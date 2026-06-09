"use client";

import { useState } from "react";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { type NameCompatibilityInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";

export default function NameCompatibilityPage() {
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("name-compatibility");

  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;
    const input: NameCompatibilityInput = { name1: name1.trim(), name2: name2.trim() };
    await submit("name-compatibility", input);
  }

  if (result || isLoading) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        onReset={reset}
        title="이름 궁합 결과"
        icon="📝"
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">📝</span>
        <h1 className="text-white font-bold text-2xl">이름 궁합</h1>
        <p className="text-white/50 text-sm mt-2">두 사람의 이름으로 풀어보는 궁합</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <div>
            <label className="block text-white/60 text-xs mb-2">나의 이름</label>
            <input
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="예: 김민준"
              maxLength={10}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-lg text-center placeholder-white/20 focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xl">📝</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-2">상대방 이름</label>
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="예: 이서연"
              maxLength={10}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-lg text-center placeholder-white/20 focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        </div>

        {/* 미리보기 */}
        {name1 && name2 && (
          <div className="text-center py-3">
            <span className="text-white font-bold text-lg">{name1}</span>
            <span className="text-white/40 mx-3">💕</span>
            <span className="text-white font-bold text-lg">{name2}</span>
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-400 to-red-500 text-white hover:opacity-90"
          }`}
        >
          {fortuneStatus?.exhausted
            ? "오늘 이름 궁합을 이미 이용했어요"
            : "📝 이름 궁합 보기"}
        </button>
      </form>

      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">오늘의 이름 궁합 결과</span>
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
                __html: fortuneStatus.todayReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-300">$1</strong>'),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
