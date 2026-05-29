import type { CSSProperties } from "react";
import tarotData from "@/data/tarot-cards.json";

// ─── 타입 ────────────────────────────────────────────────────────────

export type TarotCardData = {
  id: string;
  number: number | string;
  name: string;
  nameKo: string;
  suit: string;
  element?: string;
  keywords: string[];
  upright: {
    meaning: string;
    love?: string;
    career?: string;
    finance?: string;
    summary?: string;
  };
  reversed: {
    meaning: string;
    love?: string;
    career?: string;
    finance?: string;
    summary?: string;
  };
  description?: string;
};

export type DrawnCard = {
  card: TarotCardData;
  reversed: boolean;
};

// ─── 카드 데이터 ─────────────────────────────────────────────────────

export function getAllCards(): TarotCardData[] {
  const major = tarotData.majorArcana as unknown as TarotCardData[];
  const minor = Object.values(tarotData.minorArcana).flat() as unknown as TarotCardData[];
  return [...major, ...minor];
}

export function getCardById(id: string): TarotCardData | undefined {
  return getAllCards().find((c) => c.id === id);
}

export function drawCards(count: number): DrawnCard[] {
  const all = getAllCards();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card) => ({
    card,
    reversed: Math.random() > 0.5,
  }));
}

// ─── 스프라이트 위치 ─────────────────────────────────────────────────

const MINOR_ORDER = [
  "ace", "02", "03", "04", "05", "06", "07",
  "08", "09", "10", "page", "knight", "queen", "king",
];

type SpriteInfo = { src: string; cols: number; rows: number; col: number; row: number };

function getCardSprite(cardId: string): SpriteInfo {
  if (cardId.startsWith("major-")) {
    const num = parseInt(cardId.split("-")[1], 10);
    return { src: "/images/tarot/tarot_major.png", cols: 11, rows: 2, col: num % 11, row: Math.floor(num / 11) };
  }
  const [suit, num] = cardId.split("-");
  const index = MINOR_ORDER.indexOf(num);
  return { src: `/images/tarot/tarot_${suit}.png`, cols: 7, rows: 2, col: index % 7, row: Math.floor(index / 7) };
}

export function getCardFrontStyle(cardId: string): CSSProperties {
  const { src, cols, rows, col, row } = getCardSprite(cardId);
  const xPct = cols === 1 ? 0 : (col / (cols - 1)) * 100;
  const yPct = rows === 1 ? 0 : (row / (rows - 1)) * 100;
  return {
    backgroundImage: `url('${src}')`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat: "no-repeat",
  };
}

// tarot-back.png: 380×500 단일 이미지 — 카드 크기에 맞게 꽉 채움
export const CARD_BACK_STYLE: CSSProperties = {
  backgroundImage: "url('/images/tarot/tarot-back.png')",
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
};

// ─── 텍스트 헬퍼 ─────────────────────────────────────────────────────

export function getCardMeaning(card: TarotCardData, reversed: boolean) {
  return reversed ? card.reversed : card.upright;
}

export function getSuitLabel(suit: string): string {
  const map: Record<string, string> = {
    major: "메이저 아르카나",
    wands: "완드",
    cups: "컵",
    swords: "소드",
    pentacles: "펜타클",
  };
  return map[suit] ?? suit;
}
