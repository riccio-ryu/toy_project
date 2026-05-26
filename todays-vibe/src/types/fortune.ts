// ─── Fortune Types ────────────────────────────────────────────────────────────

export type FortuneType =
  | "dream"
  | "saju"
  | "tarot-3cards"
  | "tarot-daily"
  | "love-fortune"
  | "wealth-fortune"
  | "career-fortune"
  | "zodiac"
  | "numerology"
  | "love-compatibility"
  | "name-compatibility";

// ─── Input Types (fortune별 입력 스키마) ──────────────────────────────────────

export interface DreamInput {
  dreamDescription: string;
  mood?: string; // 꿈에서 느낀 감정 (선택)
}

export interface SajuInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number; // 시간 모를 경우 생략
  gender: "male" | "female";
}

export interface Tarot3Input {
  question: string;
  cards: [string, string, string]; // [과거, 현재, 미래] 카드 이름
}

export interface ZodiacInput {
  sign: string; // e.g. "aries", "taurus" ...
}

export interface LoveCompatibilityInput {
  person1BirthDate: string; // YYYY-MM-DD
  person2BirthDate: string;
  person1Gender: "male" | "female";
  person2Gender: "male" | "female";
}

export type FortuneInput =
  | DreamInput
  | SajuInput
  | Tarot3Input
  | ZodiacInput
  | LoveCompatibilityInput;

// ─── API Request / Response ───────────────────────────────────────────────────

export interface FortuneRequest {
  type: FortuneType;
  input: FortuneInput;
}

export interface FortuneError {
  error: string;
}
