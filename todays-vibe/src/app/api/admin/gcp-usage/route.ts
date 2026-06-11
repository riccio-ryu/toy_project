import { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { getGcpGeminiUsage } from "@/lib/gcp/monitoring";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (!payload?.isAdmin) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "1");
  const result = await getGcpGeminiUsage(Math.min(Math.max(days, 1), 28));

  return Response.json(result);
}
