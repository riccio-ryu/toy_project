"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES: Record<string, string[]> = {
  tarot: [
    "카드의 기운을 읽는 중...",
    "우주의 메시지를 해석하는 중...",
    "카드 간의 흐름을 살피는 중...",
    "당신을 위한 이야기를 엮는 중...",
  ],
  saju: [
    "천간과 지지를 분석하는 중...",
    "당신의 운명의 흐름을 읽고 있어요...",
    "대운과 세운을 살피는 중...",
    "오행의 기운을 풀이하는 중...",
  ],
  dream: [
    "꿈 속의 상징을 해석하는 중...",
    "무의식의 메시지를 읽는 중...",
    "꿈의 의미를 풀이하는 중...",
    "마음 속 이야기를 엮는 중...",
  ],
  default: [
    "AI가 해석하고 있어요...",
    "우주의 흐름을 읽는 중...",
    "당신만을 위한 운세를 풀이하는 중...",
    "별의 기운을 분석하는 중...",
  ],
};

type Props = {
  type?: "tarot" | "saju" | "dream" | "default";
};

export default function AILoadingIndicator({ type = "default" }: Props) {
  const messages = MESSAGES[type] ?? MESSAGES.default;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-white/50 text-sm"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
