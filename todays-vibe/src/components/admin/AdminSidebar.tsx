"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Users,
  LayoutList,
  BookOpen,
  BarChart2,
  Bot,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { href: "/admin",           label: "대시보드",    icon: LayoutDashboard },
  { href: "/admin/batch",     label: "운세 배치",   icon: Zap },
  { href: "/admin/users",     label: "회원 관리",   icon: Users },
  { href: "/admin/menus",     label: "메뉴 관리",   icon: LayoutList },
  { href: "/admin/readings",  label: "운세 기록",   icon: BookOpen },
  { href: "/admin/stats",     label: "사용 통계",   icon: BarChart2 },
  { href: "/admin/ai-usage",  label: "AI 사용량",   icon: Bot },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-56"
      } h-screen sticky top-0 bg-gray-900 border-r border-white/10 flex flex-col shrink-0 transition-all duration-200`}
    >
      {/* 헤더 */}
      <div className={`py-5 border-b border-white/10 flex items-center ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-1 text-white/40 text-xs hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            서비스로
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* 로고 */}
      {!collapsed && (
        <div className="px-5 py-3 border-b border-white/10">
          <h1 className="text-white font-bold text-base">🔮 관리자</h1>
        </div>
      )}
      {collapsed && (
        <div className="py-3 border-b border-white/10 flex justify-center">
          <span className="text-lg">🔮</span>
        </div>
      )}

      {/* 네비게이션 */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg transition-all duration-150 text-sm
                ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                ${isActive
                  ? "bg-purple-600/30 text-purple-300"
                  : "text-white/50 hover:text-white hover:bg-white/8"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 접기 토글 */}
      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`w-full flex items-center rounded-lg py-2 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all text-xs
            ${collapsed ? "justify-center" : "gap-2 px-3"}`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>접기</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
