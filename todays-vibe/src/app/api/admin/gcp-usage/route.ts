import { NextRequest } from "next/server";
import { getGcpGeminiUsage } from "@/lib/gcp/monitoring";
import { requireAdmin } from "@/lib/api/require-admin";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "1");
  const result = await getGcpGeminiUsage(Math.min(Math.max(days, 1), 28));

  return Response.json(result);
}
