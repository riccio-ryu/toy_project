import { getGemini, BATCH_MODEL } from "@/lib/gemini/client";
import { getAdminFirestore } from "@/lib/firebase/admin";
import zodiacData from "@/data/zodiac-signs.json";
import chineseData from "@/data/chinese-zodiac.json";
import {
  buildWeeklyZodiacPrompt,
  buildWeeklyChineseZodiacPrompt,
  buildMonthlyZodiacPrompt,
  buildMonthlyChineseZodiacPrompt,
  buildYearlyZodiacPrompt,
  buildYearlyChineseZodiacPrompt,
} from "./schedule-prompts";
import {
  getWeekKey,
  getNextWeekRange,
  getNextMonthKey,
  getNextYear,
  toWeekDocKey,
  toMonthDocKey,
  getPrevWeekDocKey,
  getPrevMonthDocKey,
  getPrevYearKey,
} from "./date-utils";
import { BatchResult } from "@/types/scheduled-fortune";

const ZODIAC_IDS = zodiacData.zodiacSigns.map((s) => s.id);
const CHINESE_IDS = chineseData.animals.map((a) => a.id);

// ─── Gemini 호출 (JSON 응답) ──────────────────────────────────────────────────

async function callGeminiJson<T>(prompt: string): Promise<T> {
  const response = await getGemini().models.generateContent({
    model: BATCH_MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as T;
}

// ─── 이전 문서 삭제 (silent) ──────────────────────────────────────────────────

async function deleteSilent(
  db: FirebaseFirestore.Firestore,
  collection: string,
  docId: string
) {
  try {
    await db.collection(collection).doc(docId).delete();
  } catch {
    // 없는 문서 삭제 시 무시
  }
}

// ─── 주간 운세 생성 (2회 호출) ────────────────────────────────────────────────

export async function generateWeeklyFortunes(now: Date): Promise<BatchResult> {
  const db = getAdminFirestore();
  const { start: weekStart, end: weekEnd } = getNextWeekRange(now);
  const weekKey = getWeekKey(new Date(weekStart));
  const weekDocKey = toWeekDocKey(weekKey); // "2026-w-22"
  const prevWeekDocKey = getPrevWeekDocKey(weekDocKey);

  const result: BatchResult = {
    period: "weekly",
    total: 2, // 별자리 1회 + 띠 1회
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  // ── 별자리 전체 1회 호출 ──
  try {
    const prompt = buildWeeklyZodiacPrompt(weekStart, weekEnd);
    const raw = await callGeminiJson<Record<string, object>>(prompt);

    // sign별로 메타 필드 추가
    const doc: Record<string, object> = {};
    for (const id of ZODIAC_IDS) {
      if (raw[id]) {
        doc[id] = {
          category: "zodiac",
          sign: id,
          weekKey,
          weekStart,
          weekEnd,
          ...raw[id],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    await db.collection("zodiac_weekly").doc(`zw_${weekDocKey}`).set(doc);
    await deleteSilent(db, "zodiac_weekly", `zw_${prevWeekDocKey}`);
    result.succeeded++;
  } catch (err) {
    result.failed++;
    result.errors.push(`zodiac: ${String(err)}`);
  }

  // ── 띠 전체 1회 호출 ──
  try {
    const prompt = buildWeeklyChineseZodiacPrompt(weekStart, weekEnd);
    const raw = await callGeminiJson<Record<string, object>>(prompt);

    const doc: Record<string, object> = {};
    for (const id of CHINESE_IDS) {
      if (raw[id]) {
        doc[id] = {
          category: "chinese_zodiac",
          sign: id,
          weekKey,
          weekStart,
          weekEnd,
          ...raw[id],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    await db.collection("chinese_zodiac_weekly").doc(`czw_${weekDocKey}`).set(doc);
    await deleteSilent(db, "chinese_zodiac_weekly", `czw_${prevWeekDocKey}`);
    result.succeeded++;
  } catch (err) {
    result.failed++;
    result.errors.push(`chinese_zodiac: ${String(err)}`);
  }

  return result;
}

// ─── 월간 운세 생성 (2회 호출) ────────────────────────────────────────────────

export async function generateMonthlyFortunes(now: Date): Promise<BatchResult> {
  const db = getAdminFirestore();
  const monthKey = getNextMonthKey(now);
  const monthDocKey = toMonthDocKey(monthKey); // "2026-m-06"
  const prevMonthDocKey = getPrevMonthDocKey(monthDocKey);

  const result: BatchResult = {
    period: "monthly",
    total: 2,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  // ── 별자리 전체 1회 호출 ──
  try {
    const prompt = buildMonthlyZodiacPrompt(monthKey);
    const raw = await callGeminiJson<Record<string, object>>(prompt);

    const doc: Record<string, object> = {};
    for (const id of ZODIAC_IDS) {
      if (raw[id]) {
        doc[id] = {
          category: "zodiac",
          sign: id,
          monthKey,
          ...raw[id],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    await db.collection("zodiac_monthly").doc(`zm_${monthDocKey}`).set(doc);
    await deleteSilent(db, "zodiac_monthly", `zm_${prevMonthDocKey}`);
    result.succeeded++;
  } catch (err) {
    result.failed++;
    result.errors.push(`zodiac: ${String(err)}`);
  }

  // ── 띠 전체 1회 호출 ──
  try {
    const prompt = buildMonthlyChineseZodiacPrompt(monthKey);
    const raw = await callGeminiJson<Record<string, object>>(prompt);

    const doc: Record<string, object> = {};
    for (const id of CHINESE_IDS) {
      if (raw[id]) {
        doc[id] = {
          category: "chinese_zodiac",
          sign: id,
          monthKey,
          ...raw[id],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    await db.collection("chinese_zodiac_monthly").doc(`czm_${monthDocKey}`).set(doc);
    await deleteSilent(db, "chinese_zodiac_monthly", `czm_${prevMonthDocKey}`);
    result.succeeded++;
  } catch (err) {
    result.failed++;
    result.errors.push(`chinese_zodiac: ${String(err)}`);
  }

  return result;
}

// ─── 연간 운세 생성 (2회 호출) ────────────────────────────────────────────────

export async function generateYearlyFortunes(now: Date): Promise<BatchResult> {
  const db = getAdminFirestore();
  const year = getNextYear(now);
  const yearKey = String(year);
  const prevYearKey = getPrevYearKey(yearKey);

  const result: BatchResult = {
    period: "yearly",
    total: 2,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  // ── 별자리 전체 1회 호출 ──
  try {
    const prompt = buildYearlyZodiacPrompt(year);
    const raw = await callGeminiJson<Record<string, object>>(prompt);

    const doc: Record<string, object> = {};
    for (const id of ZODIAC_IDS) {
      if (raw[id]) {
        doc[id] = {
          category: "zodiac",
          sign: id,
          yearKey,
          ...raw[id],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    await db.collection("zodiac_yearly").doc(`zy_${yearKey}`).set(doc);
    await deleteSilent(db, "zodiac_yearly", `zy_${prevYearKey}`);
    result.succeeded++;
  } catch (err) {
    result.failed++;
    result.errors.push(`zodiac: ${String(err)}`);
  }

  // ── 띠 전체 1회 호출 ──
  try {
    const prompt = buildYearlyChineseZodiacPrompt(year);
    const raw = await callGeminiJson<Record<string, object>>(prompt);

    const doc: Record<string, object> = {};
    for (const id of CHINESE_IDS) {
      if (raw[id]) {
        doc[id] = {
          category: "chinese_zodiac",
          sign: id,
          yearKey,
          ...raw[id],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    await db.collection("chinese_zodiac_yearly").doc(`czy_${yearKey}`).set(doc);
    await deleteSilent(db, "chinese_zodiac_yearly", `czy_${prevYearKey}`);
    result.succeeded++;
  } catch (err) {
    result.failed++;
    result.errors.push(`chinese_zodiac: ${String(err)}`);
  }

  return result;
}

