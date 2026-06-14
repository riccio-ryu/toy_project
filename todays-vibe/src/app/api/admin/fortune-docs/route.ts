import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const ALLOWED_COLLECTIONS = [
  "zodiac_weekly",
  "chinese_zodiac_weekly",
  "zodiac_monthly",
  "chinese_zodiac_monthly",
  "zodiac_yearly",
  "chinese_zodiac_yearly",
] as const;

type AllowedCollection = (typeof ALLOWED_COLLECTIONS)[number];

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  return payload?.isAdmin ? payload : null;
}

function isAllowed(col: string): col is AllowedCollection {
  return ALLOWED_COLLECTIONS.includes(col as AllowedCollection);
}

// GET ?collection=zodiac_weekly              → 문서 목록
// GET ?collection=zodiac_weekly&docId=zw_... → 문서 상세
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection") ?? "";
  const docId = searchParams.get("docId");

  if (!isAllowed(collection)) {
    return Response.json({ error: "Invalid collection" }, { status: 400 });
  }

  const db = getAdminFirestore();

  if (docId) {
    const snap = await db.collection(collection).doc(docId).get();
    if (!snap.exists) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ doc: { id: snap.id, data: snap.data() } });
  }

  const snapshot = await db.collection(collection).get();
  const docs = snapshot.docs
    .map((d) => {
      const data = d.data() as Record<string, { generatedAt?: string }>;
      const signs = Object.values(data);
      return {
        id: d.id,
        signCount: signs.length,
        generatedAt: signs[0]?.generatedAt ?? null,
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  return Response.json({ docs });
}

// DELETE body: { collection, docId }
export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json() as { collection?: string; docId?: string };
  const { collection = "", docId = "" } = body;

  if (!isAllowed(collection) || !docId) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  await getAdminFirestore().collection(collection).doc(docId).delete();
  return Response.json({ ok: true });
}
