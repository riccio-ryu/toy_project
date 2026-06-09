"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ORACLE_CARDS, type OracleCard } from "@/data/oracle-cards";

function drawCard(): OracleCard {
  return ORACLE_CARDS[Math.floor(Math.random() * ORACLE_CARDS.length)];
}

export default function OraclePage() {
  const [card, setCard] = useState<OracleCard | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleDraw() {
    setCard(drawCard());
    setRevealed(false);
    setTimeout(() => setRevealed(true), 500);
  }

  function handleReset() {
    setRevealed(false);
    setTimeout(() => setCard(null), 350);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">🌈</span>
        <h1 className="text-white font-bold text-2xl">오라클 카드</h1>
        <p className="text-white/50 text-sm mt-2">오늘 나에게 필요한 메시지를 받아보세요</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <p className="text-white/40 text-sm text-center">
          마음을 고요히 하고 카드를 뽑아보세요
        </p>

        {/* 카드 영역 */}
        <div className="relative h-[300px] w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!card ? (
              <motion.div
                key="deck"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleDraw}
                className="cursor-pointer group"
              >
                {/* 덱 스택 */}
                <div className="relative">
                  <div className="absolute top-2 left-2 w-[160px] h-[220px] rounded-2xl bg-white/5 border border-white/10" />
                  <div className="absolute top-1 left-1 w-[160px] h-[220px] rounded-2xl bg-white/5 border border-white/10" />
                  <div className="w-[160px] h-[220px] rounded-2xl bg-gradient-to-br from-violet-700 to-purple-900 border border-purple-500/30 flex items-center justify-center shadow-xl relative group-hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <span className="text-4xl block mb-2">✨</span>
                      <p className="text-purple-300 text-xs">카드 뽑기</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="card"
                initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className={`w-[160px] h-[220px] rounded-2xl bg-gradient-to-br ${card.gradient} flex flex-col items-center justify-center shadow-2xl border border-white/20`}>
                  <span className="text-5xl mb-3">{card.emoji}</span>
                  <p className="text-white font-bold text-lg">{card.name}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 뽑기 버튼 */}
        {!card && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleDraw}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm transition-opacity shadow-lg"
          >
            카드 뽑기
          </motion.button>
        )}

        {/* 카드 내용 */}
        <AnimatePresence>
          {card && revealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full space-y-4"
            >
              {/* 카드 이름 */}
              <div className="text-center">
                <h2 className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.name}
                </h2>
              </div>

              {/* 메시지 */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-white/40 text-xs mb-2">오늘의 메시지</p>
                <p className="text-white/90 text-sm leading-relaxed">{card.message}</p>
              </div>

              {/* 확언 */}
              <div className={`rounded-2xl bg-gradient-to-r ${card.gradient} p-[1px]`}>
                <div className="rounded-2xl bg-gray-950 px-5 py-4">
                  <p className="text-white/40 text-xs mb-1">오늘의 확언</p>
                  <p className="text-white/90 text-sm font-medium leading-relaxed italic">
                    "{card.affirmation}"
                  </p>
                </div>
              </div>

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
