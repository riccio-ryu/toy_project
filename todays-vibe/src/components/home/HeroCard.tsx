"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// ─── 날짜 시드 기반 난수 ─────────────────────────────────────────────────────

function seedRandom(seed: number): number {
  return ((seed * 1664525 + 1013904223) >>> 0) / 4294967295;
}

function dateToSeed(dateStr: string): number {
  return parseInt(dateStr, 10);
}

function getDailyScore(dateStr: string): number {
  return Math.floor(60 + seedRandom(dateToSeed(dateStr)) * 36); // 60~95
}

function getDailyStars(dateStr: string): [number, number, number] {
  const s = dateToSeed(dateStr);
  return [
    Math.floor(1 + seedRandom(s + 1) * 5),
    Math.floor(1 + seedRandom(s + 2) * 5),
    Math.floor(1 + seedRandom(s + 3) * 5),
  ];
}

function getDailyMessage(dateStr: string): string {
  const messages = [
    "새로운 기회가 찾아오는 날입니다.",
    "사람들과의 대화에서 좋은 에너지가 흐릅니다.",
    "작은 결단이 큰 변화를 만드는 하루입니다.",
    "평온한 마음으로 하루를 시작하면 좋겠습니다.",
    "뜻밖의 좋은 소식이 기다리고 있습니다.",
    "내면의 목소리에 귀 기울여 보세요.",
    "새로운 인연이 찾아올 수 있는 날입니다.",
    "준비해온 것들이 빛을 발하는 하루입니다.",
    "주변 사람들과의 조화가 행운을 부릅니다.",
    "긍정적인 에너지가 가득한 하루가 될 것입니다.",
    "집중력이 높아지는 날, 중요한 일을 처리하세요.",
    "작은 친절이 큰 복이 되어 돌아오는 날입니다.",
  ];
  const idx = Math.floor(seedRandom(dateToSeed(dateStr) + 7) * messages.length);
  return messages[idx];
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-yellow-300";
  if (score >= 75) return "text-emerald-300";
  return "text-blue-300";
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────────

const FORTUNE_ROWS = [
  { label: "연애운", href: "/love-fortune" },
  { label: "재물운", href: "/wealth-fortune" },
  { label: "건강운", href: "/health-fortune" },
];

export default function HeroCard({ today }: { today: string }) {
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  const score = getDailyScore(today);
  const stars = getDailyStars(today);
  const message = getDailyMessage(today);

  return (
    <div className="relative mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-indigo-900/25 to-blue-900/20 overflow-hidden">
      {/* 배경 장식 */}
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

      <div className="relative px-5 py-6">
        <p className="text-purple-300/60 text-xs font-semibold uppercase tracking-widest mb-4">
          ✨ 오늘의 운세
        </p>

        {isLoggedIn ? (
          /* ── 로그인: 점수 노출 ── */
          <>
            <div className="flex items-end gap-1.5 mb-2">
              <span className={`text-5xl font-bold leading-none ${scoreColor(score)}`}>
                {score}
              </span>
              <span className="text-white/35 text-lg mb-1">점</span>
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

            <Link
              href="/saju"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/60 transition-colors"
            >
              사주로 자세히 보기 →
            </Link>
          </>
        ) : (
          /* ── 비로그인: 블러 + 유도 ── */
          <>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-5xl font-bold leading-none text-white/70 blur-sm select-none">
                {score}
              </span>
              <span className="text-white/35 text-lg mb-1 blur-sm select-none">점</span>
            </div>

            <p className="text-white/60 text-sm mb-5 leading-relaxed blur-sm select-none">
              {message}
            </p>

            <div className="space-y-2.5 mb-5">
              {FORTUNE_ROWS.map(({ label }, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-12 blur-sm select-none">{label}</span>
                  <span className="text-yellow-400/75 text-sm tracking-widest blur-sm select-none">
                    {"★".repeat(stars[i])}{"☆".repeat(5 - stars[i])}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-white/40 text-xs mb-3 leading-relaxed">
              로그인하면 오늘의 운세 점수를 확인할 수 있어요
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/60 transition-colors"
            >
              로그인하기 →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
