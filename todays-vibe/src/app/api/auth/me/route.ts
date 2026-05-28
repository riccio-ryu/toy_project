import { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

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
    uid: payload.uid,
    email: payload.email,
    isAdmin: payload.isAdmin,
    plan: payload.isAdmin ? "admin" : payload.plan,
  });
}
