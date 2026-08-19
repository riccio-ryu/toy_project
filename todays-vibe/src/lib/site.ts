/**
 * 사이트 전역 상수. 메타데이터·sitemap·robots에서 canonical URL 기준으로 사용.
 * 배포 도메인이 바뀌면 NEXT_PUBLIC_SITE_URL 환경변수로 덮어쓴다.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://todays-vibe.com";

export const SITE_NAME = "오늘운";
export const SITE_EMAIL = "ters9292@gmail.com";
