import { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * GET /api/auth/me
 * HttpOnly 세션 쿠키를 서버에서 읽어 현재 유저의 역할 정보를 반환
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return Response.json({ isAdmin: false, plan: "free", loggedIn: false });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return Response.json({ isAdmin: false, plan: "free", loggedIn: false });
  }

  return Response.json({
    loggedIn: true,
    email: payload.email,
    isAdmin: payload.isAdmin,
    // Firestore users 컬렉션 연동 전까지 isAdmin이면 "admin", 아니면 "free"
    plan: payload.isAdmin ? "admin" : "free",
  });
}
