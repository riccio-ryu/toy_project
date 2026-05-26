import Link from "next/link";

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
    href: "/admin/batch",
    icon: "⚡",
    label: "운세 배치 관리",
    desc: "주간·월간·연간 운세 수동 생성",
    color: "from-teal-500/20 to-cyan-500/20 border-teal-400/30",
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">대시보드</h2>
        <p className="text-white/40 text-sm mt-1">서비스 전반을 관리합니다.</p>
      </div>

      {/* Summary row — TODO: 실제 데이터 연동 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "전체 회원", value: "—" },
          { label: "오늘 이용", value: "—" },
          { label: "AI 호출 (오늘)", value: "—" },
          { label: "소모 토큰 (오늘)", value: "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white/5 border border-white/10 p-5"
          >
            <p className="text-white/40 text-xs mb-1">{s.label}</p>
            <p className="text-white text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className={`rounded-2xl bg-gradient-to-br ${card.color} backdrop-blur-sm border p-6 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="text-white font-semibold text-base mb-1">
                {card.label}
              </h3>
              <p className="text-white/50 text-sm">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
