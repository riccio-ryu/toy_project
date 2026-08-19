"use client";

import { motion, AnimatePresence } from "framer-motion";
import TarotCard from "./TarotCard";
import type { DrawnCard } from "@/lib/tarot/utils";

interface Props {
  slotIdx: number;
  fanIdx: number | undefined;
  card: DrawnCard | null;
  label?: string;
  onSelect: (fanIdx: number) => void;
}

export default function TarotCardSlot({ slotIdx, fanIdx, card, label, onSelect }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="wait">
        {card ? (
          <motion.div
            key={`s${fanIdx}`}
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => fanIdx !== undefined && onSelect(fanIdx)}
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
      {label && (
        <span className="text-white/30 text-[10px] text-center leading-tight">{label}</span>
      )}
    </div>
  );
}
