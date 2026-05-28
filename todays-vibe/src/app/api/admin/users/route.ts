import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { UserRecord } from "@/types/user";

// ─── GET: 회원 목록 조회 (관리자 전용) ───────────────────────────
export async function GET(request: NextRequest) {
  // 관리자 인증 확인
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (!payload?.isAdmin) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const db = getAdminFirestore();

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const planFilter = searchParams.get("plan");   // "free" | "premium" | null
    const search     = searchParams.get("q")?.toLowerCase() ?? "";

    let query = db.collection("users").orderBy("createdAt", "desc").limit(100);
    if (planFilter === "free" || planFilter === "premium") {
      query = query.where("plan", "==", planFilter) as typeof query;
    }

    const snapshot = await query.get();

    const users: UserRecord[] = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        return {
          uid:          d.uid ?? doc.id,
          email:        d.email ?? "",
          nickname:     d.nickname ?? "",
          photoURL:     d.photoURL ?? "",
          plan:         d.plan ?? "free",
          planExpiresAt: d.planExpiresAt?.toDate?.()?.toISOString(),
          createdAt:    d.createdAt?.toDate?.()?.toISOString() ?? "",
          lastLoginAt:  d.lastLoginAt?.toDate?.()?.toISOString() ?? "",
        } satisfies UserRecord;
      })
      // 검색어 필터 (서버 측에서 처리, Firestore full-text 미지원)
      .filter((u) =>
        !search ||
        u.email.toLowerCase().includes(search) ||
        u.nickname.toLowerCase().includes(search)
      );

    return Response.json({ users, total: users.length });
  } catch (err) {
    console.error("[Admin/Users] 오류:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// ─── PATCH: 회원 플랜 변경 (관리자 전용) ─────────────────────────
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (!payload?.isAdmin) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { uid, plan } = await request.json();
    if (!uid || !["free", "premium"].includes(plan)) {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const db = getAdminFirestore();
    await db.collection("users").doc(uid).update({ plan });

    return Response.json({ status: "ok", uid, plan });
  } catch (err) {
    console.error("[Admin/Users PATCH] 오류:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
