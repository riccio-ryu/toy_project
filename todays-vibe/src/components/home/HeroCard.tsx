"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── 달 위상 계산 ──────────────────────────────────────────────────────────────

function julianDay(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const m = month <= 2 ? month + 12 : month;
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

function getMoonPhase(dateStr: string): { emoji: string; name: string } {
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6));
  const day = parseInt(dateStr.slice(6, 8));
  const jd = julianDay(year, month, day);
  const cycle = 29.53058867;
  const age = ((jd - 2451549.5) % cycle + cycle) % cycle;

  if (age < 1.85)  return { emoji: "🌑", name: "새달" };
  if (age < 7.38)  return { emoji: "🌒", name: "초승달" };
  if (age < 11.08) return { emoji: "🌓", name: "상현달" };
  if (age < 14.77) return { emoji: "🌔", name: "상현망" };
  if (age < 18.46) return { emoji: "🌕", name: "보름달" };
  if (age < 22.15) return { emoji: "🌖", name: "하현망" };
  if (age < 25.85) return { emoji: "🌗", name: "하현달" };
  return { emoji: "🌘", name: "그믐달" };
}

// ─── 행운 정보 계산 ────────────────────────────────────────────────────────────

function lcg(seed: number): number {
  return ((seed * 1664525 + 1013904223) >>> 0) / 4294967295;
}

const LUCKY_COLORS = [
  { ko: "보라", hex: "#a78bfa" },
  { ko: "파랑", hex: "#60a5fa" },
  { ko: "초록", hex: "#34d399" },
  { ko: "노랑", hex: "#fbbf24" },
  { ko: "빨강", hex: "#f87171" },
  { ko: "분홍", hex: "#f0abfc" },
  { ko: "하늘", hex: "#67e8f9" },
  { ko: "금색", hex: "#fcd34d" },
  { ko: "흰색", hex: "#e5e7eb" },
];

function getLuckyInfo(dateStr: string): { number: number; color: { ko: string; hex: string } } {
  const seed = parseInt(dateStr, 10);
  const number = Math.floor(1 + lcg(seed + 3) * 9);
  const colorIdx = Math.floor(lcg(seed + 17) * LUCKY_COLORS.length);
  return { number, color: LUCKY_COLORS[colorIdx] };
}

// ─── 기타 유틸 ────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 85) return "text-yellow-300";
  if (score >= 75) return "text-emerald-300";
  return "text-blue-300";
}

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

const FORTUNE_ROWS = [
  { label: "연애운", href: "/love-fortune" },
  { label: "재물운", href: "/wealth-fortune" },
  { label: "건강운", href: "/health-fortune" },
];

// ─── 달/행운 스트립 ───────────────────────────────────────────────────────────

function LuckyStrip({ today }: { today: string }) {
  const moon = getMoonPhase(today);
  const lucky = getLuckyInfo(today);

  return (
    <div className="mt-5 pt-4 border-t border-white/8 flex items-center gap-3 flex-wrap">
      <span className="text-white/30 text-xs flex items-center gap-1.5">
        <span className="text-base leading-none">{moon.emoji}</span>
        <span>{moon.name}</span>
      </span>
      <span className="text-white/15 text-xs">·</span>
      <span className="text-white/30 text-xs">
        행운의 숫자{" "}
        <span className="text-white/55 font-semibold">{lucky.number}</span>
      </span>
      <span className="text-white/15 text-xs">·</span>
      <span className="text-white/30 text-xs flex items-center gap-1">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: lucky.color.hex }}
        />
        <span>{lucky.color.ko}</span>
      </span>
    </div>
  );
}

// ─── 배경 장식 ────────────────────────────────────────────────────────────────

const SPARKLE_POSITIONS = [
  { x: "8%",  y: "18%", size: "text-sm" },
  { x: "82%", y: "12%", size: "text-sm" },
  { x: "65%", y: "72%", size: "text-xs" },
  { x: "25%", y: "82%", size: "text-xs" },
  { x: "92%", y: "55%", size: "text-xs" },
  { x: "45%", y: "8%",  size: "text-[10px]" },
  { x: "15%", y: "50%", size: "text-[10px]" },
];

function BgDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
      {/* 별 파티클 */}
      {SPARKLE_POSITIONS.map((pos, i) => (
        <span
          key={i}
          className={`absolute text-white/[0.06] ${pos.size}`}
          style={{ left: pos.x, top: pos.y }}
        >
          ✦
        </span>
      ))}
      {/* 별자리 연결선 암시 — 매우 희미한 점들 */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.04 }}
        aria-hidden
      >
        <line x1="8%" y1="18%" x2="25%" y2="82%" stroke="white" strokeWidth="0.5" />
        <line x1="82%" y1="12%" x2="65%" y2="72%" stroke="white" strokeWidth="0.5" />
        <line x1="45%" y1="8%" x2="82%" y2="12%" stroke="white" strokeWidth="0.5" />
        <circle cx="8%"  cy="18%" r="1.5" fill="white" />
        <circle cx="82%" cy="12%" r="1.5" fill="white" />
        <circle cx="65%" cy="72%" r="1"   fill="white" />
        <circle cx="25%" cy="82%" r="1"   fill="white" />
        <circle cx="45%" cy="8%"  r="1.5" fill="white" />
        <circle cx="15%" cy="50%" r="1"   fill="white" />
        <circle cx="92%" cy="55%" r="1"   fill="white" />
      </svg>
    </div>
  );
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────────

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
        <div className="relative px-4 py-4 sm:px-5 sm:py-6">
          <p className="text-purple-300/60 text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4">
            ✨ 오늘의 운세
          </p>
          <div className="animate-pulse space-y-3">
            <div className="h-12 w-24 bg-white/10 rounded-lg" />
            <div className="h-4 w-3/4 bg-white/8 rounded" />
            <div className="h-4 w-1/2 bg-white/8 rounded" />
          </div>
          <LuckyStrip today={today} />
        </div>
      </div>
    );
  }

  const { state, score, message, stars, isAI, settings } = data;

  return (
    <div className="relative mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-indigo-900/25 to-blue-900/20 overflow-hidden">
      <BgDecorations />

      <div className="relative px-4 py-4 sm:px-5 sm:py-6">
        <p className="text-purple-300/60 text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4">
          ✨ 오늘의 운세
        </p>

        {/* ── 미로그인 ─────────────────────────────────────────────────────── */}
        {state === "not_logged_in" && (
          <>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-4xl sm:text-5xl font-bold leading-none text-white/70 blur-sm select-none">82</span>
              <span className="text-white/35 text-base sm:text-lg mb-1 blur-sm select-none">점</span>
            </div>
            <p className="text-white/60 text-sm mb-4 sm:mb-5 leading-relaxed blur-sm select-none">
              오늘은 새로운 기회가 찾아오는 날입니다.
            </p>
            <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
              {FORTUNE_ROWS.map(({ label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-12 blur-sm select-none">{label}</span>
                  <span className="text-yellow-400/75 text-sm tracking-widest blur-sm select-none">
                    ★★★★☆
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
              로그인하기 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <LuckyStrip today={today} />
          </>
        )}

        {/* ── 생년월일 미등록 ───────────────────────────────────────────── */}
        {state === "no_birth_info" && (
          <>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-4xl sm:text-5xl font-bold leading-none text-white/70 blur-sm select-none">82</span>
              <span className="text-white/35 text-base sm:text-lg mb-1 blur-sm select-none">점</span>
            </div>
            <p className="text-white/60 text-sm mb-4 sm:mb-5 leading-relaxed blur-sm select-none">
              생년월일을 등록하면 오늘의 운세를 확인할 수 있어요.
            </p>
            <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
              {FORTUNE_ROWS.map(({ label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-12 blur-sm select-none">{label}</span>
                  <span className="text-yellow-400/75 text-sm tracking-widest blur-sm select-none">★★★☆☆</span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mb-3 leading-relaxed">
              {settings.noBirthInfoText}
            </p>
            <Link
              href="/mypage?focus=birth"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/60 transition-colors"
            >
              생년월일 등록하기 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <LuckyStrip today={today} />
          </>
        )}

        {/* ── 운세 결과 ────────────────────────────────────────────────── */}
        {state === "ready" && score !== undefined && stars && message && (
          <>
            <div className="flex items-end gap-1.5 mb-2">
              <span className={`text-4xl sm:text-5xl font-bold leading-none ${scoreColor(score)}`}>
                {score}
              </span>
              <span className="text-white/35 text-base sm:text-lg mb-1">점</span>
              {isAI && (
                <span className="ml-1.5 mb-1.5 text-[10px] font-medium text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              )}
            </div>

            <p className="text-white/60 text-sm mb-4 sm:mb-5 leading-relaxed">{message}</p>

            <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
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

            <Link
              href="/saju"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/60 transition-colors"
            >
              사주로 자세히 보기 <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <LuckyStrip today={today} />
          </>
        )}
      </div>
    </div>
  );
}
