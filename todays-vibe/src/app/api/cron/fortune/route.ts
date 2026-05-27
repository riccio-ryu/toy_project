import { NextRequest } from "next/server";
import {
  generateWeeklyFortunes,
  generateMonthlyFortunes,
  generateYearlyFortunes,
} from "@/lib/fortune/generator";
import {
  isSunday,
  isLastDayOfMonth,
  isLastDayOfYear,
} from "@/lib/fortune/date-utils";
import { BatchResult } from "@/types/scheduled-fortune";

// Vercel Cron이 보내는 Authorization 헤더 검증
function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // KST 기준 현재 날짜 (UTC+9)
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const results: BatchResult[] = [];
  const tasks: string[] = [];

  try {
    // 매주 일요일 → 다음 주 주간 운세 생성
    if (isSunday(kstNow)) {
      tasks.push("weekly");
      const r = await generateWeeklyFortunes(kstNow);
      results.push(r);
    }

    // 매월 마지막 날 → 다음 달 월간 운세 생성
    if (isLastDayOfMonth(kstNow)) {
      tasks.push("monthly");
      const r = await generateMonthlyFortunes(kstNow);
      results.push(r);
    }

    // 12월 31일 → 내년 연간 운세 생성
    if (isLastDayOfYear(kstNow)) {
      tasks.push("yearly");
      const r = await generateYearlyFortunes(kstNow);
      results.push(r);
    }

    if (tasks.length === 0) {
      return Response.json({
        message: "오늘은 생성 조건 없음",
        kstDate: kstNow.toISOString(),
      });
    }

    return Response.json({
      message: `완료: ${tasks.join(", ")}`,
      kstDate: kstNow.toISOString(),
      results,
    });
  } catch (err) {
    console.error("[cron/fortune] 오류:", err);
    return Response.json(
      { error: String(err), results },
      { status: 500 }
    );
  }
}
