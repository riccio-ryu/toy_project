// TODO: Firebase Firestore에서 회원 목록 조회

export default function AdminUsersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">회원 관리</h2>
        <p className="text-white/40 text-sm mt-1">
          가입 회원 조회, 권한 변경, 계정 제재를 관리합니다.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="이메일 또는 닉네임 검색..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-purple-400/60"
        />
        <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/60 text-sm outline-none">
          <option value="">전체 권한</option>
          <option value="user">일반 회원</option>
          <option value="admin">관리자</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["닉네임", "이메일", "가입일", "권한", "AI 사용량", "관리"].map(
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
                Firebase 연동 후 회원 목록이 표시됩니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
