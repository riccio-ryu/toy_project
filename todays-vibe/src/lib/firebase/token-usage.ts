"use server";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { todayKST } from "@/lib/utils/date";

const COL = "token_usage";

export interface TokenUsageRecord {
  userId: string;
  menuId: string;
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
  updatedAt: Date;
}

/** 스트림 완료 후 토큰 사용량을 원자적으로 누적 저장 */
export async function recordTokenUsage(opts: {
  userId: string;
  menuId: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  const { userId, menuId, inputTokens, outputTokens } = opts;
  const db = getAdminFirestore();
  const date = todayKST();
  const docId = `${date}_${userId}_${menuId}`;

  await db
    .collection(COL)
    .doc(docId)
    .set(
      {
        userId,
        menuId,
        date,
        inputTokens:  FieldValue.increment(inputTokens),
        outputTokens: FieldValue.increment(outputTokens),
        totalTokens:  FieldValue.increment(inputTokens + outputTokens),
        callCount:    FieldValue.increment(1),
        updatedAt:    new Date(),
      },
      { merge: true }
    );
}
