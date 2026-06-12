"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import type { MenuItem } from "@/types/menu";

const STORAGE_KEY = "todays-vibe:accordion";

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
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // localStorage에서 열린 카테고리 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOpenCategories(new Set(JSON.parse(saved)));
    } catch {
      // ignore
    }
  }, []);

  function toggleCategory(id: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

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

      {/* 툴바 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/30 text-xs">카테고리를 눌러 펼쳐보세요</p>
        <button
          onClick={() => setShowComingSoon((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            showComingSoon
              ? "bg-white/10 border-white/15 text-white/50 hover:bg-white/15 hover:text-white/70"
              : "bg-purple-900/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/60"
          }`}
        >
          <span>{showComingSoon ? "🙈" : "👀"}</span>
          <span>{showComingSoon ? "준비중 숨기기" : "준비중 보기"}</span>
        </button>
      </div>

      {/* 카테고리 아코디언 */}
      <div className="space-y-2">
        {categories.map((category) => {
          const categoryFortunes = fortunes
            .filter((f) => f.category === category.id)
            .filter((f) => showComingSoon || f.ready === true);
          if (categoryFortunes.length === 0) return null;

          const isOpen = openCategories.has(category.id);
          const readyCount = categoryFortunes.filter((f) => f.ready).length;

          return (
            <section key={category.id} className="rounded-2xl border border-white/8 overflow-hidden">
              {/* 카테고리 헤더 — 클릭으로 토글 */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-xl">{category.icon}</span>
                <span className="flex-1 text-white/80 text-sm font-semibold">
                  {category.name}
                </span>
                <span className="text-white/25 text-xs mr-2">
                  {readyCount}종
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="text-white/30 text-xs leading-none"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              {/* 펼쳐지는 카드 목록 */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-3 pb-3 pt-1">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 items-stretch">
                        {categoryFortunes.map((fortune) => {
                          const isReady = fortune.ready === true;
                          const needsAuth = fortune.accessLevel !== "public";

                          const card = (
                            <div
                              className={`group relative flex flex-col h-full rounded-xl border p-4 transition-all duration-200
                                ${
                                  isReady
                                    ? "bg-white/8 border-white/8 cursor-pointer hover:-translate-y-0.5 hover:bg-white/14 hover:border-white/18 hover:shadow-lg hover:shadow-purple-900/30"
                                    : "bg-white/4 border-white/4 cursor-not-allowed opacity-40 grayscale"
                                }`}
                            >
                              {/* Premium 뱃지 */}
                              {fortune.accessLevel === "premium" && isReady && (
                                <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: "linear-gradient(to right, #92400e, #d97706)",
                                    color: "#fef3c7",
                                  }}
                                >
                                  ✨ Premium
                                </span>
                              )}
                              {!isReady && (
                                <span className="absolute top-2 right-2 text-[10px] font-medium text-white/40 bg-white/8 px-1.5 py-0.5 rounded-full">
                                  준비중
                                </span>
                              )}
                              <div className="text-3xl mb-2">{fortune.icon}</div>
                              <h3 className="text-white font-semibold text-sm mb-1 leading-tight">
                                {fortune.nameKo}
                              </h3>
                              <p className="text-white/50 text-xs leading-snug line-clamp-2 flex-1">
                                {fortune.description}
                              </p>
                              {/* 하단 행: AI 뱃지 + 시작하기 */}
                              <div className="flex items-center justify-between mt-2.5">
                                {fortune.isAI && isReady ? (
                                  <span className="text-[10px] font-medium text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                                    AI
                                  </span>
                                ) : <span />}
                                {isReady && (
                                  <span className="text-white/30 text-[10px] group-hover:text-white/60 transition-colors">
                                    시작하기 <ArrowRight className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </>
  );
}
