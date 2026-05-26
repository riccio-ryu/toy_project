"use client";

import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "./config";
import { WeeklyFortune, MonthlyFortune, AnnualFortune } from "@/types/scheduled-fortune";

function db() {
  return getFirestore(getFirebaseApp());
}

// ─── 날짜 키 헬퍼 ────────────────────────────────────────────────
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

export function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// 요일 → days 키 매핑 (0=일요일)
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export function getTodayKey() {
  return DAY_KEYS[new Date().getDay()];
}

// ─── Firestore 조회 ──────────────────────────────────────────────
export async function getWeeklyFortune(
  sign: string
): Promise<WeeklyFortune | null> {
  const weekKey = getCurrentWeekKey();
  const ref = doc(db(), "fortune_weekly", `zodiac_${sign}_${weekKey}`);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as WeeklyFortune) : null;
}

export async function getMonthlyFortune(
  sign: string
): Promise<MonthlyFortune | null> {
  const monthKey = getCurrentMonthKey();
  const ref = doc(db(), "fortune_monthly", `zodiac_${sign}_${monthKey}`);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as MonthlyFortune) : null;
}

export async function getAnnualFortune(
  sign: string
): Promise<AnnualFortune | null> {
  const year = getCurrentYear();
  const ref = doc(db(), "fortune_annual", `zodiac_${sign}_${year}`);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AnnualFortune) : null;
}
