import { NextRequest } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import {
  createSessionToken,
  buildSetCookieHeader,
  buildClearCookieHeader,
} from "@/lib/session";

// 개발환경 SSL 오류 등으로 Firestore 연결 실패 시 사용할 폴백 어드민 목록
function getEnvAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

// ─── POST: 로그인 후 세션 쿠키 생성 ──────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken: string | undefined = body?.idToken;

    if (!idToken) {
      return Response.json({ error: "idToken이 필요합니다." }, { status: 400 });
    }

    // ① Firebase ID 토큰 검증 (5초 타임아웃)
    const decoded = await Promise.race([
      getAdminAuth().verifyIdToken(idToken),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("verifyIdToken timeout")), 5000)
      ),
    ]);
    const email = decoded.email ?? "";

    if (!email) {
      return Response.json({ error: "이메일 정보가 없습니다." }, { status: 400 });
    }

    // ② 어드민 여부 확인: Firestore 우선, 실패 시 env 폴백
    let isAdmin = false;
    try {
      const db = getAdminFirestore();
      const adminDoc = await Promise.race([
        db.collection("admins").doc(email).get(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Firestore timeout")), 5000)
        ),
      ]);
      isAdmin = adminDoc.exists && adminDoc.data()?.allowed === true;
      console.log("[Session] Firestore 어드민 체크 →", isAdmin);
    } catch (fsErr) {
      // SSL 인증서 오류 등 → env var 폴백
      console.warn("[Session] Firestore 연결 실패, env 폴백 사용:", (fsErr as Error).message);
      isAdmin = getEnvAdminEmails().includes(email);
      console.log("[Session] env 폴백 어드민 체크 →", isAdmin);
    }

    // ③ HMAC 세션 토큰 생성 후 쿠키에 저장
    const token = await createSessionToken(email, isAdmin);
    const response = Response.json({ status: "ok", isAdmin });
    response.headers.set("Set-Cookie", buildSetCookieHeader(token));
    return response;
  } catch (err) {
    console.error("[Session] 오류:", err);
    return Response.json({ error: String(err) }, { status: 401 });
  }
}

// ─── DELETE: 로그아웃 시 세션 쿠키 제거 ──────────────────────────
export async function DELETE() {
  const response = Response.json({ status: "ok" });
  response.headers.set("Set-Cookie", buildClearCookieHeader());
  return response;
}
