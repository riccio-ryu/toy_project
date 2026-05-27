// ─── 배치 운세 생성용 프롬프트 (JSON 응답) ────────────────────────────────────
// 12개 별자리 / 12개 띠를 한 번의 호출로 전부 생성

const JSON_INSTRUCTION = `반드시 아래 JSON 형식으로만 응답하세요. 설명이나 마크다운 없이 순수 JSON만 출력하세요.`;

const ZODIAC_IDS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const ZODIAC_NAMES_KO: Record<string, string> = {
  aries: "양자리", taurus: "황소자리", gemini: "쌍둥이자리", cancer: "게자리",
  leo: "사자자리", virgo: "처녀자리", libra: "천칭자리", scorpio: "전갈자리",
  sagittarius: "사수자리", capricorn: "염소자리", aquarius: "물병자리", pisces: "물고기자리",
};

const CHINESE_IDS = [
  "rat", "ox", "tiger", "rabbit", "dragon", "snake",
  "horse", "goat", "monkey", "rooster", "dog", "pig",
];

const CHINESE_NAMES_KO: Record<string, string> = {
  rat: "쥐", ox: "소", tiger: "호랑이", rabbit: "토끼", dragon: "용", snake: "뱀",
  horse: "말", goat: "양", monkey: "원숭이", rooster: "닭", dog: "개", pig: "돼지",
};

// ─── 주간 운세 ────────────────────────────────────────────────────────────────

export function buildWeeklyZodiacPrompt(weekStart: string, weekEnd: string): string {
  const signBlock = ZODIAC_IDS.map((id) =>
    `  "${id}": { "summary": "...", "days": { "mon":"","tue":"","wed":"","thu":"","fri":"","sat":"","sun":"" }, "lucky": { "color":"", "number":0, "keyword":"" } }`
  ).join(",\n");

  return `${JSON_INSTRUCTION}

당신은 별자리 운세 전문가입니다. 12개 별자리 전체의 ${weekStart} ~ ${weekEnd} 주간 운세를 작성해주세요.
각 별자리: ${ZODIAC_IDS.map((id) => `${id}(${ZODIAC_NAMES_KO[id]})`).join(", ")}

출력 형식:
{
${signBlock}
}

각 필드 설명:
- summary: 이번 주 전체 운세 요약 (2~3문장)
- days.mon~sun: 요일별 운세 (1~2문장씩)
- lucky.color: 행운의 색 (한국어 1단어)
- lucky.number: 행운의 숫자 (정수)
- lucky.keyword: 이번 주 키워드 (한국어 2~3단어)`;
}

export function buildWeeklyChineseZodiacPrompt(weekStart: string, weekEnd: string): string {
  const animalBlock = CHINESE_IDS.map((id) =>
    `  "${id}": { "summary": "...", "days": { "mon":"","tue":"","wed":"","thu":"","fri":"","sat":"","sun":"" }, "lucky": { "color":"", "number":0, "keyword":"" } }`
  ).join(",\n");

  return `${JSON_INSTRUCTION}

당신은 한국 전통 띠별 운세 전문가입니다. 12개 띠 전체의 ${weekStart} ~ ${weekEnd} 주간 운세를 작성해주세요.
각 띠: ${CHINESE_IDS.map((id) => `${id}(${CHINESE_NAMES_KO[id]}띠)`).join(", ")}

출력 형식:
{
${animalBlock}
}

각 필드 설명:
- summary: 이번 주 전체 운세 요약 (2~3문장)
- days.mon~sun: 요일별 운세 (1~2문장씩)
- lucky.color: 행운의 색 (한국어 1단어)
- lucky.number: 행운의 숫자 (정수)
- lucky.keyword: 이번 주 키워드 (한국어 2~3단어)`;
}

// ─── 월간 운세 ────────────────────────────────────────────────────────────────

export function buildMonthlyZodiacPrompt(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const signBlock = ZODIAC_IDS.map((id) =>
    `  "${id}": { "content": "...", "highlights": ["","",""], "lucky": { "color":"", "number":0, "keyword":"" } }`
  ).join(",\n");

  return `${JSON_INSTRUCTION}

당신은 별자리 운세 전문가입니다. 12개 별자리 전체의 ${year}년 ${parseInt(month!)}월 월간 운세를 작성해주세요.
각 별자리: ${ZODIAC_IDS.map((id) => `${id}(${ZODIAC_NAMES_KO[id]})`).join(", ")}

출력 형식:
{
${signBlock}
}

각 필드 설명:
- content: 이번 달 전체 운세 내용 (4~5문장)
- highlights: 이달의 포인트 3가지 (각 한 문장)
- lucky.color: 행운의 색 (한국어 1단어)
- lucky.number: 행운의 숫자 (정수)
- lucky.keyword: 이달의 키워드 (한국어 2~3단어)`;
}

export function buildMonthlyChineseZodiacPrompt(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const animalBlock = CHINESE_IDS.map((id) =>
    `  "${id}": { "content": "...", "highlights": ["","",""], "lucky": { "color":"", "number":0, "keyword":"" } }`
  ).join(",\n");

  return `${JSON_INSTRUCTION}

당신은 한국 전통 띠별 운세 전문가입니다. 12개 띠 전체의 ${year}년 ${parseInt(month!)}월 월간 운세를 작성해주세요.
각 띠: ${CHINESE_IDS.map((id) => `${id}(${CHINESE_NAMES_KO[id]}띠)`).join(", ")}

출력 형식:
{
${animalBlock}
}

각 필드 설명:
- content: 이번 달 전체 운세 내용 (4~5문장)
- highlights: 이달의 포인트 3가지 (각 한 문장)
- lucky.color: 행운의 색 (한국어 1단어)
- lucky.number: 행운의 숫자 (정수)
- lucky.keyword: 이달의 키워드 (한국어 2~3단어)`;
}

// ─── 연간 운세 ────────────────────────────────────────────────────────────────

export function buildYearlyZodiacPrompt(year: number): string {
  const signBlock = ZODIAC_IDS.map((id) =>
    `  "${id}": { "content": "...", "highlights": ["","",""], "quarters": { "q1":"","q2":"","q3":"","q4":"" }, "lucky": { "color":"", "number":0, "keyword":"" } }`
  ).join(",\n");

  return `${JSON_INSTRUCTION}

당신은 별자리 운세 전문가입니다. 12개 별자리 전체의 ${year}년 연간 운세를 작성해주세요.
각 별자리: ${ZODIAC_IDS.map((id) => `${id}(${ZODIAC_NAMES_KO[id]})`).join(", ")}

출력 형식:
{
${signBlock}
}

각 필드 설명:
- content: 올해 전체 운세 내용 (3~4문장)
- highlights: 올해의 포인트 3가지 (각 한 문장)
- quarters.q1~q4: 분기별 운세 (각 2~3문장, q1=1~3월, q2=4~6월, q3=7~9월, q4=10~12월)
- lucky.color: 행운의 색 (한국어 1단어)
- lucky.number: 행운의 숫자 (정수)
- lucky.keyword: 올해의 키워드 (한국어 2~3단어)`;
}

export function buildYearlyChineseZodiacPrompt(year: number): string {
  const animalBlock = CHINESE_IDS.map((id) =>
    `  "${id}": { "content": "...", "highlights": ["","",""], "quarters": { "q1":"","q2":"","q3":"","q4":"" }, "lucky": { "color":"", "number":0, "keyword":"" } }`
  ).join(",\n");

  return `${JSON_INSTRUCTION}

당신은 한국 전통 띠별 운세 전문가입니다. 12개 띠 전체의 ${year}년 연간 운세를 작성해주세요.
각 띠: ${CHINESE_IDS.map((id) => `${id}(${CHINESE_NAMES_KO[id]}띠)`).join(", ")}

출력 형식:
{
${animalBlock}
}

각 필드 설명:
- content: 올해 전체 운세 내용 (3~4문장)
- highlights: 올해의 포인트 3가지 (각 한 문장)
- quarters.q1~q4: 분기별 운세 (각 2~3문장, q1=1~3월, q2=4~6월, q3=7~9월, q4=10~12월)
- lucky.color: 행운의 색 (한국어 1단어)
- lucky.number: 행운의 숫자 (정수)
- lucky.keyword: 올해의 키워드 (한국어 2~3단어)`;
}

// ─── 하위 호환 alias ──────────────────────────────────────────────────────────
export const buildAnnualZodiacPrompt = buildYearlyZodiacPrompt;
export const buildAnnualChineseZodiacPrompt = buildYearlyChineseZodiacPrompt;
