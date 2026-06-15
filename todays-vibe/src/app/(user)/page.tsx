import fortunesData from "@/data/fortunes.json";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST } from "@/lib/utils/date";
import type { MenuItem } from "@/types/menu";
import FortuneGrid from "./FortuneGrid";
import QuickMenu from "@/components/home/QuickMenu";
import HeroCard from "@/components/home/HeroCard";
import PopularSection from "@/components/home/PopularSection";
import OracleHeader from "@/components/home/OracleHeader";

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

async function getQuickMenuItems(allMenus: MenuItem[]): Promise<MenuItem[]> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("settings").doc("quickMenu").get();
    const ids: string[] = (snap.data()?.menuIds as string[]) ?? [];
    return ids
      .map((id) => allMenus.find((m) => m.id === id && m.ready))
      .filter(Boolean) as MenuItem[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const items = await getMenuItems();
  const { categories } = fortunesData;
  const quickMenuItems = await getQuickMenuItems(items);
  const today = todayKST();

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          popular: (f as any).popular as boolean | undefined,
        }));

  const popularItems = fortunes.filter((f) => f.popular && f.ready);

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-12">
      {/* 콘텐츠 영역 배경 파티클 */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
        {[
          { x: "3%",  y: "8%",  c: "text-yellow-400/[0.06]" },
          { x: "95%", y: "5%",  c: "text-purple-400/[0.07]" },
          { x: "1%",  y: "35%", c: "text-white/[0.04]" },
          { x: "97%", y: "28%", c: "text-yellow-300/[0.05]" },
          { x: "2%",  y: "65%", c: "text-purple-300/[0.05]" },
          { x: "96%", y: "55%", c: "text-white/[0.04]" },
          { x: "4%",  y: "88%", c: "text-yellow-400/[0.04]" },
          { x: "94%", y: "82%", c: "text-purple-400/[0.05]" },
          { x: "50%", y: "2%",  c: "text-white/[0.03]" },
        ].map((p, i) => (
          <span key={i} className={`absolute text-lg ${p.c}`} style={{ left: p.x, top: p.y }}>
            {i % 3 === 0 ? "✦" : i % 3 === 1 ? "✧" : "⋆"}
          </span>
        ))}
      </div>

      {/* Header */}
      <OracleHeader />

      {/* Hero — 오늘의 운세 */}
      <HeroCard today={today} />

      {/* Quick Menu */}
      <QuickMenu items={quickMenuItems} />

      {/* 인기 운세 */}
      <PopularSection items={popularItems} />

      {/* Category sections */}
      <FortuneGrid categories={categories} fortunes={fortunes} />
    </div>
  );
}
