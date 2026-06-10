import {
  FortuneType,
  DreamInput,
  SajuInput,
  Tarot3Input,
  NumerologyInput,
  LoveCompatibilityInput,
  NameCompatibilityInput,
  ZodiacCompatibilityInput,
  RuneInput,
  NameFortuneInput,
  GeneralFortuneInput,
  TojeongInput,
  FortuneInput,
} from "@/types/fortune";

// ─── 프롬프트 빌더 진입점 ────────────────────────────────────────────────────

export function buildPrompt(type: FortuneType, input: FortuneInput): string {
  switch (type) {
    case "dream":
      return buildDreamPrompt(input as DreamInput);
    case "saju":
      return buildSajuPrompt(input as SajuInput);
    case "tarot-3cards":
      return buildTarot3Prompt(input as Tarot3Input);
    case "numerology":
      return buildNumerologyPrompt(input as NumerologyInput);
    case "love-compatibility":
      return buildLoveCompatibilityPrompt(input as LoveCompatibilityInput);
    case "business-compatibility":
      return buildBusinessCompatibilityPrompt(input as LoveCompatibilityInput);
    case "name-compatibility":
      return buildNameCompatibilityPrompt(input as NameCompatibilityInput);
    case "zodiac-compatibility":
      return buildZodiacCompatibilityPrompt(input as ZodiacCompatibilityInput);
    case "rune":
      return buildRunePrompt(input as RuneInput);
    case "name-fortune":
      return buildNameFortunePrompt(input as NameFortuneInput);
    case "tojeong":
      return buildTojeongPrompt(input as TojeongInput);
    case "love-fortune":
      return buildGeneralFortunePrompt("love", input as GeneralFortuneInput);
    case "wealth-fortune":
      return buildGeneralFortunePrompt("wealth", input as GeneralFortuneInput);
    case "career-fortune":
      return buildGeneralFortunePrompt("career", input as GeneralFortuneInput);
    case "health-fortune":
      return buildGeneralFortunePrompt("health", input as GeneralFortuneInput);
    default:
      throw new Error(`지원하지 않는 운세 타입입니다: ${type}`);
  }
}

// ─── 꿈해몽 ──────────────────────────────────────────────────────────────────

function buildDreamPrompt(input: DreamInput): string {
  const moodLine = input.mood
    ? `\n꿈에서 느낀 감정: ${input.mood}`
    : "";

  return `당신은 한국의 꿈해몽 전문가입니다. 동양 전통 꿈해몽과 현대 심리학적 해석을 모두 갖추고 있으며, 따뜻하고 통찰력 있는 해석을 제공합니다.

사용자가 꾼 꿈을 해석해 주세요.

꿈 내용: ${input.dreamDescription}${moodLine}

아래 형식으로 해석해 주세요:

## 🌙 꿈의 핵심 상징
꿈에 등장한 주요 요소(인물, 사물, 장소, 행동)가 지닌 상징적 의미를 설명해 주세요.

## 📖 전통 꿈해몽
한국·동양 전통의 관점에서 이 꿈이 암시하는 길흉과 의미를 해석해 주세요.

## 🔍 심리학적 해석
현대 심리학(융 심리학 포함) 관점에서 이 꿈이 무의식적으로 나타내는 것을 설명해 주세요.

## ✨ 오늘의 메시지
이 꿈이 꿈꾼 이에게 전하는 실질적인 조언이나 메시지를 따뜻하게 전해 주세요.

## 🎯 길흉 판단
길몽 / 흉몽 / 중립 중 하나로 판단하고, 그 이유를 간략히 설명해 주세요.

전체적으로 공감 어린 톤으로, 한국어로 작성해 주세요. 지나치게 부정적인 해석은 피하고 건설적인 방향으로 마무리해 주세요.`;
}

// ─── 사주팔자 ─────────────────────────────────────────────────────────────────

function buildSajuPrompt(input: SajuInput): string {
  const hourLine = input.birthHour !== undefined
    ? `출생 시간: ${input.birthHour}시`
    : "출생 시간: 미상";

  return `당신은 한국의 사주명리학 전문가입니다. 년/월/일/시 네 기둥(사주팔자)을 바탕으로 깊이 있는 운세를 풀이합니다.

사용자 정보:
출생년도: ${input.birthYear}년
출생월: ${input.birthMonth}월
출생일: ${input.birthDay}일
${hourLine}
성별: ${input.gender === "male" ? "남성" : "여성"}

아래 형식으로 사주를 풀이해 주세요:

## 🌟 사주 개요
이 사람의 사주 특성과 타고난 기질을 설명해 주세요.

## 💫 오행 분석
목(木)·화(火)·토(土)·금(金)·수(水)의 균형과 강약을 분석해 주세요.

## 🏃 성격 & 적성
사주에서 드러나는 성격, 강점, 적합한 직업군을 알려주세요.

## 💰 재물운
재물을 모으는 방식과 올해의 재물운 흐름을 설명해 주세요.

## ❤️ 연애·결혼운
인연과 관계에서의 특성, 올해의 연애운을 풀이해 주세요.

## 📅 올해 운세 (${new Date().getFullYear()}년)
올해 전체적인 운의 흐름과 주의할 시기, 좋은 시기를 알려주세요.

## 🎯 종합 조언
이 사주를 가진 분에게 드리는 핵심 조언을 따뜻하게 마무리해 주세요.

한국어로, 전문적이지만 이해하기 쉽게 작성해 주세요.`;
}

// ─── 타로 3장 스프레드 ────────────────────────────────────────────────────────

function buildTarot3Prompt(input: Tarot3Input): string {
  const [past, present, future] = input.cards;

  return `당신은 타로 카드 전문 리더입니다. 직관적이고 심층적인 해석으로 사용자의 질문에 답합니다.

사용자의 질문: ${input.question}

뽑힌 카드 (과거 / 현재 / 미래):
- 과거: ${past}
- 현재: ${present}
- 미래: ${future}

아래 형식으로 해석해 주세요:

## 🃏 카드 배치 개요
세 장의 카드가 전체적으로 전달하는 흐름과 메시지를 간략히 소개해 주세요.

## ⬅️ 과거 — ${past}
이 카드가 과거의 상황이나 배경으로서 의미하는 바를 해석해 주세요.

## ⚡ 현재 — ${present}
이 카드가 현재 상황이나 핵심 에너지로서 의미하는 바를 해석해 주세요.

## ➡️ 미래 — ${future}
이 카드가 앞으로의 방향이나 결과로서 의미하는 바를 해석해 주세요.

## ✨ 종합 메시지
질문 "**${input.question}**"에 대한 타로의 최종 답변을 공감 있게 전해 주세요.

## 💡 실천 조언
이 리딩을 바탕으로 사용자가 취할 수 있는 구체적인 행동 1~3가지를 제안해 주세요.

한국어로, 신비롭고 따뜻한 tone으로 작성해 주세요.`;
}

// ─── 연애운 / 재물운 / 취업운 / 건강운 ──────────────────────────────────────

const GENERAL_FORTUNE_CONFIG = {
  love: {
    title: "연애운",
    emoji: "💕",
    sections: `## 💕 현재 연애 에너지
사주를 바탕으로 이 시기 연애 기운과 감정 상태를 분석해 주세요.

## 🌹 이상형 & 인연
타고난 사주에서 드러나는 인연의 특성과 잘 맞는 상대를 알려주세요.

## 📅 올해 연애운 흐름
올해 연애운의 전반적인 흐름과 좋은 시기, 주의할 시기를 설명해 주세요.

## 💌 현재 상황 조언
입력하신 상황을 바탕으로 현재 연애에서 취해야 할 행동과 마음가짐을 조언해 주세요.

## ✨ 종합 메시지
사랑과 인연에 대한 따뜻한 응원 메시지로 마무리해 주세요.`,
  },
  wealth: {
    title: "재물운",
    emoji: "💰",
    sections: `## 💰 타고난 재물 기운
사주에서 드러나는 재물을 모으는 방식과 재물운의 특성을 분석해 주세요.

## 📈 올해 재물운 흐름
올해 재물운의 전반적인 흐름, 투자나 사업에 좋은 시기와 주의할 시기를 알려주세요.

## 🎯 재테크 & 사업 조언
이 사주에 맞는 재물을 늘리는 방법과 피해야 할 투자 유형을 조언해 주세요.

## 💡 현재 상황 조언
입력하신 재정 목표나 상황에 맞는 구체적인 조언을 해주세요.

## ✨ 종합 메시지
풍요로운 미래를 위한 응원 메시지로 마무리해 주세요.`,
  },
  career: {
    title: "취업/시험운",
    emoji: "📋",
    sections: `## 📋 타고난 직업 기운
사주에서 드러나는 적성, 강점, 어울리는 직종과 분야를 분석해 주세요.

## 🎓 올해 취업 & 시험운
올해 취업이나 시험 운의 흐름과 도전에 좋은 시기를 알려주세요.

## 💪 성공을 위한 전략
이 사주의 특성을 살린 취업 준비 전략이나 시험 합격을 위한 조언을 해주세요.

## 🎯 현재 목표 조언
입력하신 목표(직장/시험)에 맞춘 구체적이고 실질적인 조언을 해주세요.

## ✨ 종합 메시지
목표 달성을 향한 힘찬 응원 메시지로 마무리해 주세요.`,
  },
  health: {
    title: "건강운",
    emoji: "🌿",
    sections: `## 🌿 사주로 보는 체질
사주 오행을 바탕으로 타고난 체질과 건강상 강점 및 약점을 분석해 주세요.

## ⚠️ 주의해야 할 건강 부위
이 사주에서 특히 신경 써야 할 신체 부위나 건강 문제를 알려주세요.

## 📅 올해 건강운 흐름
올해 건강운의 흐름과 특히 주의해야 할 시기를 설명해 주세요.

## 💚 현재 상태 조언
입력하신 건강 상태나 고민에 맞춘 생활 습관 및 건강 관리 조언을 해주세요.

## ✨ 종합 메시지
건강한 삶을 위한 따뜻한 응원 메시지로 마무리해 주세요.`,
  },
} as const;

type GeneralFortuneKind = keyof typeof GENERAL_FORTUNE_CONFIG;

function buildGeneralFortunePrompt(kind: GeneralFortuneKind, input: GeneralFortuneInput): string {
  const cfg = GENERAL_FORTUNE_CONFIG[kind];
  const genderKo = input.gender === "male" ? "남성" : "여성";
  const questionLine = input.question
    ? `\n현재 상황 / 목표: ${input.question}`
    : "";
  const year = new Date().getFullYear();

  return `당신은 한국의 사주명리학 전문가입니다. ${cfg.title} 전문 상담사로서 따뜻하고 실용적인 조언을 드립니다.

사용자 정보:
생년월일: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일
성별: ${genderKo}${questionLine}

${input.birthYear}년생 ${genderKo}의 ${cfg.title}을(를) 아래 형식으로 풀이해 주세요. 올해는 ${year}년입니다.

${cfg.sections}

한국어로, 전문적이지만 따뜻하고 공감 어린 톤으로 작성해 주세요. 부정적인 내용도 건설적인 방향으로 마무리해 주세요.`;
}

// ─── 수비학 (생일 숫자 운세) ──────────────────────────────────────────────────

function reduceToSingleDigit(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((sum, d) => sum + parseInt(d), 0);
  }
  return n;
}

function calcLifePathNumber(year: number, month: number, day: number): number {
  const digits = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const sum = digits.split("").reduce((acc, d) => acc + parseInt(d), 0);
  return reduceToSingleDigit(sum);
}

function buildNumerologyPrompt(input: NumerologyInput): string {
  const lifePathNumber = calcLifePathNumber(input.birthYear, input.birthMonth, input.birthDay);
  const birthdayNumber = reduceToSingleDigit(input.birthDay);
  const isMaster = [11, 22, 33].includes(lifePathNumber);

  return `당신은 수비학(Numerology) 전문가입니다. 생년월일에서 도출한 숫자로 사람의 타고난 기질, 인생 경로, 운세를 풀이합니다.

사용자 정보:
생년월일: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일
생명수 (Life Path Number): ${lifePathNumber}${isMaster ? " (마스터 넘버)" : ""}
생일수 (Birthday Number): ${birthdayNumber}

아래 형식으로 수비학 운세를 풀이해 주세요:

## 🔢 생명수 ${lifePathNumber}의 의미
이 숫자가 상징하는 핵심 에너지와 삶의 주제를 설명해 주세요.${isMaster ? " 마스터 넘버의 특별한 의미와 높은 책임감에 대해서도 언급해 주세요." : ""}

## ✨ 타고난 성격 & 강점
생명수에서 드러나는 성격적 특징, 타고난 재능, 강점을 구체적으로 설명해 주세요.

## 🌱 인생 과제 & 성장 방향
이 숫자를 가진 사람이 평생 마주하는 과제와 성장을 위해 개발해야 할 면을 알려주세요.

## 💼 적합한 직업 & 환경
생명수의 에너지와 잘 맞는 직업군, 일하는 환경, 협업 스타일을 제안해 주세요.

## 💕 인간관계 & 사랑
이 숫자를 가진 사람의 관계 방식, 잘 맞는 파트너의 특성, 사랑에서의 패턴을 풀이해 주세요.

## 📅 올해 (${new Date().getFullYear()}년) 흐름
개인연도수(Personal Year Number)를 계산해 올해의 전반적인 에너지와 기회를 알려주세요.

## 🎯 종합 메시지
이 숫자를 가진 분에게 드리는 핵심 인사이트와 응원 메시지로 마무리해 주세요.

한국어로, 신비롭고 따뜻한 톤으로 작성해 주세요.`;
}

// ─── 궁합 공통 유틸 ───────────────────────────────────────────────────────────

const ZODIAC_ANIMALS_KO = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

function getZodiacAnimal(year: number): string {
  return ZODIAC_ANIMALS_KO[(year - 4 + 1200) % 12];
}

function formatBirthDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

function genderKo(g: "male" | "female"): string {
  return g === "male" ? "남성" : "여성";
}

// ─── 연애 궁합 ────────────────────────────────────────────────────────────────

function buildLoveCompatibilityPrompt(input: LoveCompatibilityInput): string {
  const year = new Date().getFullYear();
  return `당신은 한국의 사주명리학 전문가입니다. 두 사람의 생년월일을 바탕으로 연애 궁합을 분석합니다.

나:
생년월일: ${formatBirthDate(input.person1BirthDate)}
성별: ${genderKo(input.person1Gender)}

상대방:
생년월일: ${formatBirthDate(input.person2BirthDate)}
성별: ${genderKo(input.person2Gender)}

아래 형식으로 두 사람의 연애 궁합을 풀이해 주세요. 올해는 ${year}년입니다.

## 💑 첫인상 & 끌림
두 사람이 처음 만났을 때 서로에게 느끼는 첫인상과 끌림의 에너지를 분석해 주세요.

## ☯️ 오행 & 음양 조화
두 사람의 사주 오행과 음양이 어떻게 조화를 이루는지 분석해 주세요. 상생(相生)과 상극(相剋) 관계를 설명해 주세요.

## 💬 연애 스타일 & 소통
각자의 연애 방식과 두 사람이 함께할 때 소통 패턴을 분석해 주세요.

## ⚡ 갈등 요소 & 주의점
두 사람 사이에서 생길 수 있는 갈등 원인과 주의해야 할 상황을 알려주세요.

## 🌹 관계 발전 조언
더 깊고 오래가는 관계를 위한 구체적인 조언을 주세요.

## ✨ 종합 궁합 점수
전체적인 궁합을 100점 만점으로 점수를 매기고 (예: 78점), 한 줄 요약으로 마무리해 주세요.

한국어로, 따뜻하고 현실적인 톤으로 작성해 주세요. 부정적인 면도 솔직하게 말하되 건설적으로 마무리해 주세요.`;
}

// ─── 사업 파트너 궁합 ─────────────────────────────────────────────────────────

function buildBusinessCompatibilityPrompt(input: LoveCompatibilityInput): string {
  return `당신은 한국의 사주명리학 전문가입니다. 두 사람의 생년월일을 바탕으로 비즈니스 파트너십 궁합을 분석합니다.

나:
생년월일: ${formatBirthDate(input.person1BirthDate)}
성별: ${genderKo(input.person1Gender)}

파트너:
생년월일: ${formatBirthDate(input.person2BirthDate)}
성별: ${genderKo(input.person2Gender)}

아래 형식으로 두 사람의 사업 파트너 궁합을 풀이해 주세요.

## 🏢 리더십 & 역할 분담
각자의 사주에서 드러나는 리더십 스타일과 두 사람이 사업에서 맡으면 좋을 역할을 분석해 주세요.

## 🤝 시너지 & 강점 보완
두 사람의 사주가 만났을 때 생기는 시너지와 서로의 약점을 어떻게 보완하는지 설명해 주세요.

## 💰 재물운 & 사업 방향
두 사람이 함께할 때 맞는 사업 분야, 재물을 모으는 방식, 유망한 방향을 조언해 주세요.

## ⚠️ 갈등 포인트 & 위기 관리
비즈니스 관계에서 발생할 수 있는 갈등 원인과 위기 상황을 대처하는 방법을 알려주세요.

## 📈 파트너십 성공 전략
이 두 사람이 함께 성공하기 위한 구체적인 협업 전략과 주의사항을 제시해 주세요.

## ✨ 종합 파트너십 점수
전체적인 사업 궁합을 100점 만점으로 점수를 매기고 (예: 82점), 한 줄 요약으로 마무리해 주세요.

한국어로, 전문적이고 실용적인 톤으로 작성해 주세요.`;
}

// ─── 이름 궁합 ────────────────────────────────────────────────────────────────

function buildNameCompatibilityPrompt(input: NameCompatibilityInput): string {
  return `당신은 한국의 성명학(姓名學) 및 이름 궁합 전문가입니다. 두 사람의 이름으로 궁합을 분석합니다.

이름 1: ${input.name1}
이름 2: ${input.name2}

아래 형식으로 두 사람의 이름 궁합을 풀이해 주세요.

## 📝 이름의 기운 분석
각 이름이 지닌 음양오행의 기운과 한글 자모의 특성을 분석해 주세요.

## 🔤 소리 궁합 (음성학)
두 이름의 발음, 성조, 리듬이 어우러질 때 생기는 에너지를 분석해 주세요.

## ✍️ 획수 궁합
두 이름의 획수(한자 기준)를 계산하고 수리적 조화를 풀이해 주세요.

## ☯️ 음양 조화
두 이름의 음양 균형이 어떻게 맞는지 설명해 주세요.

## 💕 관계 에너지
이 두 이름이 만났을 때 형성되는 관계의 성격과 에너지를 설명해 주세요.

## ✨ 종합 이름 궁합 점수
전체적인 이름 궁합을 100점 만점으로 점수를 매기고 (예: 73점), 한 줄 요약으로 마무리해 주세요.

한국어로, 재미있고 흥미롭게 작성해 주세요. 전통적 해석과 현대적 감각을 균형 있게 담아주세요.`;
}

// ─── 띠 궁합 ─────────────────────────────────────────────────────────────────

function buildZodiacCompatibilityPrompt(input: ZodiacCompatibilityInput): string {
  const animal1 = getZodiacAnimal(input.person1BirthYear);
  const animal2 = getZodiacAnimal(input.person2BirthYear);

  return `당신은 한국의 전통 십이지(十二支) 궁합 전문가입니다. 두 사람의 띠로 궁합을 분석합니다.

나: ${input.person1BirthYear}년생 (${animal1}띠)
상대방: ${input.person2BirthYear}년생 (${animal2}띠)

아래 형식으로 두 사람의 띠 궁합을 풀이해 주세요.

## 🐾 두 띠의 기본 성격
${animal1}띠와 ${animal2}띠 각자의 타고난 성격, 기질, 강점을 설명해 주세요.

## ⚡ 상생 & 상극 관계
십이지 오합(五合), 삼합(三合), 충(沖), 형(刑) 등의 관계를 분석해 주세요. ${animal1}띠와 ${animal2}띠가 어떤 관계인지 명확히 설명해 주세요.

## 💫 잘 맞는 점
두 사람이 함께할 때 자연스럽게 조화를 이루는 부분, 서로 끌리는 이유를 설명해 주세요.

## ⚠️ 주의할 점
두 사람 사이에서 충돌이 일어날 수 있는 상황과 관계에서 조심해야 할 부분을 알려주세요.

## 🌟 관계별 궁합
연인/부부, 친구, 직장 동료로서의 궁합을 각각 간략히 설명해 주세요.

## ✨ 종합 띠 궁합 점수
전체적인 궁합을 100점 만점으로 점수를 매기고 (예: 85점), 한 줄 요약으로 마무리해 주세요.

한국어로, 전통적이면서도 친근한 톤으로 작성해 주세요.`;
}

// ─── 룬 문자 ─────────────────────────────────────────────────────────────────

function buildRunePrompt(input: RuneInput): string {
  const [r1, r2, r3] = input.runes;
  const questionLine = input.question ? `\n질문: ${input.question}` : "";

  return `당신은 북유럽 룬(Rune) 문자 전문 리더입니다. 고대 바이킹의 지혜와 신비를 담은 룬 문자를 해석합니다.
${questionLine}

뽑힌 룬 3개 (과거 / 현재 / 미래):
- 과거: ${r1}
- 현재: ${r2}
- 미래: ${r3}

아래 형식으로 해석해 주세요:

## ᚱ 룬 배치 개요
세 개의 룬이 전체적으로 전달하는 메시지와 에너지 흐름을 소개해 주세요.

## ⬅️ 과거 — ${r1}
이 룬이 과거의 상황이나 영향으로서 의미하는 바를 해석해 주세요.

## ⚡ 현재 — ${r2}
이 룬이 현재 상황의 핵심 에너지로서 의미하는 바를 해석해 주세요.

## ➡️ 미래 — ${r3}
이 룬이 앞으로의 방향과 가능성으로서 의미하는 바를 해석해 주세요.

## ✨ 종합 메시지
${input.question ? `질문 "${input.question}"에 대한` : "지금 당신에게 전하는"} 룬의 최종 메시지를 전해 주세요.

## 💡 행동 조언
이 룬 리딩을 바탕으로 취할 수 있는 구체적인 행동이나 마음가짐을 1~3가지 제안해 주세요.

한국어로, 고대의 신비로움과 따뜻한 인도감을 담아 작성해 주세요.`;
}

// ─── 성명학 ──────────────────────────────────────────────────────────────────

function buildNameFortunePrompt(input: NameFortuneInput): string {
  const birthLine = (input.birthYear && input.birthMonth && input.birthDay)
    ? `\n생년월일: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일`
    : "";
  const year = new Date().getFullYear();

  return `당신은 한국의 성명학(姓名學) 전문가입니다. 이름에 담긴 수리(數理)·음양오행·발음 에너지로 운세와 기질을 분석합니다.

이름: ${input.name}${birthLine}

아래 형식으로 성명학 분석을 풀이해 주세요. 올해는 ${year}년입니다.

## ✍️ 이름의 기본 에너지
이름 "${input.name}"이 담고 있는 전체적인 기운과 첫인상을 설명해 주세요.

## 🔢 수리 분석
이름 획수(한자 기준으로 추정)를 계산하고, 원격(元格)·형격(亨格)·이격(利格)·정격(貞格)의 수리 구조와 길흉을 분석해 주세요.

## ☯️ 음양오행 분석
이름의 자음과 모음에서 드러나는 음양오행의 조화를 분석해 주세요. 강한 기운과 보완이 필요한 기운을 설명해 주세요.

## 🎵 발음 에너지
이름의 발음(성조·리듬·소리의 조화)이 지니는 에너지와 주변에 미치는 인상을 분석해 주세요.

## 💫 타고난 기질 & 적성
이름에서 드러나는 성격적 특성, 재능, 적합한 분야를 설명해 주세요.

## 🌟 올해 (${year}년) 이름 운세
이름의 기운이 올해와 어떻게 어우러지는지, 올해 특히 빛날 분야와 조심할 시기를 알려주세요.

## 💡 이름 활용 조언
이름의 에너지를 최대한 활용하거나 약한 기운을 보완하는 생활 조언을 해주세요.

## ✨ 종합 평가
이름 전체에 대한 종합 평가와 응원 메시지로 마무리해 주세요.

한국어로, 전문적이면서도 따뜻하고 긍정적인 톤으로 작성해 주세요.`;
}

// ─── 토정비결 ─────────────────────────────────────────────────────────────────

function calcTojeongNumbers(lunarYear: number, lunarMonth: number, lunarDay: number) {
  // 상책수: 천간(天干) 기준 — 갑/을=1, 병/정=2, 무/기=3, 경/신=4, 임/계=5
  const stemIdx = ((lunarYear - 4) % 10 + 10) % 10;
  const upper = Math.floor(stemIdx / 2) + 1; // 1-5

  // 중책수: 생월 그대로
  const middle = lunarMonth; // 1-12

  // 하책수: 생일을 5일 단위로 구분
  const lower = Math.min(Math.ceil(lunarDay / 5), 6); // 1-6

  return { upper, middle, lower };
}

function tojeongUpperLabel(n: number): string {
  return ["一", "二", "三", "四", "五"][n - 1] ?? String(n);
}

function buildTojeongPrompt(input: TojeongInput): string {
  const calType = input.isLunar ? "음력" : "양력(음력으로 환산하여 해석)";
  const genderKo = input.gender === "male" ? "남성" : "여성";
  const { upper, middle, lower } = calcTojeongNumbers(input.lunarYear, input.lunarMonth, input.lunarDay);
  const hexCode = `${tojeongUpperLabel(upper)}-${tojeongUpperLabel(middle)}-${tojeongUpperLabel(lower)}`;

  return `당신은 조선 시대 토정비결의 전통을 이은 역술 전문가입니다. 이토정(李土亭) 선생의 토정비결을 현대적으로 해석하여, 생년월일의 음양오행과 괘상(卦象)으로 한 해의 운세를 풀이합니다.

사용자 정보:
생년월일(${calType}): ${input.lunarYear}년 ${input.lunarMonth}월 ${input.lunarDay}일
성별: ${genderKo}
괘수(卦數): ${hexCode} (상책 ${upper} · 중책 ${middle} · 하책 ${lower})
운세 년도: ${input.targetYear}년

위 정보를 바탕으로 ${input.targetYear}년 토정비결을 아래 형식으로 풀이해 주세요.

## 📿 ${input.targetYear}년 총운(總運)
이 해 전체의 기운, 대세(大勢), 주의할 점과 기회를 고전적인 운세 문체로 풀이해 주세요. 2~3문단 분량으로 작성해 주세요.

## 🌸 월별 운세
각 월의 운세를 아래 형식으로 작성해 주세요:

**1월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**2월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**3월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**4월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**5월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**6월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**7월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**8월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**9월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**10월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**11월** — (길흉 한 줄 요약) + 세부 내용 1~2문장
**12월** — (길흉 한 줄 요약) + 세부 내용 1~2문장

## 🔑 올해의 핵심 키워드
이 해를 대표하는 키워드 3가지를 선정하고 간략히 설명해 주세요.

## 💡 토정 선생의 조언
이 해 가장 중요한 교훈 또는 주의사항을 고전적인 어투로 한 문단 작성해 주세요.

문체는 고전적이고 신비로운 느낌을 살리되, 현대인이 이해할 수 있는 한국어로 작성해 주세요. 간간이 한자어를 사용해 격식을 높여 주세요. 전체적으로 희망과 지혜를 전하는 톤을 유지해 주세요.`;
}
