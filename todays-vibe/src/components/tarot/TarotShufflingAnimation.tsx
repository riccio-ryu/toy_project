"use client";

import { motion } from "framer-motion";
import TarotCard from "./TarotCard";

export default function TarotShufflingAnimation() {
  return (
    <motion.div
      key="shuffling"
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
      <motion.p
        className="text-white/50 text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      >
        카드를 섞는 중...
      </motion.p>
    </motion.div>
  );
}
