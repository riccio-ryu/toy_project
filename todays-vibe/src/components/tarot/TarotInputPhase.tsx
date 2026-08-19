"use client";

import { motion } from "framer-motion";
import type { FortuneStatus } from "@/types/fortune";

interface Props {
  subtitle: string;
  placeholder: string;
  question: string;
  setQuestion: (v: string) => void;
  fortuneStatus: FortuneStatus | null;
  handleStartShuffle: () => void;
}

export default function TarotInputPhase({
  subtitle,
  placeholder,
  question,
  setQuestion,
  fortuneStatus,
  handleStartShuffle,
}: Props) {
  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6"
    >
      <p className="text-white/50 text-sm text-center">{subtitle}</p>
      <div className="w-full">
        <label className="block text-white/40 text-xs mb-2">질문 (선택)</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) =>
            !fortuneStatus?.exhausted && e.key === "Enter" && handleStartShuffle()
          }
          placeholder={placeholder}
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
  );
}
