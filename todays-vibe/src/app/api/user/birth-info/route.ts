import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";

async function getSessionFromRequest(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  return verifySessionToken(cookie);
}

// ─── GET: 저장된 출생 정보 조회 ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const db = getAdminFirestore();
    const doc = await db.collection("users").doc(session.uid).get();
    const birthInfo = doc.data()?.birthInfo ?? null;
    return Response.json({ birthInfo });
  } catch {
    return Response.json({ birthInfo: null });
  }
}

// ─── POST: 출생 정보 저장 ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json();
  const { year, month, day, hour, isLunar, gender } = body;

  if (!year || !month || !day || !gender) {
    return Response.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const { FieldValue } = await import("firebase-admin/firestore");
    await db.collection("users").doc(session.uid).update({
      birthInfo: { year, month, day, hour: hour ?? -1, isLunar: isLunar ?? false, gender, savedAt: FieldValue.serverTimestamp() },
    });
    return Response.json({ status: "ok" });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// ─── DELETE: 출생 정보 삭제 ───────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const db = getAdminFirestore();
    const { FieldValue } = await import("firebase-admin/firestore");
    await db.collection("users").doc(session.uid).update({
      birthInfo: FieldValue.delete(),
    });
    return Response.json({ status: "ok" });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
