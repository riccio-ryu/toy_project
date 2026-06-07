import { NextRequest } from "next/server";
import { buildPrompt } from "@/lib/claude/prompts";
import { FortuneRequest } from "@/types/fortune";
import { checkUsage, denyResponse } from "@/lib/usage-check";
import { type ReadingType } from "@/lib/firebase/readings";
import { createFortuneStreamResponse } from "@/lib/gemini/stream-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body: FortuneRequest = await request.json();
    const { type, input } = body;

    if (!type || !input) {
      return Response.json(
        { error: "type과 input은 필수입니다." },
        { status: 400 }
      );
    }

    const usage = await checkUsage(request, type);
    if (!usage.allowed) return denyResponse(usage.reason);

    const prompt = buildPrompt(type, input);

    return createFortuneStreamResponse({
      contents: prompt,
      userId: usage.userId,
      readingType: type as ReadingType,
      input: input as unknown as Record<string, unknown>,
    });
  } catch (err) {
    console.error("[fortune API error]", err);
    return Response.json(
      { error: "운세 해석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
