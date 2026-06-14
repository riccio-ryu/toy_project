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
      <PageHeader title="켈틱 크로스 타로" />

      <AnimatePresence mode="wait">

        {phase === "input" && (
          <TarotInputPhase
            subtitle="마음속으로 질문을 생각하며 카드 10장을 뽑아보세요"
            placeholder="예: 올해 나의 방향은 어떤가요?"
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
