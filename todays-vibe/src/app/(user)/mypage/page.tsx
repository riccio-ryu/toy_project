"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { updateProfile } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseApp } from "@/lib/firebase/config";
import { uploadProfilePhoto } from "@/lib/firebase/storage";
import { validateNickname } from "@/lib/utils/nickname-validator";

// ─── 상수 ─────────────────────────────────────────────────────────
const PLAN_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "FREE",    color: "text-white/60",   bg: "bg-white/10" },
  premium: { label: "PREMIUM", color: "text-amber-400",  bg: "bg-amber-400/15 border border-amber-400/30" },
  admin:   { label: "ADMIN",   color: "text-purple-400", bg: "bg-purple-400/15 border border-purple-400/30" },
};

const QUICK_LINKS = [
  { href: "/zodiac",         emoji: "✨", label: "별자리 운세" },
  { href: "/chinese-zodiac", emoji: "🐉", label: "띠별 운세" },
  { href: "/dream",          emoji: "🌙", label: "꿈해몽" },
];

type PlanType = "free" | "premium" | "admin";
const PLAN_INDEX: Record<PlanType, number> = { free: 1, premium: 2, admin: 3 };
const PLAN_NAME: Record<PlanType, string> = {
  free: "무료 회원", premium: "프리미엄 회원", admin: "관리자",
};
const PLAN_LIMIT: Record<PlanType, string> = {
  free: "AI 기능 1일 1회 이용 가능",
  premium: "AI 기능 1일 3~5회 이용 가능",
  admin: "모든 기능 무제한 이용 가능",
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────
export default function MyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [nickError, setNickError] = useState<string | null>(null);
  const [editingNick, setEditingNick] = useState(false);
  const [nickSaving, setNickSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanType>("free");
  const [roleLoading, setRoleLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 비로그인 → 로그인 페이지
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // user 로드 후 초기화
  useEffect(() => {
    if (user) {
      setNickname(user.displayName ?? "");
      setPhotoPreview(user.photoURL ?? null);
    }
  }, [user]);

  // 세션에서 실제 role 조회
  useEffect(() => {
    if (!user) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.plan === "admin") setPlan("admin");
        else if (data.plan === "premium") setPlan("premium");
        else setPlan("free");
      })
      .catch(() => setPlan("free"))
      .finally(() => setRoleLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 가입일 포맷
  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "알 수 없음";

  const planInfo = PLAN_LABEL[plan];
  const planIndex = PLAN_INDEX[plan];

  // 토스트 표시
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── 프로필 사진 변경 ───────────────────────────────────────────
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 미리보기
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setPhotoUploading(true);
    try {
      const auth = getAuth(getFirebaseApp());
      const url = await uploadProfilePhoto(user.uid, file);
      await updateProfile(auth.currentUser!, { photoURL: url });
      showToast("프로필 사진이 변경되었어요 ✨");
    } catch (err) {
      console.error(err);
      setPhotoPreview(user.photoURL ?? null); // 실패 시 되돌리기
      showToast("사진 업로드에 실패했어요");
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── 닉네임 저장 ───────────────────────────────────────────────
  async function handleNickSave() {
    if (!user) return;
    setNickError(null);

    // 유효성 검사
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      setNickError(validation.error ?? "사용할 수 없는 닉네임이에요.");
      return;
    }

    setNickSaving(true);
    try {
      const auth = getAuth(getFirebaseApp());
      await updateProfile(auth.currentUser!, { displayName: nickname.trim() });
      setEditingNick(false);
      setNickError(null);
      showToast("닉네임이 변경되었어요 ✨");
    } catch (err) {
      console.error(err);
      showToast("닉네임 변경에 실패했어요");
    } finally {
      setNickSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto space-y-4">

        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-white/40 text-sm hover:text-white/70 transition-colors mb-2"
        >
          ← 홈
        </Link>

        {/* ── 프로필 카드 ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-5">

            {/* 아바타 */}
            <div className="relative shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="group relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-purple-400 transition-all focus:outline-none"
                title="사진 변경"
              >
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="프로필"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-700 flex items-center justify-center text-white text-2xl font-bold">
                    {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                )}
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {photoUploading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span className="text-white text-xs">변경</span>
                  }
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* 텍스트 정보 */}
            <div className="flex-1 min-w-0">
              {/* 닉네임 */}
              {editingNick ? (
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <input
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value);
                        setNickError(null); // 입력 시 에러 초기화
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleNickSave()}
                      maxLength={12}
                      autoFocus
                      className={`flex-1 bg-white/10 border rounded-lg px-3 py-1 text-white text-sm focus:outline-none transition-colors ${
                        nickError ? "border-red-400/60 focus:border-red-400" : "border-white/20 focus:border-purple-400"
                      }`}
                    />
                    <button
                      onClick={handleNickSave}
                      disabled={nickSaving}
                      className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                      {nickSaving ? "저장중..." : "저장"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNick(false);
                        setNickname(user.displayName ?? "");
                        setNickError(null);
                      }}
                      className="text-xs px-2 py-1.5 text-white/40 hover:text-white/70 transition-colors shrink-0"
                    >
                      취소
                    </button>
                  </div>
                  {/* 에러 메시지 + 글자수 */}
                  <div className="flex items-center justify-between mt-1 px-0.5">
                    {nickError ? (
                      <p className="text-red-400 text-xs">{nickError}</p>
                    ) : (
                      <p className="text-white/20 text-xs">한글·영문·숫자·_ . 사용 가능</p>
                    )}
                    <p className={`text-xs ml-2 shrink-0 ${nickname.length >= 12 ? "text-red-400" : "text-white/30"}`}>
                      {nickname.length}/12
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold text-lg truncate">
                    {user.displayName ?? "닉네임 없음"}
                  </p>
                  <button
                    onClick={() => setEditingNick(true)}
                    className="text-white/30 hover:text-white/60 transition-colors"
                    title="닉네임 변경"
                  >
                    ✏️
                  </button>
                </div>
              )}

              {/* 이메일 */}
              <p className="text-white/40 text-sm truncate">{user.email}</p>

              {/* 플랜 뱃지 */}
              {roleLoading ? (
                <div className="inline-block mt-2 h-4 w-14 bg-white/10 rounded-full animate-pulse" />
              ) : (
                <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${planInfo.bg} ${planInfo.color}`}>
                  {planInfo.label}
                </span>
              )}
            </div>
          </div>

          {/* 구분선 + 가입일 */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
            <span>가입일</span>
            <span>{createdAt}</span>
          </div>
        </div>

        {/* ── 등급 안내 ───────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs mb-3">나의 등급</p>
          <div className="flex items-center justify-between">
            <div>
              {roleLoading ? (
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-white font-medium">{PLAN_NAME[plan]}</p>
              )}
              <p className="text-white/40 text-xs mt-0.5">{PLAN_LIMIT[plan]}</p>
            </div>
            {plan === "free" && (
              <button
                disabled
                className="text-xs px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400/60 cursor-not-allowed"
              >
                프리미엄 준비중
              </button>
            )}
            {plan === "admin" && (
              <span className="text-xs px-4 py-2 rounded-xl bg-purple-400/15 border border-purple-400/30 text-purple-400 font-medium">
                관리자 계정
              </span>
            )}
          </div>

          {/* 등급 진행바 */}
          <div className="mt-4 flex gap-1">
            {["비회원", "회원", "프리미엄", "관리자"].map((g, i) => (
              <div key={g} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full mb-1.5 ${
                  i <= planIndex ? "bg-purple-500" : "bg-white/10"
                }`} />
                <p className={`text-[10px] ${
                  i === planIndex ? "text-purple-400 font-medium" : "text-white/25"
                }`}>{g}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI 사용 현황 ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs mb-3">오늘 AI 사용 현황</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "🌙", label: "꿈해몽",   used: 0, limit: 1 },
              { emoji: "🃏", label: "타로",     used: 0, limit: 1 },
              { emoji: "🔯", label: "사주",     used: 0, limit: 1 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <p className="text-lg mb-1">{item.emoji}</p>
                <p className="text-white/50 text-xs mb-1">{item.label}</p>
                <p className="text-white font-medium text-sm">
                  {item.used}
                  <span className="text-white/30 text-xs">/{item.limit}</span>
                </p>
                <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${(item.used / item.limit) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-3 text-center">
            * 사용 횟수는 Firestore 연동 후 실시간 반영됩니다
          </p>
        </div>

        {/* ── 빠른 이동 ───────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs mb-3">바로가기</p>
          <div className="flex gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <span className="text-xl">{link.emoji}</span>
                <span className="text-white/60 text-xs">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 계정 관리 ───────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <p className="text-white/40 text-xs px-5 pt-4 pb-2">계정 관리</p>
          <div className="divide-y divide-white/5">
            <button
              onClick={() => { setEditingNick(true); setNickError(null); }}
              className="w-full text-left px-5 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors flex items-center justify-between"
            >
              <span>닉네임 변경</span>
              <span className="text-white/30 text-xs">→</span>
            </button>
            <button
              disabled
              className="w-full text-left px-5 py-3 text-sm text-white/30 flex items-center justify-between cursor-not-allowed"
            >
              <span>비밀번호 변경</span>
              <span className="text-white/20 text-xs">준비중</span>
            </button>
            <button
              disabled
              className="w-full text-left px-5 py-3 text-sm text-red-400/40 flex items-center justify-between cursor-not-allowed"
            >
              <span>회원 탈퇴</span>
              <span className="text-white/20 text-xs">준비중</span>
            </button>
          </div>
        </div>

      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/10 text-white text-sm px-5 py-2.5 rounded-full shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
