"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import chineseData from "@/data/chinese-zodiac.json";
import SpriteCard from "@/components/common/SpriteCard";
import {
  getWeeklyChineseFortune,
  getMonthlyChineseFortune,
  getYearlyChineseFortune,
  getTodayKey,
  getCurrentWeekKey,
  getCurrentMonthKey,
  getCurrentYear,
} from "@/lib/firebase/fortune-reader";
import type { WeeklyFortune, MonthlyFortune, YearlyFortune } from "@/types/scheduled-fortune";

// ─── 타입 ──────────────────────────────────────────────────────────
type Tab = "today" | "weekly" | "monthly" | "yearly";

const DAY_KO: Record<string, string> = {
  mon: "월요일", tue: "화요일", wed: "수요일",
  thu: "목요일", fri: "금요일", sat: "토요일", sun: "일요일",
};

const QUARTER_KO: Record<string, string> = {
  q1: "1분기 (1~3월)", q2: "2분기 (4~6월)",
  q3: "3분기 (7~9월)", q4: "4분기 (10~12월)",
};

// 띠별 테마 색상
const ANIMAL_COLOR: Record<string, string> = {
  rat:     "text-slate-300",
  ox:      "text-yellow-400",
  tiger:   "text-orange-400",
  rabbit:  "text-pink-400",
  dragon:  "text-emerald-400",
  snake:   "text-green-400",
  horse:   "text-red-400",
  goat:    "text-lime-400",
  monkey:  "text-amber-400",
  rooster: "text-rose-400",
  dog:     "text-amber-600",
  pig:     "text-purple-400",
};

const ANIMAL_BORDER: Record<string, string> = {
  rat:     "border-slate-400/40",
  ox:      "border-yellow-500/40",
  tiger:   "border-orange-400/40",
  rabbit:  "border-pink-400/40",
  dragon:  "border-emerald-400/40",
  snake:   "border-green-400/40",
  horse:   "border-red-400/40",
  goat:    "border-lime-400/40",
  monkey:  "border-amber-400/40",
  rooster: "border-rose-400/40",
  dog:     "border-amber-600/40",
  pig:     "border-purple-400/40",
};

// ─── 컴포넌트 ──────────────────────────────────────────────────────
export default function ChineseZodiacAnimalPage() {
  const { animal } = useParams<{ animal: string }>();
  const router = useRouter();

  const animalInfo = chineseData.animals.find((a) => a.id === animal);

  const [tab, setTab] = useState<Tab>("today");
  const [weekly, setWeekly] = useState<WeeklyFortune | null>(null);
  const [monthly, setMonthly] = useState<MonthlyFortune | null>(null);
  const [yearly, setYearly] = useState<YearlyFortune | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!animalInfo) { router.push("/chinese-zodiac"); return; }
    setLoading(true);
    Promise.all([
      getWeeklyChineseFortune(animal),
      getMonthlyChineseFortune(animal),
      getYearlyChineseFortune(animal),
    ]).then(([w, m, y]) => {
      setWeekly(w);
      setMonthly(m);
      setYearly(y);
      setLoading(false);
    });
  }, [animal, animalInfo, router]);

  if (!animalInfo) return null;

  const animalColor  = ANIMAL_COLOR[animal]  ?? "text-amber-400";
  const animalBorder = ANIMAL_BORDER[animal] ?? "border-amber-400/40";
  const todayKey  = getTodayKey();
  const todayText = weekly?.days?.[todayKey] ?? null;

  const lucky =
    tab === "yearly"  ? (yearly?.lucky  ?? null) :
    tab === "monthly" ? (monthly?.lucky ?? null) :
    weekly?.lucky ?? null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "today",   label: "오늘" },
    { id: "weekly",  label: "이번 주" },
    { id: "monthly", label: "이번 달" },
    { id: "yearly",  label: "올해" },
  ];

  // 해당 띠 출생연도 (최근 5개)
  const years = animalInfo.years.sort((a, b) => b - a);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* 뒤로가기 */}
        <Link
          href="/chinese-zodiac"
          className="inline-flex items-center gap-1 text-white/40 text-sm hover:text-white/70 mb-6 transition-colors"
        >
          ← 띠 목록
        </Link>

        {/* 띠 헤더 카드 */}
        <div className={`rounded-2xl bg-white/5 border ${animalBorder} p-6 mb-6`}>
          <div className="flex gap-5 items-center">
            {/* 카드 이미지 */}
            <SpriteCard
              type="chinese"
              id={animal}
              className="w-24 shrink-0 aspect-[2/3] rounded-xl shadow-lg"
            />
            {/* 텍스트 */}
            <div>
              <h1 className="text-white text-2xl font-bold">{animalInfo.name}띠</h1>
              <p className="text-white/40 text-sm mt-1">{animalInfo.nameEn}</p>
              {/* 출생연도 태그 */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {years.map((y) => (
                  <span
                    key={y}
                    className={`text-xs px-2 py-0.5 rounded-full border ${animalBorder} ${animalColor}`}
                  >
                    {y}년생
                  </span>
                ))}
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
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
                      {(Object.entries(weekly.days) as [string, string][]).map(([day, text]) => (
                        <div
                          key={day}
                          className={`flex gap-3 text-sm ${day === todayKey ? "opacity-100" : "opacity-60"}`}
                        >
                          <span className={`font-medium w-10 shrink-0 ${day === todayKey ? animalColor : "text-white/50"}`}>
                            {DAY_KO[day]?.slice(0, 1)}요
                          </span>
                          <span className="text-white/70 leading-snug">{text}</span>
                        </div>
                      ))}
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
                    {monthly.highlights?.length > 0 && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-white/40 text-xs mb-2">이달의 포인트</p>
                        <ul className="space-y-1.5">
                          {monthly.highlights.map((h, i) => (
                            <li key={i} className="flex gap-2 text-sm text-white/70">
                              <span className={animalColor}>✦</span>
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
                              <span className={animalColor}>✦</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      {(Object.entries(yearly.quarters) as [string, string][]).map(([q, text]) => (
                        <div key={q}>
                          <p className={`text-xs font-medium mb-1 ${animalColor}`}>{QUARTER_KO[q]}</p>
                          <p className="text-white/70 text-sm leading-snug">{text}</p>
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

        {/* 다른 띠 보기 */}
        <div className="mt-8 text-center">
          <Link
            href="/chinese-zodiac"
            className="text-white/30 text-sm hover:text-white/60 transition-colors"
          >
            다른 띠 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────
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
