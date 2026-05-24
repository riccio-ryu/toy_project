import fortunesData from "@/data/fortunes.json";

// TODO: 메뉴 설정을 Firestore로 이전 후 실시간 편집 가능하게 변경
// 현재는 fortunes.json 기반 읽기 전용 목록 표시

export default function AdminMenusPage() {
  const { fortunes } = fortunesData;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">메뉴 관리</h2>
        <p className="text-white/40 text-sm mt-1">
          운세 메뉴의 노출 여부, 순서, 옵션(디자인, 기본 내용 등)을 관리합니다.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["아이콘", "이름", "경로", "카테고리", "AI 여부", "프리미엄", "관리"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-white/40 font-medium"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {fortunes.map((fortune) => (
              <tr
                key={fortune.id}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-xl">{fortune.icon}</td>
                <td className="px-4 py-3 text-white font-medium">
                  {fortune.nameKo}
                </td>
                <td className="px-4 py-3 text-white/40 font-mono text-xs">
                  {fortune.path}
                </td>
                <td className="px-4 py-3 text-white/50">{fortune.category}</td>
                <td className="px-4 py-3">
                  {fortune.isAI ? (
                    <span className="text-[10px] text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                      AI
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {fortune.isPremium ? (
                    <span className="text-[10px] text-amber-300 bg-amber-900/50 px-1.5 py-0.5 rounded-full">
                      PRO
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled
                    className="text-xs text-white/30 border border-white/10 rounded px-2 py-1 cursor-not-allowed"
                    title="Firebase 연동 후 활성화"
                  >
                    편집
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-white/20 text-xs mt-3">
        * Firestore 연동 후 메뉴 추가 · 삭제 · 순서 변경 · 옵션 편집이 가능해집니다.
      </p>
    </div>
  );
}
