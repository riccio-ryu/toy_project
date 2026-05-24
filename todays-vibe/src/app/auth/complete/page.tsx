"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithToken } from "@/lib/firebase/auth";

export default function AuthCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const ct = searchParams.get("ct");
    if (!ct) {
      router.replace("/login?error=missing_token");
      return;
    }

    // URL에서 토큰 제거 후 로그인
    window.history.replaceState({}, "", "/auth/complete");

    signInWithToken(ct)
      .then(() => router.replace("/"))
      .catch(() => router.replace("/login?error=token_failed"));
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-spin">🔮</div>
        <p className="text-white/60 text-sm">로그인 중...</p>
      </div>
    </div>
  );
}
