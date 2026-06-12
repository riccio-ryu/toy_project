import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MenuItem } from "@/types/menu";

export default function PopularSection({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-3">
        🔥 많이 보는 운세
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className="group relative flex flex-col rounded-2xl border border-white/10 overflow-hidden hover:-translate-y-0.5 transition-all duration-200 hover:shadow-xl hover:shadow-purple-900/30"
          >
            {/* 그라데이션 배경 */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.color ?? "from-purple-600 to-indigo-600"} opacity-25 group-hover:opacity-35 transition-opacity duration-200`}
            />

            <div className="relative flex flex-col flex-1 p-4">
              <span className="text-3xl mb-2">{item.icon}</span>
              <h3 className="text-white font-semibold text-sm mb-1 leading-tight">
                {item.nameKo}
              </h3>
              <p className="text-white/50 text-xs leading-snug line-clamp-2 flex-1">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1">
                  {item.isAI && (
                    <span className="text-[10px] font-medium text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                      AI
                    </span>
                  )}
                </div>
                <span className="text-white/40 text-xs group-hover:text-white/70 transition-colors">
                  시작하기 <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
