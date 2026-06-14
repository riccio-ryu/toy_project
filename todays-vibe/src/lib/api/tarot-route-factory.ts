import { NextRequest } from "next/server";
import { checkUsage, denyResponse } from "@/lib/usage-check";
import { createFortuneStreamResponse } from "@/lib/gemini/stream-response";
import type { ReadingType } from "@/lib/firebase/readings";

export interface TarotCardBase {
  id: string;
  reversed: boolean;
  position: string;
}

interface TarotRouteOptions<T extends TarotCardBase> {
  readingType: ReadingType;
  cardCount: number;
  buildPrompt: (cards: T[], question?: string) => string;
}

export function createTarotSpreadRoute<T extends TarotCardBase>(
  { readingType, cardCount, buildPrompt }: TarotRouteOptions<T>
) {
  return async function POST(request: NextRequest) {
    try {
      const { cards, question } = await request.json() as {
        cards: T[];
        question?: string;
      };

      if (!cards || cards.length !== cardCount) {
        return Response.json(
          { error: `카드 ${cardCount}장이 필요합니다.` },
          { status: 400 }
        );
      }

      const usage = await checkUsage(request, readingType);
      if (!usage.allowed) return denyResponse(usage.reason);

      const prompt = buildPrompt(cards, question);

      return createFortuneStreamResponse({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        userId: usage.userId,
        readingType,
        input: { cards, question },
      });
    } catch (err) {
      console.error(`[${readingType}]`, err);
      return Response.json({ error: String(err) }, { status: 500 });
    }
  };
}
