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
import { kstNow } from "@/lib/utils/date";
import { getDateFromWeekKey } from "@/lib/fortune/date-utils";

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

/**
 * 강제 실행: ?period=... &target=...
 *
 * period: weekly-zodiac | weekly-chinese | monthly-zodiac | monthly-chinese | yearly-zodiac | yearly-chinese | all
 * target (선택): 기간을 직접 지정
 *   - 주간: "2026-W22"  (HTML input[type=week] 포맷)
 *   - 월간: "2026-06"   (HTML input[type=month] 포맷)
 *   - 연간: "2026"
 *   - 미지정 시 현재 기간 기준
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "weekly-zodiac";
  const target = searchParams.get("target");

  let now = kstNow();

  if (target) {
    if (/^\d{4}-W\d{2}$/.test(target)) {
      // 주간: "2026-W22" → 해당 주의 월요일
      now = getDateFromWeekKey(target);
    } else if (/^\d{4}-\d{2}$/.test(target)) {
      // 월간: "2026-06" → 해당 월 1일
      const [y, m] = target.split("-");
      now = new Date(parseInt(y!), parseInt(m!) - 1, 1);
    } else if (/^\d{4}$/.test(target)) {
      // 연간: "2026" → 해당 연도 1월 1일
      now = new Date(parseInt(target), 0, 1);
    }
  }

  const results: BatchResult[] = [];

  try {
    if (period === "weekly-zodiac")   results.push(await generateWeeklyZodiacFortunes(now, true));
    if (period === "weekly-chinese")  results.push(await generateWeeklyChineseFortunes(now, true));
    if (period === "monthly-zodiac")  results.push(await generateMonthlyZodiacFortunes(now, true));
    if (period === "monthly-chinese") results.push(await generateMonthlyChineseFortunes(now, true));
    if (period === "yearly-zodiac")   results.push(await generateYearlyZodiacFortunes(now, true));
    if (period === "yearly-chinese")  results.push(await generateYearlyChineseFortunes(now, true));
    if (period === "all") {
      results.push(await generateWeeklyZodiacFortunes(now, true));
      results.push(await generateWeeklyChineseFortunes(now, true));
      results.push(await generateMonthlyZodiacFortunes(now, true));
      results.push(await generateMonthlyChineseFortunes(now, true));
      results.push(await generateYearlyZodiacFortunes(now, true));
      results.push(await generateYearlyChineseFortunes(now, true));
    }

    const label = target ? `${period} (${target})` : `${period} (현재 기간)`;
    return Response.json({ message: `강제 실행 완료: ${label}`, results });
  } catch (err) {
    return Response.json({ error: String(err), results }, { status: 500 });
  }
}
