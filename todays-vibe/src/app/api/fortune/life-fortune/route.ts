import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { buildPrompt } from "@/lib/claude/prompts";
import { generateStreamWithRetry, DEFAULT_MODEL } from "@/lib/gemini/client";
import { todayKST } from "@/lib/utils/date";
import { type LifeFortuneInput } from "@/types/fortune";

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

// 캐시 문서 ID: 생년월일 + 성별 기반
function cacheDocId(uid: string, input: LifeFortuneInput) {
  return `${uid}_${input.birthYear}_${input.birthMonth}_${input.birthDay}_${input.gender}`;
}

// GET: 특정 생년월일+성별에 대한 캐시 조회
export async function GET(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ reading: null });

  const { searchParams } = new URL(req.url);
  const y = searchParams.get("y");
  const mo = searchParams.get("mo");
  const d = searchParams.get("d");
  const g = searchParams.get("g");
  if (!y || !mo || !d || !g) return NextResponse.json({ reading: null });

  const input = { birthYear: +y, birthMonth: +mo, birthDay: +d, gender: g as "male" | "female" };
  const db = getAdminFirestore();
  const doc = await db.collection("lifetime_readings").doc(cacheDocId(uid, input)).get();
  if (!doc.exists) return NextResponse.json({ reading: null });

  const data = doc.data()!;
  return NextResponse.json({
    reading: {
      result: data.result as string,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    },
  });
}

// POST: 생성 요청
export async function POST(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const input: LifeFortuneInput = await req.json();
  const db = getAdminFirestore();
  const docRef = db.collection("lifetime_readings").doc(cacheDocId(uid, input));
  const existing = await docRef.get();

  // 같은 생년월일+성별 → 캐시 즉시 반환 (AI 호출 없음)
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

  // 다른 생년월일 → 오늘 이미 생성한 평생운세가 있으면 거부
  const today = todayKST();
  const todaySnap = await db.collection("lifetime_readings")
    .where("userId", "==", uid)
    .where("date", "==", today)
    .limit(1)
    .get();

  if (!todaySnap.empty) {
    return NextResponse.json(
      { error: "오늘은 이미 평생운세를 생성하셨습니다. 내일 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  // 신규 생성
  const prompt = buildPrompt("life-fortune", input);
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
        await docRef.set({
          userId: uid,
          birthYear: input.birthYear,
          birthMonth: input.birthMonth,
          birthDay: input.birthDay,
          gender: input.gender,
          result: chunks.join(""),
          date: today,
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("[life-fortune stream error]", err);
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
