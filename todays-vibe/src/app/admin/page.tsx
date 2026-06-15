import Link from "next/link";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST } from "@/lib/utils/date";

const CARDS = [
  {
    href: "/admin/users",
    icon: "👥",
    label: "회원 관리",
    desc: "가입 회원 조회 · 권한 변경 · 제재",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-400/30",
  },
  {
    href: "/admin/menus",
    icon: "📋",
    label: "메뉴 관리",
    desc: "운세 메뉴 노출 · 순서 · 옵션 설정",
    color: "from-purple-500/20 to-pink-500/20 border-purple-400/30",
  },
  {
    href: "/admin/stats",
    icon: "📈",
    label: "사용 통계",
    desc: "일별 · 운세별 이용 현황 그래프",
    color: "from-green-500/20 to-emerald-500/20 border-green-400/30",
  },
  {
    href: "/admin/ai-usage",
    icon: "🤖",
    label: "AI 사용량",
    desc: "토큰 소모량 · 사용자별 한도 관리",
    color: "from-amber-500/20 to-orange-500/20 border-amber-400/30",
  },
  {
    href: "/admin/readings",
    icon: "📖",
    label: "운세 기록",
    desc: "전체 AI 운세 결과 조회 · 유저별 확인",
    color: "from-indigo-500/20 to-purple-500/20 border-indigo-400/30",
  },
  {
    href: "/admin/batch",
    icon: "⚡",
    label: "운세 배치 관리",
    desc: "주간·월간·연간 운세 수동 생성",
    color: "from-teal-500/20 to-cyan-500/20 border-teal-400/30",
  },
];

async function getSummary() {
  try {
    const db = getAdminFirestore();
    const today = todayKST();

    const [usersSnap, usageSnap, tokenSnap] = await Promise.allSettled([
      db.collection("users").count().get(),
      db.collection("daily_usage").doc(today).get(),
      db.collection("token_usage").doc(today).get(),
    ]);

    const totalUsers =
      usersSnap.status === "fulfilled" ? usersSnap.value.data().count : null;

    const usageData =
      usageSnap.status === "fulfilled" && usageSnap.value.exists
        ? (usageSnap.value.data() as Record<string, Record<string, number>>)
        : null;
    const todayUse = usageData
      ? Object.values(usageData).reduce(
          (sum, u) => sum + Object.values(u).reduce((s, v) => s + v, 0),
          0
        )
      : null;

    const tokenData =
      tokenSnap.status === "fulfilled" && tokenSnap.value.exists
        ? (tokenSnap.value.data() as Record<string, Record<string, number>>)
        : null;
    const todayTokens = tokenData
      ? Object.values(tokenData).reduce(
          (sum, u) =>
            sum + ((u.input_tokens ?? 0) + (u.output_tokens ?? 0)),
          0
        )
      : null;

    return { totalUsers, todayUse, todayTokens };
  } catch {
    return { totalUsers: null, todayUse: null, todayTokens: null };
  }
}

function fmt(v: number | null): string {
  if (v === null) return "—";
  if (v >= 10000) return (v / 10000).toFixed(1) + "만";
  return v.toLocaleString();
}

export default async function AdminDashboard() {
  const { totalUsers, todayUse, todayTokens } = await getSummary();

  const SUMMARY = [
    { label: "전체 회원", value: fmt(totalUsers) },
    { label: "오늘 이용", value: fmt(todayUse) },
    { label: "오늘 AI 호출", value: fmt(todayUse) },
    { label: "오늘 소모 토큰", value: fmt(todayTokens) },
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white">대시보드</h2>
        <p className="text-white/40 text-sm mt-1">서비스 전반을 관리합니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5"
          >
            <p className="text-white/40 text-xs mb-1">{s.label}</p>
            <p className="text-white text-xl sm:text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 메뉴 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {CARDS.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className={`rounded-2xl bg-gradient-to-br ${card.color} backdrop-blur-sm border p-5 sm:p-6 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{card.icon}</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                {card.label}
              </h3>
              <p className="text-white/50 text-xs sm:text-sm">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
