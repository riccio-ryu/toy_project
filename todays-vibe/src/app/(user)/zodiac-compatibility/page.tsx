"use client";

import { useState } from "react";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { type ZodiacCompatibilityInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";

const ZODIAC = [
  { ko: "쥐", emoji: "🐭" },
  { ko: "소", emoji: "🐮" },
  { ko: "호랑이", emoji: "🐯" },
  { ko: "토끼", emoji: "🐰" },
  { ko: "용", emoji: "🐲" },
  { ko: "뱀", emoji: "🐍" },
  { ko: "말", emoji: "🐴" },
  { ko: "양", emoji: "🐑" },
  { ko: "원숭이", emoji: "🐵" },
  { ko: "닭", emoji: "🐔" },
  { ko: "개", emoji: "🐶" },
  { ko: "돼지", emoji: "🐷" },
];

function getZodiac(year: number) {
  return ZODIAC[(year - 4 + 1200) % 12];
}

const CURRENT_YEAR = new Date().getFullYear();

export default function ZodiacCompatibilityPage() {
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("zodiac-compatibility");

  const [year1, setYear1] = useState("");
  const [year2, setYear2] = useState("");

  const zodiac1 = year1 && parseInt(year1) >= 1900 ? getZodiac(parseInt(year1)) : null;
  const zodiac2 = year2 && parseInt(year2) >= 1900 ? getZodiac(parseInt(year2)) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y1 = parseInt(year1), y2 = parseInt(year2);
    if (!y1 || !y2) return;
    const input: ZodiacCompatibilityInput = { person1BirthYear: y1, person2BirthYear: y2 };
    await submit("zodiac-compatibility", input);
  }

  if (result || isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* 띠 비교 카드 */}
        {zodiac1 && zodiac2 && (
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <span className="text-5xl block">{zodiac1.emoji}</span>
              <p className="text-white/60 text-xs mt-2">{year1}년생</p>
              <p className="text-white font-semibold text-sm">{zodiac1.ko}띠</p>
            </div>
            <div className="text-white/30 text-3xl">💕</div>
            <div className="text-center">
              <span className="text-5xl block">{zodiac2.emoji}</span>
              <p className="text-white/60 text-xs mt-2">{year2}년생</p>
              <p className="text-white font-semibold text-sm">{zodiac2.ko}띠</p>
            </div>
          </div>
        )}
        <FortuneResult
          result={result}
          isLoading={isLoading}
          onReset={reset}
          title="띠 궁합 결과"
          icon="🐲"
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">🐲</span>
        <h1 className="text-white font-bold text-2xl">띠 궁합</h1>
        <p className="text-white/50 text-sm mt-2">12간지로 풀어보는 두 사람의 궁합</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">

          {/* 나 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">나의 출생년도</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={year1}
                onChange={(e) => setYear1(e.target.value)}
                min={1900}
                max={CURRENT_YEAR}
                placeholder="1990"
                required
                className="flex-1 px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-400 transition-colors"
              />
              {zodiac1 && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                  <span className="text-xl">{zodiac1.emoji}</span>
                  <span className="text-yellow-300 text-sm font-semibold">{zodiac1.ko}띠</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xl">🐲</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* 상대방 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">상대방 출생년도</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={year2}
                onChange={(e) => setYear2(e.target.value)}
                min={1900}
                max={CURRENT_YEAR}
                placeholder="1992"
                required
                className="flex-1 px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-400 transition-colors"
              />
              {zodiac2 && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                  <span className="text-xl">{zodiac2.emoji}</span>
                  <span className="text-yellow-300 text-sm font-semibold">{zodiac2.ko}띠</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90"
          }`}
        >
          {fortuneStatus?.exhausted
            ? "오늘 띠 궁합을 이미 이용했어요"
            : "🐲 띠 궁합 보기"}
        </button>
      </form>

      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">오늘의 띠 궁합 결과</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            {fortuneStatus.todayReading.createdAt && (
              <p className="text-white/30 text-xs mb-3 text-right">
                {new Date(fortuneStatus.todayReading.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 열람
              </p>
            )}
            <div
              className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: fortuneStatus.todayReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-300">$1</strong>'),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
