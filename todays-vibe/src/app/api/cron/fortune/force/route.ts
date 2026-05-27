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
  const now = new Date();
  const results: BatchResult[] = [];

  try {
    if (period === "weekly-zodiac")  results.push(await generateWeeklyZodiacFortunes(now));
    if (period === "weekly-chinese") results.push(await generateWeeklyChineseFortunes(now));
    if (period === "monthly-zodiac")  results.push(await generateMonthlyZodiacFortunes(now));
    if (period === "monthly-chinese") results.push(await generateMonthlyChineseFortunes(now));
    if (period === "yearly-zodiac")  results.push(await generateYearlyZodiacFortunes(now));
    if (period === "yearly-chinese") results.push(await generateYearlyChineseFortunes(now));
    if (period === "all") {
      results.push(await generateWeeklyZodiacFortunes(now));
      results.push(await generateWeeklyChineseFortunes(now));
      results.push(await generateMonthlyZodiacFortunes(now));
      results.push(await generateMonthlyChineseFortunes(now));
      results.push(await generateYearlyZodiacFortunes(now));
      results.push(await generateYearlyChineseFortunes(now));
    }

    return Response.json({
      message: `강제 실행 완료: ${period}`,
      results,
    });
  } catch (err) {
    return Response.json({ error: String(err), results }, { status: 500 });
  }
}
