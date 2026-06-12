"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithToken, createSession } from "@/lib/firebase/auth";

function AuthCompleteInner() {
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

    window.history.replaceState({}, "", "/auth/complete");

    signInWithToken(ct)
      .then(async (credential) => {
        // 세션 쿠키 생성 + users/{uid} 문서 upsert
        const isAdmin = await createSession(credential.user);
        router.replace(isAdmin ? "/admin" : "/");
      })
      .catch(() => router.replace("/login?error=token_failed"));
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center">
        <img src="/brand/loading.svg" alt="loading" className="w-40 h-40 mb-4 mx-auto" />
        <p className="text-white/60 text-sm">로그인 중...</p>
      </div>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense>
      <AuthCompleteInner />
    </Suspense>
  );
}
