"use client";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCustomToken,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { getFirebaseApp } from "./config";

function auth() {
  return getAuth(getFirebaseApp());
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth(), email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string
) {
  const credential = await createUserWithEmailAndPassword(auth(), email, password);
  await updateProfile(credential.user, { displayName: nickname });
  return credential;
}

export async function signInWithToken(token: string) {
  return signInWithCustomToken(auth(), token);
}

// ─── 세션 쿠키 관리 ───────────────────────────────────────────────

/** 로그인 후 서버에 세션 쿠키 생성 요청. isAdmin 반환 */
export async function createSession(user: User): Promise<boolean> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error("세션 생성에 실패했습니다.");
  }
  const data = await res.json();
  return data.isAdmin === true;
}

/** 비밀번호 재설정 이메일 발송 */
export async function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth(), email);
}

/** 로그아웃 시 Firebase Auth + 세션 쿠키 동시 제거 */
export async function signOut() {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
  return firebaseSignOut(auth());
}
