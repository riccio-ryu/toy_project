import fortunesData from "@/data/fortunes.json";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { MenuItem } from "@/types/menu";
import FortuneGrid from "./FortuneGrid";

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("menus").orderBy("order").get();
    if (snap.empty) return [];
    return snap.docs.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...rest } = d.data();
      return { id: d.id, ...rest } as MenuItem;
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const items = await getMenuItems();
  const { categories } = fortunesData;

  // Firestore 데이터가 없으면 fortunes.json으로 폴백
  const fortunes: MenuItem[] =
    items.length > 0
      ? items
      : fortunesData.fortunes.map((f, i) => ({
          id: f.id,
          icon: f.icon,
          nameKo: f.nameKo,
          description: f.description,
          category: f.category,
          path: f.path,
          difficulty: f.difficulty,
          isAI: f.isAI,
          ready: f.ready ?? false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accessLevel: ((f as any).isPremium ? "premium" : "public") as MenuItem["accessLevel"],
          tags: f.tags ?? [],
          color: f.color,
          order: i,
        }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">오늘 운</h1>
        <p className="text-purple-300 text-lg">AI가 풀어주는 나만의 운세</p>
      </div>

      {/* Category sections */}
      <FortuneGrid categories={categories} fortunes={fortunes} />
    </div>
  );
}
