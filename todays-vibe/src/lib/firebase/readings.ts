import { getAdminFirestore } from "./admin";
import { todayKST } from "@/lib/utils/date";

export type ReadingType =
  | "saju"
  | "tarot-3cards"
  | "tarot-celtic"
  | "tarot-horseshoe"
  | "tarot-tree-of-life"
  | "tarot-full-moon"
  | "dream"
  | "zodiac"
  | "chinese-zodiac"
  | "numerology"
  | "love-fortune"
  | "wealth-fortune"
  | "career-fortune"
  | "health-fortune"
  | "love-compatibility"
  | "name-compatibility"
  | "zodiac-compatibility"
  | "business-compatibility"
  | "rune"
  | "name-fortune"
  | "tojeong"
  | "life-fortune"
  | "moving-fortune"
  | "iching";

export async function saveAiReading(
  userId: string,
  type: ReadingType,
  input: Record<string, unknown>,
  result: string
): Promise<void> {
  const db = getAdminFirestore();
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined)
  );
  await db.collection("ai_readings").add({
    userId,
    type,
    input: cleanInput,
    result,
    date: todayKST(),
    createdAt: new Date(),
  });
}
