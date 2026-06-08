"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import AILoadingIndicator from "@/components/common/AILoadingIndicator";

type Props = {
  interpretRef: RefObject<HTMLDivElement | null>;
  interpretation: string;
  isLoading: boolean;
  onReset: () => void;
};

export default function TarotReadingResult({ interpretRef, interpretation, isLoading, onReset }: Props) {
  return (
    <motion.div
      ref={interpretRef}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 min-h-[120px]">
        <p className="text-white/40 text-xs mb-3">AI 카드 해석</p>
        {isLoading && !interpretation && (
          <AILoadingIndicator type="tarot" />
        )}
        {interpretation && (
          <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
            {interpretation}
            {isLoading && <span className="animate-pulse text-purple-400">▌</span>}
          </p>
        )}
      </div>
      {!isLoading && (
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-sm transition-colors"
        >
          새로운 배치로 다시 보기
        </button>
      )}
    </motion.div>
  );
}
