// ─── Fortune Status (오늘 사용 현황 API 응답) ────────────────────────────────

export interface FortuneStatus {
  used: number;
  limit: number | null;
  exhausted: boolean;
  todayReading: { id: string; result: string; createdAt: string | null } | null;
}

// ─── Fortune Types ────────────────────────────────────────────────────────────

export type FortuneType =
  | "dream"
  | "saju"
  | "tarot-3cards"
  | "tarot-daily"
  | "love-fortune"
  | "wealth-fortune"
  | "career-fortune"
  | "health-fortune"
  | "zodiac"
  | "numerology"
  | "love-compatibility"
  | "name-compatibility"
  | "zodiac-compatibility"
  | "business-compatibility"
  | "rune"
  | "name-fortune"
  | "tojeong"
  | "life-fortune"
  | "moving-fortune";

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

export interface NumerologyInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
}

export interface LoveCompatibilityInput {
  person1BirthDate: string; // YYYY-MM-DD
  person2BirthDate: string;
  person1Gender: "male" | "female";
  person2Gender: "male" | "female";
}

export interface NameCompatibilityInput {
  name1: string;
  name2: string;
}

export interface ZodiacCompatibilityInput {
  person1BirthYear: number;
  person2BirthYear: number;
}

export interface RuneInput {
  question?: string;
  runes: [string, string, string];
}

export interface NameFortuneInput {
  name: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
}

export interface GeneralFortuneInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: "male" | "female";
  question?: string;
}

export interface LifeFortuneInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: "male" | "female";
}

export interface TojeongInput {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLunar: boolean;
  gender: "male" | "female";
  targetYear: number; // 올해 운세를 볼 년도
}

export type Direction =
  | "북" | "북동" | "동" | "동남"
  | "남" | "남서" | "서" | "북서";

export interface MovingFortuneInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: "male" | "female";
  direction: Direction;
  movingYear?: number;
  movingMonth?: number;
  question?: string;
}

export type FortuneInput =
  | DreamInput
  | SajuInput
  | Tarot3Input
  | ZodiacInput
  | NumerologyInput
  | LoveCompatibilityInput
  | NameCompatibilityInput
  | ZodiacCompatibilityInput
  | RuneInput
  | NameFortuneInput
  | GeneralFortuneInput
  | TojeongInput
  | LifeFortuneInput
  | MovingFortuneInput;

// ─── API Request / Response ───────────────────────────────────────────────────

export interface FortuneRequest {
  type: FortuneType;
  input: FortuneInput;
}

export interface FortuneError {
  error: string;
}
