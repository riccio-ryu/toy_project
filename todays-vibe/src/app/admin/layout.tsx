import Link from "next/link";

const NAV = [
  { href: "/admin", label: "대시보드", icon: "📊" },
  { href: "/admin/batch", label: "운세 배치", icon: "⚡" },
  { href: "/admin/users", label: "회원 관리", icon: "👥" },
  { href: "/admin/menus", label: "메뉴 관리", icon: "📋" },
  { href: "/admin/stats", label: "사용 통계", icon: "📈" },
  { href: "/admin/ai-usage", label: "AI 사용량", icon: "🤖" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-white/10 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <Link href="/" className="text-white/40 text-xs hover:text-white/70 transition-colors">
            ← 서비스로
          </Link>
          <h1 className="text-white font-bold text-lg mt-2">🔮 관리자</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150 text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/20 text-xs">관리자 전용</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
