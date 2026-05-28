"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithEmail, createSession } from "@/lib/firebase/auth";

export default function SignupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const credential = await signUpWithEmail(email, password, nickname);
      // 세션 생성 + users/{uid} 문서 자동 생성
      await createSession(credential.user);
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          <span className="text-5xl">🔮</span>
          <span className="text-white font-bold text-2xl tracking-tight">
            오늘운
          </span>
        </Link>
        <p className="text-white/50 text-sm mt-2">AI가 풀어주는 나만의 운세</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-8">
        <h1 className="text-white text-xl font-semibold mb-6 text-center">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs mb-1.5">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              placeholder="닉네임"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-colors"
            />
          </div>
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
              placeholder="6자 이상"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1.5">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="비밀번호 재입력"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
      </div>

      {/* Login link */}
      <p className="text-center text-white/40 text-sm mt-6">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
