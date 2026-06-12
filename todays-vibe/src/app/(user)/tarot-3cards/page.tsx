"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TarotCard from "@/components/tarot/TarotCard";
import TarotFanSpread from "@/components/tarot/TarotFanSpread";
import TarotShufflingAnimation from "@/components/tarot/TarotShufflingAnimation";
import TarotReadingResult from "@/components/tarot/TarotReadingResult";
import TarotTodayResult from "@/components/tarot/TarotTodayResult";
import { useTarotSpread } from "@/lib/hooks/useTarotSpread";

const POSITIONS = ["과거", "현재", "미래"] as const;

export default function Tarot3CardsPage() {
  const {
    question, setQuestion, phase, spreadCards, selectedIndices, spreadReady,
    drawn, revealed, interpretation, isLoading, fortuneStatus, interpretRef,
    handleStartShuffle, handleSelectCard, handleConfirmSelection, handleReset, interpret,
  } = useTarotSpread("tarot", 3);

  function handleInterpret() {
    interpret("/api/fortune/tarot", {
      question: question.trim() || undefined,
      cards: drawn.map((d, i) => ({ id: d.card.id, reversed: d.reversed, position: POSITIONS[i] })),
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors"><ArrowLeft className="w-4 h-4" /> 홈</Link>
        <span className="text-white/20">|</span>
        <h1 className="text-white font-semibold text-lg">타로 3장 스프레드</h1>
        <span className="ml-auto text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/20">AI</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ── 1. 질문 입력 ─────────────────────────────────────── */}
        {phase === "input" && (
          <motion.div key="input"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-white/50 text-sm text-center">마음속으로 질문을 생각하며 카드를 뽑아보세요</p>
            <div className="w-full">
              <label className="block text-white/40 text-xs mb-2">질문 (선택)</label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => !fortuneStatus?.exhausted && e.key === "Enter" && handleStartShuffle()}
                placeholder="예: 올해 연애운은 어떤가요?"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-colors"
              />
            </div>
            <button
              onClick={!fortuneStatus?.exhausted ? handleStartShuffle : undefined}
              disabled={fortuneStatus?.exhausted === true}
              className={`px-8 py-3 rounded-full font-semibold text-sm transition-colors shadow-lg ${
                fortuneStatus?.exhausted
                  ? "bg-white/10 text-white/30 cursor-not-allowed shadow-none"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40"
              }`}
            >
              {fortuneStatus?.exhausted ? "오늘 타로를 이미 이용했어요" : "🃏 카드 섞기"}
            </button>
          </motion.div>
        )}

        {/* ── 2. 셔플 애니메이션 ──────────────────────────────── */}
        {phase === "shuffling" && <TarotShufflingAnimation />}

        {/* ── 3. 부채꼴 카드 선택 ─────────────────────────────── */}
        {phase === "spread" && (
          <motion.div key="spread"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">카드 3장을 선택하세요</p>
              <div className="flex items-center gap-3">
                <button onClick={handleStartShuffle} className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  🔀 다시 섞기
                </button>
                <span className="text-purple-300 font-semibold tabular-nums">
                  {selectedIndices.length}<span className="text-white/30 font-normal"> / 3</span>
                </span>
              </div>
            </div>

            <TarotFanSpread
              spreadCards={spreadCards}
              selectedIndices={selectedIndices}
              spreadReady={spreadReady}
              onSelectCard={handleSelectCard}
            />

            {/* 선택된 카드 하단 슬롯 */}
            <div className="flex justify-center gap-4">
              {POSITIONS.map((posLabel, slotIdx) => {
                const fanIdx = selectedIndices[slotIdx];
                const card   = fanIdx !== undefined ? spreadCards[fanIdx] : null;
                return (
                  <div key={slotIdx} className="flex flex-col items-center gap-1.5">
                    <AnimatePresence mode="wait">
                      {card ? (
                        <motion.div key={`s${fanIdx}`}
                          initial={{ opacity: 0, scale: 0.7, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7, y: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 26 }}
                          className="cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => handleSelectCard(fanIdx)}
                        >
                          <TarotCard cardId={card.card.id} isRevealed={false} size="xs" />
                        </motion.div>
                      ) : (
                        <div key="empty" className="w-[54px] h-[92px] rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center">
                          <span className="text-white/20 text-sm font-medium">{slotIdx + 1}</span>
                        </div>
                      )}
                    </AnimatePresence>
                    <span className="text-white/40 text-[10px]">{posLabel}</span>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedIndices.length === 3 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={handleConfirmSelection}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
                >
                  선택 완료 <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── 4. 3장 배치 + 공개 + AI ─────────────────────────── */}
        {(phase === "drawn" || phase === "reading") && (
          <motion.div key="drawn"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8"
          >
            {question && <p className="text-white/30 text-xs text-center">&quot;{question}&quot;</p>}

            <div className="flex justify-center gap-4">
              {drawn.map((d, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-center gap-2"
                >
                  <TarotCard cardId={d.card.id} isRevealed={revealed[i]} isReversed={d.reversed} size="md" />
                  <div className="text-center">
                    <p className="text-white/40 text-[10px]">{POSITIONS[i]}</p>
                    {revealed[i] && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <p className="text-white text-[11px] font-medium leading-tight">{d.card.nameKo}</p>
                        <p className={`text-[9px] ${d.reversed ? "text-rose-400" : "text-emerald-400"}`}>
                          {d.reversed ? "역방향" : "정방향"}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {phase === "drawn" && revealed.every(Boolean) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex gap-3 w-full"
              >
                <button onClick={handleInterpret}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
                >
                  ✨ AI 해석 받기
                </button>
                <button onClick={handleReset}
                  className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors"
                >
                  다시
                </button>
              </motion.div>
            )}

            {phase === "reading" && (
              <TarotReadingResult
                interpretRef={interpretRef}
                interpretation={interpretation}
                isLoading={isLoading}
                onReset={handleReset}
              />
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {fortuneStatus?.exhausted && phase === "input" && (
        <TarotTodayResult todayReading={fortuneStatus.todayReading} />
      )}
    </div>
  );
}
