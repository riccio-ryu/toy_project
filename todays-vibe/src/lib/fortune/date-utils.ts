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

/** ISO 주차 키 (e.g. "2027-W05") */
export function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // ISO 주차: 목요일이 속한 연도
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const week = Math.round(
    ((d.getTime() - yearStart.getTime()) / 86400000 +
      ((yearStart.getDay() + 6) % 7)) /
      7
  );
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
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

/** 다음 달 키 (e.g. "2027-02") */
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
