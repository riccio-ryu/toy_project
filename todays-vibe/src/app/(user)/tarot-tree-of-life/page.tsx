"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarotCard from "@/components/tarot/TarotCard";
import TarotFanSpread from "@/components/tarot/TarotFanSpread";
import TarotShufflingAnimation from "@/components/tarot/TarotShufflingAnimation";
import TarotReadingResult from "@/components/tarot/TarotReadingResult";
import TarotTodayResult from "@/components/tarot/TarotTodayResult";
import { useTarotSpread } from "@/lib/hooks/useTarotSpread";

const SEPHIROT = [
  { name: "케테르 (왕관)",        meaning: "영적인 것" },
  { name: "호크마 (지혜)",        meaning: "책임" },
  { name: "비나 (이해)",          meaning: "장애물" },
  { name: "헤세드 (자비)",        meaning: "도움을 주는 것" },
  { name: "게부라 (힘)",          meaning: "나를 반대하는 것" },
  { name: "티파레트 (아름다움)",   meaning: "성취할 수 있는 것" },
  { name: "네짜흐 (승리)",        meaning: "감정 관계" },
  { name: "호드 (영광)",          meaning: "인간관계 및 커리어" },
  { name: "예소드 (기반)",        meaning: "무의식의 기반" },
  { name: "말쿠트 (왕국)",        meaning: "가족들에 대해" },
] as const;

const TREE_W = 242;
const TREE_H = 692;

const TREE_LAYOUT = [
  { x: 94,  y: 0   },
  { x: 188, y: 100 },
  { x: 0,   y: 100 },
  { x: 188, y: 200 },
  { x: 0,   y: 200 },
  { x: 94,  y: 300 },
  { x: 188, y: 400 },
  { x: 0,   y: 400 },
  { x: 94,  y: 500 },
  { x: 94,  y: 600 },
] as const;

export default function TarotTreeOfLifePage() {
  const {
    question, setQuestion, phase, spreadCards, selectedIndices, spreadReady,
    drawn, revealed, interpretation, isLoading, fortuneStatus, interpretRef,
    handleStartShuffle, handleSelectCard, handleConfirmSelection, handleReset, interpret,
  } = useTarotSpread("tarot-tree-of-life", 10);

  function handleInterpret() {
    interpret("/api/fortune/tarot-tree-of-life", {
      question: question.trim() || undefined,
      cards: drawn.map((d, i) => ({
        id: d.card.id, reversed: d.reversed,
        position: SEPHIROT[i].name, meaning: SEPHIROT[i].meaning,
      })),
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">← 홈</Link>
        <span className="text-white/20">|</span>
        <h1 className="text-white font-semibold text-lg">생명의 나무 타로</h1>
        <span className="ml-auto text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/20">AI</span>
      </div>

      <AnimatePresence mode="wait">

        {phase === "input" && (
          <motion.div key="input"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-white/50 text-sm text-center">카발라의 세피로트 10위치로 삶의 전 영역을 탐색합니다</p>
            <div className="w-full">
              <label className="block text-white/40 text-xs mb-2">질문 (선택)</label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => !fortuneStatus?.exhausted && e.key === "Enter" && handleStartShuffle()}
                placeholder="예: 지금 나의 삶 전체를 보고 싶어요"
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

            <div className="relative mx-auto" style={{ width: TREE_W, height: TREE_H }}>
              {drawn.map((d, i) => {
                const pos = TREE_LAYOUT[i];
                return (
                  <motion.div key={i} className="absolute"
                    style={{ left: pos.x, top: pos.y, zIndex: i + 1 }}
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <TarotCard cardId={d.card.id} isRevealed={revealed[i]} isReversed={d.reversed} size="xs" />
                    <div
                      className="absolute -top-2 -left-2 w-[16px] h-[16px] rounded-full bg-emerald-900 border border-emerald-500/60 text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ zIndex: 20 }}
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
                    <span className="w-[16px] h-[16px] rounded-full bg-emerald-900 border border-emerald-500/60 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white/50 text-[10px] leading-none">{SEPHIROT[i].name}</span>
                      <span className="text-white/30 text-[9px] leading-none mt-0.5">{SEPHIROT[i].meaning}</span>
                    </div>
                    <span className="text-white text-xs font-medium ml-auto shrink-0">{d.card.nameKo}</span>
                    <span className={`text-[10px] shrink-0 ${d.reversed ? "text-rose-400" : "text-emerald-400"}`}>
                      {d.reversed ? "역" : "정"}
                    </span>
                  </motion.div>
                ) : (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg opacity-25">
                    <span className="w-[16px] h-[16px] rounded-full bg-white/10 text-white/40 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white/30 text-xs">{SEPHIROT[i].name}</span>
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
