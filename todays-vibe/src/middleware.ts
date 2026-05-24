import { NextRequest, NextResponse } from "next/server";

// ─── 라우트 설정 ───────────────────────────────────────────────
const PUBLIC_ROUTES = ["/", "/login", "/signup"];
const ADMIN_PREFIX = "/admin";
const AI_API_PREFIX = "/api/ai";

// ─── AI 사용량 제한 (환경 변수로 조정 가능) ──────────────────
const AI_DAILY_TOKEN_LIMIT = Number(
  process.env.AI_DAILY_TOKEN_LIMIT ?? 10_000
);

// ─── 헬퍼 ─────────────────────────────────────────────────────
function getSessionFromRequest(req: NextRequest): {
  uid: string;
  isAdmin: boolean;
} | null {
  // TODO: Firebase Admin SDK로 세션 쿠키 검증
  // const sessionCookie = req.cookies.get("session")?.value;
  // if (!sessionCookie) return null;
  // const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  // return { uid: decoded.uid, isAdmin: decoded.isAdmin === true };

  // 개발 중 임시: 쿠키 존재 여부로 판단
  const session = req.cookies.get("session")?.value;
  if (!session) return null;

  try {
    const payload = JSON.parse(atob(session.split(".")[1] ?? ""));
    return { uid: payload.uid ?? "", isAdmin: payload.isAdmin === true };
  } catch {
    return null;
  }
}

async function checkAiTokenLimit(uid: string): Promise<boolean> {
  // TODO: Firestore에서 오늘 사용량 조회
  // const today = new Date().toISOString().split("T")[0];
  // const doc = await db.collection("ai_usage").doc(`${uid}_${today}`).get();
  // const used = doc.data()?.tokens ?? 0;
  // return used < AI_DAILY_TOKEN_LIMIT;

  void uid;
  void AI_DAILY_TOKEN_LIMIT;
  return true; // 개발 중 임시: 항상 허용
}

// ─── 미들웨어 본체 ─────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. 어드민 라우트 → 로그인 + 어드민 권한 필요
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const session = getSessionFromRequest(req);

    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // 2. AI API 라우트 → 로그인 + 토큰 한도 체크
  if (pathname.startsWith(AI_API_PREFIX)) {
    const session = getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const withinLimit = await checkAiTokenLimit(session.uid);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "오늘의 AI 사용량을 초과했습니다. 내일 다시 시도해주세요." },
        { status: 429 }
      );
    }

    return NextResponse.next();
  }

  // 3. 공개 라우트 → 통과
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 4. 그 외 사용자 라우트 → 현재는 공개 (로그인 도입 후 제한 가능)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일·Next 내부 경로 제외
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
