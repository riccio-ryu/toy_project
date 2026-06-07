"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarotCard from "@/components/tarot/TarotCard";
import TarotFanSpread from "@/components/tarot/TarotFanSpread";
import TarotShufflingAnimation from "@/components/tarot/TarotShufflingAnimation";
import TarotReadingResult from "@/components/tarot/TarotReadingResult";
import TarotTodayResult from "@/components/tarot/TarotTodayResult";
import { useTarotSpread } from "@/lib/hooks/useTarotSpread";

const POSITION_NAMES = [
  "현재 상황", "교차하는 힘", "뿌리 / 과거", "최근 과거", "잠재 가능성",
  "다가오는 미래", "나 자신", "외부 환경", "희망과 두려움", "최종 결과",
] as const;

const CROSS_W = 260;
const CROSS_H = 404;

const CELTIC_LAYOUT = [
  { x: 66,  y: 156, rotate: 0  },
  { x: 66,  y: 156, rotate: 90 },
  { x: 66,  y: 260, rotate: 0  },
  { x: 0,   y: 156, rotate: 0  },
  { x: 66,  y: 52,  rotate: 0  },
  { x: 132, y: 156, rotate: 0  },
  { x: 206, y: 312, rotate: 0  },
  { x: 206, y: 208, rotate: 0  },
  { x: 206, y: 104, rotate: 0  },
  { x: 206, y: 0,   rotate: 0  },
] as const;

export default function TarotCelticPage() {
  const {
    question, setQuestion, phase, spreadCards, selectedIndices, spreadReady,
    drawn, revealed, interpretation, isLoading, fortuneStatus, interpretRef,
    handleStartShuffle, handleSelectCard, handleConfirmSelection, handleReset, interpret,
  } = useTarotSpread("tarot-celtic", 10);

  function handleInterpret() {
    interpret("/api/fortune/tarot-celtic", {
      question: question.trim() || undefined,
      cards: drawn.map((d, i) => ({ id: d.card.id, reversed: d.reversed, position: POSITION_NAMES[i] })),
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">← 홈</Link>
        <span className="text-white/20">|</span>
        <h1 className="text-white font-semibold text-lg">켈틱 크로스 타로</h1>
        <span className="ml-auto text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/20">AI</span>
      </div>

      <AnimatePresence mode="wait">

        {phase === "input" && (
          <motion.div key="input"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-white/50 text-sm text-center">마음속으로 질문을 생각하며 카드 10장을 뽑아보세요</p>
            <div className="w-full">
              <label className="block text-white/40 text-xs mb-2">질문 (선택)</label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => !fortuneStatus?.exhausted && e.key === "Enter" && handleStartShuffle()}
                placeholder="예: 올해 나의 방향은 어떤가요?"
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

        {phase === "shuffling" && <TarotShufflingAnimation />}

        {phase === "spread" && (
          <motion.div key="spread"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">카드 10장을 선택하세요</p>
              <div className="flex items-center gap-3">
                <button onClick={handleStartShuffle} className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  🔀 다시 섞기
                </button>
                <span className="text-purple-300 font-semibold tabular-nums">
                  {selectedIndices.length}<span className="text-white/30 font-normal"> / 10</span>
                </span>
              </div>
            </div>

            <TarotFanSpread
              spreadCards={spreadCards}
              selectedIndices={selectedIndices}
              spreadReady={spreadReady}
              onSelectCard={handleSelectCard}
            />

            {/* 선택된 카드 하단 슬롯 (5 × 2 그리드) */}
            <div className="flex flex-col gap-2 items-center">
              {[0, 1].map((row) => (
                <div key={row} className="flex gap-2">
                  {Array.from({ length: 5 }, (_, col) => {
                    const slotIdx = row * 5 + col;
                    const fanIdx  = selectedIndices[slotIdx];
                    const card    = fanIdx !== undefined ? spreadCards[fanIdx] : null;
                    return (
                      <div key={slotIdx} className="flex flex-col items-center gap-1">
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
                              <span className="text-white/20 text-xs font-medium">{slotIdx + 1}</span>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <AnimatePresence>
              {selectedIndices.length === 10 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={handleConfirmSelection}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
                >
                  선택 완료 →
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {(phase === "drawn" || phase === "reading") && (
          <motion.div key="drawn"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {question && <p className="text-white/30 text-xs text-center">&quot;{question}&quot;</p>}

            <div className="relative mx-auto" style={{ width: CROSS_W, height: CROSS_H }}>
              {drawn.map((d, i) => {
                const pos = CELTIC_LAYOUT[i];
                return (
                  <motion.div key={i} className="absolute"
                    style={{ left: pos.x, top: pos.y, zIndex: i === 1 ? 10 : i + 1 }}
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <div style={{ transformOrigin: "27px 46px", transform: `rotate(${pos.rotate}deg)` }}>
                      <TarotCard cardId={d.card.id} isRevealed={revealed[i]} isReversed={d.reversed} size="xs" />
                    </div>
                    <div
                      className="absolute w-[16px] h-[16px] rounded-full bg-purple-900 border border-purple-500/60 text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ top: -8, left: i === 1 ? 58 : -8, zIndex: 20 }}
                    >
                      {i + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="w-full space-y-1.5">
              {drawn.map((d, i) =>
                revealed[i] ? (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/5"
                  >
                    <span className="w-[16px] h-[16px] rounded-full bg-purple-900 border border-purple-500/60 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white/40 text-xs shrink-0">{POSITION_NAMES[i]}</span>
                    <span className="text-white text-xs font-medium ml-auto">{d.card.nameKo}</span>
                    <span className={`text-[10px] shrink-0 ${d.reversed ? "text-rose-400" : "text-emerald-400"}`}>
                      {d.reversed ? "역" : "정"}
                    </span>
                  </motion.div>
                ) : (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg opacity-25">
                    <span className="w-[16px] h-[16px] rounded-full bg-white/10 text-white/40 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white/30 text-xs">{POSITION_NAMES[i]}</span>
                  </div>
                )
              )}
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
