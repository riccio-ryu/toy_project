"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { UserRecord, PlanConfig, AllStats, UserProvider } from "@/types/user";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

// ── 내장 플랜 스타일 ─────────────────────────────────────────────
const BUILTIN_PLAN_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "FREE",    color: "text-white/60",   bg: "bg-white/10" },
  premium: { label: "PREMIUM", color: "text-amber-400",  bg: "bg-amber-400/15 border border-amber-400/30" },
  admin:   { label: "ADMIN",   color: "text-rose-400",   bg: "bg-rose-400/15 border border-rose-400/30" },
};
const CUSTOM_PLAN_STYLE = { color: "text-sky-400", bg: "bg-sky-400/15 border border-sky-400/30" };

function getPlanStyle(plan: string, customPlans: PlanConfig[]) {
  if (BUILTIN_PLAN_STYLE[plan]) return { ...BUILTIN_PLAN_STYLE[plan] };
  const custom = customPlans.find((p) => p.id === plan);
  return { label: custom?.name ?? plan.toUpperCase(), ...CUSTOM_PLAN_STYLE };
}

// ── 가입 경로 ────────────────────────────────────────────────────
const PROVIDER_INFO: Record<UserProvider, { label: string; color: string; bg: string; icon: string }> = {
  google:  { label: "Google",  color: "text-blue-400",   bg: "bg-blue-400/10 border border-blue-400/25",   icon: "G" },
  github:  { label: "GitHub",  color: "text-white/70",   bg: "bg-white/10 border border-white/20",         icon: "⌥" },
  email:   { label: "이메일",  color: "text-green-400",  bg: "bg-green-400/10 border border-green-400/25", icon: "✉" },
  kakao:   { label: "카카오",  color: "text-yellow-400", bg: "bg-yellow-400/10 border border-yellow-400/25", icon: "K" },
  naver:   { label: "네이버",  color: "text-emerald-400", bg: "bg-emerald-400/10 border border-emerald-400/25", icon: "N" },
  unknown: { label: "기타",    color: "text-white/30",   bg: "bg-white/5",                                  icon: "?" },
};

const PROVIDER_OPTIONS: { value: UserProvider | ""; label: string }[] = [
  { value: "",        label: "전체 가입경로" },
  { value: "google",  label: "Google" },
  { value: "github",  label: "GitHub" },
  { value: "email",   label: "이메일" },
  { value: "kakao",   label: "카카오" },
  { value: "naver",   label: "네이버" },
];

// ── 정렬 ─────────────────────────────────────────────────────────
type SortKey = "nickname" | "email" | "createdAt" | "lastLoginAt" | "plan" | "provider";
type SortDir = "desc" | "asc" | null;

const SORT_COLS: { key: SortKey; label: string }[] = [
  { key: "nickname",    label: "닉네임" },
  { key: "email",       label: "이메일" },
  { key: "createdAt",   label: "가입일" },
  { key: "lastLoginAt", label: "최근 로그인" },
  { key: "plan",        label: "플랜" },
  { key: "provider",    label: "가입경로" },
];

function nextDir(cur: SortDir): SortDir {
  if (cur === null)   return "desc";
  if (cur === "desc") return "asc";
  return null;
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "desc") return <span className="ml-1 text-purple-400">▼</span>;
  if (dir === "asc")  return <span className="ml-1 text-purple-400">▲</span>;
  return <span className="ml-1 text-white/20">⇅</span>;
}

// ── 플랜 추가 팝업 ───────────────────────────────────────────────
function CreatePlanModal({
  users,
  onClose,
  onCreated,
}: {
  users: UserRecord[];
  onClose: () => void;
  onCreated: (plan: PlanConfig) => void;
}) {
  const [planId,      setPlanId]      = useState("");
  const [planName,    setPlanName]    = useState("");
  const [description, setDescription] = useState("");
  const [userSearch,  setUserSearch]  = useState("");
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // planId 자동 생성 (한글 → 영문 변환 없이 입력 그대로)
  function handleNameChange(v: string) {
    setPlanName(v);
    if (!planId) {
      setPlanId(v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter((u) =>
      !q || u.email.toLowerCase().includes(q) || u.nickname.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  function toggleUid(uid: string) {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }

  async function handleSubmit() {
    setError(null);
    if (!planId || !planName) { setError("플랜 ID와 플랜명을 입력해주세요."); return; }
    if (!/^[a-z0-9-]+$/.test(planId)) { setError("플랜 ID는 영소문자·숫자·하이픈만 사용 가능합니다."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: planId, name: planName, description, assignUids: [...selectedUids] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "생성 실패"); return; }

      onCreated({ id: planId, name: planName, description, createdAt: new Date().toISOString() });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white text-lg font-bold">새 플랜 추가</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="space-y-4">
          {/* 플랜명 */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">플랜명 *</label>
            <input
              value={planName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 테스터, 이벤트 참가자"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-purple-400/60"
            />
          </div>

          {/* 플랜 ID */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">
              플랜 ID * <span className="text-white/25">(영소문자·숫자·하이픈)</span>
            </label>
            <input
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              placeholder="예: tester, event-2026"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-purple-400/60 font-mono"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">설명 (선택)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 플랜에 대한 간단한 설명"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-purple-400/60"
            />
          </div>

          {/* 계정 할당 */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">
              할당할 계정 (선택)
              {selectedUids.size > 0 && (
                <span className="ml-2 text-purple-400">{selectedUids.size}명 선택됨</span>
              )}
            </label>
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="이메일 또는 닉네임 검색..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-white/25 outline-none focus:border-purple-400/60 mb-2"
            />
            <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 divide-y divide-white/5">
              {filteredUsers.slice(0, 30).map((u) => (
                <label
                  key={u.uid}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUids.has(u.uid)}
                    onChange={() => toggleUid(u.uid)}
                    className="accent-purple-500"
                  />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{u.nickname || "-"}</p>
                    <p className="text-white/40 text-xs truncate">{u.email}</p>
                  </div>
                </label>
              ))}
              {filteredUsers.length === 0 && (
                <p className="px-3 py-4 text-white/20 text-xs text-center">검색 결과 없음</p>
              )}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {submitting ? "생성 중..." : "플랜 생성"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,       setUsers]       = useState<UserRecord[]>([]);
  const [allStats,    setAllStats]    = useState<AllStats | null>(null);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const [search,          setSearch]          = useState("");
  const [planFilter,      setPlanFilter]      = useState("");
  const [providerFilter,  setProviderFilter]  = useState<UserProvider | "">("");

  const [sortKey,     setSortKey]     = useState<SortKey | null>(null);
  const [sortDir,     setSortDir]     = useState<SortDir>(null);

  const [changing,    setChanging]    = useState<string | null>(null);
  const [detailUid,   setDetailUid]   = useState<string | null>(null);

  const [customPlans, setCustomPlans] = useState<PlanConfig[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 커스텀 플랜 목록 로드
  useEffect(() => {
    fetch("/api/admin/plans")
      .then((r) => r.json())
      .then((d) => setCustomPlans(d.plans ?? []))
      .catch(() => {});
  }, []);

  // 모든 플랜 옵션 (기본 + 커스텀)
  const allPlanOptions = useMemo(() => [
    { value: "free",    label: "무료" },
    { value: "premium", label: "프리미엄" },
    { value: "admin",   label: "관리자" },
    ...customPlans.map((p) => ({ value: p.id, label: p.name })),
  ], [customPlans]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (planFilter)     params.set("plan",     planFilter);
      if (providerFilter) params.set("provider", providerFilter);
      if (search)         params.set("q",        search);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("조회 실패");
      const data = await res.json();

      setUsers(data.users ?? []);
      setFilteredTotal(data.total ?? 0);
      if (data.allStats) setAllStats(data.allStats);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, providerFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // 클라이언트 정렬
  const sortedUsers = useMemo(() => {
    if (!sortKey || !sortDir) return users;
    return [...users].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, sortKey, sortDir]);

  function handleSortClick(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else {
      const next = nextDir(sortDir);
      setSortDir(next);
      if (next === null) setSortKey(null);
    }
  }

  async function handlePlanChange(uid: string, newPlan: string) {
    setChanging(uid);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, plan: newPlan }),
      });
      if (!res.ok) throw new Error("변경 실패");
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, plan: newPlan } : u)));
      // allStats 업데이트 (간단히 재조회 없이 로컬 보정)
      if (allStats) {
        const oldUser = users.find((u) => u.uid === uid);
        if (oldUser) {
          setAllStats((prev) => {
            if (!prev) return prev;
            const next = { ...prev };
            next[oldUser.plan] = Math.max(0, (next[oldUser.plan] ?? 0) - 1);
            next[newPlan]      = (next[newPlan] ?? 0) + 1;
            return next;
          });
        }
      }
    } catch {
      alert("플랜 변경에 실패했습니다.");
    } finally {
      setChanging(null);
    }
  }

  const statsCards = [
    { label: "전체 회원",   value: allStats?.total    ?? 0 },
    { label: "프리미엄",    value: allStats?.premium  ?? 0 },
    { label: "무료 회원",   value: allStats?.free     ?? 0 },
    { label: "관리자",      value: allStats?.admin    ?? 0 },
  ];

  return (
    <div className="p-8">
      <UserDetailDrawer uid={detailUid} onClose={() => setDetailUid(null)} />

      {showCreateModal && (
        <CreatePlanModal
          users={users}
          onClose={() => setShowCreateModal(false)}
          onCreated={(plan) => {
            setCustomPlans((prev) => [plan, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">회원 관리</h2>
          <p className="text-white/40 text-sm mt-1">가입 회원 조회, 플랜 변경을 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="text-base leading-none">+</span> 플랜 추가
        </button>
      </div>

      {/* 통계 카드 — 전체 통계 고정 */}
      <AdminStatCards
        cards={statsCards.map((s) => ({ label: s.label, value: allStats === null ? "-" : s.value }))}
      />

      {/* 커스텀 플랜 목록 */}
      {customPlans.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {customPlans.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-full bg-sky-400/10 border border-sky-400/30 px-3 py-1">
              <span className="text-sky-400 text-xs font-bold">{p.name}</span>
              <span className="text-white/30 text-xs font-mono">{p.id}</span>
              {p.description && <span className="text-white/30 text-xs">— {p.description}</span>}
            </div>
          ))}
        </div>
      )}

      {/* 필터 바 */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          placeholder="이메일 또는 닉네임 검색..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-purple-400/60"
        />
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value as UserProvider | "")}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/60 text-sm outline-none cursor-pointer"
        >
          {PROVIDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/60 text-sm outline-none cursor-pointer"
        >
          <option value="">전체 플랜</option>
          {allPlanOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={fetchUsers}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
        >
          검색
        </button>
      </div>

      {/* 검색 결과 카운트 */}
      {!loading && (
        <p className="text-white/30 text-xs mb-3">
          검색 결과 <span className="text-white/60 font-semibold">{filteredTotal}건</span>
          {allStats && (
            <> / 전체 <span className="text-white/60 font-semibold">{allStats.total}건</span></>
          )}
          {(search || planFilter || providerFilter) && (
            <button
              onClick={() => { setSearch(""); setPlanFilter(""); setProviderFilter(""); }}
              className="ml-3 text-purple-400 hover:text-purple-300 transition-colors"
            >
              필터 초기화
            </button>
          )}
        </p>
      )}

      {/* 테이블 */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {SORT_COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSortClick(col.key)}
                  className="text-left px-4 py-3 text-white/40 font-medium cursor-pointer hover:text-white/60 select-none transition-colors whitespace-nowrap"
                >
                  {col.label}
                  <SortIcon dir={sortKey === col.key ? sortDir : null} />
                </th>
              ))}
              <th className="text-left px-4 py-3 text-white/40 font-medium">플랜 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <AdminTableSkeleton rows={5} cols={7} />
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-red-400 text-sm">{error}</td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/20 text-sm">
                  회원이 없거나 검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => {
                const planStyle = getPlanStyle(user.plan, customPlans);
                return (
                  <tr
                    key={user.uid}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setDetailUid(user.uid)}
                  >
                    {/* 닉네임 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">
                            {((user.nickname || user.email || "?")[0] ?? "?").toUpperCase()}
                          </div>
                        )}
                        <span className="text-white font-medium">{user.nickname || "-"}</span>
                      </div>
                    </td>
                    {/* 이메일 */}
                    <td className="px-4 py-3 text-white/60 truncate max-w-[180px]">{user.email}</td>
                    {/* 가입일 */}
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    {/* 최근 로그인 */}
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap">{formatDateTime(user.lastLoginAt)}</td>
                    {/* 플랜 배지 */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${planStyle.bg} ${planStyle.color}`}>
                        {planStyle.label}
                      </span>
                    </td>
                    {/* 가입 경로 */}
                    <td className="px-4 py-3">
                      {(() => {
                        const pi = PROVIDER_INFO[user.provider] ?? PROVIDER_INFO.unknown;
                        return (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${pi.bg} ${pi.color}`}>
                            <span className="text-[10px]">{pi.icon}</span>
                            {pi.label}
                          </span>
                        );
                      })()}
                    </td>
                    {/* 플랜 변경 */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {changing === user.uid ? (
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <select
                          value={user.plan}
                          onChange={(e) => handlePlanChange(user.uid, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs outline-none cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <option value="free">무료</option>
                          <option value="premium">프리미엄</option>
                          <option value="admin">관리자</option>
                          {customPlans.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
