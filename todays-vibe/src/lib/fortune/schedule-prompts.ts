// ─── 배치 운세 생성용 프롬프트 (JSON 응답) ────────────────────────────────────

const JSON_INSTRUCTION = `반드시 아래 JSON 형식으로만 응답하세요. 설명이나 마크다운 없이 순수 JSON만 출력하세요.`;

// ─── 주간 운세 ────────────────────────────────────────────────────────────────

export function buildWeeklyZodiacPrompt(
  signName: string,
  weekStart: string,
  weekEnd: string
): string {
  return `${JSON_INSTRUCTION}

당신은 별자리 운세 전문가입니다. ${signName}의 ${weekStart} ~ ${weekEnd} 주간 운세를 작성해주세요.

출력 형식:
{
  "summary": "이번 주 전체 운세 요약 (2~3문장)",
  "days": {
    "mon": "월요일 운세 (1~2문장)",
    "tue": "화요일 운세 (1~2문장)",
    "wed": "수요일 운세 (1~2문장)",
    "thu": "목요일 운세 (1~2문장)",
    "fri": "금요일 운세 (1~2문장)",
    "sat": "토요일 운세 (1~2문장)",
    "sun": "일요일 운세 (1~2문장)"
  },
  "lucky": {
    "color": "행운의 색 (한국어 1단어)",
    "number": 7,
    "keyword": "이번 주 키워드 (한국어 2~3단어)"
  }
}`;
}

export function buildWeeklyChineseZodiacPrompt(
  animalName: string,
  weekStart: string,
  weekEnd: string
): string {
  return `${JSON_INSTRUCTION}

당신은 한국 전통 띠별 운세 전문가입니다. ${animalName}띠의 ${weekStart} ~ ${weekEnd} 주간 운세를 작성해주세요.

출력 형식:
{
  "summary": "이번 주 전체 운세 요약 (2~3문장)",
  "days": {
    "mon": "월요일 운세 (1~2문장)",
    "tue": "화요일 운세 (1~2문장)",
    "wed": "수요일 운세 (1~2문장)",
    "thu": "목요일 운세 (1~2문장)",
    "fri": "금요일 운세 (1~2문장)",
    "sat": "토요일 운세 (1~2문장)",
    "sun": "일요일 운세 (1~2문장)"
  },
  "lucky": {
    "color": "행운의 색 (한국어 1단어)",
    "number": 3,
    "keyword": "이번 주 키워드 (한국어 2~3단어)"
  }
}`;
}

// ─── 월간 운세 ────────────────────────────────────────────────────────────────

export function buildMonthlyZodiacPrompt(
  signName: string,
  monthKey: string
): string {
  const [year, month] = monthKey.split("-");
  return `${JSON_INSTRUCTION}

당신은 별자리 운세 전문가입니다. ${signName}의 ${year}년 ${parseInt(month!)}월 월간 운세를 작성해주세요.

출력 형식:
{
  "content": "이번 달 전체 운세 내용 (4~5문장, 전반적인 운의 흐름)",
  "highlights": [
    "이달의 포인트 1 (한 문장)",
    "이달의 포인트 2 (한 문장)",
    "이달의 포인트 3 (한 문장)"
  ],
  "lucky": {
    "color": "행운의 색 (한국어 1단어)",
    "number": 5,
    "keyword": "이달의 키워드 (한국어 2~3단어)"
  }
}`;
}

export function buildMonthlyChineseZodiacPrompt(
  animalName: string,
  monthKey: string
): string {
  const [year, month] = monthKey.split("-");
  return `${JSON_INSTRUCTION}

당신은 한국 전통 띠별 운세 전문가입니다. ${animalName}띠의 ${year}년 ${parseInt(month!)}월 월간 운세를 작성해주세요.

출력 형식:
{
  "content": "이번 달 전체 운세 내용 (4~5문장, 전반적인 운의 흐름)",
  "highlights": [
    "이달의 포인트 1 (한 문장)",
    "이달의 포인트 2 (한 문장)",
    "이달의 포인트 3 (한 문장)"
  ],
  "lucky": {
    "color": "행운의 색 (한국어 1단어)",
    "number": 8,
    "keyword": "이달의 키워드 (한국어 2~3단어)"
  }
}`;
}

// ─── 연간 운세 ────────────────────────────────────────────────────────────────

export function buildAnnualZodiacPrompt(
  signName: string,
  year: number
): string {
  return `${JSON_INSTRUCTION}

당신은 별자리 운세 전문가입니다. ${signName}의 ${year}년 연간 운세를 작성해주세요.

출력 형식:
{
  "summary": "올해 전체 운세 요약 (3~4문장)",
  "quarters": {
    "q1": "1분기(1~3월) 운세 (2~3문장)",
    "q2": "2분기(4~6월) 운세 (2~3문장)",
    "q3": "3분기(7~9월) 운세 (2~3문장)",
    "q4": "4분기(10~12월) 운세 (2~3문장)"
  }
}`;
}

export function buildAnnualChineseZodiacPrompt(
  animalName: string,
  year: number
): string {
  return `${JSON_INSTRUCTION}

당신은 한국 전통 띠별 운세 전문가입니다. ${animalName}띠의 ${year}년 연간 운세를 작성해주세요.

출력 형식:
{
  "summary": "올해 전체 운세 요약 (3~4문장)",
  "quarters": {
    "q1": "1분기(1~3월) 운세 (2~3문장)",
    "q2": "2분기(4~6월) 운세 (2~3문장)",
    "q3": "3분기(7~9월) 운세 (2~3문장)",
    "q4": "4분기(10~12월) 운세 (2~3문장)"
  }
}`;
}
