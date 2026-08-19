import { formatCardLines } from "@/lib/tarot/utils";
import { createTarotSpreadRoute, TarotCardBase } from "@/lib/api/tarot-route-factory";

export const runtime = "nodejs";

type CardInput = TarotCardBase;

function buildPrompt(cards: CardInput[], question?: string): string {
  const cardLines = formatCardLines(cards, { numbered: false });

  return `당신은 따뜻하고 통찰력 있는 타로 카드 리더입니다.

스프레드: 쓰리카드 (과거 → 현재 → 미래)
${question ? `질문: ${question}` : "전반적인 운세"}

뽑힌 카드:
${cardLines}

위 카드 배치를 해석해주세요.

작성 규칙:
- 세 카드를 하나의 흐름으로 자연스럽게 연결
- 각 카드의 자리(과거/현재/미래) 의미와 카드 의미를 결합
- 확정적 예언 금지 — 가능성과 방향성으로 표현
- 부정적 카드도 성장·통찰의 관점으로 해석
- 따뜻하고 공감적인 톤, 한국어
- 500~700자 내외`;
}

export const POST = createTarotSpreadRoute({ readingType: "tarot-3cards", cardCount: 3, buildPrompt });
