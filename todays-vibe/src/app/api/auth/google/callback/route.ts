import { NextRequest, NextResponse } from "next/server";
import { createCustomToken } from "@/lib/firebase/admin";

interface GoogleTokenResponse {
  access_token: string;
  error?: string;
}

interface GoogleUserResponse {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  error?: { message: string };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("google_oauth_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData: GoogleTokenResponse = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error);

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData: GoogleUserResponse = await userRes.json();
    if (userData.error) throw new Error(userData.error.message);

    const uid = `google:${userData.id}`;
    const customToken = await createCustomToken(uid, {
      provider: "google",
      email: userData.email ?? "",
      displayName: userData.name ?? "",
      photoURL: userData.picture ?? "",
    });

    const completeUrl = new URL("/auth/complete", req.url);
    completeUrl.searchParams.set("ct", customToken);
    const res = NextResponse.redirect(completeUrl.toString());
    res.cookies.delete("google_oauth_state");
    return res;
  } catch (err) {
    console.error("[Google OAuth callback]", err);
    return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
  }
}
