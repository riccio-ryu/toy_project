"use client";

import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "./config";
import {
  WeeklyFortune,
  MonthlyFortune,
  YearlyFortune,
} from "@/types/scheduled-fortune";

function db() {
  return getFirestore(getFirebaseApp());
}

// ─── 날짜 키 헬퍼 ────────────────────────────────────────────────

/** 현재 ISO 주차 키 e.g. "2026-W22" */
export function getCurrentWeekKey(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const week = Math.round(
    ((d.getTime() - yearStart.getTime()) / 86400000 +
      ((yearStart.getDay() + 6) % 7)) /
      7
  );
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** "2026-W22" → "2026-w-22" (Firestore 문서 ID용) */
function toWeekDocKey(weekKey: string): string {
  return weekKey.replace("-W", "-w-");
}

/** 현재 월 키 e.g. "2026-06" */
export function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-06" → "2026-m-06" (Firestore 문서 ID용) */
function toMonthDocKey(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${year}-m-${month}`;
}

/** 현재 연도 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/** 요일 → days 키 매핑 (0=일요일) */
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export function getTodayKey() {
  return DAY_KEYS[new Date().getDay()];
}

// ─── 별자리 운세 조회 ────────────────────────────────────────────

export async function getWeeklyZodiacFortune(
  sign: string
): Promise<WeeklyFortune | null> {
  const weekDocKey = toWeekDocKey(getCurrentWeekKey()); // "2026-w-22"
  const ref = doc(db(), "zodiac_weekly", `zw_${weekDocKey}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data()[sign] as WeeklyFortune) ?? null;
}

export async function getMonthlyZodiacFortune(
  sign: string
): Promise<MonthlyFortune | null> {
  const monthDocKey = toMonthDocKey(getCurrentMonthKey()); // "2026-m-06"
  const ref = doc(db(), "zodiac_monthly", `zm_${monthDocKey}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data()[sign] as MonthlyFortune) ?? null;
}

export async function getYearlyZodiacFortune(
  sign: string
): Promise<YearlyFortune | null> {
  const year = getCurrentYear();
  const ref = doc(db(), "zodiac_yearly", `zy_${year}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data()[sign] as YearlyFortune) ?? null;
}

// ─── 띠별 운세 조회 ──────────────────────────────────────────────

export async function getWeeklyChineseFortune(
  sign: string
): Promise<WeeklyFortune | null> {
  const weekDocKey = toWeekDocKey(getCurrentWeekKey());
  const ref = doc(db(), "chinese_zodiac_weekly", `czw_${weekDocKey}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data()[sign] as WeeklyFortune) ?? null;
}

export async function getMonthlyChineseFortune(
  sign: string
): Promise<MonthlyFortune | null> {
  const monthDocKey = toMonthDocKey(getCurrentMonthKey());
  const ref = doc(db(), "chinese_zodiac_monthly", `czm_${monthDocKey}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data()[sign] as MonthlyFortune) ?? null;
}

export async function getYearlyChineseFortune(
  sign: string
): Promise<YearlyFortune | null> {
  const year = getCurrentYear();
  const ref = doc(db(), "chinese_zodiac_yearly", `czy_${year}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data()[sign] as YearlyFortune) ?? null;
}

