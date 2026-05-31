import { NextRequest } from "next/server";
import { getGemini, DEFAULT_MODEL } from "@/lib/gemini/client";
import { getCardById } from "@/lib/tarot/utils";
import { checkUsage, denyResponse } from "@/lib/usage-check";

export const runtime = "nodejs";

type CardInput = { id: string; reversed: boolean; position: string; meaning: string };

function buildPrompt(cards: CardInput[], question?: string): string {
  const cardLines = cards
    .map(({ id, reversed, position, meaning }, idx) => {
      const card = getCardById(id);
      if (!card) return "";
      const interp = reversed ? card.reversed : card.upright;
      return `• ${idx + 1}번 ${position} (${meaning}): ${card.nameKo} (${card.name}) — ${reversed ? "역방향" : "정방향"}
  키워드: ${card.keywords.join(", ")}
  의미: ${interp.meaning}`;
    })
    .join("\n\n");

  return `당신은 따뜻하고 통찰력 있는 타로 카드 리더입니다.

스프레드: 생명의 나무 (Tree of Life) — 카발라 세피로트 10위치
${question ? `질문: ${question}` : "전반적인 삶의 흐름"}

세피로트 포지션:
1번 케테르 (왕관) — 영적인 것
2번 호크마 (지혜) — 책임
3번 비나 (이해) — 장애물
4번 헤세드 (자비) — 도움을 주는 것
5번 게부라 (힘) — 나를 반대하는 것
6번 티파레트 (아름다움) — 성취할 수 있는 것
7번 네짜흐 (승리) — 감정 관계
8번 호드 (영광) — 인간관계 및 커리어
9번 예소드 (기반) — 무의식의 기반
10번 말쿠트 (왕국) — 가족들에 대해

뽑힌 카드:
${cardLines}

위 생명의 나무 배치를 해석해주세요.

작성 규칙:
- 10개 세피로트를 영적(1-3) → 현실(4-6) → 관계/무의식(7-10)의 흐름으로 연결
- 각 포지션의 세피로트 의미와 카드 의미를 결합하여 서술
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

    const usage = await checkUsage(request, "tarot-tree-of-life");
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
    console.error("[Tree of Life API]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
