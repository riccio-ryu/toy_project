import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);

  try {
    const db = getAdminFirestore();
    // orderBy와 where를 다른 필드에 조합하면 복합 인덱스가 필요하므로
    // 최대 100개를 가져와 JS에서 정렬 후 limit 적용
    const snap = await db
      .collection("ai_readings")
      .where("userId", "==", session.uid)
      .limit(100)
      .get();

    const readings = snap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          type: d.type as string,
          date: d.date as string,
          result: d.result as string,
          createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      })
      .sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, limit);

    return Response.json({ readings });
  } catch (err) {
    console.error("[/api/user/readings]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
