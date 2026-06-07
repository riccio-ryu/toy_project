import { GoogleGenAI } from "@google/genai";
import type { GenerateContentConfig, ContentListUnion } from "@google/genai";

// 배치(대량 호출)용
export const BATCH_MODEL = "gemini-2.5-flash";
// 스트리밍(유저 직접 호출)용: 품질 우선
export const DEFAULT_MODEL = "gemini-2.5-flash";
export const DEFAULT_MAX_TOKENS = 2000;

let _gemini: GoogleGenAI | null = null;

/** 실제 호출 시점에 초기화 (빌드 타임 에러 방지) */
export function getGemini(): GoogleGenAI {
  if (_gemini) return _gemini;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  _gemini = new GoogleGenAI({ apiKey });
  return _gemini;
}

/** 503 과부하 시 최대 3회 재시도 (3s → 6s → 9s 간격) */
export async function generateStreamWithRetry(params: {
  model: string;
  contents: ContentListUnion;
  config?: GenerateContentConfig;
}, maxRetries = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await getGemini().models.generateContentStream(params);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 503 && attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
