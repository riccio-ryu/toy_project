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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-stretch">
              {categoryFortunes.map((fortune) => {
                const isReady = fortune.ready === true;

                const card = (
                  <div
                    className={`group relative flex flex-col h-full rounded-xl backdrop-blur-sm border p-4 transition-all duration-200
                      ${isReady
                        ? "bg-white/10 border-white/10 cursor-pointer hover:-translate-y-1 hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-purple-900/40"
                        : "bg-white/5 border-white/5 cursor-not-allowed opacity-50 grayscale"
                      }`}
                  >
                    {/* PRO 뱃지 */}
                    {fortune.isPremium && isReady && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-300 bg-amber-900/50 px-1.5 py-0.5 rounded-full">
                        PRO
                      </span>
                    )}

                    {/* 준비중 뱃지 */}
                    {!isReady && (
                      <span className="absolute top-2 right-2 text-[10px] font-medium text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full">
                        준비중
                      </span>
                    )}

                    <div className="text-3xl mb-2">{fortune.icon}</div>
                    <h3 className="text-white font-semibold text-sm mb-1 leading-tight">
                      {fortune.nameKo}
                    </h3>
                    <p className="text-white/50 text-xs leading-snug line-clamp-2">
                      {fortune.description}
                    </p>
                    {fortune.isAI && isReady && (
                      <span className="inline-block mt-2 text-[10px] font-medium text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                );

                return isReady ? (
                  <Link key={fortune.id} href={fortune.path}>
                    {card}
                  </Link>
                ) : (
                  <div key={fortune.id}>{card}</div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
