// ─── 날짜 유틸리티 ────────────────────────────────────────────────────────────

/** 오늘이 일요일인지 (KST 기준) */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

/** 오늘이 해당 월의 마지막 날인지 */
export function isLastDayOfMonth(date: Date): boolean {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDate() === 1;
}

/** 오늘이 12월 31일인지 */
export function isLastDayOfYear(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() === 31;
}

/** ISO 주차 키 (e.g. "2026-W25") */
export function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // 해당 날짜가 속한 주의 목요일로 이동 (ISO 8601: 목요일 기준으로 연도 결정)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const year = d.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * 주간 문서 ID용 키
 * "2026-W22" → "2026-w-22"
 */
export function toWeekDocKey(weekKey: string): string {
  // "2026-W22" → "2026-w-22"
  return weekKey.replace("-W", "-w-");
}

/**
 * 월간 문서 ID용 키
 * "2026-06" → "2026-m-06"
 */
export function toMonthDocKey(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${year}-m-${month}`;
}

/**
 * 이전 주 문서 키
 * e.g. "2026-w-22" → "2026-w-21" (연 경계: 1주차면 전년도 마지막 주)
 */
export function getPrevWeekDocKey(weekDocKey: string): string {
  const [yearStr, , weekStr] = weekDocKey.split("-"); // "2026-w-22" → ["2026","w","22"]
  const year = parseInt(yearStr!);
  const week = parseInt(weekStr!);

  if (week > 1) {
    return `${year}-w-${String(week - 1).padStart(2, "0")}`;
  }
  // 1주차면 전년도 마지막 주 (12월 28일은 항상 마지막 주에 포함)
  const dec28 = new Date(year - 1, 11, 28);
  return toWeekDocKey(getWeekKey(dec28));
}

/**
 * 이전 달 문서 키
 * e.g. "2026-m-06" → "2026-m-05" (1월이면 전년도 12월)
 */
export function getPrevMonthDocKey(monthDocKey: string): string {
  const [yearStr, monthStr] = monthDocKey.split("-m-"); // "2026-m-06" → ["2026","06"]
  const year = parseInt(yearStr!);
  const month = parseInt(monthStr!);

  if (month > 1) {
    return `${year}-m-${String(month - 1).padStart(2, "0")}`;
  }
  return `${year - 1}-m-12`;
}

/**
 * 이전 연도 키
 * e.g. "2026" → "2025"
 */
export function getPrevYearKey(yearKey: string): string {
  return String(parseInt(yearKey) - 1);
}

/** 이번 주 월요일부터 일요일 범위 계산 */
export function getCurrentWeekRange(from: Date): { start: string; end: string } {
  const day = from.getDay(); // 0=일, 1=월...
  const daysToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(from);
  monday.setDate(from.getDate() + daysToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toDateString(monday), end: toDateString(sunday) };
}

/** 이번 달 키 (e.g. "2026-05") */
export function getCurrentMonthKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${m}`;
}

/** 다음 주 월요일부터 일요일 범위 계산 */
export function getNextWeekRange(from: Date): { start: string; end: string } {
  const day = from.getDay(); // 0=일, 1=월...
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;

  const monday = new Date(from);
  monday.setDate(from.getDate() + daysUntilNextMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: toDateString(monday),
    end: toDateString(sunday),
  };
}

/** 다음 달 키 (e.g. "2026-06") */
export function getNextMonthKey(date: Date): string {
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const m = String(next.getMonth() + 1).padStart(2, "0");
  return `${next.getFullYear()}-${m}`;
}

/** 내년 연도 */
export function getNextYear(date: Date): number {
  return date.getFullYear() + 1;
}

/** YYYY-MM-DD 형식 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * "2026-W22" 형식의 weekKey → 해당 주의 월요일 Date 반환
 * (HTML input[type=week] 값과 동일한 포맷)
 */
export function getDateFromWeekKey(weekKey: string): Date {
  const [yearStr, weekPart] = weekKey.split("-W");
  const year = parseInt(yearStr!);
  const week = parseInt(weekPart!);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (dayOfWeek - 1) + (week - 1) * 7);
  return monday;
}
