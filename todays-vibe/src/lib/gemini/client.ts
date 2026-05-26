import { GoogleGenAI } from "@google/genai";

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
