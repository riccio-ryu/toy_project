import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { AccessLevel } from "@/types/menu";
import type { NextRequest } from "next/server";

const ROLE_RANK: Record<AccessLevel, number> = {
  public: 0,
  member: 1,
  premium: 2,
  admin: 3,
};

function planToRole(payload: { isAdmin: boolean; plan: string } | null): AccessLevel {
  if (!payload) return "public";
  if (payload.isAdmin) return "admin";
  if (payload.plan === "premium") return "premium";
  return "member";
}

function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
}

type DenyReason =
  | "unauthenticated"
  | "insufficient_plan"
  | "usage_limit_exceeded";

type CheckResult =
  | { allowed: true; remaining: number | null; userId: string | null; role: AccessLevel }
  | { allowed: false; reason: DenyReason };

/**
 * 1) 세션으로 사용자 역할 확인
 * 2) 메뉴의 accessLevel 확인 (접근 권한)
 * 3) usageLimits 확인 후 허용 시 카운트 1 증가 (원자적)
 */
export async function checkUsage(
  request: NextRequest,
  menuId: string
): Promise<CheckResult> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  const role = planToRole(payload);
  const userId = payload?.uid ?? null;

  const db = getAdminFirestore();
  const menuSnap = await db.collection("menus").doc(menuId).get();
  const menu = menuSnap.data();

  // accessLevel 체크
  const requiredLevel: AccessLevel = menu?.accessLevel ?? "public";
  if (ROLE_RANK[role] < ROLE_RANK[requiredLevel]) {
    return {
      allowed: false,
      reason: role === "public" ? "unauthenticated" : "insufficient_plan",
    };
  }

  // usageLimits 없으면 무제한
  const limits = menu?.usageLimits;
  if (!limits) return { allowed: true, remaining: null, userId, role };

  const limit: number = limits[role] ?? -1;
  if (limit === 0) return { allowed: false, reason: "insufficient_plan" };
  if (limit === -1) return { allowed: true, remaining: null, userId, role };

  // 일별 카운트 체크 + 원자적 증가
  if (!userId) return { allowed: false, reason: "unauthenticated" };

  const docId = `${todayKST()}_${userId}_${menuId}`;
  const usageRef = db.collection("daily_usage").doc(docId);

  let txAllowed = false;
  let txRemaining = 0;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(usageRef);
    const count: number = snap.exists ? (snap.data()?.count ?? 0) : 0;

    if (count >= limit) return;

    tx.set(
      usageRef,
      { userId, menuId, date: todayKST(), count: FieldValue.increment(1), updatedAt: new Date() },
      { merge: true }
    );
    txAllowed = true;
    txRemaining = limit - count - 1;
  });

  if (!txAllowed) return { allowed: false, reason: "usage_limit_exceeded" };
  return { allowed: true, remaining: txRemaining, userId, role };
}

const DENY_MESSAGES: Record<DenyReason, string> = {
  unauthenticated: "로그인이 필요합니다.",
  insufficient_plan: "이용 등급이 부족합니다. 플랜을 업그레이드해 주세요.",
  usage_limit_exceeded: "오늘의 이용 횟수를 모두 소진했습니다. 내일 자정에 초기화됩니다.",
};

const DENY_STATUS: Record<DenyReason, number> = {
  unauthenticated: 401,
  insufficient_plan: 403,
  usage_limit_exceeded: 429,
};

export function denyResponse(reason: DenyReason): Response {
  return Response.json(
    { error: DENY_MESSAGES[reason] },
    { status: DENY_STATUS[reason] }
  );
}
