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
      <PageHeader title="타로 3장 스프레드" />

      <AnimatePresence mode="wait">

        {phase === "input" && (
          <TarotInputPhase
            subtitle="마음속으로 질문을 생각하며 카드를 뽑아보세요"
            placeholder="예: 올해 연애운은 어떤가요?"
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
              cardCount={3}
              selectedCount={selectedIndices.length}
              onReshuffle={handleStartShuffle}
            />

            <TarotFanSpread
              spreadCards={spreadCards}
              selectedIndices={selectedIndices}
              spreadReady={spreadReady}
              onSelectCard={handleSelectCard}
            />

            <div className="flex justify-center gap-4">
              {POSITIONS.map((posLabel, slotIdx) => {
                const fanIdx = selectedIndices[slotIdx];
                const card   = fanIdx !== undefined ? spreadCards[fanIdx] : null;
                return (
                  <TarotCardSlot
                    key={slotIdx}
                    slotIdx={slotIdx}
                    fanIdx={fanIdx}
                    card={card}
                    label={posLabel}
                    onSelect={handleSelectCard}
                  />
                );
              })}
            </div>

            <AnimatePresence>
              {selectedIndices.length === 3 && (
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
