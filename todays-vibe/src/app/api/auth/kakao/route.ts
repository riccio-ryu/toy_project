import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export function GET() {
  const state = randomBytes(16).toString("hex");
  const clientId = process.env.KAKAO_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/kakao/callback`;

  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "profile_nickname profile_image account_email");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("kakao_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return res;
}
