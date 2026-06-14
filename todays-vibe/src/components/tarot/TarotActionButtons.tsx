"use client";

import { motion } from "framer-motion";

interface Props {
  onInterpret: () => void;
  onReset: () => void;
}

export default function TarotActionButtons({ onInterpret, onReset }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex gap-3 w-full"
    >
      <button
        onClick={onInterpret}
        className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40"
      >
        ✨ AI 해석 받기
      </button>
      <button
        onClick={onReset}
        className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors"
      >
        다시
      </button>
    </motion.div>
  );
}
