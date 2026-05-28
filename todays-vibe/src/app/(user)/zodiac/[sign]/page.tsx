"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import zodiacData from "@/data/zodiac-signs.json";
import SpriteCard from "@/components/common/SpriteCard";
import {
  getWeeklyZodiacFortune,
  getMonthlyZodiacFortune,
  getYearlyZodiacFortune,
  getTodayKey,
  getCurrentWeekKey,
  getCurrentMonthKey,
  getCurrentYear,
} from "@/lib/firebase/fortune-reader";
import type { WeeklyFortune, MonthlyFortune, YearlyFortune } from "@/types/scheduled-fortune";

// ─── 타입 ─────────────────────────────────────────────────────────
type Tab = "today" | "weekly" | "monthly" | "yearly";

const DAY_KO: Record<string, string> = {
  mon: "월요일", tue: "화요일", wed: "수요일",
  thu: "목요일", fri: "금요일", sat: "토요일", sun: "일요일",
};

const QUARTER_KO: Record<string, string> = {
  q1: "1분기 (1~3월)", q2: "2분기 (4~6월)",
  q3: "3분기 (7~9월)", q4: "4분기 (10~12월)",
};

const ELEMENT_COLOR: Record<string, string> = {
  fire: "text-orange-400", earth: "text-green-400",
  air: "text-yellow-300", water: "text-blue-400",
};

const ELEMENT_BORDER: Record<string, string> = {
  fire: "border-orange-400/40", earth: "border-green-400/40",
  air: "border-yellow-400/40", water: "border-blue-400/40",
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────
export default function ZodiacSignPage() {
  const { sign } = useParams<{ sign: string }>();
  const router = useRouter();

  const signInfo = zodiacData.zodiacSigns.find((s) => s.id === sign);
  const [tab, setTab] = useState<Tab>("today");
  const [weekly, setWeekly] = useState<WeeklyFortune | null>(null);
  const [monthly, setMonthly] = useState<MonthlyFortune | null>(null);
  const [yearly, setYearly] = useState<YearlyFortune | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signInfo) { router.push("/zodiac"); return; }
    setLoading(true);
    Promise.all([
      getWeeklyZodiacFortune(sign),
      getMonthlyZodiacFortune(sign),
      getYearlyZodiacFortune(sign),
    ]).then(([w, m, y]) => {
      setWeekly(w);
      setMonthly(m);
      setYearly(y);
      setLoading(false);
    });
  }, [sign, signInfo, router]);

  if (!signInfo) return null;

  const elColor  = ELEMENT_COLOR[signInfo.element] ?? "text-purple-400";
  const elBorder = ELEMENT_BORDER[signInfo.element] ?? "border-purple-400/40";
  const todayKey = getTodayKey();
  const todayText = weekly?.days?.[todayKey] ?? null;
  const lucky =
    tab === "yearly" ? (yearly?.lucky ?? null) :
    tab === "monthly" ? (monthly?.lucky ?? null) :
    weekly?.lucky ?? null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "today",   label: "오늘" },
    { id: "weekly",  label: "이번 주" },
    { id: "monthly", label: "이번 달" },
    { id: "yearly",  label: "올해" },
  ];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* 뒤로가기 */}
        <Link href="/zodiac" className="inline-flex items-center gap-1 text-white/40 text-sm hover:text-white/70 mb-6 transition-colors">
          ← 별자리 목록
        </Link>

        {/* 별자리 헤더 카드 */}
        <div className={`rounded-2xl bg-white/5 border ${elBorder} p-6 mb-6`}>
          <div className="flex gap-5 items-center">
            {/* 카드 이미지 */}
            <SpriteCard
              type="zodiac"
              id={sign}
              className="w-24 shrink-0 aspect-[2/3] rounded-xl shadow-lg"
            />
            {/* 텍스트 */}
            <div>
              <h1 className="text-white text-2xl font-bold">{signInfo.name}</h1>
              <p className="text-white/40 text-sm mt-1">{signInfo.dateRange}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                <span className={`text-xs font-medium ${elColor}`}>
                  {signInfo.elementKo}의 별자리
                </span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/50 text-xs">지배행성 {signInfo.rulingPlanet}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === t.id
                  ? "bg-white/15 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        {loading ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">운세를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 오늘 */}
            {tab === "today" && (
              <FortuneCard title={`${DAY_KO[todayKey]}의 운세`} empty={!todayText}>
                {todayText && (
                  <>
                    <p className="text-white/80 leading-relaxed text-sm">{todayText}</p>
                    {weekly && (
                      <p className="text-white/40 text-xs mt-3 border-t border-white/10 pt-3">
                        {weekly.weekStart} ~ {weekly.weekEnd} 주간운세 기반
                      </p>
                    )}
                  </>
                )}
              </FortuneCard>
            )}

            {/* 이번 주 */}
            {tab === "weekly" && (
              <FortuneCard title={`${getCurrentWeekKey()} 주간 운세`} empty={!weekly}>
                {weekly && (
                  <div className="space-y-4">
                    <p className="text-white/80 leading-relaxed text-sm">{weekly.summary}</p>
                    <div className="border-t border-white/10 pt-4 space-y-2">
                      {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((day) => {
                        const text = weekly.days[day];
                        if (!text) return null;
                        return (
                          <div key={day} className={`flex gap-3 text-sm ${day === todayKey ? "opacity-100" : "opacity-60"}`}>
                            <span className={`font-medium w-10 shrink-0 ${day === todayKey ? elColor : "text-white/50"}`}>
                              {DAY_KO[day]?.slice(0, 1)}요
                            </span>
                            <span className="text-white/70 leading-snug">{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </FortuneCard>
            )}

            {/* 이번 달 */}
            {tab === "monthly" && (
              <FortuneCard title={`${getCurrentMonthKey()} 월간 운세`} empty={!monthly}>
                {monthly && (
                  <div className="space-y-4">
                    <p className="text-white/80 leading-relaxed text-sm">{monthly.content}</p>
                    {monthly.highlights.length > 0 && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-white/40 text-xs mb-2">이달의 포인트</p>
                        <ul className="space-y-1.5">
                          {monthly.highlights.map((h, i) => (
                            <li key={i} className="flex gap-2 text-sm text-white/70">
                              <span className={elColor}>✦</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </FortuneCard>
            )}

            {/* 올해 */}
            {tab === "yearly" && (
              <FortuneCard title={`${getCurrentYear()}년 연간 운세`} empty={!yearly}>
                {yearly && (
                  <div className="space-y-4">
                    <p className="text-white/80 leading-relaxed text-sm">{yearly.content}</p>
                    {yearly.highlights?.length > 0 && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-white/40 text-xs mb-2">올해의 포인트</p>
                        <ul className="space-y-1.5">
                          {yearly.highlights.map((h, i) => (
                            <li key={i} className="flex gap-2 text-sm text-white/70">
                              <span className={elColor}>✦</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      {(["q1", "q2", "q3", "q4"] as const).map((q) => (
                        <div key={q}>
                          <p className={`text-xs font-medium mb-1 ${elColor}`}>{QUARTER_KO[q]}</p>
                          <p className="text-white/70 text-sm leading-snug">{yearly.quarters[q]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </FortuneCard>
            )}

            {/* 럭키 아이템 */}
            {lucky && (
              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-white/40 text-xs mb-3">
                  {tab === "yearly" ? "올해의 럭키 아이템" : tab === "monthly" ? "이번 달 럭키 아이템" : "이번 주 럭키 아이템"}
                </p>
                <div className="flex gap-3">
                  <LuckyBadge label="컬러" value={lucky.color} />
                  <LuckyBadge label="숫자" value={String(lucky.number)} />
                  <LuckyBadge label="키워드" value={lucky.keyword} />
                </div>
              </div>
            )}
          </>
        )}

        {/* 다른 별자리 */}
        <div className="mt-8 text-center">
          <Link href="/zodiac" className="text-white/30 text-sm hover:text-white/60 transition-colors">
            다른 별자리 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────
function FortuneCard({
  title,
  children,
  empty,
}: {
  title: string;
  children?: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <p className="text-white/40 text-xs mb-3">{title}</p>
      {empty ? (
        <div className="text-center py-6">
          <p className="text-white/30 text-sm">아직 운세가 준비되지 않았어요</p>
          <p className="text-white/20 text-xs mt-1">배치 생성 후 확인해주세요</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function LuckyBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-center">
      <p className="text-white/30 text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
    </div>
  );
}
