"use server";

import { getAdminFirestore } from "@/lib/firebase/admin";
import type { MenuItem, Category } from "@/types/menu";

const COL = "menus";
const CAT_COL = "categories";

function db() {
  return getAdminFirestore();
}

export async function getMenus(): Promise<MenuItem[]> {
  const snap = await db().collection(COL).orderBy("order").get();
  return snap.docs.map((d) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...data } = d.data();
    return { id: d.id, ...data } as MenuItem;
  });
}

export async function saveMenu(item: MenuItem): Promise<void> {
  const { id, ...data } = item;
  await db()
    .collection(COL)
    .doc(id)
    .set({ ...data, updatedAt: new Date() }, { merge: true });
}

export async function deleteMenusByIds(ids: string[]): Promise<void> {
  const firestore = db();
  const batch = firestore.batch();
  ids.forEach((id) => batch.delete(firestore.collection(COL).doc(id)));
  await batch.commit();
}

// ─── Category actions ─────────────────────────────────────────────────────────

export async function getExtraCategories(): Promise<Category[]> {
  const snap = await db().collection(CAT_COL).orderBy("order").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function saveCategory(cat: Category): Promise<void> {
  const { id, ...data } = cat;
  await db().collection(CAT_COL).doc(id).set(data, { merge: true });
}

export async function deleteCategoryById(id: string): Promise<void> {
  await db().collection(CAT_COL).doc(id).delete();
}

// ─── Batch order update ───────────────────────────────────────────────────────

export async function batchUpdateOrders(
  menus: { id: string; order: number }[],
  cats: { id: string; order: number }[]
): Promise<void> {
  const firestore = db();
  const batch = firestore.batch();
  menus.forEach(({ id, order }) =>
    batch.update(firestore.collection(COL).doc(id), { order, updatedAt: new Date() })
  );
  cats.forEach(({ id, order }) =>
    batch.set(firestore.collection(CAT_COL).doc(id), { order }, { merge: true })
  );
  await batch.commit();
}

// ─── Menu actions ─────────────────────────────────────────────────────────────

export async function patchMenusByIds(
  ids: string[] | null,
  data: Partial<Omit<MenuItem, "id">>
): Promise<void> {
  const firestore = db();
  const col = firestore.collection(COL);

  const refs = ids
    ? ids.map((id) => col.doc(id))
    : (await col.get()).docs.map((d) => d.ref);

  const batch = firestore.batch();
  refs.forEach((ref) => batch.update(ref, { ...data, updatedAt: new Date() }));
  await batch.commit();
}
