import {
  FortuneType,
  DreamInput,
  SajuInput,
  Tarot3Input,
  NumerologyInput,
  GeneralFortuneInput,
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
