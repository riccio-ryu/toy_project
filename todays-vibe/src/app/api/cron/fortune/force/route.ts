import { NextRequest } from "next/server";
import {
  generateWeeklyZodiacFortunes,
  generateWeeklyChineseFortunes,
  generateMonthlyZodiacFortunes,
  generateMonthlyChineseFortunes,
  generateYearlyZodiacFortunes,
  generateYearlyChineseFortunes,
} from "@/lib/fortune/generator";
import { BatchResult } from "@/types/scheduled-fortune";

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// 강제 실행: ?period=weekly-zodiac | weekly-chinese | monthly-zodiac | monthly-chinese | yearly-zodiac | yearly-chinese | all
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "weekly-zodiac";
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // KST 기준
  const results: BatchResult[] = [];

  // 강제 실행은 항상 현재 주기 기준으로 생성 (forceCurrentPeriod = true)
  const CURRENT = true;

  try {
    if (period === "weekly-zodiac")  results.push(await generateWeeklyZodiacFortunes(now, CURRENT));
    if (period === "weekly-chinese") results.push(await generateWeeklyChineseFortunes(now, CURRENT));
    if (period === "monthly-zodiac")  results.push(await generateMonthlyZodiacFortunes(now, CURRENT));
    if (period === "monthly-chinese") results.push(await generateMonthlyChineseFortunes(now, CURRENT));
    if (period === "yearly-zodiac")  results.push(await generateYearlyZodiacFortunes(now, CURRENT));
    if (period === "yearly-chinese") results.push(await generateYearlyChineseFortunes(now, CURRENT));
    if (period === "all") {
      results.push(await generateWeeklyZodiacFortunes(now, CURRENT));
      results.push(await generateWeeklyChineseFortunes(now, CURRENT));
      results.push(await generateMonthlyZodiacFortunes(now, CURRENT));
      results.push(await generateMonthlyChineseFortunes(now, CURRENT));
      results.push(await generateYearlyZodiacFortunes(now, CURRENT));
      results.push(await generateYearlyChineseFortunes(now, CURRENT));
    }

    return Response.json({
      message: `강제 실행 완료: ${period}`,
      results,
    });
  } catch (err) {
    return Response.json({ error: String(err), results }, { status: 500 });
  }
}
