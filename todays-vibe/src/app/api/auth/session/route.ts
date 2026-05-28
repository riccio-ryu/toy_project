import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
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

    const uid   = decoded.uid;
    const email = decoded.email ?? "";
    if (!email) {
      return Response.json({ error: "이메일 정보가 없습니다." }, { status: 400 });
    }

    // ② Firestore 처리 (어드민 체크 + users 문서 upsert)
    let isAdmin = false;
    let plan: UserPlan = "free";

    try {
      const db = getAdminFirestore();

      const [adminDoc, userDoc] = await Promise.all([
        Promise.race([
          db.collection("admins").doc(email).get(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
          ),
        ]),
        Promise.race([
          db.collection("users").doc(uid).get(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
          ),
        ]),
      ]);

      // 어드민 여부
      isAdmin = adminDoc.exists && adminDoc.data()?.allowed === true;

      if (userDoc.exists) {
        // 기존 회원 — lastLoginAt 갱신, plan 읽기
        const data = userDoc.data()!;
        const rawPlan = data.plan as string;
        const expiresAt = data.planExpiresAt?.toDate() as Date | undefined;

        plan =
          rawPlan === "premium" && (!expiresAt || expiresAt > new Date())
            ? "premium"
            : "free";

        // planExpiresAt 지났으면 plan 도 free로 정정
        if (rawPlan === "premium" && expiresAt && expiresAt <= new Date()) {
          await db.collection("users").doc(uid).update({
            plan: "free",
            lastLoginAt: FieldValue.serverTimestamp(),
          });
        } else {
          await db.collection("users").doc(uid).update({
            lastLoginAt: FieldValue.serverTimestamp(),
          });
        }
      } else {
        // 신규 회원 — users/{uid} 문서 생성
        const nickname =
          decoded.name ??
          decoded.email?.split("@")[0] ??
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
        plan = "free";
      }

      console.log("[Session] Firestore 처리 완료 — isAdmin:", isAdmin, "plan:", plan);
    } catch (fsErr) {
      // Firestore 연결 실패 시 env 폴백 (어드민만)
      console.warn("[Session] Firestore 연결 실패, env 폴백:", (fsErr as Error).message);
      isAdmin = getEnvAdminEmails().includes(email);
    }

    // ③ HMAC 세션 토큰 생성
    const token = await createSessionToken(uid, email, isAdmin, plan);
    const response = Response.json({ status: "ok", isAdmin, plan });
    response.headers.set("Set-Cookie", buildSetCookieHeader(token));
    return response;
  } catch (err) {
    console.error("[Session] 오류:", err);
    return Response.json({ error: String(err) }, { status: 401 });
  }
}

// ─── DELETE: 로그아웃 ─────────────────────────────────────────────
export async function DELETE() {
  const response = Response.json({ status: "ok" });
  response.headers.set("Set-Cookie", buildClearCookieHeader());
  return response;
}
