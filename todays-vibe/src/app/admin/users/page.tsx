"use client";

import { useEffect, useState, useCallback } from "react";
import type { UserRecord } from "@/types/user";

const PLAN_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "FREE",    color: "text-white/60",  bg: "bg-white/10" },
  premium: { label: "PREMIUM", color: "text-amber-400", bg: "bg-amber-400/15 border border-amber-400/30" },
};

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<UserRecord[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // 필터
  const [search,     setSearch]     = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // 플랜 변경 중인 uid
  const [changing, setChanging] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (planFilter) params.set("plan", planFilter);
      if (search)     params.set("q", search);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("조회 실패");
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [search, planFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handlePlanChange(uid: string, newPlan: "free" | "premium") {
    setChanging(uid);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, plan: newPlan }),
      });
      if (!res.ok) throw new Error("변경 실패");
      // 로컬 상태 즉시 반영
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, plan: newPlan } : u))
      );
    } catch {
      alert("플랜 변경에 실패했습니다.");
    } finally {
      setChanging(null);
    }
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">회원 관리</h2>
        <p className="text-white/40 text-sm mt-1">
          가입 회원 조회, 플랜 변경을 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "전체 회원",   value: total },
          { label: "프리미엄",    value: users.filter((u) => u.plan === "premium").length },
          { label: "무료 회원",   value: users.filter((u) => u.plan === "free").length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 px-5 py-4">
            <p className="text-white/40 text-xs mb-1">{s.label}</p>
            <p className="text-white text-2xl font-bold">{loading ? "-" : s.value}</p>
          </div>
        ))}
      </div>

      {/* 필터 바 */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          placeholder="이메일 또는 닉네임 검색..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-purple-400/60"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/60 text-sm outline-none"
        >
          <option value="">전체 플랜</option>
          <option value="free">무료</option>
          <option value="premium">프리미엄</option>
        </select>
        <button
          onClick={fetchUsers}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
        >
          검색
        </button>
      </div>

      {/* 테이블 */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["닉네임", "이메일", "가입일", "최근 로그인", "플랜", "변경"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              /* 스켈레톤 */
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-400 text-sm">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/20 text-sm">
                  회원이 없거나 검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const planStyle = PLAN_STYLE[user.plan] ?? PLAN_STYLE.free;
                return (
                  <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors">
                    {/* 닉네임 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.photoURL ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={user.photoURL}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">
                            {(user.nickname || user.email)[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-white font-medium">
                          {user.nickname || "-"}
                        </span>
                      </div>
                    </td>
                    {/* 이메일 */}
                    <td className="px-4 py-3 text-white/60 truncate max-w-[180px]">
                      {user.email}
                    </td>
                    {/* 가입일 */}
                    <td className="px-4 py-3 text-white/40">
                      {formatDate(user.createdAt)}
                    </td>
                    {/* 최근 로그인 */}
                    <td className="px-4 py-3 text-white/40">
                      {formatDateTime(user.lastLoginAt)}
                    </td>
                    {/* 플랜 배지 */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${planStyle.bg} ${planStyle.color}`}>
                        {planStyle.label}
                      </span>
                    </td>
                    {/* 플랜 변경 */}
                    <td className="px-4 py-3">
                      {changing === user.uid ? (
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : user.plan === "free" ? (
                        <button
                          onClick={() => handlePlanChange(user.uid, "premium")}
                          className="text-xs px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition-colors"
                        >
                          → 프리미엄
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePlanChange(user.uid, "free")}
                          className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 transition-colors"
                        >
                          → 무료
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && users.length > 0 && (
        <p className="text-white/20 text-xs mt-3 text-right">
          총 {total}명 표시 중
        </p>
      )}
    </div>
  );
}
