import type { ContentListUnion } from "@google/genai";
import { generateStreamWithRetry, DEFAULT_MODEL } from "./client";
import { saveAiReading, type ReadingType } from "@/lib/firebase/readings";

const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
  "X-Accel-Buffering": "no",
} as const;

/**
 * Gemini 스트리밍 호출 → ReadableStream 생성 → ai_readings 저장까지 처리하는 공통 헬퍼.
 * 각 fortune API route의 반복 보일러플레이트를 대체한다.
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
      try {
        for await (const chunk of result) {
          const text = chunk.text ?? "";
          if (text) {
            chunks.push(text);
            controller.enqueue(enc.encode(text));
          }
        }
        if (opts.userId) {
          await saveAiReading(opts.userId, opts.readingType, opts.input, chunks.join(""))
            .catch((err) => console.error("[ai_readings]", err));
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
