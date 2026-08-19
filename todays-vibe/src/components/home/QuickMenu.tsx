import Link from "next/link";
import { Zap } from "lucide-react";
import type { MenuItem } from "@/types/menu";

export default function QuickMenu({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="flex items-center gap-1.5 text-white/35 text-xs font-semibold uppercase tracking-widest mb-3">
        <Zap className="w-3 h-3" /> 빠른 메뉴
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)` }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className="group flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl bg-white/8 border border-white/10 hover:bg-white/14 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-white/75 group-hover:text-white text-xs font-medium text-center leading-tight transition-colors">
              {item.nameKo}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
