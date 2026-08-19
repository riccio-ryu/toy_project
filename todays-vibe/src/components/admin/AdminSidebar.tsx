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
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      {/* 헤더 */}
      <div className={`py-5 border-b border-white/10 flex items-center ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
        {!collapsed ? (
          <Link href="/" onClick={onNav} className="flex items-center gap-1 text-white/40 text-xs hover:text-white/70 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            서비스로
          </Link>
        ) : (
          <Link href="/" onClick={onNav} className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* 로고 */}
      <div className={`border-b border-white/10 ${collapsed ? "py-3 flex justify-center" : "px-5 py-3"}`}>
        <h1 className="text-white font-bold text-base">{collapsed ? "A" : "관리자"}</h1>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg transition-all duration-150 text-sm
                ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                ${isActive ? "bg-purple-600/30 text-purple-300" : "text-white/50 hover:text-white hover:bg-white/8"}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 접기 토글 (데스크탑만) */}
      <div className="hidden md:block px-2 py-3 border-t border-white/10">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`w-full flex items-center rounded-lg py-2 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all text-xs
            ${collapsed ? "justify-center" : "gap-2 px-3"}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>접기</span></>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 모바일 상단 바 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-gray-900 border-b border-white/10 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-white/50 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-white font-semibold text-sm">관리자</span>
      </div>

      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-gray-900 border-r border-white/10 flex flex-col h-full relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* 데스크탑 사이드바 */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-56"} h-screen sticky top-0 bg-gray-900 border-r border-white/10 flex-col shrink-0 transition-all duration-200`}>
        <SidebarContent />
      </aside>
    </>
  );
}
