"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="mt-auto border-t border-white/10">
      {/* 접힌 상태 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-3 text-white/30 hover:text-white/50 text-xs transition-colors"
      >
        <span>© 2026 오늘운</span>
        <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>∨</span>
      </button>

      {/* 펼친 상태 */}
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-8 space-y-6 max-w-xl mx-auto">

          {/* 면책조항 */}
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-white/40 text-[11px] leading-relaxed">
              본 서비스의 AI 운세 해석은 <span className="text-white/60">재미와 참고 목적</span>으로 제공됩니다.
              실제 의사결정, 투자, 건강, 법률 등 중요한 사안에 활용하지 마세요.
              운세 결과는 개인의 상황에 따라 다를 수 있습니다.
            </p>
          </div>

          {/* 링크 */}
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/40">
            <Link href="/about" className="hover:text-white/70 transition-colors">서비스 소개</Link>
            <span className="text-white/20">·</span>
            <Link href="/terms" className="hover:text-white/70 transition-colors">이용약관</Link>
            <span className="text-white/20">·</span>
            <Link href="/privacy" className="hover:text-white/70 transition-colors">개인정보처리방침</Link>
            <span className="text-white/20">·</span>
            <Link href="/contact" className="hover:text-white/70 transition-colors">문의하기</Link>
          </nav>

          <p className="text-center text-white/20 text-[11px]">© 2026 오늘운 · All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
