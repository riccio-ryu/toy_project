import { NextRequest } from "next/server";
import { getGemini, DEFAULT_MODEL } from "@/lib/gemini/client";
import { getCardById } from "@/lib/tarot/utils";
import { checkUsage, denyResponse } from "@/lib/usage-check";
import { saveAiReading } from "@/lib/firebase/readings";

export const runtime = "nodejs";

type CardInput = { id: string; reversed: boolean; position: string };

function buildPrompt(cards: CardInput[], question?: string): string {
  const cardLines = cards
    .map(({ id, reversed, position }) => {
      const card = getCardById(id);
      if (!card) return "";
      const meaning = reversed ? card.reversed : card.upright;
      return `• ${position}: ${card.nameKo} (${card.name}) — ${reversed ? "역방향" : "정방향"}
  키워드: ${card.keywords.join(", ")}
  의미: ${meaning.meaning}`;
    })
    .join("\n\n");

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

export async function POST(request: NextRequest) {
  try {
    const { cards, question } = await request.json() as {
      cards: CardInput[];
      question?: string;
    };

    if (!cards || cards.length !== 3) {
      return Response.json({ error: "카드 3장이 필요합니다." }, { status: 400 });
    }

    const usage = await checkUsage(request, "tarot-3cards");
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
        const chunks: string[] = [];
        for await (const chunk of result) {
          const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (text) {
            chunks.push(text);
            controller.enqueue(enc.encode(text));
          }
        }
        if (usage.userId) {
          await saveAiReading(usage.userId, "tarot-3cards", { cards, question }, chunks.join(""))
            .catch((err) => console.error("[ai_readings]", err));
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
    console.error("[Tarot API]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
