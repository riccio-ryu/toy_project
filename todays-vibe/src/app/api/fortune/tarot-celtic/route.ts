import { NextRequest } from "next/server";
import { getCardById } from "@/lib/tarot/utils";
import { checkUsage, denyResponse } from "@/lib/usage-check";
import { createFortuneStreamResponse } from "@/lib/gemini/stream-response";

export const runtime = "nodejs";

type CardInput = { id: string; reversed: boolean; position: string };

function buildPrompt(cards: CardInput[], question?: string): string {
  const cardLines = cards
    .map(({ id, reversed, position }, idx) => {
      const card = getCardById(id);
      if (!card) return "";
      const meaning = reversed ? card.reversed : card.upright;
      return `• ${idx + 1}번 ${position}: ${card.nameKo} (${card.name}) — ${reversed ? "역방향" : "정방향"}
  키워드: ${card.keywords.join(", ")}
  의미: ${meaning.meaning}`;
    })
    .join("\n\n");

  return `당신은 따뜻하고 통찰력 있는 타로 카드 리더입니다.

스프레드: 켈틱 크로스 (Celtic Cross) 10장 배열
${question ? `질문: ${question}` : "전반적인 운세"}

켈틱 크로스 포지션:
1번 현재 상황 — 지금 상황의 핵심
2번 교차하는 힘 — 도전하거나 보완하는 힘
3번 뿌리 / 과거 — 현재 상황의 토대와 근원
4번 최근 과거 — 직전에 지나간 영향
5번 잠재 가능성 — 잠재된 가능성 또는 최선의 결과
6번 다가오는 미래 — 가까운 미래의 흐름
7번 나 자신 — 나의 태도와 내면 상태
8번 외부 환경 — 주변 환경과 타인의 영향
9번 희망과 두려움 — 내가 바라거나 두려워하는 것
10번 최종 결과 — 전체 흐름의 귀결

뽑힌 카드:
${cardLines}

위 켈틱 크로스 배치를 해석해주세요.

작성 규칙:
- 10장 카드를 하나의 흐름으로 연결 (현재→도전→과거→미래→내면→결과)
- 각 포지션의 의미와 카드 의미를 결합하여 자연스럽게 서술
- 확정적 예언 금지 — 가능성과 방향성으로 표현
- 부정적 카드도 성장·통찰의 관점으로 해석
- 따뜻하고 공감적인 톤, 한국어
- 1200~1800자 내외`;
}

export async function POST(request: NextRequest) {
  try {
    const { cards, question } = await request.json() as {
      cards: CardInput[];
      question?: string;
    };

    if (!cards || cards.length !== 10) {
      return Response.json({ error: "카드 10장이 필요합니다." }, { status: 400 });
    }

    const usage = await checkUsage(request, "tarot-celtic");
    if (!usage.allowed) return denyResponse(usage.reason);

    const prompt = buildPrompt(cards, question);

    return createFortuneStreamResponse({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      userId: usage.userId,
      readingType: "tarot-celtic",
      input: { cards, question },
    });
  } catch (err) {
    console.error("[Tarot Celtic API]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
