import Link from "next/link";
import fortunesData from "@/data/fortunes.json";

export default function Home() {
  const { fortunes, categories } = fortunesData;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">오늘 운</h1>
        <p className="text-purple-300 text-lg">AI가 풀어주는 나만의 운세</p>
      </div>

      {/* Category sections */}
      {categories.map((category) => {
        const categoryFortunes = fortunes.filter(
          (f) => f.category === category.id,
        );
        return (
          <section key={category.id} className="mb-10">
            <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoryFortunes.map((fortune) => (
                <Link key={fortune.id} href={fortune.path}>
                  <div className="group relative rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-purple-900/40">
                    {fortune.isPremium && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-300 bg-amber-900/50 px-1.5 py-0.5 rounded-full">
                        PRO
                      </span>
                    )}
                    <div className="text-3xl mb-2">{fortune.icon}</div>
                    <h3 className="text-white font-semibold text-sm mb-1 leading-tight">
                      {fortune.nameKo}
                    </h3>
                    <p className="text-white/50 text-xs leading-snug">
                      {fortune.description}
                    </p>
                    {fortune.isAI && (
                      <span className="inline-block mt-2 text-[10px] text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
