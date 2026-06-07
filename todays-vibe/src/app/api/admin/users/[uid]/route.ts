import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { todayKST } from "@/lib/utils/date";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  return payload?.isAdmin ? payload : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { uid } = await params;
  if (!uid) return Response.json({ error: "uid 필요" }, { status: 400 });

  try {
    const db = getAdminFirestore();

    // ── 1. 유저 프로필 ──────────────────────────────────────────
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return Response.json({ error: "유저 없음" }, { status: 404 });
    }
    const u = userSnap.data()!;
    const profile = {
      uid,
      email:        u.email ?? "",
      nickname:     u.nickname ?? "",
      photoURL:     u.photoURL ?? "",
      plan:         u.plan ?? "free",
      provider:     u.provider ?? "unknown",
      createdAt:    u.createdAt?.toDate?.()?.toISOString() ?? "",
      lastLoginAt:  u.lastLoginAt?.toDate?.()?.toISOString() ?? "",
    };

    // ── 2. AI 이용 히스토리 (최근 50건) ─────────────────────────
    // userId로 필터 후 메모리 정렬 (복합 인덱스 불필요)
    const readingsSnap = await db
      .collection("ai_readings")
      .where("userId", "==", uid)
      .limit(200)
      .get();

    const readings = readingsSnap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id:        doc.id,
          type:      d.type ?? "",
          input:     d.input ?? {},
          resultPreview: typeof d.result === "string"
            ? d.result.replace(/\n/g, " ").slice(0, 80)
            : "",
          isPublic:  d.isPublic ?? false,
          date:      d.date ?? "",
          createdAt: d.createdAt?.toDate?.()?.toISOString() ?? "",
        };
      })
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      .slice(0, 50);

    // ── 3. 오늘 사용량 (daily_usage) ────────────────────────────
    const today = todayKST();
    const usageSnap = await db
      .collection("daily_usage")
      .where("userId", "==", uid)
      .where("date", "==", today)
      .get();

    const todayUsage = usageSnap.docs.map((doc) => ({
      menuId: doc.data().menuId ?? "",
      count:  doc.data().count ?? 0,
    }));

    return Response.json({ profile, readings, todayUsage });
  } catch (err) {
    console.error("[Admin/Users/Detail]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
