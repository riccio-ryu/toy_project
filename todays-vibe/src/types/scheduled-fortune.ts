export type FortuneCategory = "zodiac" | "chinese_zodiac";
export type FortunePeriod = "weekly" | "monthly" | "yearly";

// ─── 주간 운세 (sign 단위) ────────────────────────────────────────────────────
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
  weekKey: string;       // e.g. "2026-W22"
  weekStart: string;     // e.g. "2026-06-01" (월요일)
  weekEnd: string;       // e.g. "2026-06-07" (일요일)
  summary: string;       // 이번 주 전체 요약
  days: WeeklyDays;
  lucky: {
    color: string;
    number: number;
    keyword: string;
  };
  generatedAt: string;   // ISO string
}

// ─── 월간 운세 (sign 단위) ────────────────────────────────────────────────────
export interface MonthlyFortune {
  category: FortuneCategory;
  sign: string;
  monthKey: string;      // e.g. "2026-06"
  content: string;
  highlights: string[];  // 이번 달 주요 포인트 3가지
  lucky: {
    color: string;
    number: number;
    keyword: string;
  };
  generatedAt: string;
}

// ─── 연간 운세 (sign 단위) ────────────────────────────────────────────────────
export interface YearlyFortune {
  category: FortuneCategory;
  sign: string;
  yearKey: string;       // e.g. "2026"
  content: string;       // 올해 전체 운세 내용
  highlights: string[];  // 올해 주요 포인트 3가지
  quarters: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  lucky: {
    color: string;
    number: number;
    keyword: string;
  };
  generatedAt: string;
}

// ─── Firestore 문서 구조 (sign → data 맵) ────────────────────────────────────
/** zodiac_weekly / czw_YYYY-w-WW 문서 전체 */
export type WeeklyFortuneDoc = Record<string, WeeklyFortune>;
/** zodiac_monthly / czm_YYYY-m-MM 문서 전체 */
export type MonthlyFortuneDoc = Record<string, MonthlyFortune>;
/** zodiac_yearly / czy_YYYY 문서 전체 */
export type YearlyFortuneDoc = Record<string, YearlyFortune>;

// ─── 하위 호환 alias ──────────────────────────────────────────────────────────
/** @deprecated YearlyFortune 사용 권장 */
export type AnnualFortune = YearlyFortune;

// ─── 배치 실행 결과 ───────────────────────────────────────────────────────────
export interface BatchResult {
  period: FortunePeriod;
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}
