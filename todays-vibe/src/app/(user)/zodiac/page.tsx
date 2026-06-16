import Link from "next/link";
import zodiacData from "@/data/zodiac-signs.json";
import SpriteCard from "@/components/common/SpriteCard";

export default function ZodiacPage() {
  const signs = zodiacData.zodiacSigns;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="text-white/40 text-sm mb-2">별자리 운세</p>
          <h1 className="text-3xl font-bold text-white mb-3">오늘의 별자리</h1>
          <p className="text-white/50 text-sm">나의 별자리를 선택하세요</p>
        </div>

        {/* 12별자리 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {signs.map((sign) => (
            <Link key={sign.id} href={`/zodiac/${sign.id}`}>
              <div className="group rounded-2xl overflow-hidden border border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/40 hover:border-white/20 transition-all duration-200 cursor-pointer">
                {/* 카드 이미지 */}
                <SpriteCard
                  type="zodiac"
                  id={sign.id}
                  className="w-full aspect-[2/3]"
                />
                {/* 이름 */}
                <div className="bg-white/5 px-3 py-2 text-center">
                  <p className="text-white font-semibold text-sm">{sign.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{sign.dateRange}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
