import { getAdminFirestore } from "./admin";

export type ReadingType =
  | "saju"
  | "tarot-3cards"
  | "tarot-celtic"
  | "tarot-horseshoe"
  | "tarot-tree-of-life"
  | "tarot-full-moon"
  | "dream"
  | "zodiac"
  | "chinese-zodiac";

function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
}

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
