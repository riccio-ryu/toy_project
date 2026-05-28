import type { Timestamp } from "firebase-admin/firestore";

export type UserPlan = "free" | "premium";

/**
 * Firestore users/{uid} 문서 스키마
 */
export interface UserDoc {
  uid: string;
  email: string;
  nickname: string;
  photoURL?: string;
  plan: UserPlan;
  planExpiresAt?: Timestamp;   // 프리미엄 만료일 (없으면 free)
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

/**
 * 클라이언트 노출용 (Timestamp → string 직렬화)
 */
export interface UserRecord {
  uid: string;
  email: string;
  nickname: string;
  photoURL?: string;
  plan: UserPlan;
  planExpiresAt?: string;
  createdAt: string;
  lastLoginAt: string;
}
