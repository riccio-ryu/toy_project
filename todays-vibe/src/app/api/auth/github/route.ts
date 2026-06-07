import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export function GET() {
  const state = randomBytes(16).toString("hex");
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return res;
}
