/** `**text**` → `<strong class="{colorClass}">text</strong>` 변환 */
export function boldHighlight(text: string, colorClass: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, `<strong class="${colorClass}">$1</strong>`);
}

/** "2026. 06. 15." 형식 — 날짜만 */
export function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

/** "06. 15. 15:32" 형식 — 월/일/시/분 */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}
