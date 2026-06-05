import type { Timestamp } from "firebase-admin/firestore";

export type BuiltinPlan = "free" | "premium" | "admin";
export type UserPlan = BuiltinPlan | string;

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

export type UserProvider = "google" | "github" | "email" | "kakao" | "naver" | "unknown";

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
  provider: UserProvider;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Firestore plans/{planId} 문서 스키마
 */
export interface PlanConfig {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface AllStats {
  total: number;
  free: number;
  premium: number;
  admin: number;
  [key: string]: number;
}
