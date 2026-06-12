"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, ChevronDown, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { updateProfile } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseApp } from "@/lib/firebase/config";
import { uploadProfilePhoto } from "@/lib/firebase/storage";
import { validateNickname } from "@/lib/utils/nickname-validator";
import { HOUR_OPTIONS } from "@/lib/saju/calculator";

type BirthInfo = {
  year: number; month: number; day: number;
  hour: number; isLunar: boolean; gender: "male" | "female";
};

type Reading = {
  id: string;
  type: string;
  date: string;
  result: string;
  createdAt: string | null;
};

const READING_META: Record<string, { emoji: string; label: string }> = {
  saju:               { emoji: "📜", label: "사주팔자" },
  dream:              { emoji: "🌙", label: "꿈해몽" },
  "tarot-3cards":     { emoji: "🃏", label: "타로 3장" },
  "tarot-celtic":     { emoji: "🔮", label: "켈틱 크로스" },
  "tarot-horseshoe":  { emoji: "🔮", label: "말발굽" },
  "tarot-full-moon":  { emoji: "🌕", label: "보름달" },
  "tarot-tree-of-life": { emoji: "🌳", label: "생명의 나무" },
  zodiac:             { emoji: "✨", label: "별자리" },
  "chinese-zodiac":   { emoji: "🐉", label: "띠별 운세" },
};

// ─── 상수 ─────────────────────────────────────────────────────────
const PLAN_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "FREE",    color: "text-white/60",   bg: "bg-white/10" },
  premium: { label: "PREMIUM", color: "text-amber-400",  bg: "bg-amber-400/15 border border-amber-400/30" },
  admin:   { label: "ADMIN",   color: "text-purple-400", bg: "bg-purple-400/15 border border-purple-400/30" },
};

// 로그인 수단 표시 정보
const PROVIDER_INFO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  "password":   { label: "이메일",  icon: "✉️",  color: "text-blue-300",   bg: "bg-blue-400/10 border border-blue-400/20" },
  "google.com": { label: "Google",  icon: "G",   color: "text-red-300",    bg: "bg-red-400/10 border border-red-400/20" },
  "github.com": { label: "GitHub",  icon: "⌥",   color: "text-white/70",   bg: "bg-white/10 border border-white/20" },
  "naver.com":  { label: "네이버",  icon: "N",   color: "text-green-300",  bg: "bg-green-400/10 border border-green-400/20" },
  "kakao.com":  { label: "카카오",  icon: "K",   color: "text-yellow-300", bg: "bg-yellow-400/10 border border-yellow-400/20" },
};

const QUICK_LINKS = [
  { href: "/saju",           emoji: "📜", label: "사주팔자" },
  { href: "/zodiac",         emoji: "✨", label: "별자리 운세" },
  { href: "/chinese-zodiac", emoji: "🐉", label: "띠별 운세" },
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
  const searchParams = useSearchParams();

  const [nickname, setNickname] = useState("");
  const [nickError, setNickError] = useState<string | null>(null);
  const [editingNick, setEditingNick] = useState(false);
  const [nickSaving, setNickSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanType>("free");
  const [roleLoading, setRoleLoading] = useState(true);

  // 운세 기록
  const [readings, setReadings]         = useState<Reading[]>([]);
  const [readingsLoading, setReadingsLoading] = useState(true);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // 사용 현황
  const [usageData, setUsageData]       = useState<Record<string, number>>({});
  const [usageLoading, setUsageLoading] = useState(true);

  // 출생 정보
  const [birthInfo, setBirthInfo]       = useState<BirthInfo | null>(null);
  const [birthLoading, setBirthLoading] = useState(true);
  const [editingBirth, setEditingBirth] = useState(false);
  const [birthDraft, setBirthDraft]     = useState<BirthInfo>({
    year: 1990, month: 1, day: 1, hour: -1, isLunar: false, gender: "male",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const birthSectionRef = useRef<HTMLDivElement>(null);
  const [birthHighlight, setBirthHighlight] = useState(false);

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

  // 운세 기록 로드
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/readings?limit=20")
      .then((r) => r.json())
      .then((d) => {
        if (d.readings) setReadings(d.readings);
        else console.error("[readings]", d.error);
      })
      .catch(console.error)
      .finally(() => setReadingsLoading(false));
  }, [user]);

  // 사용 현황 로드
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/usage")
      .then((r) => r.json())
      .then((d) => { if (d.usage) setUsageData(d.usage); })
      .catch(() => {})
      .finally(() => setUsageLoading(false));
  }, [user]);

  // 출생 정보 로드
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/birth-info")
      .then((r) => r.json())
      .then((d) => {
        if (d.birthInfo) {
          setBirthInfo(d.birthInfo);
          setBirthDraft(d.birthInfo);
        }
      })
      .catch(() => {})
      .finally(() => setBirthLoading(false));
  }, [user]);

  // ?focus=birth 감지 — 출생 정보 섹션으로 스크롤 + 편집 모드 오픈 + 하이라이트
  useEffect(() => {
    if (birthLoading || searchParams.get("focus") !== "birth") return;
    setEditingBirth(true);
    setBirthHighlight(true);
    setTimeout(() => {
      birthSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    setTimeout(() => setBirthHighlight(false), 2000);
  }, [birthLoading, searchParams]);

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

  // ── 출생 정보 저장 ────────────────────────────────────────────
  async function handleBirthSave() {
    await fetch("/api/user/birth-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(birthDraft),
    });
    setBirthInfo(birthDraft);
    setEditingBirth(false);
    showToast("출생 정보가 저장되었어요 ✨");
  }

  async function handleBirthDelete() {
    await fetch("/api/user/birth-info", { method: "DELETE" });
    setBirthInfo(null);
    setBirthDraft({ year: 1990, month: 1, day: 1, hour: -1, isLunar: false, gender: "male" });
    setEditingBirth(false);
    showToast("출생 정보가 삭제되었어요");
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
          <ArrowLeft className="w-4 h-4" /> 홈
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
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 이메일 */}
              <p className="text-white/40 text-sm truncate">{user.email}</p>

              {/* 로그인 수단 */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(() => {
                  const providerIds = user.providerData.length > 0
                    ? user.providerData.map((p) => p.providerId)
                    : user.uid.startsWith("google:") ? ["google.com"]
                    : user.uid.startsWith("github:") ? ["github.com"]
                    : user.uid.startsWith("naver:") ? ["naver.com"]
                    : user.uid.startsWith("kakao:") ? ["kakao.com"]
                    : ["password"];
                  return providerIds.map((pid) => {
                    const info = PROVIDER_INFO[pid] ?? {
                      label: pid, icon: "🔗",
                      color: "text-white/50", bg: "bg-white/10 border border-white/20",
                    };
                    return (
                      <span key={pid} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${info.bg} ${info.color}`}>
                        <span className="text-[10px] leading-none">{info.icon}</span>
                        {info.label}
                      </span>
                    );
                  });
                })()}
              </div>

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
          {usageLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: "🌙", label: "꿈해몽", menuId: "dream" },
                { emoji: "🃏", label: "타로",   menuId: "tarot-3cards" },
                { emoji: "📜", label: "사주",   menuId: "saju" },
              ].map((item) => {
                const used = usageData[item.menuId] ?? 0;
                const limit = plan === "admin" ? Infinity : plan === "premium" ? 5 : 1;
                const pct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
                return (
                  <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-lg mb-1">{item.emoji}</p>
                    <p className="text-white/50 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-medium text-sm">
                      {used}
                      <span className="text-white/30 text-xs">
                        /{limit === Infinity ? "∞" : limit}
                      </span>
                    </p>
                    <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${used >= (limit as number) && limit !== Infinity ? "bg-red-500" : "bg-purple-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 출생 정보 ───────────────────────────────────────── */}
        <div
          ref={birthSectionRef}
          className={`rounded-2xl bg-white/5 border p-5 transition-all duration-500 ${
            birthHighlight
              ? "border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              : "border-white/10"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs">출생 정보</p>
            {!birthLoading && !editingBirth && (
              <button
                onClick={() => { setBirthDraft(birthInfo ?? birthDraft); setEditingBirth(true); }}
                className="text-white/30 text-xs hover:text-white/60 transition-colors"
              >
                {birthInfo ? "수정" : "+ 등록"}
              </button>
            )}
          </div>

          {birthLoading ? (
            <div className="h-8 bg-white/5 rounded-lg animate-pulse" />
          ) : editingBirth ? (
            <div className="space-y-3">
              {/* 양력/음력 */}
              <div className="flex gap-2">
                {(["양력", "음력"] as const).map((t, i) => (
                  <button key={t} type="button"
                    onClick={() => setBirthDraft((d) => ({ ...d, isLunar: i === 1 }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      birthDraft.isLunar === (i === 1) ? "bg-purple-600 text-white" : "bg-white/10 text-white/50"
                    }`}
                  >{t}</button>
                ))}
              </div>
              {/* 생년월일 */}
              <div className="grid grid-cols-3 gap-2">
                {/* 년도 */}
                <div>
                  <label className="block text-white/30 text-[10px] mb-1">년도</label>
                  <input
                    type="number"
                    min={1900}
                    max={2025}
                    value={birthDraft.year}
                    onChange={(e) => setBirthDraft((d) => ({ ...d, year: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
                {/* 월 */}
                <div>
                  <label className="block text-white/30 text-[10px] mb-1">월</label>
                  <select
                    value={birthDraft.month}
                    onChange={(e) => setBirthDraft((d) => ({ ...d, month: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 appearance-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m} className="bg-gray-900">{m}월</option>
                    ))}
                  </select>
                </div>
                {/* 일 */}
                <div>
                  <label className="block text-white/30 text-[10px] mb-1">일</label>
                  <select
                    value={birthDraft.day}
                    onChange={(e) => setBirthDraft((d) => ({ ...d, day: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 appearance-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-gray-900">{d}일</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* 태어난 시간 */}
              <div>
                <label className="block text-white/30 text-[10px] mb-1">태어난 시간</label>
                <select
                  value={birthDraft.hour}
                  onChange={(e) => setBirthDraft((d) => ({ ...d, hour: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 appearance-none"
                >
                  {HOUR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* 성별 */}
              <div className="flex gap-2">
                {([["male", "남성"], ["female", "여성"]] as const).map(([val, label]) => (
                  <button key={val} type="button"
                    onClick={() => setBirthDraft((d) => ({ ...d, gender: val }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      birthDraft.gender === val ? "bg-purple-600 text-white" : "bg-white/10 text-white/50"
                    }`}
                  >{label}</button>
                ))}
              </div>
              {/* 버튼 */}
              <div className="flex gap-2 pt-1">
                <button onClick={handleBirthSave}
                  className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors">
                  저장
                </button>
                <button onClick={() => setEditingBirth(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-white/50 text-xs font-semibold hover:bg-white/15 transition-colors">
                  취소
                </button>
                {birthInfo && (
                  <button onClick={handleBirthDelete}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors">
                    삭제
                  </button>
                )}
              </div>
            </div>
          ) : birthInfo ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: "생년월일", value: `${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일 (${birthInfo.isLunar ? "음력" : "양력"})` },
                { label: "태어난 시간", value: HOUR_OPTIONS.find(h => h.value === birthInfo.hour)?.label.split("(")[0] ?? "모름" },
                { label: "성별", value: birthInfo.gender === "male" ? "남성" : "여성" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/5 p-3">
                  <p className="text-white/30 text-[10px] mb-0.5">{label}</p>
                  <p className="text-white/80 text-xs font-medium">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/25 text-xs">
              출생 정보를 등록하면 사주팔자 등 운세를 볼 때 자동으로 불러옵니다.
            </p>
          )}
        </div>

        {/* ── 내 운세 기록 ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs">내 운세 기록</p>
            {readings.length > 0 && (
              <span className="text-white/20 text-xs">{readings.length}건</span>
            )}
          </div>
          {readingsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : readings.length === 0 ? (
            <p className="text-white/25 text-xs text-center py-4">
              아직 AI 운세를 이용한 기록이 없어요
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {readings.slice(0, visibleCount).map((r) => {
                  const meta = READING_META[r.type] ?? { emoji: "🔮", label: r.type };
                  const isExpanded = expandedId === r.id;
                  const dateStr = r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    : r.date
                      ? `${r.date.slice(0, 4)}.${r.date.slice(4, 6)}.${r.date.slice(6, 8)}`
                      : "";
                  return (
                    <div key={r.id} className="rounded-xl bg-white/5 border border-white/8 overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="text-base shrink-0">{meta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-medium">{meta.label}</p>
                          <p className="text-white/30 text-xs">{dateStr}</p>
                        </div>
                        <span className={`text-white/30 text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-white/5">
                          <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap">
                            {r.result}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {visibleCount < readings.length && (
                <button
                  onClick={() => setVisibleCount((c) => c + 5)}
                  className="mt-3 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/60 text-xs transition-colors"
                >
                  더보기 ({readings.length - visibleCount}건 남음)
                </button>
              )}
            </>
          )}
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
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
            {/* 이메일 로그인 사용자만 비밀번호 변경 노출 */}
            {user.providerData.some((p) => p.providerId === "password") ? (
              <button
                disabled
                className="w-full text-left px-5 py-3 text-sm text-white/30 flex items-center justify-between cursor-not-allowed"
              >
                <span>비밀번호 변경</span>
                <span className="text-white/20 text-xs">준비중</span>
              </button>
            ) : (
              <div className="px-5 py-3 text-sm text-white/20 flex items-center justify-between">
                <span>비밀번호 변경</span>
                <span className="text-white/15 text-xs">소셜 로그인 계정</span>
              </div>
            )}
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
