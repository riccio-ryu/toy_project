// TODO: Firestore ai_usage 컬렉션 연동

const DEFAULT_DAILY_LIMIT = 10_000;

export default function AdminAiUsagePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">AI 사용량 관리</h2>
        <p className="text-white/40 text-sm mt-1">
          사용자별 토큰 소모량 및 일일 한도를 관리합니다.
        </p>
      </div>

      {/* Global limit setting */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4">전역 설정</h3>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-white/40 text-xs mb-1">1인당 일일 토큰 한도</p>
            <p className="text-white text-2xl font-bold">
              {DEFAULT_DAILY_LIMIT.toLocaleString()}
            </p>
          </div>
          <div className="text-white/20 text-xs ml-4">
            (환경변수 AI_DAILY_TOKEN_LIMIT으로 설정)
          </div>
          <button
            disabled
            className="ml-auto px-4 py-2 rounded-lg text-sm text-white/30 border border-white/10 cursor-not-allowed"
            title="Firebase 연동 후 활성화"
          >
            변경
          </button>
        </div>
      </div>

      {/* Usage table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["회원", "오늘 사용 토큰", "한도", "사용률", "상태", "관리"].map(
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
          <tbody>
            <tr>
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-white/20 text-sm"
              >
                Firebase 연동 후 사용자별 AI 사용량이 표시됩니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
