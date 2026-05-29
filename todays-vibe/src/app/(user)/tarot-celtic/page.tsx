"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarotCard from "@/components/tarot/TarotCard";
import { drawCards, type DrawnCard } from "@/lib/tarot/utils";

const SELECT_COUNT = 10;

const POSITION_NAMES = [
  "현재 상황",
  "교차하는 힘",
  "뿌리 / 과거",
  "최근 과거",
  "잠재 가능성",
  "다가오는 미래",
  "나 자신",
  "외부 환경",
  "희망과 두려움",
  "최종 결과",
] as const;

// ── 도넛 섹터 팬 스프레드 상수 ──────────────────────────────────────
const SPREAD_COUNT = 78;
const SPAN_DEG     = 140;
const R_INNER      = 90;
const CARD_W       = 54;
const CARD_H       = 90;
const FAN_H        = R_INNER + CARD_H + 28;

// ── 켈틱 크로스 레이아웃 ────────────────────────────────────────────
// xs 카드: 54×92px  컨테이너: 260×404px
//
//       [5]                [10]
// [4] [1/2] [6]            [9]
//       [3]                [8]
//                          [7]
//
const CROSS_W = 260;
const CROSS_H = 404;

const CELTIC_LAYOUT = [
  { x: 66,  y: 156, rotate: 0  },  // 1: 현재 상황 (center)
  { x: 66,  y: 156, rotate: 90 },  // 2: 교차하는 힘 (rotated, crosses 1)
  { x: 66,  y: 260, rotate: 0  },  // 3: 뿌리 / 과거 (below)
  { x: 0,   y: 156, rotate: 0  },  // 4: 최근 과거 (left)
  { x: 66,  y: 52,  rotate: 0  },  // 5: 잠재 가능성 (above)
  { x: 132, y: 156, rotate: 0  },  // 6: 다가오는 미래 (right)
  { x: 206, y: 312, rotate: 0  },  // 7: 나 자신 (staff bottom)
  { x: 206, y: 208, rotate: 0  },  // 8: 외부 환경 (staff 3rd)
  { x: 206, y: 104, rotate: 0  },  // 9: 희망과 두려움 (staff 2nd)
  { x: 206, y: 0,   rotate: 0  },  // 10: 최종 결과 (staff top)
] as const;

type Phase = "input" | "shuffling" | "spread" | "drawn" | "reading";

export default function TarotCelticPage() {
  const [question,        setQuestion]        = useState("");
  const [phase,           setPhase]           = useState<Phase>("input");
  const [spreadCards,     setSpreadCards]     = useState<DrawnCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [spreadReady,     setSpreadReady]     = useState(false);
  const [drawn,           setDrawn]           = useState<DrawnCard[]>([]);
  const [revealed,        setRevealed]        = useState<boolean[]>(Array(SELECT_COUNT).fill(false));
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
      setTimeout(() => setSpreadReady(true), SPREAD_COUNT * 8 + 400);
    }, 1800);
  }

  function handleSelectCard(index: number) {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= SELECT_COUNT) return prev;
      return [...prev, index];
    });
  }

  function handleConfirmSelection() {
    const selected = selectedIndices.map((i) => spreadCards[i]);
    setDrawn(selected);
    setRevealed(Array(SELECT_COUNT).fill(false));
    setPhase("drawn");
    Array.from({ length: SELECT_COUNT }, (_, i) => {
      setTimeout(() => {
        setRevealed((prev) => { const n = [...prev]; n[i] = true; return n; });
      }, 500 + i * 400);
    });
  }

  async function handleInterpret() {
    setIsLoading(true);
    setPhase("reading");
    setInterpretation("");
    setTimeout(() => interpretRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const res = await fetch("/api/fortune/tarot-celtic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim() || undefined,
          cards: drawn.map((d, i) => ({
            id:       d.card.id,
            reversed: d.reversed,
            position: POSITION_NAMES[i],
          })),
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
    setRevealed(Array(SELECT_COUNT).fill(false));
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
        <h1 className="text-white font-semibold text-lg">켈틱 크로스 타로</h1>
        <span className="ml-auto text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/20">AI</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ── 1. 질문 입력 ─────────────────────────────────────── */}
        {phase === "input" && (
          <motion.div key="input"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-white/50 text-sm text-center">
              마음속으로 질문을 생각하며 카드 10장을 뽑아보세요
            </p>
            <div className="w-full">
              <label className="block text-white/40 text-xs mb-2">질문 (선택)</label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartShuffle()}
                placeholder="예: 올해 나의 방향은 어떤가요?"
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
              <p className="text-white/60 text-sm">카드 10장을 선택하세요</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartShuffle}
                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  🔀 다시 섞기
                </button>
                <span className="text-purple-300 font-semibold tabular-nums">
                  {selectedIndices.length}<span className="text-white/30 font-normal"> / 10</span>
                </span>
              </div>
            </div>

            {/* ── 도넛 섹터 팬 스프레드 ────────────────────────── */}
            <div className="relative w-full" style={{ height: FAN_H }}>
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

            {/* ── 선택된 카드 하단 슬롯 (5 × 2 그리드) ─────────── */}
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

            {/* 선택 완료 버튼 */}
            <AnimatePresence>
              {selectedIndices.length === SELECT_COUNT && (
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

        {/* ── 4. 켈틱 크로스 배치 + 공개 + AI ─────────────────── */}
        {(phase === "drawn" || phase === "reading") && (
          <motion.div key="drawn"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {question && (
              <p className="text-white/30 text-xs text-center">&quot;{question}&quot;</p>
            )}

            {/* 켈틱 크로스 레이아웃 */}
            <div className="relative mx-auto" style={{ width: CROSS_W, height: CROSS_H }}>
              {drawn.map((d, i) => {
                const pos = CELTIC_LAYOUT[i];
                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left:   pos.x,
                      top:    pos.y,
                      zIndex: i === 1 ? 10 : i + 1,
                    }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <div
                      style={{
                        transformOrigin: "27px 46px",
                        transform:       `rotate(${pos.rotate}deg)`,
                      }}
                    >
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

            {/* 카드 정보 리스트 */}
            <div className="w-full space-y-1.5">
              {drawn.map((d, i) =>
                revealed[i] ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
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
