import { NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { PlanConfig } from "@/types/user";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/api/require-admin";

// ─── GET: 커스텀 플랜 목록 ─────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection("plans").orderBy("createdAt", "desc").get();

    const plans: PlanConfig[] = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id:          doc.id,
        name:        d.name ?? doc.id,
        description: d.description ?? "",
        createdAt:   d.createdAt?.toDate?.()?.toISOString() ?? "",
      };
    });

    return Response.json({ plans });
  } catch (err) {
    console.error("[Admin/Plans GET] 오류:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// ─── POST: 커스텀 플랜 생성 ───────────────────────────────────
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { id, name, description, assignUids } = await request.json() as {
      id: string;
      name: string;
      description?: string;
      assignUids?: string[];
    };

    if (!id || !name) {
      return Response.json({ error: "플랜 ID와 플랜명은 필수입니다." }, { status: 400 });
    }
    // slug 검증: 영문/숫자/하이픈만 허용
    if (!/^[a-z0-9-]+$/.test(id)) {
      return Response.json({ error: "플랜 ID는 영소문자·숫자·하이픈만 사용 가능합니다." }, { status: 400 });
    }
    // 기본 플랜 덮어쓰기 방지
    if (["free", "premium", "admin"].includes(id)) {
      return Response.json({ error: "예약된 플랜 ID입니다." }, { status: 400 });
    }

    const db = getAdminFirestore();

    const existing = await db.collection("plans").doc(id).get();
    if (existing.exists) {
      return Response.json({ error: "이미 존재하는 플랜 ID입니다." }, { status: 409 });
    }

    const batch = db.batch();

    // 플랜 문서 생성
    batch.set(db.collection("plans").doc(id), {
      name,
      description: description ?? "",
      createdAt: FieldValue.serverTimestamp(),
    });

    // 선택된 계정에 플랜 할당
    if (assignUids && assignUids.length > 0) {
      for (const uid of assignUids) {
        batch.update(db.collection("users").doc(uid), { plan: id });
      }
    }

    await batch.commit();

    return Response.json({ status: "ok", id });
  } catch (err) {
    console.error("[Admin/Plans POST] 오류:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// ─── DELETE: 커스텀 플랜 삭제 ─────────────────────────────────
export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { id } = await request.json() as { id: string };
    if (!id || ["free", "premium", "admin"].includes(id)) {
      return Response.json({ error: "삭제할 수 없는 플랜입니다." }, { status: 400 });
    }

    const db = getAdminFirestore();
    await db.collection("plans").doc(id).delete();

    return Response.json({ status: "ok", id });
  } catch (err) {
    console.error("[Admin/Plans DELETE] 오류:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
