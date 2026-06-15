"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── 달 위상 ──────────────────────────────────────────────────────────────────

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

const MOON_ENERGY: Record<string, string> = {
  "새달":   "새로운 시작",
  "초승달": "차오르는 기운",
  "상현달": "나아가는 기운",
  "상현망": "무르익는 기운",
  "보름달": "충만한 기운",
  "하현망": "내려놓는 기운",
  "하현달": "정리하는 기운",
  "그믐달": "마무리의 기운",
};

// ─── 행운 정보 ────────────────────────────────────────────────────────────────

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

const DIRECTIONS = ["동(東)", "서(西)", "남(南)", "북(北)", "동북(東北)", "동남(東南)", "서북(西北)", "서남(西南)"];

const KEYWORD_POOL = [
  "시작", "연결", "성장", "치유", "도약", "변화", "창조", "소통",
  "균형", "집중", "인연", "감사", "용기", "직감", "흐름", "쉼",
  "기회", "따뜻함", "정돈", "자유", "신뢰", "통찰", "비움", "지혜",
];

function getLuckyInfo(dateStr: string) {
  const seed = parseInt(dateStr, 10);
  const number    = Math.floor(1 + lcg(seed + 3)  * 9);
  const colorIdx  = Math.floor(lcg(seed + 17) * LUCKY_COLORS.length);
  const dirIdx    = Math.floor(lcg(seed + 31) * DIRECTIONS.length);
  return { number, color: LUCKY_COLORS[colorIdx], direction: DIRECTIONS[dirIdx] };
}

function getKeywords(dateStr: string): [string, string] {
  const seed = parseInt(dateStr, 10);
  const n = KEYWORD_POOL.length;
  const i1 = Math.floor(lcg(seed + 41) * n);
  const i2 = (Math.floor(lcg(seed + 53) * (n - 1)) + i1 + 1) % n;
  return [KEYWORD_POOL[i1], KEYWORD_POOL[i2 % n]];
}

function formatDateKo(dateStr: string): string {
  const y = dateStr.slice(0, 4);
  const m = parseInt(dateStr.slice(4, 6));
  const d = parseInt(dateStr.slice(6, 8));
  return `${y}년 ${m}월 ${d}일`;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-yellow-300";
  if (score >= 75) return "text-emerald-300";
  return "text-blue-300";
}

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface HeroCardSettings {
  notLoggedInText: string;
  noBirthInfoText: string;
}

interface DailyHeroData {
  state: "not_logged_in" | "no_birth_info" | "ready";
  score?: number;
  message?: string;
  isAI?: boolean;
  settings: HeroCardSettings;
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
      {SPARKLE_POSITIONS.map((pos, i) => (
        <span key={i} className={`absolute text-white/[0.06] ${pos.size}`} style={{ left: pos.x, top: pos.y }}>✦</span>
      ))}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }} aria-hidden>
        <line x1="8%" y1="18%" x2="25%" y2="82%" stroke="white" strokeWidth="0.5" />
        <line x1="82%" y1="12%" x2="65%" y2="72%" stroke="white" strokeWidth="0.5" />
        <line x1="45%" y1="8%" x2="82%" y2="12%" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function HeroCard({ today }: { today: string }) {
  const [data, setData] = useState<DailyHeroData | null>(null);
  const [viewState, setViewState] = useState<"prompt" | "receiving" | "result">("prompt");

  // API 데이터 fetch
  useEffect(() => {
    fetch("/api/user/daily-hero")
      .then((r) => r.json())
      .then((d: DailyHeroData) => setData(d))
      .catch(() => {});
  }, [today]);

  // localStorage로 오늘 이미 받았으면 바로 결과 표시
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(`fortune_received_${today}`)) {
        setViewState("result");
      }
    }
  }, [today]);

  function handleReceive() {
    setViewState("receiving");
    localStorage.setItem(`fortune_received_${today}`, "1");
    setTimeout(() => setViewState("result"), 700);
  }

  const moon     = getMoonPhase(today);
  const lucky    = getLuckyInfo(today);
  const keywords = getKeywords(today);
  const dateKo   = formatDateKo(today);
  const state    = data?.state;
  const message  = data?.message;

  const cardClass = "relative mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-indigo-900/25 to-blue-900/20 overflow-hidden";

  // ── 로딩 ──────────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className={cardClass}>
        <BgDecorations />
        <div className="relative px-4 py-10 sm:px-5 text-center">
          <div className="text-5xl mb-4 animate-pulse">{moon.emoji}</div>
          <div className="animate-pulse space-y-2 max-w-xs mx-auto">
            <div className="h-5 bg-white/10 rounded w-48 mx-auto" />
            <div className="h-3 bg-white/6 rounded w-36 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // ── 기운 받기 전 ──────────────────────────────────────────────────────────
  if (viewState === "prompt") {
    return (
      <div className={cardClass}>
        <BgDecorations />
        <div className="relative px-4 py-10 sm:px-6 text-center">
          <div className="text-5xl mb-4">{moon.emoji}</div>
          <h3 className="text-white font-bold text-xl mb-1">오늘의 기운이 도착했어요</h3>
          <p className="text-white/40 text-sm mb-7">아직 받지 않았어요 · 하루 한 번 무료</p>
          <button
            onClick={handleReceive}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-purple-600/50 border border-purple-500/50 text-purple-100 text-sm font-semibold hover:bg-purple-600/70 transition-all active:scale-95"
          >
            ✨ 오늘의 기운 받기
          </button>
        </div>
      </div>
    );
  }

  // ── 받는 중 애니메이션 ────────────────────────────────────────────────────
  if (viewState === "receiving") {
    return (
      <div className={cardClass}>
        <BgDecorations />
        <div className="relative px-4 py-10 text-center">
          <div className="text-5xl mb-4 animate-pulse">{moon.emoji}</div>
          <p className="text-white/50 text-sm">기운을 받는 중...</p>
        </div>
      </div>
    );
  }

  // ── 결과 ──────────────────────────────────────────────────────────────────
  return (
    <div className={cardClass}>
      <BgDecorations />
      <div className="relative px-4 py-5 sm:px-5 sm:py-6">

        {/* 달 위상 헤더 */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">{moon.emoji}</div>
          <h3 className="text-white font-bold text-base">
            {moon.name}·{MOON_ENERGY[moon.name] ?? "오늘의 기운"}
          </h3>
          <p className="text-white/30 text-xs mt-0.5">{dateKo}</p>
        </div>

        {/* 행운 3종 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <p className="text-white/35 text-[10px] mb-2">행운의 색</p>
            <div className="w-5 h-5 rounded-full mx-auto mb-1.5" style={{ backgroundColor: lucky.color.hex }} />
            <p className="text-white text-xs font-semibold">{lucky.color.ko}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <p className="text-white/35 text-[10px] mb-2">행운의 숫자</p>
            <p className="text-white text-2xl font-bold leading-none mb-1">{lucky.number}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <p className="text-white/35 text-[10px] mb-2">방위</p>
            <p className="text-white text-xs font-semibold mt-2">{lucky.direction}</p>
          </div>
        </div>

        {/* 키워드 */}
        <div className="flex gap-2 justify-center mb-4">
          {keywords.map((k) => (
            <span key={k} className="px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/25 text-purple-300 text-xs font-medium">
              {k}
            </span>
          ))}
        </div>

        {/* 메시지 */}
        {message && (
          <p className="text-white/60 text-sm text-center leading-relaxed mb-4 px-2">
            "{message}"
          </p>
        )}

        {/* AI 점수 뱃지 (생년월일 있는 유저) */}
        {state === "ready" && data.score !== undefined && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              {data.isAI && (
                <span className="text-[10px] font-medium text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">AI</span>
              )}
              <span className={`text-sm font-bold ${scoreColor(data.score)}`}>{data.score}점</span>
            </div>
          </div>
        )}

        {/* 더 깊이 읽기 */}
        <div className="border-t border-white/8 pt-4">
          <p className="text-white/30 text-xs text-center mb-3">이 기운을 더 깊이 읽어볼까요?</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: "/saju",        label: "사주",   emoji: "📜" },
              { href: "/tarot-3cards",label: "타로",   emoji: "🃏" },
              { href: "/zodiac",      label: "별자리", emoji: "✨" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 transition-colors">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-white/55 text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 로그인 / 생년월일 CTA */}
        {state === "not_logged_in" && (
          <div className="mt-4 text-center">
            <p className="text-white/25 text-xs mb-2">{data.settings.notLoggedInText}</p>
            <Link href="/login" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs hover:bg-purple-600/50 transition-colors">
              로그인하기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
        {state === "no_birth_info" && (
          <div className="mt-4 text-center">
            <p className="text-white/25 text-xs mb-2">{data.settings.noBirthInfoText}</p>
            <Link href="/mypage?focus=birth" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs hover:bg-purple-600/50 transition-colors">
              생년월일 등록하기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* 다음 기운 안내 */}
        <p className="text-white/20 text-xs text-center mt-4">⏰ 다음 기운은 내일 받을 수 있어요</p>
      </div>
    </div>
  );
}
