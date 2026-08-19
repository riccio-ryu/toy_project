import Link from "next/link";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST, kstDateOffset } from "@/lib/utils/date";
import { Users, Zap, Trophy, Bot, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── 데이터 패치 ──────────────────────────────────────────────────────────────

async function getDashboardData() {
  const db = getAdminFirestore();
  const today = todayKST();
  const yesterday = kstDateOffset(1);

  const todayStart = new Date(
    parseInt(today.slice(0, 4)),
    parseInt(today.slice(4, 6)) - 1,
    parseInt(today.slice(6, 8))
  );

  const [totalUsersRes, todayUsageRes, yesterdayUsageRes, todayTokenRes, usersRes] =
    await Promise.allSettled([
      db.collection("users").count().get(),
      db.collection("daily_usage").where("date", "==", today).get(),
      db.collection("daily_usage").where("date", "==", yesterday).get(),
      db.collection("token_usage").where("date", "==", today).get(),
      db.collection("users").get(),
    ]);

  // 전체 회원 + 오늘 신규
  const totalUsers =
    totalUsersRes.status === "fulfilled" ? totalUsersRes.value.data().count : 0;

  let newUsersToday = 0;
  if (usersRes.status === "fulfilled") {
    newUsersToday = usersRes.value.docs.filter((d) => {
      const ca = d.data().createdAt;
      return ca && ca.toDate() >= todayStart;
    }).length;
  }

  // 오늘 이용 집계
  let todayTotal = 0;
  const menuCounts: Record<string, number> = {};
  if (todayUsageRes.status === "fulfilled") {
    for (const doc of todayUsageRes.value.docs) {
      const { menuId, count = 0 } = doc.data();
      todayTotal += count;
      menuCounts[menuId] = (menuCounts[menuId] ?? 0) + count;
    }
  }

  // 전일 이용 (비교용)
  let yesterdayTotal = 0;
  if (yesterdayUsageRes.status === "fulfilled") {
    for (const doc of yesterdayUsageRes.value.docs) {
      yesterdayTotal += doc.data().count ?? 0;
    }
  }

  // 오늘 소모 토큰
  let todayTokens = 0;
  if (todayTokenRes.status === "fulfilled") {
    for (const doc of todayTokenRes.value.docs) {
      todayTokens += doc.data().totalTokens ?? 0;
    }
  }

  // 메뉴 이름 조회
  const menuIds = Object.keys(menuCounts);
  const menuInfo: Record<string, { name: string; icon: string }> = {};
  if (menuIds.length > 0) {
    const snaps = await Promise.all(menuIds.map((id) => db.collection("menus").doc(id).get()));
    for (const snap of snaps) {
      if (snap.exists) {
        menuInfo[snap.id] = { name: snap.data()!.nameKo, icon: snap.data()!.icon };
      }
    }
  }

  const menuRanking = Object.entries(menuCounts)
    .map(([id, count]) => ({ id, count, ...menuInfo[id] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return { totalUsers, newUsersToday, todayTotal, yesterdayTotal, todayTokens, menuRanking };
}

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function fmtNum(v: number): string {
  if (v >= 100000) return (v / 10000).toFixed(0) + "만";
  if (v >= 10000)  return (v / 10000).toFixed(1) + "만";
  if (v >= 1000)   return (v / 1000).toFixed(1) + "K";
  return v.toLocaleString();
}

function trend(today: number, yesterday: number) {
  if (yesterday === 0) return null;
  return Math.round(((today - yesterday) / yesterday) * 100);
}

// ─── 빠른 이동 ────────────────────────────────────────────────────────────────

const NAV_CARDS = [
  { href: "/admin/users",    icon: "👥", label: "회원 관리",     color: "border-blue-400/20 hover:border-blue-400/50" },
  { href: "/admin/menus",    icon: "📋", label: "메뉴 관리",     color: "border-purple-400/20 hover:border-purple-400/50" },
  { href: "/admin/stats",    icon: "📈", label: "사용 통계",     color: "border-green-400/20 hover:border-green-400/50" },
  { href: "/admin/ai-usage", icon: "🤖", label: "AI 사용량",     color: "border-amber-400/20 hover:border-amber-400/50" },
  { href: "/admin/readings", icon: "📖", label: "운세 기록",     color: "border-indigo-400/20 hover:border-indigo-400/50" },
  { href: "/admin/batch",    icon: "⚡", label: "배치 관리",     color: "border-teal-400/20 hover:border-teal-400/50" },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const { totalUsers, newUsersToday, todayTotal, yesterdayTotal, todayTokens, menuRanking } =
    await getDashboardData();

  const usageTrend = trend(todayTotal, yesterdayTotal);
  const maxCount = menuRanking[0]?.count ?? 1;

  return (
    <div className="p-4 md:p-8 max-w-5xl">

      {/* 헤더 */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">대시보드</h2>
          <p className="text-white/40 text-sm mt-0.5">서비스 전반 현황을 한눈에 확인합니다.</p>
        </div>
        <span className="text-white/20 text-xs hidden sm:block">{todayKST().replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3")} 기준</span>
      </div>

      {/* ── 요약 카드 4개 ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">

        {/* 전체 회원 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/40 text-xs">전체 회원</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-white text-2xl sm:text-3xl font-bold tabular-nums">{fmtNum(totalUsers)}</p>
          {newUsersToday > 0 && (
            <p className="text-emerald-400 text-xs mt-1.5">+{newUsersToday}명 오늘 신규</p>
          )}
          {newUsersToday === 0 && (
            <p className="text-white/20 text-xs mt-1.5">오늘 신규 없음</p>
          )}
        </div>

        {/* 오늘 이용 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/40 text-xs">오늘 AI 이용</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-white text-2xl sm:text-3xl font-bold tabular-nums">{fmtNum(todayTotal)}</p>
          <div className="flex items-center gap-1 mt-1.5">
            {usageTrend === null ? (
              <span className="text-white/20 text-xs">전일 데이터 없음</span>
            ) : usageTrend > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs">전일 대비 +{usageTrend}%</span>
              </>
            ) : usageTrend < 0 ? (
              <>
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">전일 대비 {usageTrend}%</span>
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 text-white/30" />
                <span className="text-white/30 text-xs">전일과 동일</span>
              </>
            )}
          </div>
        </div>

        {/* 오늘 인기 운세 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/40 text-xs">오늘 인기 운세</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          {menuRanking[0] ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xl">{menuRanking[0].icon ?? "🔮"}</span>
                <p className="text-white font-bold text-sm leading-tight">{menuRanking[0].name ?? menuRanking[0].id}</p>
              </div>
              <p className="text-amber-400 text-xs mt-1.5">{menuRanking[0].count}회 이용</p>
            </>
          ) : (
            <p className="text-white text-2xl font-bold">—</p>
          )}
        </div>

        {/* 오늘 소모 토큰 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/40 text-xs">오늘 소모 토큰</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <Bot className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <p className="text-white text-2xl sm:text-3xl font-bold tabular-nums">{fmtNum(todayTokens)}</p>
          <p className="text-white/20 text-xs mt-1.5">입력 + 출력 합산</p>
        </div>
      </div>

      {/* ── 오늘 운세별 이용 현황 ──────────────────────────────── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-sm">오늘 운세별 이용 현황</h3>
          <Link href="/admin/stats" className="text-white/30 text-xs hover:text-white/60 transition-colors">
            자세히 →
          </Link>
        </div>

        {menuRanking.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-6">오늘 이용 기록이 없어요</p>
        ) : (
          <div className="space-y-3">
            {menuRanking.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-white/30 text-xs w-4 text-right shrink-0">{i + 1}</span>
                <span className="text-base shrink-0 w-6 text-center">{item.icon ?? "🔮"}</span>
                <span className="text-white/70 text-sm w-24 truncate shrink-0">{item.name ?? item.id}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500/70 transition-all"
                    style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
                  />
                </div>
                <span className="text-white/50 text-xs tabular-nums w-10 text-right shrink-0">{item.count}회</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 빠른 이동 ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-white/40 text-xs font-medium mb-3">빠른 이동</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
          {NAV_CARDS.map((card) => (
            <Link key={card.href} href={card.href}>
              <div className={`rounded-xl bg-white/5 border ${card.color} p-3 sm:p-4 transition-all duration-150 flex flex-col items-center gap-1.5`}>
                <span className="text-xl sm:text-2xl">{card.icon}</span>
                <span className="text-white/60 text-xs font-medium text-center leading-tight">{card.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
