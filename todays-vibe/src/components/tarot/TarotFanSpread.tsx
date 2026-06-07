"use client";

import { motion } from "framer-motion";
import TarotCard from "./TarotCard";
import type { DrawnCard } from "@/lib/tarot/utils";
import { SPREAD_COUNT, SPAN_DEG, R_INNER, CARD_W, CARD_H, FAN_H } from "@/lib/hooks/useTarotSpread";

type Props = {
  spreadCards: DrawnCard[];
  selectedIndices: number[];
  spreadReady: boolean;
  onSelectCard: (index: number) => void;
};

function cardTransform(i: number) {
  const t   = i / (SPREAD_COUNT - 1);
  const deg = -(SPAN_DEG / 2) + t * SPAN_DEG;
  const rad = (deg * Math.PI) / 180;
  return { x: R_INNER * Math.sin(rad), bottomPx: R_INNER * Math.cos(rad), deg };
}

export default function TarotFanSpread({ spreadCards, selectedIndices, spreadReady, onSelectCard }: Props) {
  return (
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
            onClick={() => onSelectCard(i)}
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
  );
}
