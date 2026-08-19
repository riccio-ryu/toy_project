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

// ─── 개별 이미지 경로 ─────────────────────────────────────────────────

const MAJOR_FILENAMES: Record<number, string> = {
  0:  "00_THE_FOOL",
  1:  "01_THE_MAGICIAN",
  2:  "02_THE_HIGH_PRIESTESS",
  3:  "03_THE_EMPRESS",
  4:  "04_THE_EMPEROR",
  5:  "05_THE_HIEROPHANT",
  6:  "06_THE_LOVERS",
  7:  "07_THE_CHARIOT",
  8:  "08_STRENGTH",
  9:  "09_THE_HERMIT",
  10: "10_WHEEL_OF_FORTUNE",
  11: "11_JUSTICE",
  12: "12_THE_HANGED_MAN",
  13: "13_DEATH",
  14: "14_TEMPERANCE",
  15: "15_THE_DEVIL",
  16: "16_THE_TOWER",
  17: "17_THE_STAR",
  18: "18_THE_MOON",
  19: "19_THE_SUN",
  20: "20_JUDGEMENT",
  21: "21_THE_WORLD",
};

const MINOR_NUM_TO_FILE: Record<string, string> = {
  ace:    "01_ace",
  "02":   "02_two",
  "03":   "03_three",
  "04":   "04_four",
  "05":   "05_five",
  "06":   "06_six",
  "07":   "07_seven",
  "08":   "08_eight",
  "09":   "09_nine",
  "10":   "10_ten",
  page:   "11_page",
  knight: "12_knight",
  queen:  "13_queen",
  king:   "14_king",
};

export function getCardImageUrl(cardId: string): string {
  if (cardId.startsWith("major-")) {
    const num = parseInt(cardId.split("-")[1], 10);
    return `/images/tarot/tarot_majors/${MAJOR_FILENAMES[num]}.png`;
  }
  const [suit, num] = cardId.split("-");
  const fileNum = MINOR_NUM_TO_FILE[num];
  return `/images/tarot/tarot_${suit}/${suit}_${fileNum}.png`;
}

export function getCardFrontStyle(cardId: string): CSSProperties {
  return {
    backgroundImage: `url('${getCardImageUrl(cardId)}')`,
    backgroundSize: "100% 100%",
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

/**
 * buildPrompt용 카드 목록 포매터.
 * extra: 포지션 부연설명 (desc / meaning 등). 없으면 괄호 생략.
 * numbered: true면 "• N번 position" 형식, false면 "• position" 형식.
 */
export function formatCardLines(
  cards: Array<{ id: string; reversed: boolean; position: string; extra?: string }>,
  { numbered = true }: { numbered?: boolean } = {}
): string {
  return cards
    .map(({ id, reversed, position, extra }, idx) => {
      const card = getCardById(id);
      if (!card) return "";
      const interp = reversed ? card.reversed : card.upright;
      const prefix = numbered ? `• ${idx + 1}번 ${position}` : `• ${position}`;
      const label = extra ? `${prefix} (${extra})` : prefix;
      return `${label}: ${card.nameKo} (${card.name}) — ${reversed ? "역방향" : "정방향"}
  키워드: ${card.keywords.join(", ")}
  의미: ${interp.meaning}`;
    })
    .filter(Boolean)
    .join("\n\n");
}
