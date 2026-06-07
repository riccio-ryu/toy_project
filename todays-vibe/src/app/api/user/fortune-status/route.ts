import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST } from "@/lib/utils/date";

function planToRole(payload: { isAdmin: boolean; plan: string }): string {
  if (payload.isAdmin) return "admin";
  if (payload.plan === "premium") return "premium";
  return "member";
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const menuId = new URL(req.url).searchParams.get("menuId");
  if (!menuId) return Response.json({ error: "menuId가 필요합니다." }, { status: 400 });

  try {
    const db = getAdminFirestore();
    const today = todayKST();
    const role = planToRole(session);

    // 메뉴 제한 조회
    const menuSnap = await db.collection("menus").doc(menuId).get();
    const limits = menuSnap.data()?.usageLimits as Record<string, number> | undefined;
    const limit: number | null = limits ? (limits[role] ?? -1) : null;
    // limit null = 제한 없음(메뉴 미설정), -1 = 무제한, 0 = 차단, 1+ = 횟수 제한

    // 오늘 사용 횟수
    const usageSnap = await db
      .collection("daily_usage")
      .doc(`${today}_${session.uid}_${menuId}`)
      .get();
    const used: number = usageSnap.exists ? (usageSnap.data()?.count ?? 0) : 0;

    const exhausted = limit !== null && limit !== -1 && used >= limit;

    // 오늘 기록 조회 (exhausted일 때만)
    let todayReading = null;
    if (exhausted) {
      const readingSnap = await db
        .collection("ai_readings")
        .where("userId", "==", session.uid)
        .where("type", "==", menuId)
        .where("date", "==", today)
        .limit(1)
        .get();

      if (!readingSnap.empty) {
        const d = readingSnap.docs[0].data();
        todayReading = {
          id: readingSnap.docs[0].id,
          result: d.result as string,
          createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      }
    }

    return Response.json({ used, limit, exhausted, todayReading });
  } catch (err) {
    console.error("[fortune-status]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
