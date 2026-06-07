import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { todayKST, kstDateOffset } from "@/lib/utils/date";

type Period = "today" | "7d" | "30d" | "all";

function dateRangeArray(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(
    parseInt(startDate.slice(0, 4)),
    parseInt(startDate.slice(4, 6)) - 1,
    parseInt(startDate.slice(6, 8))
  );
  const end = new Date(
    parseInt(endDate.slice(0, 4)),
    parseInt(endDate.slice(4, 6)) - 1,
    parseInt(endDate.slice(6, 8))
  );
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ""));
  }
  return dates;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (!payload?.isAdmin) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const period    = (req.nextUrl.searchParams.get("period") ?? "today") as Period;
  const menuId    = req.nextUrl.searchParams.get("menuId");
  const customStart = req.nextUrl.searchParams.get("start");  // YYYY-MM-DD
  const customEnd   = req.nextUrl.searchParams.get("end");    // YYYY-MM-DD
  const today     = todayKST();

  // 커스텀 범위가 있으면 우선 적용, 없으면 period 기반
  const startDate = customStart
    ? customStart.replace(/-/g, "")
    : period === "today" ? today
    : period === "7d"    ? kstDateOffset(6)
    : period === "30d"   ? kstDateOffset(29)
    : "20000101";
  const endDate = customEnd ? customEnd.replace(/-/g, "") : today;
  const isAll   = !customStart && period === "all";

  const db = getAdminFirestore();

  // ── daily_usage 쿼리 ──────────────────────────────────────────
  let usageQuery = db.collection("daily_usage") as FirebaseFirestore.Query;
  if (!isAll) {
    usageQuery = usageQuery.where("date", ">=", startDate).where("date", "<=", endDate);
  }
  if (menuId) {
    usageQuery = usageQuery.where("menuId", "==", menuId);
  }
  const usageSnap = await usageQuery.get();

  // ── 메뉴 드릴다운 응답 ────────────────────────────────────────
  if (menuId) {
    let totalCount = 0;
    const dailyCounts: Record<string, number> = {};
    const userSet = new Set<string>();

    for (const doc of usageSnap.docs) {
      const { date, count, userId } = doc.data();
      const c = count ?? 0;
      totalCount += c;
      dailyCounts[date] = (dailyCounts[date] ?? 0) + c;
      if (userId) userSet.add(userId);
    }

    const allDates = isAll
      ? Object.keys(dailyCounts).sort()
      : dateRangeArray(startDate, endDate);

    return Response.json({
      totalCount,
      uniqueUsers: userSet.size,
      dailyData: allDates.map((date) => ({ date, count: dailyCounts[date] ?? 0 })),
    });
  }

  // ── 전체 집계 ─────────────────────────────────────────────────
  let totalUsage = 0;
  const menuCounts: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};

  for (const doc of usageSnap.docs) {
    const { menuId: mid, date, count } = doc.data();
    const c = count ?? 0;
    totalUsage += c;
    menuCounts[mid]   = (menuCounts[mid]   ?? 0) + c;
    dailyCounts[date] = (dailyCounts[date] ?? 0) + c;
  }

  // ── 메뉴 정보 (이름·아이콘) ───────────────────────────────────
  const menuIds = Object.keys(menuCounts);
  const menuInfo: Record<string, { nameKo: string; icon: string }> = {};
  if (menuIds.length > 0) {
    const snaps = await Promise.all(menuIds.map((id) => db.collection("menus").doc(id).get()));
    for (const snap of snaps) {
      if (snap.exists) {
        menuInfo[snap.id] = { nameKo: snap.data()!.nameKo, icon: snap.data()!.icon };
      }
    }
  }

  const menuRanking = Object.entries(menuCounts)
    .map(([id, count]) => ({
      id,
      count,
      nameKo: menuInfo[id]?.nameKo ?? id,
      icon:   menuInfo[id]?.icon   ?? "🔮",
    }))
    .sort((a, b) => b.count - a.count);

  const allDates = isAll
    ? Object.keys(dailyCounts).sort()
    : dateRangeArray(startDate, endDate);

  const dailyData = allDates.map((date) => ({ date, count: dailyCounts[date] ?? 0 }));

  // ── 가입자 수 ─────────────────────────────────────────────────
  const usersSnap = await db.collection("users").get();
  const totalUsers = usersSnap.size;

  let newUsers = 0;
  if (period !== "all") {
    const startTs = new Date(
      parseInt(startDate.slice(0, 4)),
      parseInt(startDate.slice(4, 6)) - 1,
      parseInt(startDate.slice(6, 8))
    );
    newUsers = usersSnap.docs.filter((d) => {
      const createdAt = d.data().createdAt;
      return createdAt && createdAt.toDate() >= startTs;
    }).length;
  } else {
    newUsers = totalUsers;
  }

  return Response.json({
    totalUsage,
    topMenu: menuRanking[0] ?? null,
    totalUsers,
    newUsers,
    dailyData,
    menuRanking,
  });
}
