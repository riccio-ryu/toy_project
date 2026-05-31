"use server";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { AccessLevel, UsageLimits } from "@/types/menu";

const COL = "daily_usage";

/** KST 기준 오늘 날짜 YYYYMMDD */
function todayKST(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10).replace(/-/g, "");
}

function docId(userId: string, menuId: string) {
  return `${todayKST()}_${userId}_${menuId}`;
}

/**
 * 오늘 사용 횟수를 확인하고, 허용되면 카운트를 1 증가시킵니다.
 * 트랜잭션으로 원자적으로 처리됩니다.
 *
 * @returns allowed  사용 가능 여부
 * @returns remaining 오늘 남은 횟수 (무제한이면 null)
 */
export async function checkAndIncrementUsage(
  userId: string,
  menuId: string,
  role: AccessLevel,
  limits: UsageLimits | undefined
): Promise<{ allowed: boolean; remaining: number | null }> {
  if (!limits) return { allowed: true, remaining: null };

  const limit = limits[role] ?? -1;
  if (limit === 0) return { allowed: false, remaining: 0 };
  if (limit === -1) return { allowed: true, remaining: null };

  const db = getAdminFirestore();
  const ref = db.collection(COL).doc(docId(userId, menuId));

  let result: { allowed: boolean; remaining: number | null } = {
    allowed: false,
    remaining: 0,
  };

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count: number = snap.exists ? (snap.data()?.count ?? 0) : 0;

    if (count >= limit) {
      result = { allowed: false, remaining: 0 };
      return;
    }

    tx.set(
      ref,
      {
        userId,
        menuId,
        date: todayKST(),
        count: FieldValue.increment(1),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    result = { allowed: true, remaining: limit - count - 1 };
  });

  return result;
}

/** 오늘 특정 메뉴의 사용 횟수만 조회 (증가 없음) */
export async function getUsageCount(
  userId: string,
  menuId: string
): Promise<number> {
  const snap = await getAdminFirestore()
    .collection(COL)
    .doc(docId(userId, menuId))
    .get();
  return snap.exists ? (snap.data()?.count ?? 0) : 0;
}

/** 여러 메뉴의 오늘 사용량 일괄 조회 */
export async function getBulkUsage(
  userId: string,
  menuIds: string[]
): Promise<Record<string, number>> {
  const db = getAdminFirestore();
  const today = todayKST();
  const snaps = await Promise.all(
    menuIds.map((id) => db.collection(COL).doc(`${today}_${userId}_${id}`).get())
  );
  return Object.fromEntries(
    menuIds.map((id, i) => [id, snaps[i].exists ? (snaps[i].data()?.count ?? 0) : 0])
  );
}
