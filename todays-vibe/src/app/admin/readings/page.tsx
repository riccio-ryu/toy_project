"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { formatDateTime } from "@/lib/utils/format";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

type Reading = {
  id: string;
  userId: string | null;
  type: string;
  date: string;
  result: string;
  createdAt: string | null;
};

const TYPE_META: Record<string, { emoji: string; label: string }> = {
  saju:                 { emoji: "📜", label: "사주팔자" },
  dream:                { emoji: "🌙", label: "꿈해몽" },
  "tarot-3cards":       { emoji: "🃏", label: "타로 3장" },
  "tarot-celtic":       { emoji: "🔮", label: "켈틱 크로스" },
  "tarot-horseshoe":    { emoji: "🔮", label: "말발굽" },
  "tarot-full-moon":    { emoji: "🌕", label: "보름달" },
  "tarot-tree-of-life": { emoji: "🌳", label: "생명의 나무" },
  zodiac:               { emoji: "✨", label: "별자리" },
  "chinese-zodiac":     { emoji: "🐉", label: "띠별 운세" },
};

const TYPE_OPTIONS = [
  { value: "", label: "전체 타입" },
  ...Object.entries(TYPE_META).map(([value, { emoji, label }]) => ({
    value,
    label: `${emoji} ${label}`,
  })),
];


export default function AdminReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [typeFilter, setTypeFilter]   = useState("");
  const [userFilter, setUserFilter]   = useState("");
  const [userInput, setUserInput]     = useState("");

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (typeFilter) params.set("type", typeFilter);
      if (userFilter) params.set("userId", userFilter);

      const res = await fetch(`/api/admin/readings?${params}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReadings(data.readings ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [typeFilter, userFilter]);

  useEffect(() => { fetchReadings(); }, [fetchReadings]);

  // 타입별 카운트
  const typeCounts = readings.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">운세 기록</h2>
        <p className="text-white/40 text-sm mt-1">
          저장된 AI 운세 결과를 조회합니다. 유저가 결과를 못 봤을 때 여기서 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <AdminStatCards cards={[
        { label: "전체 기록",    value: loading ? "-" : total },
        { label: "사주팔자",     value: loading ? "-" : (typeCounts["saju"] ?? 0) },
        { label: "타로 (전체)", value: loading ? "-" : Object.entries(typeCounts).filter(([k]) => k.startsWith("tarot")).reduce((s, [, v]) => s + v, 0) },
        { label: "꿈해몽",      value: loading ? "-" : (typeCounts["dream"] ?? 0) },
      ]} />

      {/* 필터 바 */}
      <div className="flex gap-3 mb-5">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm outline-none focus:border-purple-400/60"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setUserFilter(userInput); }}
          placeholder="userId로 검색..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-purple-400/60"
        />
        <button
          onClick={() => setUserFilter(userInput)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
        >
          검색
        </button>
        {(typeFilter || userFilter) && (
          <button
            onClick={() => { setTypeFilter(""); setUserFilter(""); setUserInput(""); }}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 text-sm rounded-lg border border-white/10 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* 테이블 */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["타입", "userId", "일시", "결과 미리보기"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <AdminTableSkeleton rows={6} cols={4} />
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-red-400 text-sm">
                  {error}
                </td>
              </tr>
            ) : readings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-white/20 text-sm">
                  기록이 없습니다.
                </td>
              </tr>
            ) : (
              readings.map((r) => {
                const meta = TYPE_META[r.type] ?? { emoji: "🔮", label: r.type };
                const isExpanded = expandedId === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      {/* 타입 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{meta.emoji}</span>
                          <span className="text-white/80 font-medium">{meta.label}</span>
                        </span>
                      </td>
                      {/* userId */}
                      <td className="px-4 py-3">
                        {r.userId ? (
                          <span className="text-white/50 font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                            {r.userId.slice(0, 12)}…
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">비로그인</span>
                        )}
                      </td>
                      {/* 일시 */}
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                        {formatDateTime(r.createdAt)}
                      </td>
                      {/* 결과 미리보기 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs truncate max-w-xs">
                            {r.result.slice(0, 60)}…
                          </span>
                          <span className={`text-white/20 text-xs shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="mb-2 flex gap-3 text-xs text-white/30">
                            <span>ID: <span className="font-mono text-white/40">{r.id}</span></span>
                            <span>userId: <span className="font-mono text-white/40">{r.userId ?? "없음"}</span></span>
                            <span>date: <span className="font-mono text-white/40">{r.date}</span></span>
                          </div>
                          <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap border-t border-white/5 pt-3">
                            {r.result}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && readings.length > 0 && (
        <p className="text-white/20 text-xs mt-3 text-right">
          {total}건 중 {readings.length}건 표시
        </p>
      )}
    </div>
  );
}
