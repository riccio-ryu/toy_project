import { NextRequest, NextResponse } from "next/server";
import { createCustomToken } from "@/lib/firebase/admin";

interface NaverTokenResponse {
  access_token: string;
  token_type: string;
  error?: string;
}

interface NaverUserResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email?: string;
    name?: string;
    nickname?: string;
    profile_image?: string;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("naver_oauth_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  try {
    // 1. 액세스 토큰 요청
    const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code,
        state,
      }),
    });
    const tokenData: NaverTokenResponse = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error);

    // 2. 유저 정보 요청
    const userRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData: NaverUserResponse = await userRes.json();
    const naverUser = userData.response;

    // 3. Firebase Custom Token 생성
    const uid = `naver:${naverUser.id}`;
    const customToken = await createCustomToken(uid, {
      provider: "naver",
      email: naverUser.email ?? "",
      displayName: naverUser.nickname ?? naverUser.name ?? "",
    });

    // 4. 완료 페이지로 리다이렉트 (custom token 전달)
    const completeUrl = new URL("/auth/complete", req.url);
    completeUrl.searchParams.set("ct", customToken);
    const res = NextResponse.redirect(completeUrl.toString());
    res.cookies.delete("naver_oauth_state");
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=naver_failed", req.url));
  }
}
