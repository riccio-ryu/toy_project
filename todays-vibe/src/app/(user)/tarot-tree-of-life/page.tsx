"use client";

import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import TarotCard from "@/components/tarot/TarotCard";
import TarotFanSpread from "@/components/tarot/TarotFanSpread";
import TarotShufflingAnimation from "@/components/tarot/TarotShufflingAnimation";
import TarotReadingResult from "@/components/tarot/TarotReadingResult";
import TarotTodayResult from "@/components/tarot/TarotTodayResult";
import TarotInputPhase from "@/components/tarot/TarotInputPhase";
import TarotSpreadHeader from "@/components/tarot/TarotSpreadHeader";
import TarotCardSlot from "@/components/tarot/TarotCardSlot";
import TarotConfirmButton from "@/components/tarot/TarotConfirmButton";
import TarotActionButtons from "@/components/tarot/TarotActionButtons";
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
      <PageHeader title="생명의 나무 타로" />

      <AnimatePresence mode="wait">

        {phase === "input" && (
          <TarotInputPhase
            subtitle="카발라의 세피로트 10위치로 삶의 전 영역을 탐색합니다"
            placeholder="예: 지금 나의 삶 전체를 보고 싶어요"
            question={question}
            setQuestion={setQuestion}
            fortuneStatus={fortuneStatus}
            handleStartShuffle={handleStartShuffle}
          />
        )}

        {phase === "shuffling" && <TarotShufflingAnimation />}

        {phase === "spread" && (
          <motion.div key="spread"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <TarotSpreadHeader
              cardCount={10}
              selectedCount={selectedIndices.length}
              onReshuffle={handleStartShuffle}
            />

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
                      <TarotCardSlot
                        key={slotIdx}
                        slotIdx={slotIdx}
                        fanIdx={fanIdx}
                        card={card}
                        onSelect={handleSelectCard}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <AnimatePresence>
              {selectedIndices.length === 10 && (
                <TarotConfirmButton onClick={handleConfirmSelection} />
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
              <TarotActionButtons onInterpret={handleInterpret} onReset={handleReset} />
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
