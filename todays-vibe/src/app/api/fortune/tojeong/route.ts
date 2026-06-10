import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { buildPrompt } from "@/lib/claude/prompts";
import { generateStreamWithRetry, DEFAULT_MODEL } from "@/lib/gemini/client";
import { type TojeongInput } from "@/types/fortune";

export const runtime = "nodejs";

const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
  "X-Accel-Buffering": "no",
} as const;

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token).catch(() => null);
  return payload?.uid ?? null;
}

function docId(uid: string, year: number) {
  return `${uid}_${year}`;
}

// GET: 연간 캐시 조회
export async function GET(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ reading: null });

  const year = parseInt(new URL(req.url).searchParams.get("year") ?? String(new Date().getFullYear()));
  const db = getAdminFirestore();
  const doc = await db.collection("tojeong_readings").doc(docId(uid, year)).get();

  if (!doc.exists) return NextResponse.json({ reading: null });

  const data = doc.data()!;
  return NextResponse.json({
    reading: {
      result: data.result as string,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      targetYear: data.targetYear as number,
    },
  });
}

// POST: 생성 (캐시 있으면 캐시 반환, 없으면 AI 생성 후 저장)
export async function POST(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const input: TojeongInput = await req.json();
  const year = input.targetYear;
  const db = getAdminFirestore();
  const docRef = db.collection("tojeong_readings").doc(docId(uid, year));
  const existing = await docRef.get();

  // 캐시 있으면 즉시 스트림으로 반환
  if (existing.exists) {
    const cached = existing.data()!.result as string;
    const enc = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(enc.encode(cached));
        controller.close();
      },
    });
    return new Response(stream, { headers: STREAM_HEADERS });
  }

  // AI 생성 + 저장
  const prompt = buildPrompt("tojeong", input);
  const aiResult = await generateStreamWithRetry({ model: DEFAULT_MODEL, contents: prompt });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const chunks: string[] = [];
      try {
        for await (const chunk of aiResult) {
          const text = chunk.text ?? "";
          if (text) {
            chunks.push(text);
            controller.enqueue(enc.encode(text));
          }
        }
        // 연간 캐시 저장
        await docRef.set({
          userId: uid,
          targetYear: year,
          lunarYear: input.lunarYear,
          lunarMonth: input.lunarMonth,
          lunarDay: input.lunarDay,
          isLunar: input.isLunar,
          gender: input.gender,
          result: chunks.join(""),
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("[tojeong stream error]", err);
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
