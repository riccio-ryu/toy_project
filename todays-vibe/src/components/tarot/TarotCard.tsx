"use client";

import { getCardFrontStyle, CARD_BACK_STYLE } from "@/lib/tarot/utils";

// 사이즈: w × h (타로 카드 비율 ~1:1.75)
const SIZE_CLASS: Record<string, string> = {
  xs: "w-[54px] h-[92px]",
  sm: "w-[80px] h-[136px]",
  md: "w-[110px] h-[190px]",
  lg: "w-[150px] h-[262px]",
  xl: "w-[180px] h-[315px]",
};

interface TarotCardProps {
  cardId: string;
  isRevealed: boolean;
  isReversed?: boolean;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  onClick?: () => void;
}

export default function TarotCard({
  cardId,
  isRevealed,
  isReversed = false,
  size = "lg",
  className = "",
  onClick,
}: TarotCardProps) {
  const frontStyle = getCardFrontStyle(cardId);

  return (
    <div
      className={`${SIZE_CLASS[size]} shrink-0 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ perspective: "1200px" }}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* 뒷면 */}
        <div
          className="absolute inset-0 rounded-xl shadow-lg shadow-black/40"
          style={{ backfaceVisibility: "hidden", ...CARD_BACK_STYLE }}
        />
        {/* 앞면 */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-lg shadow-black/40"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className={`w-full h-full transition-transform duration-500 ${isReversed ? "rotate-180" : ""}`}
            style={frontStyle}
          />
        </div>
      </div>
    </div>
  );
}
