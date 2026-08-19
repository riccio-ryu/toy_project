"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { type MovingFortuneInput, type Direction } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";
import TodayFortuneCard from "@/components/common/TodayFortuneCard";

const DIRECTIONS: { label: Direction; desc: string }[] = [
  { label: "북서", desc: "건(乾)" },
  { label: "북", desc: "감(坎)" },
  { label: "북동", desc: "간(艮)" },
  { label: "서", desc: "태(兌)" },
  { label: "동", desc: "진(震)" },
  { label: "남서", desc: "곤(坤)" },
  { label: "남", desc: "이(離)" },
  { label: "동남", desc: "손(巽)" },
];

// 방위 → 그리드 위치 [row, col] (3x3, 중앙=나)
const DIRECTION_GRID: Record<Direction, [number, number]> = {
  북서: [0, 0], 북: [0, 1], 북동: [0, 2],
  서:  [1, 0],              동:  [1, 2],
  남서: [2, 0], 남: [2, 1], 동남: [2, 2],
};

export default function MovingFortunePage() {
  const { user } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("moving-fortune");

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [direction, setDirection] = useState<Direction | "">("");
  const [movingYear, setMovingYear] = useState(String(new Date().getFullYear()));
  const [movingMonth, setMovingMonth] = useState("");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/birth-info")
      .then((r) => r.json())
      .then((d) => {
        if (d.birthInfo) {
          setYear(String(d.birthInfo.year));
          setMonth(String(d.birthInfo.month));
          setDay(String(d.birthInfo.day));
          setGender(d.birthInfo.gender ?? "male");
        }
      })
      .catch(() => {});
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!y || !m || !d || !direction) return;

    const input: MovingFortuneInput = {
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      gender,
      direction,
      movingYear: movingYear ? parseInt(movingYear) : undefined,
      movingMonth: movingMonth ? parseInt(movingMonth) : undefined,
      question: question.trim() || undefined,
    };
    await submit("moving-fortune", input);
  }

  if (result || isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <FortuneResult
          result={result}
          isLoading={isLoading}
          onReset={() => { reset(); setDirection(""); setQuestion(""); }}
          title="이사/방위 길흉"
          icon=""
        />
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const valid = !!year && !!month && !!day && !!direction;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-white font-bold text-2xl">이사/방위 길흉</h1>
        <p className="text-white/50 text-sm mt-2">풍수·사주 기반 이사 방향 AI 분석</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">

          {/* 생년월일 */}
          <div>
            <label className="block text-white/50 text-xs mb-2">생년월일 (양력)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="number" value={year} onChange={(e) => setYear(e.target.value)}
                  min={1900} max={currentYear} placeholder="1990" required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <p className="text-white/25 text-[10px] mt-1 text-center">년</p>
              </div>
              <div>
                <select value={month} onChange={(e) => setMonth(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">월</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mo) => (
                    <option key={mo} value={mo} className="bg-gray-900">{mo}월</option>
                  ))}
                </select>
                <p className="text-white/25 text-[10px] mt-1 text-center">월</p>
              </div>
              <div>
                <select value={day} onChange={(e) => setDay(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">일</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dd) => (
                    <option key={dd} value={dd} className="bg-gray-900">{dd}일</option>
                  ))}
                </select>
                <p className="text-white/25 text-[10px] mt-1 text-center">일</p>
              </div>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-white/50 text-xs mb-2">성별</label>
            <div className="flex gap-2">
              {([["male", "남성"], ["female", "여성"]] as const).map(([val, label]) => (
                <button key={val} type="button" onClick={() => setGender(val)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    gender === val
                      ? "bg-teal-600/70 border border-teal-500/50 text-teal-100"
                      : "bg-white/5 border border-white/10 text-white/40"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* 방위 컴퍼스 */}
          <div>
            <label className="block text-white/50 text-xs mb-3">이사할 방향 선택</label>
            <div className="relative w-full aspect-square max-w-[260px] mx-auto grid grid-cols-3 grid-rows-3 gap-1.5">
              {(["북서", "북", "북동", "서", null, "동", "남서", "남", "동남"] as (Direction | null)[]).map((dir, i) => {
                if (!dir) {
                  return (
                    <div key="center" className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-white/30 text-xs">나</span>
                    </div>
                  );
                }
                const info = DIRECTIONS.find((d) => d.label === dir)!;
                const selected = direction === dir;
                return (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setDirection(dir)}
                    className={`rounded-xl flex flex-col items-center justify-center py-2 transition-all text-center border ${
                      selected
                        ? "bg-teal-600/60 border-teal-400/60 text-white scale-105 shadow-lg shadow-teal-900/40"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                    }`}
                  >
                    <span className="text-sm font-bold">{dir}</span>
                    <span className="text-[9px] mt-0.5 opacity-60">{info.desc}</span>
                  </button>
                );
              })}
            </div>
            {direction && (
              <p className="text-center text-teal-300 text-sm mt-3">
                <span className="font-bold">{direction}방</span> 선택됨
              </p>
            )}
          </div>

          {/* 이사 시기 */}
          <div>
            <label className="block text-white/50 text-xs mb-2">이사 예정 시기 <span className="text-white/25">(선택)</span></label>
            <div className="grid grid-cols-2 gap-2">
              <select value={movingYear} onChange={(e) => setMovingYear(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors appearance-none"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear + i).map((y) => (
                  <option key={y} value={y} className="bg-gray-900">{y}년</option>
                ))}
              </select>
              <select value={movingMonth} onChange={(e) => setMovingMonth(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors appearance-none"
              >
                <option value="" className="bg-gray-900 text-white/40">월 미정</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mo) => (
                  <option key={mo} value={mo} className="bg-gray-900">{mo}월</option>
                ))}
              </select>
            </div>
          </div>

          {/* 추가 질문 */}
          <div>
            <label className="block text-white/50 text-xs mb-2">추가 궁금한 점 <span className="text-white/25">(선택)</span></label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 집 방위가 정남향인데 거실 배치는 어떻게 할까요?"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={!valid || fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            !valid || fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90"
          }`}
        >
          {fortuneStatus?.exhausted
            ? "오늘 이사/방위 분석을 이미 이용했어요"
            : `${direction || "방향 선택 후"} 이사 운 분석하기`}
        </button>
      </form>

      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <TodayFortuneCard
          label="오늘의 분석 결과"
          todayReading={fortuneStatus.todayReading}
          highlightColor="text-teal-300"
        />
      )}
    </div>
  );
}
