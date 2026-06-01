import lunisolar from "lunisolar";

// ─── 상수 ────────────────────────────────────────────────────────────

export const STEMS_KO: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};

export const BRANCHES_KO: Record<string, string> = {
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

export const BRANCH_ANIMAL: Record<string, string> = {
  子: "쥐", 丑: "소", 寅: "호랑이", 卯: "토끼", 辰: "용", 巳: "뱀",
  午: "말", 未: "양", 申: "원숭이", 酉: "닭", 戌: "개", 亥: "돼지",
};

export const E5_KO: Record<string, string> = {
  木: "목(木)", 火: "화(火)", 土: "토(土)", 金: "금(金)", 水: "수(水)",
};

// 12시진 선택지
export const HOUR_OPTIONS = [
  { value: -1,  label: "모름" },
  { value: 23,  label: "자시(子時) 23:00~01:00" },
  { value: 1,   label: "축시(丑時) 01:00~03:00" },
  { value: 3,   label: "인시(寅時) 03:00~05:00" },
  { value: 5,   label: "묘시(卯時) 05:00~07:00" },
  { value: 7,   label: "진시(辰時) 07:00~09:00" },
  { value: 9,   label: "사시(巳時) 09:00~11:00" },
  { value: 11,  label: "오시(午時) 11:00~13:00" },
  { value: 13,  label: "미시(未時) 13:00~15:00" },
  { value: 15,  label: "신시(申時) 15:00~17:00" },
  { value: 17,  label: "유시(酉時) 17:00~19:00" },
  { value: 19,  label: "술시(戌時) 19:00~21:00" },
  { value: 21,  label: "해시(亥時) 21:00~23:00" },
] as const;

// ─── 타입 ────────────────────────────────────────────────────────────

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;  // -1 = 모름, 그 외 해당 시진 시작 시각
  isLunar: boolean;
  gender: "male" | "female";
}

export interface Pillar {
  char: string;      // 甲子
  stem: string;      // 甲
  branch: string;    // 子
  stemKo: string;    // 갑
  branchKo: string;  // 자
  animal?: string;   // 쥐 (년주에만)
  element: string;   // 목(木)
}

export interface SajuResult {
  year:   Pillar;
  month:  Pillar;
  day:    Pillar;
  hour:   Pillar | null;   // 시간 모르면 null
  dayMaster: string;       // 일간 (나 자신)
  dayMasterElement: string;
  summary: string;         // AI 프롬프트용 요약 텍스트
}

// ─── 계산 ─────────────────────────────────────────────────────────────

function makePillar(pillarObj: ReturnType<typeof lunisolar>["char8"]["year"], isYear = false): Pillar {
  const stem   = pillarObj.stem.toString();
  const branch = pillarObj.branch.toString();
  const e5     = pillarObj.stem.e5?.toString() ?? "";
  return {
    char:     pillarObj.toString(),
    stem,
    branch,
    stemKo:   STEMS_KO[stem]   ?? stem,
    branchKo: BRANCHES_KO[branch] ?? branch,
    animal:   isYear ? BRANCH_ANIMAL[branch] : undefined,
    element:  E5_KO[e5] ?? e5,
  };
}

export function calculateSaju(input: BirthInput): SajuResult {
  const { year, month, day, hour, isLunar } = input;

  // 날짜 객체 생성
  const hourVal = hour === -1 ? 12 : hour;  // 모름이면 정오로 처리
  let ls: ReturnType<typeof lunisolar>;

  if (isLunar) {
    ls = lunisolar.fromLunar({ year, month, day, hour: hourVal });
  } else {
    ls = lunisolar(new Date(year, month - 1, day, hourVal));
  }

  const c8 = ls.char8;
  const yearPillar  = makePillar(c8.year, true);
  const monthPillar = makePillar(c8.month);
  const dayPillar   = makePillar(c8.day);
  const hourPillar  = hour === -1 ? null : makePillar(c8.hour);

  const dayMasterE5 = c8.day.stem.e5?.toString() ?? "";

  const summary = buildSummary(input, yearPillar, monthPillar, dayPillar, hourPillar);

  return {
    year:             yearPillar,
    month:            monthPillar,
    day:              dayPillar,
    hour:             hourPillar,
    dayMaster:        dayPillar.stem,
    dayMasterElement: E5_KO[dayMasterE5] ?? dayMasterE5,
    summary,
  };
}

function buildSummary(
  input: BirthInput,
  year: Pillar,
  month: Pillar,
  day: Pillar,
  hour: Pillar | null,
): string {
  const genderKo = input.gender === "male" ? "남성" : "여성";
  const calType  = input.isLunar ? "음력" : "양력";
  const birthStr = `${calType} ${input.year}년 ${input.month}월 ${input.day}일${input.hour !== -1 ? ` ${HOUR_OPTIONS.find(h => h.value === input.hour)?.label.split("(")[0]}` : ""}`;

  const pillars = [
    `년주 ${year.char}(${year.stemKo}${year.branchKo}, ${year.animal})`,
    `월주 ${month.char}(${month.stemKo}${month.branchKo})`,
    `일주 ${day.char}(${day.stemKo}${day.branchKo})`,
    hour ? `시주 ${hour.char}(${hour.stemKo}${hour.branchKo})` : "시주 미상",
  ];

  return `성별: ${genderKo} / 생년월일시: ${birthStr}\n사주 원국: ${pillars.join(", ")}\n일간(나 자신): ${day.stem}(${day.stemKo}) — ${day.element}`;
}
