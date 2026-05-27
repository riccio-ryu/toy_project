"use client";

import { useState } from "react";

type Period = "weekly" | "monthly" | "yearly" | "all";

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

const PERIODS: { value: Period; label: string; icon: string; desc: string }[] =
  [
    {
      value: "weekly",
      label: "주간 운세",
      icon: "📅",
      desc: "12별자리 + 12띠 × 7일치 생성",
    },
    {
      value: "monthly",
      label: "월간 운세",
      icon: "🗓️",
      desc: "12별자리 + 12띠 월간 생성",
    },
    {
      value: "yearly",
      label: "연간 운세",
      icon: "🎯",
      desc: "12별자리 + 12띠 연간 생성",
    },
    {
      value: "all",
      label: "전체 생성",
      icon: "⚡",
      desc: "주간 + 월간 + 연간 모두 생성",
    },
  ];

export default function BatchPage() {
  const [loading, setPeriodLoading] = useState<Period | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const runBatch = async (period: Period) => {
    if (loading) return;
    if (
      !confirm(
        `${PERIODS.find((p) => p.value === period)?.label} 운세를 지금 생성할까요?\n(Gemini API 호출이 발생합니다)`
      )
    )
      return;

    setPeriodLoading(period);
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
      setPeriodLoading(null);
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

      {/* 배치 실행 버튼 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => runBatch(p.value)}
            disabled={loading !== null}
            className={`rounded-xl border p-5 text-left transition-all duration-200 ${
              p.value === "all"
                ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:from-purple-500/30"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
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
