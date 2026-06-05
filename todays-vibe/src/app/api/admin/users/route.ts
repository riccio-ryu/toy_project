import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { UserRecord, AllStats, UserProvider } from "@/types/user";

function deriveProvider(uid: string, stored?: string): UserProvider {
  if (stored && stored !== "unknown") return stored as UserProvider;
  if (uid.startsWith("kakao:")) return "kakao";
  if (uid.startsWith("naver:")) return "naver";
  return "unknown";
}

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  return payload?.isAdmin ? payload : null;
}

// ─── GET: 회원 목록 조회 (관리자 전용) ───────────────────────────
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const db = getAdminFirestore();
    const { searchParams } = new URL(request.url);
    const planFilter      = searchParams.get("plan")     ?? "";
    const providerFilter  = searchParams.get("provider") ?? "";
    const search          = searchParams.get("q")?.toLowerCase() ?? "";

    // 회원 목록 조회 — users.plan 단일 소스
    const snapshot = await db.collection("users").orderBy("createdAt", "desc").limit(500).get();
    const allUsers: UserRecord[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      const uid: string = d.uid ?? doc.id;
      return {
        uid,
        email:         d.email ?? "",
        nickname:      d.nickname ?? "",
        photoURL:      d.photoURL ?? "",
        plan:          d.plan ?? "free",
        planExpiresAt: d.planExpiresAt?.toDate?.()?.toISOString(),
        provider:      deriveProvider(uid, d.provider),
        createdAt:     d.createdAt?.toDate?.()?.toISOString() ?? "",
        lastLoginAt:   d.lastLoginAt?.toDate?.()?.toISOString() ?? "",
      } satisfies UserRecord;
    });

    // 전체 통계 — 필터 적용 전 전체 집계
    const allStats: AllStats = { total: 0, free: 0, premium: 0, admin: 0 };
    allUsers.forEach((u) => {
      allStats.total++;
      allStats[u.plan] = (allStats[u.plan] ?? 0) + 1;
    });

    // 검색·플랜·프로바이더 필터 적용
    const users = allUsers.filter((u) => {
      const planMatch     = !planFilter     || u.plan     === planFilter;
      const providerMatch = !providerFilter || u.provider === providerFilter;
      const searchMatch   = !search || u.email.toLowerCase().includes(search) || u.nickname.toLowerCase().includes(search);
      return planMatch && providerMatch && searchMatch;
    });

    return Response.json({ users, total: users.length, allStats });
  } catch (err) {
    console.error("[Admin/Users] 오류:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// ─── PATCH: 회원 플랜 변경 (관리자 전용) ─────────────────────────
export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { uid, plan } = await request.json();
    if (!uid || typeof plan !== "string" || !plan) {
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
