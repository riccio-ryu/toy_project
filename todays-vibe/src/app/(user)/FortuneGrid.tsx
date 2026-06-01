"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import type { MenuItem } from "@/types/menu";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  categories: Category[];
  fortunes: MenuItem[];
}

export default function FortuneGrid({ categories, fortunes }: Props) {
  const { user, loading } = useAuth();
  const [modalPath, setModalPath] = useState<string | null>(null);

  function handleClick(fortune: MenuItem, e: React.MouseEvent) {
    if (!loading && !user && fortune.accessLevel !== "public") {
      e.preventDefault();
      setModalPath(fortune.path);
    }
  }

  return (
    <>
      <LoginRequiredModal
        isOpen={modalPath !== null}
        onClose={() => setModalPath(null)}
        redirectPath={modalPath ?? "/"}
      />

      {categories.map((category) => {
        const categoryFortunes = fortunes.filter((f) => f.category === category.id);
        if (categoryFortunes.length === 0) return null;

        return (
          <section key={category.id} className="mb-10">
            <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-stretch">
              {categoryFortunes.map((fortune) => {
                const isReady = fortune.ready === true;
                const needsAuth = fortune.accessLevel !== "public";

                const card = (
                  <div
                    className={`group relative flex flex-col h-full rounded-xl backdrop-blur-sm border p-4 transition-all duration-200
                      ${
                        isReady
                          ? "bg-white/10 border-white/10 cursor-pointer hover:-translate-y-1 hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-purple-900/40"
                          : "bg-white/5 border-white/5 cursor-not-allowed opacity-50 grayscale"
                      }`}
                  >
                    {fortune.accessLevel === "premium" && isReady && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-300 bg-amber-900/50 px-1.5 py-0.5 rounded-full">
                        PRO
                      </span>
                    )}
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
                      <span className="inline-block mt-2 w-fit text-[10px] font-medium text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                );

                if (!isReady) return <div key={fortune.id}>{card}</div>;

                return (
                  <Link
                    key={fortune.id}
                    href={fortune.path}
                    onClick={(e) => needsAuth ? handleClick(fortune, e) : undefined}
                  >
                    {card}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
