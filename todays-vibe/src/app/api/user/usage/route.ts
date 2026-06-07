import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST } from "@/lib/utils/date";

const TRACKED_MENUS = ["saju", "dream", "tarot-3cards", "tarot-celtic", "tarot-horseshoe", "tarot-full-moon", "tarot-tree-of-life"];

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const db = getAdminFirestore();
    const today = todayKST();

    const snaps = await Promise.all(
      TRACKED_MENUS.map((menuId) =>
        db.collection("daily_usage").doc(`${today}_${session.uid}_${menuId}`).get()
      )
    );

    const usage: Record<string, number> = {};
    TRACKED_MENUS.forEach((menuId, i) => {
      usage[menuId] = snaps[i].exists ? (snaps[i].data()?.count ?? 0) : 0;
    });

    return Response.json({ usage, date: today });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
