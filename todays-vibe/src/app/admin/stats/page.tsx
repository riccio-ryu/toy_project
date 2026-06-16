"use client";

import { useEffect, useState } from "react";

type Period = "today" | "7d" | "30d" | "all";

interface MenuRankItem {
  id: string;
  nameKo: string;
  icon: string;
  count: number;
}

interface StatsData {
  totalUsage: number;
  topMenu: MenuRankItem | null;
  totalUsers: number;
  newUsers: number;
  dailyData: { date: string; count: number }[];
  menuRanking: MenuRankItem[];
}

interface MenuDetail {
  totalCount: number;
  uniqueUsers: number;
  dailyData: { date: string; count: number }[];
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "오늘" },
  { value: "7d",    label: "7일" },
  { value: "30d",   label: "30일" },
  { value: "all",   label: "전체" },
];

function formatDate(yyyymmdd: string): string {
  const m = parseInt(yyyymmdd.slice(4, 6));
  const d = parseInt(yyyymmdd.slice(6, 8));
  return `${m}/${d}`;
}

function MiniBarChart({ dailyData, period }: { dailyData: { date: string; count: number }[]; period: Period }) {
  const max = Math.max(...dailyData.map((d) => d.count), 1);
  if (dailyData.every((d) => d.count === 0)) {
    return <p className="text-white/20 text-xs text-center py-4">기간 내 이용 없음</p>;
  }
  return (
    <div className="flex items-end gap-0.5 h-16 overflow-x-auto">
      {dailyData.map(({ date, count }) => (
        <div key={date} className="flex flex-col items-center gap-0.5 min-w-[18px] flex-1 group relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {count}회
          </div>
          <div
            className={`w-full rounded-t transition-colors ${
              count === 0 ? "bg-white/5" : "bg-purple-400/70 group-hover:bg-purple-300"
            }`}
            style={{ height: `${Math.max((count / max) * 52, count > 0 ? 3 : 1)}px` }}
          />
          {period !== "today" && dailyData.length <= 10 && (
            <p className="text-white/20 text-[8px] shrink-0">{formatDate(date)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminStatsPage() {
  const [period, setPeriod]           = useState<Period>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd]     = useState("");
  const [data, setData]               = useState<StatsData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [detail, setDetail]           = useState<MenuDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const isCustom = customStart !== "" && customEnd !== "";

  function buildQuery(extra?: string) {
    const base = isCustom
      ? `start=${customStart}&end=${customEnd}`
      : `period=${period}`;
    return `/api/admin/stats?${base}${extra ? `&${extra}` : ""}`;
  }

  // 전체 통계 조회
  useEffect(() => {
    if (isCustom && customEnd < customStart) return;
    setLoading(true);
    setData(null);
    setSelectedId(null);
    setDetail(null);
    fetch(buildQuery())
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customStart, customEnd]);

  // 메뉴 드릴다운 조회
  function handleMenuClick(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    fetch(buildQuery(`menuId=${id}`))
      .then((r) => r.json())
      .then(setDetail)
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  }

  function handlePeriodClick(p: Period) {
    setPeriod(p);
    setCustomStart("");
    setCustomEnd("");
  }

  const maxDaily = data ? Math.max(...data.dailyData.map((d) => d.count), 1) : 1;
  const maxMenu  = data?.menuRanking[0]?.count ?? 1;

  return (
    <div className="p-4 md:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white">사용 통계</h2>
        <p className="text-white/40 text-sm mt-1">일별 · 운세별 이용 현황을 확인합니다.</p>
      </div>

      {/* 기간 선택 */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handlePeriodClick(value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !isCustom && period === value
                ? "bg-purple-600 text-white"
                : "text-white/40 border border-white/10 hover:border-white/30 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}

        <span className="text-white/20 text-sm px-1 hidden sm:inline">|</span>

        {/* 커스텀 날짜 범위 */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={customStart}
            max={customEnd || undefined}
            onChange={(e) => setCustomStart(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm bg-white/5 border transition-colors text-white/70 focus:outline-none focus:border-purple-400 [color-scheme:dark] ${
              isCustom ? "border-purple-500/60" : "border-white/10"
            }`}
          />
          <span className="text-white/30 text-sm">~</span>
          <input
            type="date"
            value={customEnd}
            min={customStart || undefined}
            onChange={(e) => setCustomEnd(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm bg-white/5 border transition-colors text-white/70 focus:outline-none focus:border-purple-400 [color-scheme:dark] ${
              isCustom ? "border-purple-500/60" : "border-white/10"
            }`}
          />
          {isCustom && (
            <button
              onClick={() => { setCustomStart(""); setCustomEnd(""); }}
              className="text-white/30 hover:text-white/60 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "총 AI 이용 횟수", icon: "🤖", value: loading ? null : (data?.totalUsage ?? 0).toLocaleString(), unit: "회" },
          { label: "가장 인기 운세",  icon: "⭐", value: loading ? null : data?.topMenu ? `${data.topMenu.icon} ${data.topMenu.nameKo}` : "—", unit: "" },
          { label: "총 가입자",       icon: "👤", value: loading ? null : (data?.totalUsers ?? 0).toLocaleString(), unit: "명" },
          { label: period === "all" ? "전체 가입자" : "신규 가입", icon: "✨", value: loading ? null : (data?.newUsers ?? 0).toLocaleString(), unit: "명" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span>{s.icon}</span>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
            {s.value === null ? (
              <div className="h-8 w-20 bg-white/10 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-white font-bold text-2xl leading-tight">
                {s.value}
                {s.unit && s.value !== "—" && (
                  <span className="text-white/40 text-sm font-normal ml-1">{s.unit}</span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 일별 이용량 차트 (오늘 제외) */}
      {period !== "today" && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-8">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-6">
            일별 이용량
          </h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data?.dailyData.length || data.dailyData.every((d) => d.count === 0) ? (
            <div className="h-32 flex items-center justify-center text-white/20 text-sm">데이터가 없습니다</div>
          ) : (
            <div className="flex items-end gap-1 h-36 overflow-x-auto pb-6">
              {data.dailyData.map(({ date, count }) => (
                <div key={date} className="flex flex-col items-center gap-1 min-w-[26px] flex-1 group relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {count}회
                  </div>
                  <div
                    className={`w-full rounded-t transition-colors ${
                      count === 0 ? "bg-white/5" : "bg-purple-500/60 group-hover:bg-purple-400"
                    }`}
                    style={{ height: `${Math.max((count / maxDaily) * 112, count > 0 ? 4 : 2)}px` }}
                  />
                  <p className="text-white/25 text-[9px] shrink-0">{formatDate(date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 운세별 이용 순위 */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest">
            운세별 이용 순위
          </h3>
          {selectedId && (
            <button
              onClick={() => { setSelectedId(null); setDetail(null); }}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              접기 ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !data?.menuRanking.length ? (
          <div className="px-5 py-12 text-center text-white/20 text-sm">데이터가 없습니다</div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.menuRanking.map((item, idx) => (
              <div key={item.id}>
                {/* 메뉴 행 */}
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3 transition-colors text-left ${
                    selectedId === item.id
                      ? "bg-purple-600/10 border-l-2 border-purple-500"
                      : "hover:bg-white/3"
                  }`}
                >
                  <span className={`w-5 text-center text-xs font-bold shrink-0 ${
                    idx === 0 ? "text-amber-400" :
                    idx === 1 ? "text-white/50"  :
                    idx === 2 ? "text-orange-600/80" : "text-white/20"
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span className="flex-1 text-white/80 text-sm truncate">{item.nameKo}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${(item.count / maxMenu) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-sm font-medium w-10 text-right">
                      {item.count.toLocaleString()}
                    </span>
                    <span className={`text-white/30 text-xs transition-transform ${
                      selectedId === item.id ? "rotate-180" : ""
                    }`}>▼</span>
                  </div>
                </button>

                {/* 드릴다운 패널 */}
                {selectedId === item.id && (
                  <div className="bg-white/3 border-t border-white/5 px-5 py-4">
                    {detailLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : detail ? (
                      <div className="space-y-4">
                        {/* 요약 카드 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                            <p className="text-white/40 text-[10px] mb-1">기간 내 총 이용</p>
                            <p className="text-white font-bold text-xl">
                              {detail.totalCount.toLocaleString()}
                              <span className="text-white/40 text-xs font-normal ml-1">회</span>
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                            <p className="text-white/40 text-[10px] mb-1">이용 유저 수</p>
                            <p className="text-white font-bold text-xl">
                              {detail.uniqueUsers.toLocaleString()}
                              <span className="text-white/40 text-xs font-normal ml-1">명</span>
                            </p>
                          </div>
                        </div>
                        {/* 미니 차트 */}
                        {period !== "today" && (
                          <div>
                            <p className="text-white/30 text-[10px] mb-2 uppercase tracking-widest">일별 추이</p>
                            <MiniBarChart dailyData={detail.dailyData} period={period} />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
