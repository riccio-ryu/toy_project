import Link from "next/link";
import chineseData from "@/data/chinese-zodiac.json";
import SpriteCard from "@/components/common/SpriteCard";

const CURRENT_YEAR = new Date().getFullYear();

export default function ChineseZodiacPage() {
  const animals = chineseData.animals;
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
              <span className="text-white/60 text-xs">
                {CURRENT_YEAR}년은 <span className="text-white font-medium">{thisYearAnimal.name}띠</span> 해
              </span>
            </div>
          )}
        </div>

        {/* 12띠 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {animals.map((animal) => {
            const isThisYear = animal.years.includes(CURRENT_YEAR);
            return (
              <Link key={animal.id} href={`/chinese-zodiac/${animal.id}`}>
                <div className={`group rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/30
                  ${isThisYear ? "border-amber-400/50 ring-1 ring-amber-400/30" : "border-white/10 hover:border-white/20"}`}
                >
                  {/* 카드 이미지 */}
                  <div className="relative">
                    <SpriteCard
                      type="chinese"
                      id={animal.id}
                      className="w-full aspect-[2/3]"
                    />
                    {isThisYear && (
                      <span className="absolute top-2 right-2 text-[10px] font-medium bg-amber-400/90 text-amber-900 px-1.5 py-0.5 rounded-full">
                        올해
                      </span>
                    )}
                  </div>
                  {/* 이름 */}
                  <div className="bg-white/5 px-3 py-2 text-center">
                    <p className="text-white font-semibold text-sm">{animal.name}띠</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {animal.years.filter((y) => y <= CURRENT_YEAR).slice(0, 3).join(" · ")}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          카드 하단의 연도를 확인해 나의 띠를 찾아보세요
        </p>
      </div>
    </div>
  );
}
