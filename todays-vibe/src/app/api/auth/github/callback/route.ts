import { NextRequest, NextResponse } from "next/server";
import { createCustomToken } from "@/lib/firebase/admin";

interface GitHubTokenResponse {
  access_token: string;
  error?: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  message?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("github_oauth_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`;

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData: GitHubTokenResponse = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error);

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const userData: GitHubUserResponse = await userRes.json();
    if (userData.message) throw new Error(userData.message);

    // 이메일이 비공개인 경우 /user/emails 에서 primary 이메일 조회
    let email = userData.email ?? "";
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      const emailsData: unknown = await emailRes.json();
      if (Array.isArray(emailsData)) {
        email = (emailsData as GitHubEmail[]).find((e) => e.primary)?.email ?? "";
      }
    }

    const uid = `github:${userData.id}`;
    const customToken = await createCustomToken(uid, {
      provider: "github",
      email,
      displayName: userData.name ?? userData.login ?? "",
      photoURL: userData.avatar_url ?? "",
    });

    const completeUrl = new URL("/auth/complete", req.url);
    completeUrl.searchParams.set("ct", customToken);
    const res = NextResponse.redirect(completeUrl.toString());
    res.cookies.delete("github_oauth_state");
    return res;
  } catch (err) {
    console.error("[GitHub OAuth callback]", err);
    return NextResponse.redirect(new URL("/login?error=github_failed", req.url));
  }
}
