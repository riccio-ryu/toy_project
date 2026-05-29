"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarotCard from "@/components/tarot/TarotCard";
import { drawCards, getCardMeaning, getSuitLabel, type DrawnCard } from "@/lib/tarot/utils";

export default function TarotDailyPage() {
  const [drawn, setDrawn] = useState<DrawnCard | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleDraw() {
    const [card] = drawCards(1);
    setDrawn(card);
    setRevealed(false);
    // 카드 등장 후 짧은 딜레이로 자동 공개
    setTimeout(() => setRevealed(true), 600);
  }

  function handleReset() {
    setRevealed(false);
    setTimeout(() => setDrawn(null), 400);
  }

  const meaning = drawn ? getCardMeaning(drawn.card, drawn.reversed) : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
          ← 홈
        </Link>
        <span className="text-white/20">|</span>
        <h1 className="text-white font-semibold text-lg">타로 원카드</h1>
      </div>

      {/* 메인 */}
      <div className="flex flex-col items-center gap-8">
        <p className="text-white/50 text-sm text-center">
          마음속으로 오늘 하루를 생각하며 카드를 뽑아보세요
        </p>

        {/* 카드 영역 */}
        <div className="relative h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!drawn ? (
              <motion.div
                key="deck"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleDraw}
                className="cursor-pointer group"
              >
                {/* 덱 스택 효과 */}
                <div className="relative">
                  <div className="absolute top-2 left-2 w-[150px] h-[262px] rounded-xl bg-white/5 border border-white/10" />
                  <div className="absolute top-1 left-1 w-[150px] h-[262px] rounded-xl bg-white/5 border border-white/10" />
                  <TarotCard
                    cardId="major-00"
                    isRevealed={false}
                    size="lg"
                    className="relative group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-center text-purple-300 text-xs mt-4 group-hover:text-purple-200 transition-colors">
                  클릭해서 카드 뽑기
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-3"
              >
                <TarotCard
                  cardId={drawn.card.id}
                  isRevealed={revealed}
                  isReversed={drawn.reversed}
                  size="lg"
                />
                {revealed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      drawn.reversed
                        ? "text-rose-300 border-rose-400/30 bg-rose-900/20"
                        : "text-emerald-300 border-emerald-400/30 bg-emerald-900/20"
                    }`}
                  >
                    {drawn.reversed ? "역방향" : "정방향"}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 카드 뽑기 버튼 (카드 없을 때만) */}
        {!drawn && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleDraw}
            className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
          >
            카드 뽑기
          </motion.button>
        )}

        {/* 카드 해석 결과 */}
        <AnimatePresence>
          {drawn && revealed && meaning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full space-y-4"
            >
              {/* 카드 이름 */}
              <div className="text-center">
                <p className="text-white/40 text-xs mb-1">{getSuitLabel(drawn.card.suit)}</p>
                <h2 className="text-white font-bold text-2xl">{drawn.card.nameKo}</h2>
                <p className="text-white/50 text-sm">{drawn.card.name}</p>
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  {drawn.card.keywords.slice(0, 4).map((kw) => (
                    <span key={kw} className="text-[11px] text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* 핵심 의미 */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-white/40 text-xs mb-2">오늘의 메시지</p>
                <p className="text-white/90 text-sm leading-relaxed">{meaning.meaning}</p>
              </div>

              {/* 영역별 해석 (major arcana는 love/career/finance 있음) */}
              {(meaning.love || meaning.career || meaning.finance) && (
                <div className="grid grid-cols-3 gap-2">
                  {meaning.love && (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                      <p className="text-rose-300 text-lg mb-1">❤️</p>
                      <p className="text-white/40 text-[10px] mb-1">연애</p>
                      <p className="text-white/80 text-[11px] leading-relaxed">{meaning.love}</p>
                    </div>
                  )}
                  {meaning.career && (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                      <p className="text-blue-300 text-lg mb-1">💼</p>
                      <p className="text-white/40 text-[10px] mb-1">직장</p>
                      <p className="text-white/80 text-[11px] leading-relaxed">{meaning.career}</p>
                    </div>
                  )}
                  {meaning.finance && (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                      <p className="text-yellow-300 text-lg mb-1">💰</p>
                      <p className="text-white/40 text-[10px] mb-1">재물</p>
                      <p className="text-white/80 text-[11px] leading-relaxed">{meaning.finance}</p>
                    </div>
                  )}
                </div>
              )}

              {/* summary (minor arcana) */}
              {meaning.summary && (
                <div className="rounded-xl bg-purple-900/20 border border-purple-500/20 p-4">
                  <p className="text-purple-200 text-sm leading-relaxed">{meaning.summary}</p>
                </div>
              )}

              {/* 카드 설명 */}
              {drawn.card.description && (
                <p className="text-white/30 text-xs text-center leading-relaxed px-2">
                  {drawn.card.description}
                </p>
              )}

              {/* 다시 뽑기 */}
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-sm transition-colors"
              >
                다시 뽑기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
