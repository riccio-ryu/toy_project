"use client";

import { useState } from "react";

interface RunResult {
  period: string;
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

interface ApiResponse {
  message: string;
  results?: RunResult[];
  error?: string;
}

function isoWeekValue(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const year = d.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function monthValue(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function yearValue(date = new Date()): string {
  return String(date.getFullYear());
}

const SECTIONS = [
  {
    id: "weekly",
    label: "주간 운세",
    icon: "📅",
    inputType: "week" as const,
    periodZodiac: "weekly-zodiac",
    periodChinese: "weekly-chinese",
  },
  {
    id: "monthly",
    label: "월간 운세",
    icon: "🌙",
    inputType: "month" as const,
    periodZodiac: "monthly-zodiac",
    periodChinese: "monthly-chinese",
  },
  {
    id: "yearly",
    label: "연간 운세",
    icon: "✨",
    inputType: "number" as const,
    periodZodiac: "yearly-zodiac",
    periodChinese: "yearly-chinese",
  },
] as const;

export default function BatchRunner() {
  const [weekTarget,  setWeekTarget]  = useState(isoWeekValue());
  const [monthTarget, setMonthTarget] = useState(monthValue());
  const [yearTarget,  setYearTarget]  = useState(yearValue());
  const [loading,     setLoading]     = useState<string | null>(null);
  const [logs,        setLogs]        = useState<{ key: string; res: ApiResponse }[]>([]);

  function getTarget(sectionId: string) {
    if (sectionId === "weekly")  return weekTarget;
    if (sectionId === "monthly") return monthTarget;
    return yearTarget;
  }

  async function runBatch(period: string, sectionId: string, signLabel: string) {
    if (loading) return;
    const target = getTarget(sectionId);
    const confirmLabel =
      sectionId === "weekly"  ? `${target} 주간` :
      sectionId === "monthly" ? `${target} 월간` :
                                `${target}년 연간`;

    if (!confirm(`${confirmLabel} ${signLabel} 운세를 생성할까요?\n(Gemini API 호출이 발생합니다)`)) return;

    const key = `${period}_${target}`;
    setLoading(key);
    try {
      const res = await fetch(
        `/api/cron/fortune/force?period=${period}&target=${target}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
        }
      );
      const data: ApiResponse = await res.json();
      setLogs((prev) => [{ key, res: data }, ...prev].slice(0, 10));
    } catch (err) {
      setLogs((prev) => [{ key, res: { message: "요청 실패", error: String(err) } }, ...prev].slice(0, 10));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <p className="text-white/40 text-sm mb-6">
        기간을 지정하고 운세 데이터를 수동으로 생성합니다. Gemini API가 호출됩니다.
      </p>

      <div className="space-y-4 mb-8">
        {SECTIONS.map((s) => {
          const target = getTarget(s.id);
          const isThisLoading =
            loading?.startsWith(s.periodZodiac + "_") ||
            loading?.startsWith(s.periodChinese + "_");

          return (
            <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{s.icon}</span>
                <span className="text-white font-semibold text-sm">{s.label}</span>
              </div>

              <div className="mb-4">
                {s.inputType === "number" ? (
                  <input
                    type="number"
                    value={yearTarget}
                    onChange={(e) => setYearTarget(e.target.value)}
                    min={2020}
                    max={2099}
                    className="w-36 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-400/60 [color-scheme:dark]"
                  />
                ) : (
                  <input
                    type={s.inputType}
                    value={s.id === "weekly" ? weekTarget : monthTarget}
                    onChange={(e) =>
                      s.id === "weekly" ? setWeekTarget(e.target.value) : setMonthTarget(e.target.value)
                    }
                    className="bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-400/60 [color-scheme:dark]"
                  />
                )}
                <span className="ml-3 text-white/30 text-xs">
                  {s.inputType === "week"   && "ISO 주차 기준"}
                  {s.inputType === "month"  && "해당 월 전체"}
                  {s.inputType === "number" && "해당 연도 전체"}
                </span>
              </div>

              <div className="flex gap-2">
                {(["zodiac", "chinese"] as const).map((sign) => {
                  const period = sign === "zodiac" ? s.periodZodiac : s.periodChinese;
                  const label  = sign === "zodiac" ? "별자리" : "띠";
                  const isThis = loading === `${period}_${target}`;
                  return (
                    <button
                      key={sign}
                      onClick={() => runBatch(period, s.id, label)}
                      disabled={!!loading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isThis && <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />}
                      {label} 실행
                    </button>
                  );
                })}
                <button
                  onClick={async () => {
                    await runBatch(s.periodZodiac, s.id, "별자리");
                    await runBatch(s.periodChinese, s.id, "띠");
                  }}
                  disabled={!!loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-purple-300 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                >
                  {isThisLoading && <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />}
                  전체 실행
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {logs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs font-medium">실행 로그</p>
            <button onClick={() => setLogs([])} className="text-white/20 hover:text-white/40 text-xs transition-colors">
              지우기
            </button>
          </div>
          {logs.map(({ key, res }, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 ${res.error ? "bg-red-900/20 border-red-500/30" : "bg-green-900/20 border-green-500/30"}`}
            >
              <p className="text-white/30 text-xs font-mono mb-1">{key}</p>
              <p className={`font-semibold text-sm mb-2 ${res.error ? "text-red-300" : "text-green-300"}`}>
                {res.error ? "❌ 오류 발생" : "✅ " + res.message}
              </p>
              {res.error && <p className="text-red-400 text-xs">{res.error}</p>}
              {res.results?.map((r, j) => (
                <div key={j} className="text-xs text-white/50 space-y-0.5 mt-2">
                  <p className="text-white/70 font-medium">{r.period}</p>
                  <p>총 {r.total}개 · 성공 {r.succeeded} · 실패 {r.failed}</p>
                  {r.errors.map((e, k) => <p key={k} className="text-red-400">• {e}</p>)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
