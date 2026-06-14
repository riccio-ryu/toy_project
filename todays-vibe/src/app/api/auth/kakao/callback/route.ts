import { NextRequest, NextResponse } from "next/server";
import { createCustomToken, upsertOAuthUser } from "@/lib/firebase/admin";

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  error?: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("kakao_oauth_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  try {
    // 1. 액세스 토큰 요청
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET ?? "",
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/kakao/callback`,
        code,
      }),
    });
    const tokenData: KakaoTokenResponse = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error);

    // 2. 유저 정보 요청
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });
    const userData: KakaoUserResponse = await userRes.json();

    // 3. Firebase Custom Token 생성
    const uid = `kakao:${userData.id}`;
    const email = userData.kakao_account?.email ?? "";
    if (!email) {
      return NextResponse.redirect(new URL("/login?error=email_required", req.url));
    }
    const displayName = userData.kakao_account?.profile?.nickname ?? "";
    const photoURL = userData.kakao_account?.profile?.profile_image_url ?? "";

    await upsertOAuthUser(uid, { email, displayName, photoURL });

    const customToken = await createCustomToken(uid, {
      provider: "kakao",
      email,
      displayName,
      photoURL,
    });

    // 4. 완료 페이지로 리다이렉트
    const completeUrl = new URL("/auth/complete", req.url);
    completeUrl.searchParams.set("ct", customToken);
    const res = NextResponse.redirect(completeUrl.toString());
    res.cookies.delete("kakao_oauth_state");
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=kakao_failed", req.url));
  }
}
