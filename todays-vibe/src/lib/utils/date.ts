const KST_OFFSET = 9 * 60 * 60 * 1000;

/** 현재 시각을 KST 기준 Date 객체로 반환 */
export function kstNow(): Date {
  return new Date(Date.now() + KST_OFFSET);
}

/** KST 기준 오늘 날짜를 YYYYMMDD 형식으로 반환 */
export function todayKST(): string {
  return kstNow().toISOString().slice(0, 10).replace(/-/g, "");
}

/** KST 기준 N일 전 날짜를 YYYYMMDD 형식으로 반환 */
export function kstDateOffset(daysAgo: number): string {
  return new Date(Date.now() + KST_OFFSET - daysAgo * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10).replace(/-/g, "");
}
