import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/require-admin";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const db = getAdminFirestore();
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type") ?? "";
    const userFilter = searchParams.get("userId") ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

    // orderBy 단독으로 사용해 복합 인덱스 없이 최신순 조회
    const snap = await db
      .collection("ai_readings")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    let readings = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        userId: d.userId as string | null,
        type: d.type as string,
        date: d.date as string,
        result: d.result as string,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    if (typeFilter) {
      readings = readings.filter((r) => r.type === typeFilter);
    }
    if (userFilter) {
      readings = readings.filter((r) => r.userId?.includes(userFilter));
    }

    const total = readings.length;
    readings = readings.slice(0, limit);

    return Response.json({ readings, total });
  } catch (err) {
    console.error("[admin/readings]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
