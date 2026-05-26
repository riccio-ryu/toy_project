import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
}

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const DEFAULT_MODEL = "gemini-2.5-flash";
export const DEFAULT_MAX_TOKENS = 2000;
