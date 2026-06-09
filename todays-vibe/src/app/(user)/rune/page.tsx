"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { drawRunes, type Rune } from "@/data/runes";
import { type RuneInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";

const POSITION_LABELS = ["과거", "현재", "미래"];

export default function RunePage() {
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("rune");

  const [question, setQuestion] = useState("");
  const [drawnRunes, setDrawnRunes] = useState<Rune[] | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleDraw() {
    const runes = drawRunes(3);
    setDrawnRunes(runes);
    setRevealed(false);
    setTimeout(() => setRevealed(true), 400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!drawnRunes) return;
    const input: RuneInput = {
      question: question.trim() || undefined,
      runes: [
        `${drawnRunes[0].symbol} ${drawnRunes[0].nameKo}`,
        `${drawnRunes[1].symbol} ${drawnRunes[1].nameKo}`,
        `${drawnRunes[2].symbol} ${drawnRunes[2].nameKo}`,
      ],
    };
    await submit("rune", input);
  }

  function handleReset() {
    reset();
    setDrawnRunes(null);
    setRevealed(false);
    setQuestion("");
  }

  if (result || isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* 뽑힌 룬 표시 */}
        {drawnRunes && (
          <div className="flex items-center justify-center gap-4 mb-8">
            {drawnRunes.map((rune, i) => (
              <div key={rune.id} className="text-center">
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center mb-1">
                  <span className="text-white text-3xl font-bold">{rune.symbol}</span>
                </div>
                <p className="text-white/30 text-[10px]">{POSITION_LABELS[i]}</p>
                <p className="text-white/60 text-xs">{rune.name}</p>
              </div>
            ))}
          </div>
        )}
        <FortuneResult
          result={result}
          isLoading={isLoading}
          onReset={handleReset}
          title="룬 문자 결과"
          icon="ᚱ"
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3 font-serif">ᚱ</span>
        <h1 className="text-white font-bold text-2xl">룬 문자</h1>
        <p className="text-white/50 text-sm mt-2">북유럽 고대 룬 3개로 과거·현재·미래를 읽습니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 질문 입력 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <label className="block text-white/60 text-xs mb-2">
            질문 <span className="text-white/30">(선택)</span>
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 지금 이 결정을 내려도 될까요?"
            className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        {/* 룬 뽑기 영역 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <p className="text-white/60 text-xs mb-4 text-center">룬 주머니에서 3개를 뽑습니다</p>

          <AnimatePresence mode="wait">
            {!drawnRunes ? (
              <motion.div
                key="stones"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center gap-4"
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center"
                  >
                    <span className="text-white/20 text-2xl">?</span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="runes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center gap-4"
              >
                {drawnRunes.map((rune, i) => (
                  <motion.div
                    key={rune.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.5 }}
                    transition={{ delay: i * 0.15, duration: 0.4 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-700/50 border border-slate-500/40 flex items-center justify-center mb-1 shadow-lg">
                      <span className="text-white text-3xl font-bold">{rune.symbol}</span>
                    </div>
                    <p className="text-white/40 text-[10px]">{POSITION_LABELS[i]}</p>
                    <p className="text-slate-300 text-xs font-medium">{rune.name}</p>
                    <p className="text-white/30 text-[10px]">{rune.keywords[0]}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleDraw}
              className="px-5 py-2 rounded-lg bg-slate-600/50 border border-slate-500/30 text-slate-200 text-sm hover:bg-slate-500/50 transition-colors"
            >
              {drawnRunes ? "다시 뽑기" : "ᚱ 룬 뽑기"}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={!drawnRunes || fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : !drawnRunes
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-slate-600 to-gray-700 text-white hover:opacity-90"
          }`}
        >
          {fortuneStatus?.exhausted ? "오늘 룬 해석을 이미 이용했어요" : "ᚱ AI 룬 해석 보기"}
        </button>
      </form>

      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">오늘의 룬 해석 결과</span>
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
                __html: fortuneStatus.todayReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-300">$1</strong>'),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
