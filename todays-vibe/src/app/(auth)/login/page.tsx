"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, createSession, sendPasswordReset } from "@/lib/firebase/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function getDestination(isAdmin: boolean) {
    return isAdmin ? "/admin" : redirectTo;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      const isAdmin = await createSession(result.user);
      router.push(getDestination(isAdmin));
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: FormEvent) {
    e.preventDefault();
    setResetStatus("sending");
    try {
      await sendPasswordReset(resetEmail);
      setResetStatus("sent");
    } catch {
      setResetStatus("error");
    }
  }

  function handleGoogle() {
    window.location.href = "/api/auth/google";
  }

  function handleGithub() {
    window.location.href = "/api/auth/github";
  }

  function handleKakao() {
    window.location.href = "/api/auth/kakao";
  }

  function handleNaver() {
    window.location.href = "/api/auth/naver";
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <Image src="/brand/logo.svg" alt="오늘운" width={120} height={40} priority />
        </Link>
        <p className="text-white/50 text-sm mt-2">AI가 풀어주는 나만의 운세</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-8">
        <h1 className="text-white text-xl font-semibold mb-6 text-center">
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호 입력"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Image src="/brand/loading.svg" alt="로딩 중" width={20} height={20} className="mx-auto" />
            ) : "로그인"}
          </button>
        </form>

        {/* 비밀번호 찾기 */}
        <div className="mt-4">
          {!showReset ? (
            <button
              onClick={() => { setShowReset(true); setResetEmail(email); }}
              className="w-full text-center text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60 text-xs mb-3">
                가입한 이메일로 재설정 링크를 보내드려요.
              </p>
              {resetStatus === "sent" ? (
                <div className="text-center">
                  <p className="text-emerald-400 text-sm font-medium mb-1">이메일을 보냈어요 ✓</p>
                  <p className="text-white/40 text-xs mb-3">받은 편지함을 확인해 주세요.</p>
                  <button
                    onClick={() => { setShowReset(false); setResetStatus("idle"); }}
                    className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="가입한 이메일 입력"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  {resetStatus === "error" && (
                    <p className="text-red-400 text-xs">이메일을 다시 확인해 주세요.</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowReset(false); setResetStatus("idle"); }}
                      className="flex-1 py-2 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={resetStatus === "sending"}
                      className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                      {resetStatus === "sending" ? "전송 중..." : "재설정 링크 보내기"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">또는</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          {/* Naver */}
          <button
            onClick={handleNaver}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#03C75A] text-white text-sm font-semibold hover:bg-[#02b350] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
            </svg>
            네이버로 로그인
          </button>

          {/* Kakao */}
          <button
            onClick={handleKakao}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#FEE500] text-[#191919] text-sm font-semibold hover:bg-[#F5DC00] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.582 2 11c0 2.836 1.795 5.34 4.5 6.823L5.5 21l4.084-2.685C10.35 18.427 11.168 18.5 12 18.5c5.523 0 10-3.582 10-7.75C22 6.582 17.523 3 12 3z" />
            </svg>
            카카오로 로그인
          </button>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.77c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </button>

          {/* GitHub */}
          <button
            onClick={handleGithub}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#24292e] text-white text-sm font-semibold hover:bg-[#1a1e22] border border-white/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub로 로그인
          </button>
        </div>
      </div>

      {/* Sign up link */}
      <p className="text-center text-white/40 text-sm mt-6">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm" />}>
      <LoginForm />
    </Suspense>
  );
}
