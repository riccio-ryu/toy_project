import Link from "next/link";
import chineseData from "@/data/chinese-zodiac.json";

const CURRENT_YEAR = new Date().getFullYear();

// 띠별 색상 (12띠를 4그룹으로)
const ANIMAL_STYLE: Record<string, string> = {
  rat:     "from-slate-500/20 to-gray-500/20 border-slate-400/30",
  ox:      "from-yellow-600/20 to-amber-500/20 border-yellow-500/30",
  tiger:   "from-orange-500/20 to-red-500/20 border-orange-400/30",
  rabbit:  "from-pink-400/20 to-rose-400/20 border-pink-400/30",
  dragon:  "from-emerald-500/20 to-teal-500/20 border-emerald-400/30",
  snake:   "from-green-600/20 to-emerald-600/20 border-green-500/30",
  horse:   "from-red-500/20 to-orange-500/20 border-red-400/30",
  goat:    "from-lime-500/20 to-green-400/20 border-lime-400/30",
  monkey:  "from-amber-500/20 to-yellow-500/20 border-amber-400/30",
  rooster: "from-rose-500/20 to-pink-500/20 border-rose-400/30",
  dog:     "from-brown-500/20 to-amber-700/20 border-amber-600/30",
  pig:     "from-purple-400/20 to-pink-400/20 border-purple-400/30",
};

const ANIMAL_RING: Record<string, string> = {
  rat:     "ring-slate-400/50",
  ox:      "ring-yellow-500/50",
  tiger:   "ring-orange-400/50",
  rabbit:  "ring-pink-400/50",
  dragon:  "ring-emerald-400/50",
  snake:   "ring-green-500/50",
  horse:   "ring-red-400/50",
  goat:    "ring-lime-400/50",
  monkey:  "ring-amber-400/50",
  rooster: "ring-rose-400/50",
  dog:     "ring-amber-600/50",
  pig:     "ring-purple-400/50",
};

export default function ChineseZodiacPage() {
  const animals = chineseData.animals;
  // 올해 띠 찾기
  const thisYearAnimal = animals.find((a) => a.years.includes(CURRENT_YEAR));

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="text-white/40 text-sm mb-2">띠별 운세</p>
          <h1 className="text-3xl font-bold text-white mb-3">🐉 나의 띠 운세</h1>
          <p className="text-white/50 text-sm">태어난 해의 띠를 선택하세요</p>
          {thisYearAnimal && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <span className="text-sm">{thisYearAnimal.emoji}</span>
              <span className="text-white/60 text-xs">{CURRENT_YEAR}년은 <span className="text-white font-medium">{thisYearAnimal.name}띠</span> 해</span>
            </div>
          )}
        </div>

        {/* 12띠 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {animals.map((animal) => {
            const isThisYear = animal.years.includes(CURRENT_YEAR);
            return (
              <Link key={animal.id} href={`/chinese-zodiac/${animal.id}`}>
                <div
                  className={`rounded-2xl bg-gradient-to-br ${ANIMAL_STYLE[animal.id] ?? "from-white/5 to-white/10 border-white/10"}
                    border p-4 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer
                    ${isThisYear ? `ring-2 ${ANIMAL_RING[animal.id]}` : ""}`}
                >
                  <div className="text-3xl mb-2">{animal.emoji}</div>
                  <p className="text-white font-semibold text-sm">{animal.name}띠</p>
                  <p className="text-white/40 text-xs mt-1">
                    {animal.years.slice(0, 3).join(", ")}...
                  </p>
                  {isThisYear && (
                    <span className="mt-1.5 inline-block text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/70">
                      올해
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* 내 띠 찾기 안내 */}
        <p className="text-center text-white/20 text-xs mt-8">
          카드 하단의 연도를 확인해 나의 띠를 찾아보세요
        </p>
      </div>
    </div>
  );
}
