import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST, kstDateOffset } from "@/lib/utils/date";
import { requireAdmin } from "@/lib/api/require-admin";

type Period = "today" | "7d" | "30d";

export interface MenuLimitInfo {
  id: string;
  nameKo: string;
  icon: string;
  usageLimits: { member?: number; premium?: number; admin?: number } | null;
}

export interface UserUsageRow {
  uid: string;
  email: string;
  nickname: string;
  plan: string;
  totalCount: number;
  byMenu: Record<string, number>;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
}

export interface AiUsageResponse {
  users: UserUsageRow[];
  menus: MenuLimitInfo[];
  dailyTokenLimit: number;
  summary: {
    totalRequests: number;
    uniqueUsers: number;
    topMenu: { id: string; nameKo: string; icon: string; count: number } | null;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
  };
}

const DEFAULT_DAILY_TOKEN_LIMIT = 50_000;

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const period = (req.nextUrl.searchParams.get("period") ?? "today") as Period;
  const today = todayKST();
  const startDate =
    period === "today" ? today
    : period === "7d"  ? kstDateOffset(6)
    : kstDateOffset(29);

  const db = getAdminFirestore();

  // ── 토큰 한도 설정 조회 ───────────────────────────────────────
  let dailyTokenLimit = DEFAULT_DAILY_TOKEN_LIMIT;
  try {
    const limitsSnap = await db.collection("settings").doc("aiLimits").get();
    if (limitsSnap.exists) {
      dailyTokenLimit = limitsSnap.data()?.dailyTokenLimitPerUser ?? DEFAULT_DAILY_TOKEN_LIMIT;
    }
  } catch { /* keep default */ }

  // ── daily_usage + token_usage 병렬 조회 ───────────────────────
  const [usageSnap, tokenSnap] = await Promise.all([
    db.collection("daily_usage")
      .where("date", ">=", startDate)
      .where("date", "<=", today)
      .get(),
    db.collection("token_usage")
      .where("date", ">=", startDate)
      .where("date", "<=", today)
      .get(),
  ]);

  // ── 유저별 요청 수 집계 ───────────────────────────────────────
  const userMap = new Map<string, Record<string, number>>();
  const menuCountMap = new Map<string, number>();

  for (const doc of usageSnap.docs) {
    const { userId, menuId, count } = doc.data();
    if (!userId || !menuId) continue;
    const c = count ?? 0;

    if (!userMap.has(userId)) userMap.set(userId, {});
    const byMenu = userMap.get(userId)!;
    byMenu[menuId] = (byMenu[menuId] ?? 0) + c;

    menuCountMap.set(menuId, (menuCountMap.get(menuId) ?? 0) + c);
  }

  // ── 유저별 토큰 집계 ──────────────────────────────────────────
  interface TokenSums { input: number; output: number; total: number }
  const userTokenMap = new Map<string, TokenSums>();
  let summaryInputTokens = 0;
  let summaryOutputTokens = 0;

  for (const doc of tokenSnap.docs) {
    const { userId, inputTokens, outputTokens, totalTokens } = doc.data();
    if (!userId) continue;
    const prev = userTokenMap.get(userId) ?? { input: 0, output: 0, total: 0 };
    userTokenMap.set(userId, {
      input:  prev.input  + (inputTokens  ?? 0),
      output: prev.output + (outputTokens ?? 0),
      total:  prev.total  + (totalTokens  ?? 0),
    });
    summaryInputTokens  += inputTokens  ?? 0;
    summaryOutputTokens += outputTokens ?? 0;
  }

  // ── 메뉴 정보 조회 ────────────────────────────────────────────
  const menuIds = Array.from(menuCountMap.keys());
  const allMenuSnap = await db.collection("menus").get();
  const menuInfoMap = new Map<string, MenuLimitInfo>();
  for (const snap of allMenuSnap.docs) {
    const d = snap.data();
    menuInfoMap.set(snap.id, {
      id: snap.id,
      nameKo: d.nameKo ?? snap.id,
      icon: d.icon ?? "🔮",
      usageLimits: d.usageLimits ?? null,
    });
  }

  const menus: MenuLimitInfo[] = allMenuSnap.docs
    .filter((d) => d.data().usageLimits != null || menuCountMap.has(d.id))
    .map((d) => menuInfoMap.get(d.id)!)
    .filter(Boolean);

  // ── 유저 정보 조회 ────────────────────────────────────────────
  const uids = Array.from(userMap.keys());
  const userInfoMap = new Map<string, { email: string; nickname: string; plan: string }>();
  if (uids.length > 0) {
    const userSnaps = await Promise.all(uids.map((uid) => db.collection("users").doc(uid).get()));
    for (const snap of userSnaps) {
      if (snap.exists) {
        const d = snap.data()!;
        userInfoMap.set(snap.id, {
          email: d.email ?? "",
          nickname: d.nickname ?? "",
          plan: d.plan ?? "free",
        });
      }
    }
  }

  const users: UserUsageRow[] = uids
    .map((uid) => {
      const byMenu = userMap.get(uid)!;
      const totalCount = Object.values(byMenu).reduce((s, c) => s + c, 0);
      const info = userInfoMap.get(uid);
      const tokens = userTokenMap.get(uid) ?? { input: 0, output: 0, total: 0 };
      return {
        uid,
        email: info?.email ?? uid,
        nickname: info?.nickname ?? "",
        plan: info?.plan ?? "free",
        totalCount,
        byMenu,
        totalInputTokens:  tokens.input,
        totalOutputTokens: tokens.output,
        totalTokens:       tokens.total,
      };
    })
    .sort((a, b) => b.totalCount - a.totalCount);

  // ── 요약 ─────────────────────────────────────────────────────
  const totalRequests = users.reduce((s, u) => s + u.totalCount, 0);
  const topMenuEntry = menuIds.length > 0
    ? menuIds.reduce((a, b) => (menuCountMap.get(a)! >= menuCountMap.get(b)! ? a : b))
    : null;
  const topMenu = topMenuEntry
    ? {
        id: topMenuEntry,
        nameKo: menuInfoMap.get(topMenuEntry)?.nameKo ?? topMenuEntry,
        icon: menuInfoMap.get(topMenuEntry)?.icon ?? "🔮",
        count: menuCountMap.get(topMenuEntry)!,
      }
    : null;

  return Response.json({
    users,
    menus,
    dailyTokenLimit,
    summary: {
      totalRequests,
      uniqueUsers: uids.length,
      topMenu,
      totalInputTokens:  summaryInputTokens,
      totalOutputTokens: summaryOutputTokens,
      totalTokens:       summaryInputTokens + summaryOutputTokens,
    },
  } satisfies AiUsageResponse);
}

// ─── PATCH: 메뉴 한도 저장 ────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json();
  const db = getAdminFirestore();

  // 토큰 한도 저장
  if (typeof body.dailyTokenLimitPerUser === "number") {
    await db.collection("settings").doc("aiLimits").set(
      { dailyTokenLimitPerUser: body.dailyTokenLimitPerUser, updatedAt: new Date() },
      { merge: true }
    );
    return Response.json({ ok: true });
  }

  // 메뉴 한도 저장
  const { menuId, usageLimits } = body;
  if (!menuId || typeof usageLimits !== "object") {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  await db.collection("menus").doc(menuId).set({ usageLimits }, { merge: true });

  return Response.json({ ok: true });
}
