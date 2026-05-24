// TODO: Firestore 집계 데이터 연동

export default function AdminStatsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">사용 통계</h2>
        <p className="text-white/40 text-sm mt-1">
          일별 · 운세별 이용 현황을 확인합니다.
        </p>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-8">
        {["오늘", "7일", "30일", "전체"].map((p) => (
          <button
            key={p}
            disabled
            className="px-4 py-2 rounded-lg text-sm text-white/40 border border-white/10 cursor-not-allowed"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "총 운세 이용", icon: "🔮", value: "—" },
          { label: "신규 가입", icon: "👤", value: "—" },
          { label: "AI 호출 수", icon: "🤖", value: "—" },
          { label: "가장 인기 운세", icon: "⭐", value: "—" },
          { label: "평균 세션 시간", icon: "⏱", value: "—" },
          { label: "재방문율", icon: "🔄", value: "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white/5 border border-white/10 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{s.icon}</span>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
            <p className="text-white text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-8 flex items-center justify-center min-h-[200px]">
        <p className="text-white/20 text-sm text-center">
          📊 Firebase 연동 후 이용 현황 차트가 표시됩니다.
        </p>
      </div>
    </div>
  );
}
