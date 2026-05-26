export type FortuneCategory = "zodiac" | "chinese_zodiac";
export type FortunePeriod = "weekly" | "monthly" | "annual";

// ─── 주간 운세 ────────────────────────────────────────────────────────────────
export interface WeeklyDays {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

export interface WeeklyFortune {
  category: FortuneCategory;
  sign: string;          // e.g. "aries" | "rat"
  weekKey: string;       // e.g. "2027-W05"
  weekStart: string;     // e.g. "2027-01-25" (월요일)
  weekEnd: string;       // e.g. "2027-01-31" (일요일)
  summary: string;       // 이번 주 전체 요약
  days: WeeklyDays;
  lucky: {
    color: string;
    number: number;
    keyword: string;
  };
  generatedAt: string;   // ISO string
}

// ─── 월간 운세 ────────────────────────────────────────────────────────────────
export interface MonthlyFortune {
  category: FortuneCategory;
  sign: string;
  monthKey: string;      // e.g. "2027-02"
  content: string;
  highlights: string[];  // 이번 달 주요 포인트 3가지
  lucky: {
    color: string;
    number: number;
    keyword: string;
  };
  generatedAt: string;
}

// ─── 연간 운세 ────────────────────────────────────────────────────────────────
export interface AnnualFortune {
  category: FortuneCategory;
  sign: string;
  year: number;
  summary: string;
  quarters: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  generatedAt: string;
}

// ─── 배치 실행 결과 ───────────────────────────────────────────────────────────
export interface BatchResult {
  period: FortunePeriod;
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}
