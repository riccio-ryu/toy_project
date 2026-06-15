"use client";

import { useEffect, useState, useCallback } from "react";
import type { AiUsageResponse, MenuLimitInfo, UserUsageRow } from "@/app/api/admin/ai-usage/route";
import type { GcpUsageResult, GcpUsageError } from "@/lib/gcp/monitoring";

type Period = "today" | "7d" | "30d";

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "오늘" },
  { value: "7d",    label: "7일" },
  { value: "30d",   label: "30일" },
];

function fmtTokens(n: number): string {
  if (n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const PLAN_LABEL: Record<string, string> = {
  free:    "무료",
  premium: "프리미엄",
  admin:   "관리자",
};
const PLAN_COLOR: Record<string, string> = {
  free:    "text-white/40",
  premium: "text-yellow-400",
  admin:   "text-purple-400",
};

// ─── 한도 편집 모달 ───────────────────────────────────────────────────────────

function LimitsModal({
  menu,
  onClose,
  onSave,
}: {
  menu: MenuLimitInfo;
  onClose: () => void;
  onSave: (id: string, limits: Record<string, number>) => Promise<void>;
}) {
  const init = menu.usageLimits ?? {};
  const [member,  setMember]  = useState(String(init.member  ?? -1));
  const [premium, setPremium] = useState(String(init.premium ?? -1));
  const [saving, setSaving]   = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(menu.id, {
      member:  Number(member),
      premium: Number(premium),
      admin:   -1,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">{menu.icon}</span>
          <h3 className="text-white font-semibold">{menu.nameKo} 한도 설정</h3>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white/60 text-lg">✕</button>
        </div>

        <p className="text-white/30 text-xs mb-4">-1 = 무제한 &nbsp;·&nbsp; 0 = 사용불가</p>

        <div className="space-y-3">
          {[
            { label: "무료 회원",     value: member,  set: setMember },
            { label: "프리미엄 회원", value: premium, set: setPremium },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-white/50 text-sm w-28">{label}</span>
              <input
                type="number"
                min={-1}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-right focus:outline-none focus:border-purple-500/50"
              />
              <span className="text-white/30 text-xs w-6">회</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/10 text-white/40 text-sm hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-purple-600/50 border border-purple-500/30 text-purple-200 text-sm hover:bg-purple-600/70 transition-colors disabled:opacity-50"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 공용 바 컴포넌트 ────────────────────────────────────────────────────────

interface BarProps {
  value: number;
  total: number;
  label: string;
  numColor: string;
  barColor: string;
  denomLabel?: string;
}

function StatBar({ value, total, label, numColor, barColor, denomLabel }: BarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const alertColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : barColor;
  const pctTextColor = pct >= 90 ? "text-red-400" : pct >= 70 ? "text-yellow-300" : "text-white/40";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-white/40 text-xs">{label}</span>
        <span className={`text-xs font-semibold tabular-nums ${pctTextColor}`}>{pct}%</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums leading-none ${numColor}`}>
          {value === 0 ? "—" : fmtTokens(value)}
        </span>
        {denomLabel && <span className="text-white/20 text-xs">/ {denomLabel}</span>}
      </div>
      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${alertColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-white/20 text-[10px] text-right tabular-nums">{value.toLocaleString()} tokens</div>
    </div>
  );
}

// ─── 사용률 바 (요청 횟수) ───────────────────────────────────────────────────

function UsageBar({ count, limit }: { count: number; limit: number | null }) {
  if (!limit || limit === -1) {
    return <span className="text-white/20 text-xs">무제한</span>;
  }
  const pct = Math.min(100, Math.round((count / limit) * 100));
  const color =
    pct >= 90 ? "bg-red-500" :
    pct >= 70 ? "bg-yellow-500" :
    "bg-emerald-500";

  return (
    <div className="space-y-1 min-w-[100px]">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs tabular-nums">{count.toLocaleString()} / {limit}</span>
        <span className={`text-xs font-semibold tabular-nums ${pct >= 90 ? "text-red-400" : pct >= 70 ? "text-yellow-300" : "text-white/40"}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── 토큰 바 (유저 테이블용) ─────────────────────────────────────────────────

function TokenBar({
  inputTokens, outputTokens, totalTokens, dailyLimit,
}: {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  dailyLimit: number;
}) {
  if (totalTokens === 0) return <span className="text-white/20 text-xs">—</span>;

  const totalPct = Math.min(100, Math.round((totalTokens / dailyLimit) * 100));
  const inputPct  = totalTokens > 0 ? Math.round((inputTokens  / totalTokens) * 100) : 0;
  const outputPct = totalTokens > 0 ? Math.round((outputTokens / totalTokens) * 100) : 0;
  const totalAlertColor = totalPct >= 90 ? "text-red-400" : totalPct >= 70 ? "text-yellow-300" : "text-white/40";

  return (
    <div className="space-y-1.5 min-w-[140px]">
      {/* 총 사용량 vs 한도 */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-purple-300 text-xs font-semibold tabular-nums">{fmtTokens(totalTokens)}</span>
        <span className={`text-xs font-bold tabular-nums ${totalAlertColor}`}>{totalPct}%</span>
      </div>
      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${totalPct >= 90 ? "bg-red-500" : totalPct >= 70 ? "bg-yellow-500" : "bg-purple-500"}`}
          style={{ width: `${totalPct}%` }}
        />
      </div>
      <div className="text-white/20 text-[10px] text-right">/ {fmtTokens(dailyLimit)}</div>
      {/* 입력/출력 분리 */}
      <div className="flex items-center gap-1 pt-0.5">
        <span className="text-blue-300/60 text-[10px] tabular-nums">입력 {inputPct}%</span>
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden flex">
          <div className="h-full bg-blue-500/60 rounded-l-full" style={{ width: `${inputPct}%` }} />
          <div className="h-full bg-emerald-500/60 rounded-r-full" style={{ width: `${outputPct}%` }} />
        </div>
        <span className="text-emerald-300/60 text-[10px] tabular-nums">{outputPct}% 출력</span>
      </div>
    </div>
  );
}

// ─── GCP 공식 사용량 섹션 ────────────────────────────────────────────────────

const GCP_PERIODS: { days: number; label: string }[] = [
  { days: 1,  label: "오늘" },
  { days: 7,  label: "7일" },
  { days: 28, label: "28일" },
];

function GcpUsagePanel() {
  const [days, setDays]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<
    | { ok: true; data: GcpUsageResult }
    | { ok: false; error: GcpUsageError }
    | null
  >(null);

  const load = useCallback((d: number) => {
    setLoading(true);
    fetch(`/api/admin/gcp-usage?days=${d}`)
      .then((r) => r.json())
      .then(setResult)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  const data = result?.ok ? result.data : null;
  const err  = result && !result.ok ? result.error : null;

  return (
    <div className="rounded-xl bg-white/3 border border-white/6 px-5 py-5 mb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-base">☁️</span>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">GCP 공식 사용량</p>
          <span className="text-white/20 text-xs">· AI Studio 실측값</span>
        </div>
        <div className="ml-auto flex gap-1.5">
          {GCP_PERIODS.map(({ days: d, label }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                days === d
                  ? "bg-purple-600/40 border border-purple-500/30 text-purple-200"
                  : "border border-white/10 text-white/30 hover:text-white/50"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => load(days)}
            className="px-2 py-1 rounded-full border border-white/10 text-white/30 hover:text-white/50 text-xs ml-1"
            title="새로고침"
          >↺</button>
        </div>
      </div>

      {/* 에러 */}
      {err && (
        <div className="rounded-lg bg-red-500/8 border border-red-500/15 px-4 py-3 text-sm">
          {err.type === "permission_denied" && (
            <>
              <p className="text-red-400 font-medium mb-1">IAM 권한 없음</p>
              <p className="text-white/40 text-xs whitespace-pre-line">{err.hint}</p>
            </>
          )}
          {err.type === "metric_not_found" && (
            <>
              <p className="text-yellow-400 font-medium mb-1">메트릭 없음</p>
              <p className="text-white/40 text-xs whitespace-pre-line">{err.hint}</p>
            </>
          )}
          {err.type === "unknown" && (
            <p className="text-red-400 text-xs">{err.message}</p>
          )}
        </div>
      )}

      {/* 데이터 */}
      {(loading || data) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:divide-x divide-white/6">
          {[
            { label: "입력 토큰",  value: data?.inputTokens,  denom: data ? data.inputTokens + data.outputTokens : 0, color: "text-blue-300",    bar: "bg-blue-500" },
            { label: "출력 토큰",  value: data?.outputTokens, denom: data ? data.inputTokens + data.outputTokens : 0, color: "text-emerald-300", bar: "bg-emerald-500" },
            { label: "총 요청 수", value: data?.requestCount, denom: null,                                            color: "text-white/70",    bar: "bg-white/30" },
          ].map(({ label, value, denom, color, bar }, i) => {
            const pct = denom && value ? Math.round((value / denom) * 100) : null;
            return (
              <div key={label} className={`space-y-2 ${i === 0 ? "pr-6" : i === 1 ? "px-6" : "pl-6"}`}>
                <div className="flex items-baseline justify-between">
                  <span className="text-white/40 text-xs">{label}</span>
                  {pct !== null && (
                    <span className="text-white/40 text-xs font-semibold tabular-nums">{pct}%</span>
                  )}
                </div>
                {loading ? (
                  <div className="h-7 bg-white/5 rounded animate-pulse" />
                ) : (
                  <p className={`text-2xl font-bold tabular-nums leading-none ${color}`}>
                    {value != null ? (label === "총 요청 수" ? value.toLocaleString() : fmtTokens(value)) : "—"}
                  </p>
                )}
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${bar}`}
                    style={{ width: loading ? "0%" : `${pct ?? 100}%` }}
                  />
                </div>
                {!loading && value != null && (
                  <p className="text-white/20 text-[10px] text-right tabular-nums">
                    {label === "총 요청 수" ? `${value.toLocaleString()} 건` : `${value.toLocaleString()} tokens`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 기간 표시 */}
      {data && (
        <p className="text-white/15 text-[10px] mt-4 text-right">
          {new Date(data.period.start).toLocaleDateString("ko-KR")} ~{" "}
          {new Date(data.period.end).toLocaleDateString("ko-KR")}
        </p>
      )}
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function AdminAiUsagePage() {
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData]     = useState<AiUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [editMenu, setEditMenu]   = useState<MenuLimitInfo | null>(null);
  const [editTokenLimit, setEditTokenLimit] = useState(false);
  const [tokenLimitInput, setTokenLimitInput] = useState("");
  const [savingTokenLimit, setSavingTokenLimit] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/ai-usage?period=${period}`)
      .then((r) => r.json())
      .then((d: AiUsageResponse) => {
        setData(d);
        setError(null);
      })
      .catch(() => setError("데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveLimits(menuId: string, limits: Record<string, number>) {
    await fetch(`/api/admin/ai-usage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId, usageLimits: limits }),
    });
    load();
  }

  async function handleSaveTokenLimit() {
    const val = Number(tokenLimitInput);
    if (!val || val < 0) return;
    setSavingTokenLimit(true);
    await fetch(`/api/admin/ai-usage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyTokenLimitPerUser: val }),
    });
    setSavingTokenLimit(false);
    setEditTokenLimit(false);
    load();
  }

  const { summary, users, menus } = data ?? { summary: null, users: [], menus: [] };
  const dailyTokenLimit = data?.dailyTokenLimit ?? 50_000;

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">AI 사용량 관리</h2>
        <p className="text-white/40 text-sm mt-1">기능별 이용 횟수 및 유저별 한도를 관리합니다.</p>
      </div>

      {/* 기간 필터 */}
      <div className="flex gap-2 mb-6">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              period === value
                ? "bg-purple-600/50 border border-purple-500/40 text-purple-200"
                : "border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto px-3 py-1.5 rounded-full border border-white/10 text-white/30 hover:text-white/60 text-sm transition-colors"
          title="새로고침"
        >
          ↺
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {[
          {
            label: "총 요청 수",
            value: loading ? "—" : (summary?.totalRequests ?? 0).toLocaleString(),
            sub: period === "today" ? "오늘" : period === "7d" ? "최근 7일" : "최근 30일",
          },
          {
            label: "활성 유저",
            value: loading ? "—" : (summary?.uniqueUsers ?? 0).toLocaleString(),
            sub: "명",
          },
          {
            label: "최다 이용 기능",
            value: loading ? "—" : summary?.topMenu ? `${summary.topMenu.icon} ${summary.topMenu.nameKo}` : "—",
            sub: summary?.topMenu ? `${summary.topMenu.count.toLocaleString()}회` : "",
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl bg-white/5 border border-white/8 px-5 py-4">
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <p className="text-white text-xl font-bold">{value}</p>
            <p className="text-white/30 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* 토큰 요약 */}
      <div className="rounded-xl bg-white/3 border border-white/6 px-5 py-5 mb-8">
        {/* 헤더 + 한도 편집 */}
        <div className="flex items-center gap-3 mb-5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">토큰 사용량</p>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-white/30 text-xs">유저당 일일 한도</span>
            {editTokenLimit ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={tokenLimitInput}
                  onChange={(e) => setTokenLimitInput(e.target.value)}
                  className="w-24 bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none focus:border-purple-500/50"
                  placeholder={String(dailyTokenLimit)}
                  autoFocus
                />
                <button
                  onClick={handleSaveTokenLimit}
                  disabled={savingTokenLimit}
                  className="px-2 py-1 rounded-lg bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs hover:bg-purple-600/60 transition-colors disabled:opacity-50"
                >
                  {savingTokenLimit ? "…" : "저장"}
                </button>
                <button onClick={() => setEditTokenLimit(false)} className="text-white/30 hover:text-white/60 text-xs">
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setTokenLimitInput(String(dailyTokenLimit)); setEditTokenLimit(true); }}
                className="text-white/50 text-xs font-semibold hover:text-purple-300 transition-colors"
              >
                {fmtTokens(dailyTokenLimit)} <span className="text-white/20 font-normal">편집</span>
              </button>
            )}
          </div>
        </div>

        {/* 3개 바 카드 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:divide-x divide-white/6">
            <div className="md:pr-6">
              <StatBar
                label="입력 토큰"
                value={summary?.totalInputTokens ?? 0}
                total={summary?.totalTokens ?? 0}
                numColor="text-blue-300"
                barColor="bg-blue-500"
                denomLabel={`총 ${fmtTokens(summary?.totalTokens ?? 0)}`}
              />
            </div>
            <div className="px-6">
              <StatBar
                label="출력 토큰"
                value={summary?.totalOutputTokens ?? 0}
                total={summary?.totalTokens ?? 0}
                numColor="text-emerald-300"
                barColor="bg-emerald-500"
                denomLabel={`총 ${fmtTokens(summary?.totalTokens ?? 0)}`}
              />
            </div>
            <div className="pl-6">
              <StatBar
                label="총 토큰 (용량 대비)"
                value={summary?.totalTokens ?? 0}
                total={(summary?.uniqueUsers ?? 1) * dailyTokenLimit}
                numColor="text-purple-300"
                barColor="bg-purple-500"
                denomLabel={`${fmtTokens((summary?.uniqueUsers ?? 1) * dailyTokenLimit)} cap`}
              />
            </div>
          </div>
        )}
      </div>

      {/* GCP 공식 사용량 */}
      <GcpUsagePanel />

      {/* 메뉴별 한도 설정 */}
      <div className="mb-8">
        <h3 className="text-white/70 text-sm font-semibold mb-3">기능별 한도 설정</h3>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <p className="text-white/20 text-sm">한도가 설정된 기능이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setEditMenu(menu)}
                className="text-left rounded-xl bg-white/5 border border-white/8 px-4 py-3 hover:border-purple-500/30 hover:bg-white/8 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{menu.icon}</span>
                  <span className="text-white/80 text-sm font-medium truncate">{menu.nameKo}</span>
                  <span className="ml-auto text-white/20 text-xs group-hover:text-purple-400 transition-colors">편집</span>
                </div>
                {menu.usageLimits ? (
                  <div className="flex gap-3 text-xs text-white/30">
                    <span>무료 {menu.usageLimits.member === -1 ? "∞" : (menu.usageLimits.member ?? "—")}회</span>
                    <span>·</span>
                    <span>프리미엄 {menu.usageLimits.premium === -1 ? "∞" : (menu.usageLimits.premium ?? "—")}회</span>
                  </div>
                ) : (
                  <span className="text-white/20 text-xs">한도 없음</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 유저별 사용 현황 */}
      <div>
        <h3 className="text-white/70 text-sm font-semibold mb-3">
          유저별 사용 현황
          {!loading && <span className="ml-2 text-white/30 font-normal">{users.length}명</span>}
        </h3>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {["유저", "플랜", "총 요청", "토큰 (입력/출력)", "기능별 이용"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-white/20">
                    기간 내 이용 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow key={user.uid} user={user} menus={menus} dailyTokenLimit={dailyTokenLimit} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 한도 편집 모달 */}
      {editMenu && (
        <LimitsModal
          menu={editMenu}
          onClose={() => setEditMenu(null)}
          onSave={handleSaveLimits}
        />
      )}
    </div>
  );
}

// ─── 유저 행 ──────────────────────────────────────────────────────────────────

function UserRow({ user, menus, dailyTokenLimit }: { user: UserUsageRow; menus: MenuLimitInfo[]; dailyTokenLimit: number }) {
  const [open, setOpen] = useState(false);

  const usedMenus = Object.entries(user.byMenu)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-4 py-3">
          <p className="text-white/80 text-sm truncate max-w-[180px]">{user.nickname || user.email}</p>
          {user.nickname && (
            <p className="text-white/30 text-xs truncate max-w-[180px]">{user.email}</p>
          )}
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs font-medium ${PLAN_COLOR[user.plan] ?? "text-white/40"}`}>
            {PLAN_LABEL[user.plan] ?? user.plan}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-white font-semibold">{user.totalCount.toLocaleString()}</span>
          <span className="text-white/30 text-xs ml-1">회</span>
        </td>
        <td className="px-4 py-3">
          <TokenBar
            inputTokens={user.totalInputTokens}
            outputTokens={user.totalOutputTokens}
            totalTokens={user.totalTokens}
            dailyLimit={dailyTokenLimit}
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {usedMenus.slice(0, 3).map(([menuId, count]) => {
              const menu = menus.find((m) => m.id === menuId);
              return (
                <span key={menuId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-xs text-white/50">
                  {menu?.icon ?? "🔮"} {count}
                </span>
              );
            })}
            {usedMenus.length > 3 && (
              <span className="text-white/20 text-xs self-center">+{usedMenus.length - 3}</span>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-white/5 bg-white/2">
          <td colSpan={5} className="px-6 py-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {usedMenus.map(([menuId, count]) => {
                const menu = menus.find((m) => m.id === menuId);
                const limit = menu?.usageLimits?.[user.plan as "member" | "premium"] ?? null;
                return (
                  <div key={menuId} className="flex items-center gap-2">
                    <span className="text-white/50 text-xs w-24 truncate">
                      {menu?.icon ?? "🔮"} {menu?.nameKo ?? menuId}
                    </span>
                    <UsageBar count={count} limit={limit} />
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
