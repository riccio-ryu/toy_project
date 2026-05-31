import { NextRequest } from "next/server";
import { getGemini, DEFAULT_MODEL } from "@/lib/gemini/client";
import { buildPrompt } from "@/lib/claude/prompts";
import { FortuneRequest } from "@/types/fortune";
import { checkUsage, denyResponse } from "@/lib/usage-check";

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
    // 스트림 시작 전 Gemini 연결 검증
    let stream;
    try {
      stream = await getGemini().models.generateContentStream({
        model: DEFAULT_MODEL,
        contents: prompt,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "AI 연결에 실패했습니다.";
      console.error("[fortune API - Gemini 연결 실패]", message);
      return Response.json({ error: message }, { status: 502 });
    }

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[fortune API error]", err);
    return Response.json(
      { error: "운세 해석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
