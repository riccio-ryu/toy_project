"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarotCard from "@/components/tarot/TarotCard";
import { drawCards, type DrawnCard } from "@/lib/tarot/utils";

const POSITIONS = ["과거", "현재", "미래"] as const;

// ── 도넛 섹터 팬 스프레드 상수 ──────────────────────────────────────
const SPREAD_COUNT = 78;
const SPAN_DEG     = 140;
const R_INNER      = 90;
const CARD_W       = 54;
const CARD_H       = 90;
const CONTAINER_H  = R_INNER + CARD_H + 28;

type Phase = "input" | "shuffling" | "spread" | "drawn" | "reading";

export default function Tarot3CardsPage() {
  const [question,        setQuestion]        = useState("");
  const [phase,           setPhase]           = useState<Phase>("input");
  const [spreadCards,     setSpreadCards]     = useState<DrawnCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [spreadReady,     setSpreadReady]     = useState(false);
  const [drawn,           setDrawn]           = useState<DrawnCard[]>([]);
  const [revealed,        setRevealed]        = useState([false, false, false]);
  const [interpretation,  setInterpretation]  = useState("");
  const [isLoading,       setIsLoading]       = useState(false);
  const interpretRef = useRef<HTMLDivElement>(null);

  function handleStartShuffle() {
    setPhase("shuffling");
    setTimeout(() => {
      setSpreadCards(drawCards(SPREAD_COUNT));
      setSelectedIndices([]);
      setSpreadReady(false);
      setPhase("spread");
      // 카드 cascade 애니메이션 완료 후 spreadReady → true
      setTimeout(() => setSpreadReady(true), SPREAD_COUNT * 8 + 400);
    }, 1800);
  }

  function handleSelectCard(index: number) {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 3)     return prev;
      return [...prev, index];
    });
  }

  function handleConfirmSelection() {
    const selected = selectedIndices.map((i) => spreadCards[i]);
    setDrawn(selected);
    setRevealed([false, false, false]);
    setPhase("drawn");
    [0, 1, 2].forEach((i) => {
      setTimeout(() => {
        setRevealed((prev) => { const n = [...prev]; n[i] = true; return n; });
      }, 500 + i * 500);
    });
  }

  async function handleInterpret() {
    setIsLoading(true);
    setPhase("reading");
    setInterpretation("");
    setTimeout(() => interpretRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const res = await fetch("/api/fortune/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim() || undefined,
          cards: drawn.map((d, i) => ({ id: d.card.id, reversed: d.reversed, position: POSITIONS[i] })),
        }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setInterpretation((prev) => prev + dec.decode(value, { stream: true }));
      }
    } catch {
      setInterpretation("해석을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setPhase("input");
    setSpreadCards([]);
    setSelectedIndices([]);
    setSpreadReady(false);
    setDrawn([]);
    setRevealed([false, false, false]);
    setInterpretation("");
  }

  function cardTransform(i: number) {
    const t   = i / (SPREAD_COUNT - 1);
    const deg = -(SPAN_DEG / 2) + t * SPAN_DEG;
    const rad = (deg * Math.PI) / 180;
    return {
      x:        R_INNER * Math.sin(rad),
      bottomPx: R_INNER * Math.cos(rad),
      deg,
    };
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">← 홈</Link>
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
                onKeyDown={(e) => e.key === "Enter" && handleStartShuffle()}
                placeholder="예: 올해 연애운은 어떤가요?"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-colors"
              />
            </div>
            <button
              onClick={handleStartShuffle}
              className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
            >
              🃏 카드 섞기
            </button>
          </motion.div>
        )}

        {/* ── 2. 셔플 애니메이션 ──────────────────────────────── */}
        {phase === "shuffling" && (
          <motion.div key="shuffling"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center gap-10 py-16"
          >
            <div className="relative w-[110px] h-[190px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div key={i} className="absolute inset-0" style={{ zIndex: i }}
                  animate={{
                    x:      [0, i % 2 === 0 ? -38 : 38,  0, i % 2 === 0 ? 26 : -26, 0],
                    rotate: [i * 4 - 8, i % 2 === 0 ? -22 : 22, i * 4 - 8, i % 2 === 0 ? 14 : -14, i * 4 - 8],
                    y:      [i * -2,  i * -2 - 12,  i * -2,  i * -2 - 6,  i * -2],
                  }}
                  transition={{ duration: 0.45, repeat: 3, repeatType: "loop", ease: "easeInOut", delay: i * 0.05 }}
                >
                  <TarotCard cardId={`major-0${i}`} isRevealed={false} size="md" />
                </motion.div>
              ))}
            </div>
            <motion.p className="text-white/50 text-sm"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            >
              카드를 섞는 중...
            </motion.p>
          </motion.div>
        )}

        {/* ── 3. 부채꼴 카드 선택 ─────────────────────────────── */}
        {phase === "spread" && (
          <motion.div key="spread"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            {/* 안내 + 카운터 */}
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">카드 3장을 선택하세요</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartShuffle}
                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  🔀 다시 섞기
                </button>
                <span className="text-purple-300 font-semibold tabular-nums">
                  {selectedIndices.length}<span className="text-white/30 font-normal"> / 3</span>
                </span>
              </div>
            </div>

            {/* ── 도넛 섹터 팬 스프레드 ────────────────────────── */}
            <div className="relative w-full" style={{ height: CONTAINER_H }}>
              {spreadCards.map((card, i) => {
                const { x, bottomPx, deg } = cardTransform(i);
                const isSelected = selectedIndices.includes(i);

                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left:          `calc(50% + ${x}px)`,
                      bottom:        bottomPx,
                      width:         0,
                      height:        0,
                      zIndex:        i,
                      pointerEvents: isSelected ? "none" : "auto",
                      cursor:        "pointer",
                    }}
                    onClick={() => handleSelectCard(i)}
                  >
                    <motion.div
                      style={{
                        position:        "absolute",
                        left:            -CARD_W / 2,
                        bottom:          0,
                        width:           CARD_W,
                        height:          CARD_H,
                        transformOrigin: `${CARD_W / 2}px ${CARD_H}px`,
                      }}
                      initial={{ opacity: 0, rotate: deg, scale: 0.5 }}
                      animate={{
                        opacity: isSelected ? 0 : 1,
                        rotate:  deg,
                        scale:   isSelected ? 0.3 : 1,
                      }}
                      transition={{
                        opacity: { delay: isSelected || spreadReady ? 0 : i * 0.008, duration: 0.2 },
                        scale:   { type: "spring", stiffness: 500, damping: 30 },
                      }}
                    >
                      <TarotCard cardId={card.card.id} isRevealed={false} size="xs" />
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* ── 선택된 카드 하단 슬롯 ───────────────────────── */}
            <div className="flex justify-center gap-4">
              {POSITIONS.map((posLabel, slotIdx) => {
                const fanIdx = selectedIndices[slotIdx];
                const card   = fanIdx !== undefined ? spreadCards[fanIdx] : null;

                return (
                  <div key={slotIdx} className="flex flex-col items-center gap-1.5">
                    <AnimatePresence mode="wait">
                      {card ? (
                        <motion.div
                          key={`s${fanIdx}`}
                          initial={{ opacity: 0, scale: 0.7, y: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7, y: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 26 }}
                          className="cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => handleSelectCard(fanIdx)}
                        >
                          <TarotCard cardId={card.card.id} isRevealed={false} size="xs" />
                        </motion.div>
                      ) : (
                        <div
                          key="empty"
                          className="w-[54px] h-[92px] rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center"
                        >
                          <span className="text-white/20 text-sm font-medium">{slotIdx + 1}</span>
                        </div>
                      )}
                    </AnimatePresence>
                    <span className="text-white/40 text-[10px]">{posLabel}</span>
                  </div>
                );
              })}
            </div>

            {/* 선택 완료 버튼 */}
            <AnimatePresence>
              {selectedIndices.length === 3 && (
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

        {/* ── 4. 3장 배치 + 공개 + AI ─────────────────────────── */}
        {(phase === "drawn" || phase === "reading") && (
          <motion.div key="drawn"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8"
          >
            {question && (
              <p className="text-white/30 text-xs text-center">&quot;{question}&quot;</p>
            )}

            {/* 카드 3장 */}
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

            {/* AI 해석 버튼 */}
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

            {/* AI 해석 결과 */}
            {phase === "reading" && (
              <motion.div ref={interpretRef}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-4"
              >
                <div className="rounded-xl bg-white/5 border border-white/10 p-5 min-h-[120px]">
                  <p className="text-white/40 text-xs mb-3">AI 카드 해석</p>
                  {isLoading && !interpretation && (
                    <p className="text-white/30 text-sm animate-pulse">카드를 읽는 중...</p>
                  )}
                  {interpretation && (
                    <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
                      {interpretation}
                      {isLoading && <span className="animate-pulse text-purple-400">▌</span>}
                    </p>
                  )}
                </div>
                {!isLoading && (
                  <button onClick={handleReset}
                    className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-sm transition-colors"
                  >
                    새로운 배치로 다시 보기
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
