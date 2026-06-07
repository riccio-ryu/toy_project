import { NextRequest } from "next/server";
import { getCardById } from "@/lib/tarot/utils";
import { checkUsage, denyResponse } from "@/lib/usage-check";
import { createFortuneStreamResponse } from "@/lib/gemini/stream-response";

export const runtime = "nodejs";

type CardInput = { id: string; reversed: boolean; position: string; desc: string };

function buildPrompt(cards: CardInput[], question?: string): string {
  const cardLines = cards
    .map(({ id, reversed, position, desc }, idx) => {
      const card = getCardById(id);
      if (!card) return "";
      const interp = reversed ? card.reversed : card.upright;
      return `• ${idx + 1}번 ${position} (${desc}): ${card.nameKo} (${card.name}) — ${reversed ? "역방향" : "정방향"}
  키워드: ${card.keywords.join(", ")}
  의미: ${interp.meaning}`;
    })
    .join("\n\n");

  return `당신은 따뜻하고 통찰력 있는 타로 카드 리더입니다.

스프레드: 말발굽 (Horseshoe) 5장 배열
${question ? `질문: ${question}` : "전반적인 흐름과 방향"}

말발굽 포지션:
1번 현재 — 질문자의 현재 상황
2번 방향 — 나아가야 할 방향
3번 장애물 — 앞에 놓인 장애물
4번 지략 — 힘을 주는 것과 헤쳐나갈 지략
5번 결과 — 최종 결과

뽑힌 카드:
${cardLines}

위 말발굽 배치를 해석해주세요.

작성 규칙:
- 현재 → 방향 → 장애물 → 지략 → 결과의 흐름으로 자연스럽게 연결
- 각 포지션의 의미와 카드 의미를 결합하여 서술
- 확정적 예언 금지 — 가능성과 방향성으로 표현
- 부정적 카드도 성장·통찰의 관점으로 해석
- 따뜻하고 공감적인 톤, 한국어
- 700~1000자 내외`;
}

export async function POST(request: NextRequest) {
  try {
    const { cards, question } = await request.json() as {
      cards: CardInput[];
      question?: string;
    };

    if (!cards || cards.length !== 5) {
      return Response.json({ error: "카드 5장이 필요합니다." }, { status: 400 });
    }

    const usage = await checkUsage(request, "tarot-horseshoe");
    if (!usage.allowed) return denyResponse(usage.reason);

    const prompt = buildPrompt(cards, question);

    return createFortuneStreamResponse({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      userId: usage.userId,
      readingType: "tarot-horseshoe",
      input: { cards, question },
    });
  } catch (err) {
    console.error("[Horseshoe API]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
