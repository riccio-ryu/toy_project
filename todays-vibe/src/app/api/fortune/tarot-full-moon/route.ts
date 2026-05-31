import { NextRequest } from "next/server";
import { getGemini, DEFAULT_MODEL } from "@/lib/gemini/client";
import { getCardById } from "@/lib/tarot/utils";
import { checkUsage, denyResponse } from "@/lib/usage-check";

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

스프레드: 보름달 (Full Moon) 7장 배열
${question ? `질문: ${question}` : "전반적인 삶의 흐름과 목표"}

보름달 포지션:
1번 지금 삶 — 질문자의 현재 상태
2번 인간관계 — 인간관계 및 주변 환경
3번 방해 요소 — 목표를 방해하는 것
4번 극복 방법 — 장애물을 극복하기 위해 해야 할 것
5번 행동 지침 — 목표를 이루기 위해 해야 할 것
6번 외부 교훈 — 외부·타인으로부터 배워야 할 것
7번 예상 결과 — 보름달 에너지가 가리키는 예상 결과 (중심 카드)

뽑힌 카드:
${cardLines}

위 보름달 배치를 해석해주세요.

작성 규칙:
- 7번 카드(예상 결과)는 보름달의 핵심 에너지로 강조하여 해석
- 현재(1) → 주변(2-3) → 방향(4-5) → 교훈(6) → 결과(7)의 흐름으로 연결
- 각 포지션의 의미와 카드 의미를 결합하여 서술
- 확정적 예언 금지 — 가능성과 방향성으로 표현
- 부정적 카드도 성장·통찰의 관점으로 해석
- 따뜻하고 공감적인 톤, 한국어
- 900~1200자 내외`;
}

export async function POST(request: NextRequest) {
  try {
    const { cards, question } = await request.json() as {
      cards: CardInput[];
      question?: string;
    };

    if (!cards || cards.length !== 7) {
      return Response.json({ error: "카드 7장이 필요합니다." }, { status: 400 });
    }

    const usage = await checkUsage(request, "tarot-full-moon");
    if (!usage.allowed) return denyResponse(usage.reason);

    const gemini = getGemini();
    const prompt = buildPrompt(cards, question);

    const result = await gemini.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        for await (const chunk of result) {
          const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (text) controller.enqueue(enc.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[Full Moon API]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
