"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarotCard from "@/components/tarot/TarotCard";
import { drawCards, getSuitLabel, type DrawnCard } from "@/lib/tarot/utils";

const POSITIONS = ["과거", "현재", "미래"] as const;

type Phase = "input" | "drawn" | "reading";

export default function Tarot3CardsPage() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState([false, false, false]);
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const interpretRef = useRef<HTMLDivElement>(null);

  function handleDraw() {
    const drawn = drawCards(3);
    setCards(drawn);
    setRevealed([false, false, false]);
    setInterpretation("");
    setPhase("drawn");

    // 카드 등장 후 순서대로 플립
    [0, 1, 2].forEach((i) => {
      setTimeout(() => {
        setRevealed((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 700 + i * 500);
    });
  }

  async function handleInterpret() {
    setIsLoading(true);
    setPhase("reading");
    setInterpretation("");
    setTimeout(() => interpretRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    try {
      const payload = {
        question: question.trim() || undefined,
        cards: cards.map((d, i) => ({
          id: d.card.id,
          reversed: d.reversed,
          position: POSITIONS[i],
        })),
      };

      const res = await fetch("/api/fortune/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) throw new Error("해석 요청 실패");

      const reader = res.body.getReader();
      const dec = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setInterpretation((prev) => prev + dec.decode(value, { stream: true }));
      }
    } catch (err) {
      console.error("[Tarot 3cards]", err);
      setInterpretation("해석을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setPhase("input");
    setCards([]);
    setRevealed([false, false, false]);
    setInterpretation("");
  }

  const allRevealed = revealed.every(Boolean);

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
          ← 홈
        </Link>
        <span className="text-white/20">|</span>
        <h1 className="text-white font-semibold text-lg">타로 3장 스프레드</h1>
        <span className="ml-auto text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/20">
          AI
        </span>
      </div>

      <div className="flex flex-col items-center gap-8">

        {/* 질문 입력 (input / drawn 단계) */}
        {phase !== "reading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <label className="block text-white/50 text-xs mb-2">
              질문 (선택) — 없으면 전반적인 운세로 해석
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 올해 연애운은 어떤가요?"
              disabled={phase === "drawn"}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-colors disabled:opacity-50"
            />
          </motion.div>
        )}

        {/* 카드 뽑기 버튼 */}
        {phase === "input" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleDraw}
            className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
          >
            카드 3장 뽑기
          </motion.button>
        )}

        {/* 카드 3장 */}
        <AnimatePresence>
          {cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="flex justify-center gap-4">
                {cards.map((drawn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <TarotCard
                      cardId={drawn.card.id}
                      isRevealed={revealed[i]}
                      isReversed={drawn.reversed}
                      size="md"
                    />
                    <div className="text-center">
                      <p className="text-white/40 text-[10px]">{POSITIONS[i]}</p>
                      {revealed[i] && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <p className="text-white text-[11px] font-medium leading-tight">
                            {drawn.card.nameKo}
                          </p>
                          <p className={`text-[9px] ${drawn.reversed ? "text-rose-400" : "text-emerald-400"}`}>
                            {drawn.reversed ? "역방향" : "정방향"}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI 해석 버튼 */}
              {allRevealed && phase === "drawn" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 mt-6"
                >
                  <button
                    onClick={handleInterpret}
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
                  >
                    ✨ AI 해석 받기
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors"
                  >
                    다시
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI 해석 결과 */}
        <AnimatePresence>
          {phase === "reading" && (
            <motion.div
              ref={interpretRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-4"
            >
              {/* 카드 수트 요약 */}
              <div className="flex gap-2 flex-wrap justify-center">
                {cards.map((drawn, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    <span className="text-white/40 text-[10px]">{POSITIONS[i]}</span>
                    <span className="text-white text-[11px] font-medium">{drawn.card.nameKo}</span>
                    <span className={`text-[9px] ${drawn.reversed ? "text-rose-400" : "text-emerald-400"}`}>
                      {drawn.reversed ? "↓" : "↑"}
                    </span>
                  </div>
                ))}
                {question && (
                  <div className="w-full text-center text-white/30 text-xs mt-1">
                    &quot;{question}&quot;
                  </div>
                )}
              </div>

              {/* 해석 텍스트 */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 min-h-[120px]">
                <p className="text-white/40 text-xs mb-3">AI 카드 해석</p>
                {isLoading && !interpretation && (
                  <div className="flex items-center gap-2 text-white/30 text-sm">
                    <span className="animate-pulse">카드를 읽는 중...</span>
                  </div>
                )}
                {interpretation && (
                  <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
                    {interpretation}
                    {isLoading && <span className="animate-pulse text-purple-400">▌</span>}
                  </p>
                )}
              </div>

              {/* 다시 하기 */}
              {!isLoading && (
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-sm transition-colors"
                >
                  새로운 배치로 다시 보기
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
