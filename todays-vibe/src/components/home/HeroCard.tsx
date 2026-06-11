"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HeroCardSettings {
  notLoggedInText: string;
  noBirthInfoText: string;
}

interface DailyHeroData {
  state: "not_logged_in" | "no_birth_info" | "ready";
  score?: number;
  message?: string;
  stars?: [number, number, number];
  isAI?: boolean;
  settings: HeroCardSettings;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-yellow-300";
  if (score >= 75) return "text-emerald-300";
  return "text-blue-300";
}

const FORTUNE_ROWS = [
  { label: "연애운", href: "/love-fortune" },
  { label: "재물운", href: "/wealth-fortune" },
  { label: "건강운", href: "/health-fortune" },
];

const STARS_PLACEHOLDER = "★★★★☆";

function BgDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
      {[
        { x: "8%",  y: "18%" },
        { x: "82%", y: "12%" },
        { x: "65%", y: "72%" },
        { x: "25%", y: "82%" },
        { x: "92%", y: "55%" },
      ].map((pos, i) => (
        <span key={i} className="absolute text-white/8 text-sm" style={{ left: pos.x, top: pos.y }}>
          ✦
        </span>
      ))}
    </div>
  );
}

export default function HeroCard({ today }: { today: string }) {
  const [data, setData] = useState<DailyHeroData | null>(null);

  useEffect(() => {
    fetch("/api/user/daily-hero")
      .then((r) => r.json())
      .then((d: DailyHeroData) => setData(d))
      .catch(() => {});
  }, [today]);

  // ── 로딩 ────────────────────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="relative mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-indigo-900/25 to-blue-900/20 overflow-hidden">
        <BgDecorations />
        <div className="relative px-5 py-6">
          <p className="text-purple-300/60 text-xs font-semibold uppercase tracking-widest mb-4">
            ✨ 오늘의 운세
          </p>
          <div className="animate-pulse space-y-3">
            <div className="h-12 w-24 bg-white/10 rounded-lg" />
            <div className="h-4 w-3/4 bg-white/8 rounded" />
            <div className="h-4 w-1/2 bg-white/8 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const { state, score, message, stars, isAI, settings } = data;

  return (
    <div className="relative mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-indigo-900/25 to-blue-900/20 overflow-hidden">
      <BgDecorations />

      <div className="relative px-5 py-6">
        <p className="text-purple-300/60 text-xs font-semibold uppercase tracking-widest mb-4">
          ✨ 오늘의 운세
        </p>

        {/* ── 미로그인 ─────────────────────────────────────────────────────── */}
        {state === "not_logged_in" && (
          <>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-5xl font-bold leading-none text-white/70 blur-sm select-none">82</span>
              <span className="text-white/35 text-lg mb-1 blur-sm select-none">점</span>
            </div>
            <p className="text-white/60 text-sm mb-5 leading-relaxed blur-sm select-none">
              오늘은 새로운 기회가 찾아오는 날입니다.
            </p>
            <div className="space-y-2.5 mb-5">
              {FORTUNE_ROWS.map(({ label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-12 blur-sm select-none">{label}</span>
                  <span className="text-yellow-400/75 text-sm tracking-widest blur-sm select-none">
                    {STARS_PLACEHOLDER}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mb-3 leading-relaxed">
              {settings.notLoggedInText}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/60 transition-colors"
            >
              로그인하기 →
            </Link>
          </>
        )}

        {/* ── 로그인 (생년월일 유무 공통) ──────────────────────────────────── */}
        {(state === "no_birth_info" || state === "ready") &&
          score !== undefined &&
          stars &&
          message && (
          <>
            <div className="flex items-end gap-1.5 mb-2">
              <span className={`text-5xl font-bold leading-none ${scoreColor(score)}`}>
                {score}
              </span>
              <span className="text-white/35 text-lg mb-1">점</span>
              {isAI && (
                <span className="ml-1.5 mb-1.5 text-[10px] font-medium text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              )}
            </div>

            <p className="text-white/60 text-sm mb-5 leading-relaxed">{message}</p>

            <div className="space-y-2.5 mb-5">
              {FORTUNE_ROWS.map(({ label, href }, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-12">{label}</span>
                  <Link
                    href={href}
                    className="text-yellow-400/75 text-sm hover:text-yellow-300 transition-colors tracking-widest"
                  >
                    {"★".repeat(stars[i])}{"☆".repeat(5 - stars[i])}
                  </Link>
                </div>
              ))}
            </div>

            {state === "no_birth_info" && (
              <p className="text-white/40 text-xs mb-3 leading-relaxed">
                {settings.noBirthInfoText}
              </p>
            )}

            <Link
              href={state === "no_birth_info" ? "/mypage" : "/saju"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/60 transition-colors"
            >
              {state === "no_birth_info" ? "생년월일 등록하기 →" : "사주로 자세히 보기 →"}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
