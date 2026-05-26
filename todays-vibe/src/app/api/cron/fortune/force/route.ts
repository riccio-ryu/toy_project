import { NextRequest } from "next/server";
import {
  generateWeeklyFortunes,
  generateMonthlyFortunes,
  generateAnnualFortunes,
} from "@/lib/fortune/generator";
import { BatchResult } from "@/types/scheduled-fortune";

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// 강제 실행: ?period=weekly | monthly | annual | all
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "weekly";
  const now = new Date();
  const results: BatchResult[] = [];

  try {
    if (period === "weekly" || period === "all") {
      results.push(await generateWeeklyFortunes(now));
    }
    if (period === "monthly" || period === "all") {
      results.push(await generateMonthlyFortunes(now));
    }
    if (period === "annual" || period === "all") {
      results.push(await generateAnnualFortunes(now));
    }

    return Response.json({
      message: `강제 실행 완료: ${period}`,
      results,
    });
  } catch (err) {
    return Response.json({ error: String(err), results }, { status: 500 });
  }
}
