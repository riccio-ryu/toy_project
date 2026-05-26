import { gemini, DEFAULT_MODEL } from "@/lib/gemini/client";
import { getAdminFirestore } from "@/lib/firebase/admin";
import zodiacData from "@/data/zodiac-signs.json";
import chineseData from "@/data/chinese-zodiac.json";
import {
  buildWeeklyZodiacPrompt,
  buildWeeklyChineseZodiacPrompt,
  buildMonthlyZodiacPrompt,
  buildMonthlyChineseZodiacPrompt,
  buildAnnualZodiacPrompt,
  buildAnnualChineseZodiacPrompt,
} from "./schedule-prompts";
import {
  getWeekKey,
  getNextWeekRange,
  getNextMonthKey,
  getNextYear,
} from "./date-utils";
import { BatchResult } from "@/types/scheduled-fortune";

const ZODIAC_SIGNS = zodiacData.zodiacSigns;
const CHINESE_ANIMALS = chineseData.animals;

// ─── Gemini 호출 (JSON 응답) ──────────────────────────────────────────────────

async function callGeminiJson<T>(prompt: string): Promise<T> {
  const response = await gemini.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as T;
}

// API 과부하 방지용 딜레이
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── 주간 운세 생성 ───────────────────────────────────────────────────────────

export async function generateWeeklyFortunes(
  now: Date
): Promise<BatchResult> {
  const db = getAdminFirestore();
  const { start: weekStart, end: weekEnd } = getNextWeekRange(now);
  const weekKey = getWeekKey(new Date(weekStart));
  const result: BatchResult = {
    period: "weekly",
    total: ZODIAC_SIGNS.length + CHINESE_ANIMALS.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  // 별자리 12개
  for (const sign of ZODIAC_SIGNS) {
    try {
      const prompt = buildWeeklyZodiacPrompt(sign.name, weekStart, weekEnd);
      const data = await callGeminiJson<object>(prompt);

      await db
        .collection("fortune_weekly")
        .doc(`zodiac_${sign.id}_${weekKey}`)
        .set({
          category: "zodiac",
          sign: sign.id,
          weekKey,
          weekStart,
          weekEnd,
          ...data,
          generatedAt: new Date().toISOString(),
        });

      result.succeeded++;
      await delay(1000); // 1초 간격
    } catch (err) {
      result.failed++;
      result.errors.push(`zodiac/${sign.id}: ${String(err)}`);
    }
  }

  // 띠 12개
  for (const animal of CHINESE_ANIMALS) {
    try {
      const prompt = buildWeeklyChineseZodiacPrompt(
        animal.name,
        weekStart,
        weekEnd
      );
      const data = await callGeminiJson<object>(prompt);

      await db
        .collection("fortune_weekly")
        .doc(`chinese_zodiac_${animal.id}_${weekKey}`)
        .set({
          category: "chinese_zodiac",
          sign: animal.id,
          weekKey,
          weekStart,
          weekEnd,
          ...data,
          generatedAt: new Date().toISOString(),
        });

      result.succeeded++;
      await delay(1000);
    } catch (err) {
      result.failed++;
      result.errors.push(`chinese_zodiac/${animal.id}: ${String(err)}`);
    }
  }

  return result;
}

// ─── 월간 운세 생성 ───────────────────────────────────────────────────────────

export async function generateMonthlyFortunes(
  now: Date
): Promise<BatchResult> {
  const db = getAdminFirestore();
  const monthKey = getNextMonthKey(now);
  const result: BatchResult = {
    period: "monthly",
    total: ZODIAC_SIGNS.length + CHINESE_ANIMALS.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  for (const sign of ZODIAC_SIGNS) {
    try {
      const prompt = buildMonthlyZodiacPrompt(sign.name, monthKey);
      const data = await callGeminiJson<object>(prompt);

      await db
        .collection("fortune_monthly")
        .doc(`zodiac_${sign.id}_${monthKey}`)
        .set({
          category: "zodiac",
          sign: sign.id,
          monthKey,
          ...data,
          generatedAt: new Date().toISOString(),
        });

      result.succeeded++;
      await delay(1000);
    } catch (err) {
      result.failed++;
      result.errors.push(`zodiac/${sign.id}: ${String(err)}`);
    }
  }

  for (const animal of CHINESE_ANIMALS) {
    try {
      const prompt = buildMonthlyChineseZodiacPrompt(animal.name, monthKey);
      const data = await callGeminiJson<object>(prompt);

      await db
        .collection("fortune_monthly")
        .doc(`chinese_zodiac_${animal.id}_${monthKey}`)
        .set({
          category: "chinese_zodiac",
          sign: animal.id,
          monthKey,
          ...data,
          generatedAt: new Date().toISOString(),
        });

      result.succeeded++;
      await delay(1000);
    } catch (err) {
      result.failed++;
      result.errors.push(`chinese_zodiac/${animal.id}: ${String(err)}`);
    }
  }

  return result;
}

// ─── 연간 운세 생성 ───────────────────────────────────────────────────────────

export async function generateAnnualFortunes(
  now: Date
): Promise<BatchResult> {
  const db = getAdminFirestore();
  const year = getNextYear(now);
  const result: BatchResult = {
    period: "annual",
    total: ZODIAC_SIGNS.length + CHINESE_ANIMALS.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  for (const sign of ZODIAC_SIGNS) {
    try {
      const prompt = buildAnnualZodiacPrompt(sign.name, year);
      const data = await callGeminiJson<object>(prompt);

      await db
        .collection("fortune_annual")
        .doc(`zodiac_${sign.id}_${year}`)
        .set({
          category: "zodiac",
          sign: sign.id,
          year,
          ...data,
          generatedAt: new Date().toISOString(),
        });

      result.succeeded++;
      await delay(1500);
    } catch (err) {
      result.failed++;
      result.errors.push(`zodiac/${sign.id}: ${String(err)}`);
    }
  }

  for (const animal of CHINESE_ANIMALS) {
    try {
      const prompt = buildAnnualChineseZodiacPrompt(animal.name, year);
      const data = await callGeminiJson<object>(prompt);

      await db
        .collection("fortune_annual")
        .doc(`chinese_zodiac_${animal.id}_${year}`)
        .set({
          category: "chinese_zodiac",
          sign: animal.id,
          year,
          ...data,
          generatedAt: new Date().toISOString(),
        });

      result.succeeded++;
      await delay(1500);
    } catch (err) {
      result.failed++;
      result.errors.push(`chinese_zodiac/${animal.id}: ${String(err)}`);
    }
  }

  return result;
}
