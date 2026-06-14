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

const POSITIONS = [
  { label: "지금 삶",    desc: "질문자의 지금 삶" },
  { label: "인간관계",   desc: "인간관계 및 주변 환경" },
  { label: "방해 요소",  desc: "목표를 방해하는 것" },
  { label: "극복 방법",  desc: "장애물을 극복하기 위해 해야 할 것" },
  { label: "행동 지침",  desc: "목표를 이루기 위해 해야 할 것" },
  { label: "외부 교훈",  desc: "외부·타인으로부터 배워야 할 것" },
  { label: "예상 결과",  desc: "예상 결과 (보름달 에너지)" },
] as const;

const MOON_W = 222;
const MOON_H = 500;

const FULLMOON_LAYOUT = [
  { x: 84,  y: 0   },
  { x: 0,   y: 102 },
  { x: 168, y: 102 },
  { x: 0,   y: 306 },
  { x: 168, y: 306 },
  { x: 84,  y: 408 },
  { x: 84,  y: 204 },
] as const;

export default function TarotFullMoonPage() {
  const {
    question, setQuestion, phase, spreadCards, selectedIndices, spreadReady,
    drawn, revealed, interpretation, isLoading, fortuneStatus, interpretRef,
    handleStartShuffle, handleSelectCard, handleConfirmSelection, handleReset, interpret,
  } = useTarotSpread("tarot-full-moon", 7);

  function handleInterpret() {
    interpret("/api/fortune/tarot-full-moon", {
      question: question.trim() || undefined,
      cards: drawn.map((d, i) => ({
        id: d.card.id, reversed: d.reversed,
        position: POSITIONS[i].label, desc: POSITIONS[i].desc,
      })),
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <PageHeader title="보름달 타로" />

      <AnimatePresence mode="wait">

        {phase === "input" && (
          <TarotInputPhase
            subtitle="보름달 에너지로 삶의 흐름과 목표를 탐색합니다"
            placeholder="예: 지금 내가 집중해야 할 것은 무엇인가요?"
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
              cardCount={7}
              selectedCount={selectedIndices.length}
              onReshuffle={handleStartShuffle}
            />

            <TarotFanSpread
              spreadCards={spreadCards}
              selectedIndices={selectedIndices}
              spreadReady={spreadReady}
              onSelectCard={handleSelectCard}
            />

            <div className="flex justify-center gap-1.5">
              {POSITIONS.map((pos, slotIdx) => {
                const fanIdx = selectedIndices[slotIdx];
                const card   = fanIdx !== undefined ? spreadCards[fanIdx] : null;
                return (
                  <TarotCardSlot
                    key={slotIdx}
                    slotIdx={slotIdx}
                    fanIdx={fanIdx}
                    card={card}
                    label={pos.label}
                    onSelect={handleSelectCard}
                  />
                );
              })}
            </div>

            <AnimatePresence>
              {selectedIndices.length === 7 && (
                <TarotConfirmButton onClick={handleConfirmSelection} />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {(phase === "drawn" || phase === "reading") && (
          <motion.div key="drawn"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8"
          >
            {question && <p className="text-white/30 text-xs text-center">&quot;{question}&quot;</p>}

            <div className="relative mx-auto" style={{ width: MOON_W, height: MOON_H }}>
              {drawn.map((d, i) => {
                const pos = FULLMOON_LAYOUT[i];
                const isCenter = i === 6;
                return (
                  <motion.div key={i} className="absolute"
                    style={{ left: pos.x, top: pos.y, zIndex: isCenter ? 10 : i + 1 }}
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <TarotCard cardId={d.card.id} isRevealed={revealed[i]} isReversed={d.reversed} size="xs" />
                    <div
                      className={`absolute -top-2 -left-2 w-[16px] h-[16px] rounded-full text-white text-[9px] font-bold flex items-center justify-center ${
                        isCenter ? "bg-sky-900 border border-sky-400/60" : "bg-indigo-900 border border-indigo-500/60"
                      }`}
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
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-lg ${i === 6 ? "bg-sky-900/20 border border-sky-500/20" : "bg-white/5"}`}
                  >
                    <span className={`w-[16px] h-[16px] rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 ${
                      i === 6 ? "bg-sky-900 border border-sky-400/60" : "bg-indigo-900 border border-indigo-500/60"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-white/40 text-xs shrink-0">{POSITIONS[i].label}</span>
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
                    <span className="text-white/30 text-xs">{POSITIONS[i].label}</span>
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
