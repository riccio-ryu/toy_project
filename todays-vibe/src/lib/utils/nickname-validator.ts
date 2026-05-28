/**
 * 닉네임 유효성 검사 유틸
 * - 길이, 허용 문자, 금지어 (시스템 예약어 / 욕설 / 성인어) 검사
 */

// ─── 시스템 예약어 (완전 일치 또는 포함 시 차단) ──────────────────
const RESERVED_WORDS = [
  // 시스템/권한 관련
  "admin", "administrator", "관리자", "운영자", "운영진", "스태프", "staff",
  "system", "root", "moderator", "mod", "superuser", "master",
  "official", "공식", "오피셜",
  // 서비스명 도용 방지
  "오늘운", "todaysvibe", "todays-vibe", "todays_vibe",
];

// ─── 금지어 (포함 시 차단) ────────────────────────────────────────
const BLOCKED_WORDS = [
  // 한국어 욕설
  "씨발", "시발", "씨팔", "시팔", "쌍년", "쌍놈",
  "개새끼", "개새", "새끼", "새기",
  "병신", "벙신", "빙신",
  "지랄", "개지랄",
  "미친놈", "미친년", "미친새끼",
  "존나", "존내", "좆",
  "보지", "자지", "보짓", "자짓",
  "창녀", "창년", "매춘",
  "강간", "성폭행", "성추행",
  "느금마", "니기미", "니애미",
  "개같은", "개같",
  // 영어 욕설
  "fuck", "fuck", "shit", "bitch", "asshole", "bastard",
  "dick", "cock", "pussy", "cunt", "whore", "slut",
  "nigger", "nigga",
  // 성인 관련
  "야동", "포르노", "porn", "porno", "섹스", "섹시", "sex",
  "av", "성인물", "음란",
  // 혐오 표현
  "홀로코스트", "나치", "테러",
];

// ─── 허용 문자 패턴 ───────────────────────────────────────────────
// 한글, 영문(대소), 숫자, 밑줄(_), 마침표(.) 허용
const ALLOWED_PATTERN = /^[가-힣a-zA-Z0-9_.]+$/;

// ─── 검사 결과 타입 ───────────────────────────────────────────────
export interface NicknameValidationResult {
  valid: boolean;
  error?: string;
}

// ─── 메인 검사 함수 ───────────────────────────────────────────────
export function validateNickname(nickname: string): NicknameValidationResult {
  const trimmed = nickname.trim();

  // 1. 빈 값
  if (!trimmed) {
    return { valid: false, error: "닉네임을 입력해주세요." };
  }

  // 2. 길이 (2~12자)
  if (trimmed.length < 2) {
    return { valid: false, error: "닉네임은 2자 이상이어야 해요." };
  }
  if (trimmed.length > 12) {
    return { valid: false, error: "닉네임은 12자 이하여야 해요." };
  }

  // 3. 허용 문자 검사
  if (!ALLOWED_PATTERN.test(trimmed)) {
    return { valid: false, error: "한글, 영문, 숫자, _ . 만 사용할 수 있어요." };
  }

  // 4. 앞뒤 특수문자 제한 (. 또는 _로 시작/끝 불가)
  if (/^[._]|[._]$/.test(trimmed)) {
    return { valid: false, error: "닉네임은 특수문자로 시작하거나 끝날 수 없어요." };
  }

  const lower = trimmed.toLowerCase();

  // 5. 시스템 예약어 (완전 일치 또는 포함)
  for (const word of RESERVED_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { valid: false, error: "사용할 수 없는 닉네임이에요." };
    }
  }

  // 6. 금지어 포함 여부
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { valid: false, error: "닉네임에 사용할 수 없는 단어가 포함되어 있어요." };
    }
  }

  return { valid: true };
}
