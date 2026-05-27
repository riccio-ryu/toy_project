import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

// ─── 라우트 설정 ───────────────────────────────────────────────
const ADMIN_PREFIX = "/admin";
const AI_API_PREFIX = "/api/ai";

// ─── 세션 검증 (Edge 호환 — Firebase Admin 없음) ──────────────
async function getSession(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  return verifySessionToken(cookie);
}

// ─── 프록시 본체 ───────────────────────────────────────────────
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. 어드민 라우트 → 세션 + isAdmin 체크
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // 2. AI API 라우트 → 로그인 체크
  if (pathname.startsWith(AI_API_PREFIX)) {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    return NextResponse.next();
  }

  // 3. 나머지 → 통과
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)",],
};

