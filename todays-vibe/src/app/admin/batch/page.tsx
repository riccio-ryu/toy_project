"use client";

import { useState } from "react";

type Period =
  | "weekly-zodiac"
  | "weekly-chinese"
  | "monthly-zodiac"
  | "monthly-chinese"
  | "yearly-zodiac"
  | "yearly-chinese"
  | "all";

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

const PERIODS: { value: Period; label: string; icon: string; desc: string }[] = [
  { value: "weekly-zodiac",   label: "주간 (별자리)", icon: "⭐", desc: "12별자리 주간 7일치 생성" },
  { value: "weekly-chinese",  label: "주간 (띠)",     icon: "🐉", desc: "12띠 주간 7일치 생성" },
  { value: "monthly-zodiac",  label: "월간 (별자리)", icon: "🌙", desc: "12별자리 월간 생성" },
  { value: "monthly-chinese", label: "월간 (띠)",     icon: "🗓️", desc: "12띠 월간 생성" },
  { value: "yearly-zodiac",   label: "연간 (별자리)", icon: "✨", desc: "12별자리 연간 생성" },
  { value: "yearly-chinese",  label: "연간 (띠)",     icon: "🎯", desc: "12띠 연간 생성" },
];

export default function BatchPage() {
  const [loading, setLoading] = useState<Period | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const runBatch = async (period: Period) => {
    if (loading) return;
    if (
      !confirm(
        `${PERIODS.find((p) => p.value === period)?.label ?? "전체"} 운세를 지금 생성할까요?\n(Gemini API 호출이 발생합니다)`
      )
    )
      return;

    setLoading(period);
    setResponse(null);

    try {
      const res = await fetch(`/api/cron/fortune/force?period=${period}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}`,
        },
      });
      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ message: "요청 실패", error: String(err) });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">운세 배치 관리</h2>
        <p className="text-white/40 text-sm mt-1">
          운세 데이터를 수동으로 강제 생성합니다. Gemini API가 호출됩니다.
        </p>
      </div>

      {/* 개별 배치 버튼 (2열) */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => runBatch(p.value)}
            disabled={loading !== null}
            className="rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 p-5 text-left transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{p.icon}</span>
              {loading === p.value && (
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <p className="text-white font-semibold text-sm">{p.label}</p>
            <p className="text-white/40 text-xs mt-0.5">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* 전체 생성 버튼 (전체 너비) */}
      <button
        onClick={() => runBatch("all")}
        disabled={loading !== null}
        className="w-full rounded-xl border bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:from-purple-500/30 p-5 text-left transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">⚡</span>
          {loading === "all" && (
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <p className="text-white font-semibold text-sm">전체 생성</p>
        <p className="text-white/40 text-xs mt-0.5">위 6개 모두 생성 (Gemini API 6회 호출)</p>
      </button>

      {/* 실행 결과 */}
      {response && (
        <div
          className={`rounded-xl border p-5 ${
            response.error
              ? "bg-red-900/20 border-red-500/30"
              : "bg-green-900/20 border-green-500/30"
          }`}
        >
          <p
            className={`font-semibold text-sm mb-3 ${
              response.error ? "text-red-300" : "text-green-300"
            }`}
          >
            {response.error ? "❌ 오류 발생" : "✅ " + response.message}
          </p>

          {response.error && (
            <p className="text-red-400 text-xs">{response.error}</p>
          )}

          {response.results?.map((r, i) => (
            <div key={i} className="mt-3 text-xs text-white/60 space-y-1">
              <p className="text-white/80 font-medium">{r.period}</p>
              <p>
                총 {r.total}개 중 성공 {r.succeeded}개 / 실패 {r.failed}개
              </p>
              {r.errors.length > 0 && (
                <ul className="text-red-400 space-y-0.5">
                  {r.errors.map((e, j) => (
                    <li key={j}>• {e}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
