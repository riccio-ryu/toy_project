import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import {
  createSessionToken,
  buildSetCookieHeader,
  buildClearCookieHeader,
} from "@/lib/session";
import type { UserPlan } from "@/types/user";

function getEnvAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

// users/{uid} 문서 생성 또는 갱신 후 plan 반환
async function upsertUserDoc(
  uid: string,
  email: string,
  decoded: DecodedIdToken,
  userDoc: DocumentSnapshot
): Promise<UserPlan> {
  const db = getAdminFirestore();

  if (userDoc.exists) {
    // 기존 회원 — lastLoginAt 갱신, plan 읽기
    const data = userDoc.data()!;
    const rawPlan = data.plan as string;
    const expiresAt = data.planExpiresAt?.toDate() as Date | undefined;
    const isPremiumValid = rawPlan === "premium" && (!expiresAt || expiresAt > new Date());

    if (rawPlan === "premium" && expiresAt && expiresAt <= new Date()) {
      // 만료된 프리미엄 → free로 정정
      await db.collection("users").doc(uid).update({
        plan: "free",
        lastLoginAt: FieldValue.serverTimestamp(),
      });
      return "free";
    }

    await db.collection("users").doc(uid).update({
      lastLoginAt: FieldValue.serverTimestamp(),
    });
    return isPremiumValid ? "premium" : "free";
  }

  // 신규 회원 — 문서 생성
  const nickname =
    decoded.name ??
    (email ? email.split("@")[0] : null) ??
    "사용자";

  await db.collection("users").doc(uid).set({
    uid,
    email,
    nickname,
    photoURL: decoded.picture ?? "",
    plan: "free",
    createdAt: FieldValue.serverTimestamp(),
    lastLoginAt: FieldValue.serverTimestamp(),
  });

  return "free";
}

// ─── POST: 로그인 후 세션 쿠키 생성 ──────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken: string | undefined = body?.idToken;

    if (!idToken) {
      return Response.json({ error: "idToken이 필요합니다." }, { status: 400 });
    }

    // ① Firebase ID 토큰 검증
    const decoded = await Promise.race([
      getAdminAuth().verifyIdToken(idToken),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("verifyIdToken timeout")), 5000)
      ),
    ]);

    const uid = decoded.uid;

    // ② 이메일 확보 — 토큰에 없으면 Firebase Auth에서 직접 조회
    //    (GitHub 비공개 이메일, Google 일부 케이스 등)
    let email = decoded.email ?? "";
    if (!email) {
      try {
        const userRecord = await getAdminAuth().getUser(uid);
        email = userRecord.email ?? "";
      } catch {
        // 이메일 없는 계정도 허용 (isAdmin = false 처리)
      }
    }

    // ③ Firestore 처리
    let isAdmin = false;
    let plan: UserPlan = "free";

    try {
      const db = getAdminFirestore();

      const withTimeout = <T>(p: Promise<T>) =>
        Promise.race([
          p,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Firestore timeout")), 5000)
          ),
        ]);

      // users 문서 조회 (항상)
      // admins 문서 조회 (이메일 있을 때만)
      const promises: [Promise<DocumentSnapshot>, Promise<DocumentSnapshot | null>] = [
        withTimeout(db.collection("users").doc(uid).get()),
        email
          ? withTimeout(db.collection("admins").doc(email).get())
          : Promise.resolve(null),
      ];

      const [userDoc, adminDoc] = await Promise.all(promises);

      isAdmin = adminDoc?.exists === true && adminDoc.data()?.allowed === true;
      plan = await upsertUserDoc(uid, email, decoded, userDoc);

      console.log("[Session] 완료 — uid:", uid, "isAdmin:", isAdmin, "plan:", plan);
    } catch (fsErr) {
      console.warn("[Session] Firestore 실패, env 폴백:", (fsErr as Error).message);
      isAdmin = email ? getEnvAdminEmails().includes(email) : false;
    }

    // ④ HMAC 세션 토큰 발급
    const token = await createSessionToken(uid, email, isAdmin, plan);
    const response = Response.json({ status: "ok", isAdmin, plan });
    response.headers.set("Set-Cookie", buildSetCookieHeader(token));
    return response;
  } catch (err) {
    console.error("[Session] 오류:", err);
    return Response.json({ error: String(err) }, { status: 401 });
  }
}

// ─── GET: 현재 세션 확인 ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { verifySessionToken, SESSION_COOKIE } = await import("@/lib/session");
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({ authenticated: false, isAdmin: false });

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({ authenticated: false, isAdmin: false });

  return Response.json({
    authenticated: true,
    isAdmin: session.isAdmin,
    plan: session.plan,
    uid: session.uid,
  });
}

// ─── DELETE: 로그아웃 ─────────────────────────────────────────────
export async function DELETE() {
  const response = Response.json({ status: "ok" });
  response.headers.set("Set-Cookie", buildClearCookieHeader());
  return response;
}
