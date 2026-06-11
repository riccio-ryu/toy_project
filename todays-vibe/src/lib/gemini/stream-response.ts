import type { ContentListUnion } from "@google/genai";
import { generateStreamWithRetry, DEFAULT_MODEL } from "./client";
import { saveAiReading, type ReadingType } from "@/lib/firebase/readings";
import { recordTokenUsage } from "@/lib/firebase/token-usage";

const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
  "X-Accel-Buffering": "no",
} as const;

/**
 * Gemini 스트리밍 호출 → ReadableStream 생성 → ai_readings + token_usage 저장까지 처리하는 공통 헬퍼.
 */
export async function createFortuneStreamResponse(opts: {
  contents: ContentListUnion;
  userId: string | null;
  readingType: ReadingType;
  input: Record<string, unknown>;
}): Promise<Response> {
  const result = await generateStreamWithRetry({
    model: DEFAULT_MODEL,
    contents: opts.contents,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const chunks: string[] = [];
      let inputTokens = 0;
      let outputTokens = 0;

      try {
        for await (const chunk of result) {
          const text = chunk.text ?? "";
          if (text) {
            chunks.push(text);
            controller.enqueue(enc.encode(text));
          }
          // 마지막 청크에 최종 usageMetadata가 들어있음
          if (chunk.usageMetadata) {
            inputTokens  = chunk.usageMetadata.promptTokenCount    ?? inputTokens;
            outputTokens = chunk.usageMetadata.candidatesTokenCount ?? outputTokens;
          }
        }

        if (opts.userId) {
          const fullText = chunks.join("");
          await Promise.allSettled([
            saveAiReading(opts.userId, opts.readingType, opts.input, fullText),
            inputTokens > 0
              ? recordTokenUsage({
                  userId:      opts.userId,
                  menuId:      opts.readingType,
                  inputTokens,
                  outputTokens,
                })
              : Promise.resolve(),
          ]);
        }
      } catch (err) {
        console.error("[stream error]", err);
        controller.close();
        return;
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
