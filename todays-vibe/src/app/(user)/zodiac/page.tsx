import Link from "next/link";
import zodiacData from "@/data/zodiac-signs.json";

const ELEMENT_STYLE: Record<string, string> = {
  fire:  "from-red-500/20 to-orange-500/20 border-red-400/30",
  earth: "from-green-500/20 to-emerald-500/20 border-green-400/30",
  air:   "from-yellow-400/20 to-cyan-400/20 border-yellow-400/30",
  water: "from-blue-500/20 to-indigo-500/20 border-blue-400/30",
};

export default function ZodiacPage() {
  const signs = zodiacData.zodiacSigns;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="text-white/40 text-sm mb-2">별자리 운세</p>
          <h1 className="text-3xl font-bold text-white mb-3">✨ 오늘의 별자리</h1>
          <p className="text-white/50 text-sm">나의 별자리를 선택하세요</p>
        </div>

        {/* 12별자리 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {signs.map((sign) => (
            <Link key={sign.id} href={`/zodiac/${sign.id}`}>
              <div
                className={`rounded-2xl bg-gradient-to-br ${ELEMENT_STYLE[sign.element]} backdrop-blur-sm border p-4 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer`}
              >
                <div className="text-3xl mb-2">{sign.symbol}</div>
                <p className="text-white font-semibold text-sm">{sign.name}</p>
                <p className="text-white/40 text-xs mt-1">{sign.dateRange}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
