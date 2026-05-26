import {
  FortuneType,
  DreamInput,
  SajuInput,
  Tarot3Input,
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
