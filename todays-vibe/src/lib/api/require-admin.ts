import { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/** 어드민 세션을 검증하고 payload를 반환. 비어드민이면 null. */
export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  return payload?.isAdmin ? payload : null;
}

export const UNAUTHORIZED = { error: "권한이 없습니다." } as const;
