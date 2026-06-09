"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";

export default function Header() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-md bg-black/30 border-b border-white/10">
      {/* Logo */}
      <Link href="/">
        <Image
          src="/brand/logo.svg"
          alt="오늘운"
          width={108}
          height={36}
          priority
        />
      </Link>

      {/* Auth */}
      <nav className="flex items-center gap-3">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
        ) : user ? (
          <div ref={menuRef} className="relative">
            {/* 아바타 버튼 */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-purple-400 transition-all focus:outline-none"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-purple-700 flex items-center justify-center text-white text-sm font-bold">
                  {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
            </button>

            {/* 드롭다운 */}
            {open && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-gray-900 border border-white/10 shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white text-sm font-medium truncate">
                    {user.displayName ?? "사용자"}
                  </p>
                  <p className="text-white/40 text-xs truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/mypage"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                  >
                    <span>👤</span> 마이페이지
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="border-t border-white/10 my-1" />
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-white/5 transition-colors"
                      >
                        <span>⚙️</span> 관리자 페이지
                      </Link>
                    </>
                  )}
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm text-white/80 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 text-sm text-white font-semibold bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
