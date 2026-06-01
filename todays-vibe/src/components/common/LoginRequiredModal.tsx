"use client";

import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  redirectPath: string;
}

export default function LoginRequiredModal({ isOpen, onClose, redirectPath }: Props) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleLogin() {
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1a1033] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-4xl mb-4 block">🔒</span>
          <h2 className="text-white font-bold text-lg mb-2">로그인이 필요합니다</h2>
          <p className="text-white/50 text-sm">이 운세는 회원만 이용할 수 있어요</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-colors"
          >
            로그인하기
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-white/10 text-white/70 font-semibold text-sm hover:bg-white/15 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
