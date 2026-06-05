"use client";

import { useEffect, useState } from "react";
import type { UserProvider } from "@/types/user";

// ── 타입 ──────────────────────────────────────────────────────────
interface Reading {
  id: string;
  type: string;
  input: Record<string, unknown>;
  resultPreview: string;
  isPublic: boolean;
  date: string;
  createdAt: string;
}
interface TodayUsage { menuId: string; count: number; }
interface UserDetail {
  profile: {
    uid: string; email: string; nickname: string; photoURL: string;
    plan: string; provider: UserProvider;
    createdAt: string; lastLoginAt: string;
  };
  readings: Reading[];
  todayUsage: TodayUsage[];
}

// ── 상수 ──────────────────────────────────────────────────────────
const FORTUNE_LABEL: Record<string, string> = {
  "tarot-3cards":       "타로 3장",
  "tarot-daily":        "오늘의 타로",
  "tarot-celtic":       "켈틱 크로스",
  "tarot-horseshoe":    "말굽 타로",
  "tarot-full-moon":    "보름달 타로",
  "tarot-tree-of-life": "생명나무 타로",
  dream:                "꿈해몽",
  saju:                 "사주풀이",
  "love-fortune":       "연애운",
  "wealth-fortune":     "재물운",
  "career-fortune":     "직업운",
  zodiac:               "별자리 운세",
  numerology:           "수비학",
  "love-compatibility": "궁합",
  "name-compatibility": "이름 궁합",
};

const FORTUNE_ICON: Record<string, string> = {
  "tarot-3cards": "🃏", "tarot-daily": "🎴", "tarot-celtic": "🔮",
  "tarot-horseshoe": "🐴", "tarot-full-moon": "🌕", "tarot-tree-of-life": "🌳",
  dream: "💭", saju: "📜", "love-fortune": "❤️", "wealth-fortune": "💰",
  "career-fortune": "💼", zodiac: "⭐", numerology: "🔢",
  "love-compatibility": "💑", "name-compatibility": "✍️",
};

const PLAN_STYLE: Record<string, { label: string; color: string }> = {
  free:    { label: "FREE",    color: "text-white/50" },
  premium: { label: "PREMIUM", color: "text-amber-400" },
  admin:   { label: "ADMIN",   color: "text-rose-400" },
};

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google", github: "GitHub", email: "이메일",
  kakao: "카카오", naver: "네이버", unknown: "기타",
};

// ── 헬퍼 ──────────────────────────────────────────────────────────
function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function formatDateTime(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function formatReadingDate(yyyymmdd: string) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0,4)}.${yyyymmdd.slice(4,6)}.${yyyymmdd.slice(6,8)}`;
}

function inputSummary(type: string, input: Record<string, unknown>): string {
  if (type.startsWith("tarot")) {
    const cards = input.cards as { id?: string; position?: string }[] | undefined;
    if (cards && Array.isArray(cards)) return cards.map(c => c.position ?? c.id ?? "").filter(Boolean).join(" · ");
    return "-";
  }
  if (type === "dream") {
    const d = input.dreamDescription as string | undefined;
    return d ? d.slice(0, 40) + (d.length > 40 ? "…" : "") : "-";
  }
  if (type === "saju") {
    const { birthYear, birthMonth, birthDay, gender } = input as Record<string, string|number>;
    return `${birthYear}.${String(birthMonth).padStart(2,"0")}.${String(birthDay).padStart(2,"0")} ${gender === "male" ? "남" : "여"}`;
  }
  if (type === "zodiac") return (input.sign as string) ?? "-";
  return JSON.stringify(input).slice(0, 40);
}

// ── 드로어 컴포넌트 ───────────────────────────────────────────────
export function UserDetailDrawer({
  uid,
  onClose,
}: {
  uid: string | null;
  onClose: () => void;
}) {
  const [data,    setData]    = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState<"history" | "today">("history");

  useEffect(() => {
    if (!uid) { setData(null); return; }
    setLoading(true);
    setData(null);
    setTab("history");
    fetch(`/api/admin/users/${uid}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uid]);

  const open = !!uid;

  return (
    <>
      {/* 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 드로어 패널 */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-[480px] bg-gray-950 border-l border-white/10 shadow-2xl flex flex-col
          transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h3 className="text-white font-bold text-base">회원 상세</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl transition-colors">✕</button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && data && (
          <div className="flex-1 overflow-y-auto">
            {/* ── 프로필 카드 ── */}
            <div className="px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                {data.profile.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.profile.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white text-lg font-bold">
                    {(data.profile.nickname || data.profile.email)[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold">{data.profile.nickname || "-"}</p>
                  <p className="text-white/50 text-sm">{data.profile.email}</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold ${(PLAN_STYLE[data.profile.plan] ?? PLAN_STYLE.free).color}`}>
                    {(PLAN_STYLE[data.profile.plan] ?? { label: data.profile.plan.toUpperCase() }).label}
                  </span>
                  <span className="text-white/30 text-xs">{PROVIDER_LABEL[data.profile.provider] ?? "기타"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  ["UID",       data.profile.uid],
                  ["가입일",    formatDate(data.profile.createdAt)],
                  ["최근 로그인", formatDateTime(data.profile.lastLoginAt)],
                  ["이용 횟수",  `총 ${data.readings.length}건`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-white/30 mb-0.5">{label}</p>
                    <p className="text-white/80 font-mono truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 탭 ── */}
            <div className="flex border-b border-white/10 shrink-0">
              {(["history", "today"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors
                    ${tab === t ? "text-purple-400 border-b-2 border-purple-400" : "text-white/40 hover:text-white/60"}`}
                >
                  {t === "history" ? `이용 히스토리 (${data.readings.length})` : `오늘 사용량 (${data.todayUsage.length})`}
                </button>
              ))}
            </div>

            {/* ── 이용 히스토리 탭 ── */}
            {tab === "history" && (
              <div className="divide-y divide-white/5">
                {data.readings.length === 0 ? (
                  <p className="px-6 py-12 text-center text-white/20 text-sm">이용 내역이 없습니다.</p>
                ) : (
                  data.readings.map((r) => (
                    <div key={r.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5 shrink-0">{FORTUNE_ICON[r.type] ?? "🔮"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-medium">
                              {FORTUNE_LABEL[r.type] ?? r.type}
                            </span>
                            {r.isPublic && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-400/15 border border-sky-400/30 text-sky-400">
                                공개
                              </span>
                            )}
                            <span className="ml-auto text-white/30 text-xs shrink-0">
                              {formatReadingDate(r.date)}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs truncate">
                            {inputSummary(r.type, r.input)}
                          </p>
                          {r.resultPreview && (
                            <p className="text-white/30 text-xs mt-1 line-clamp-2">
                              {r.resultPreview}…
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── 오늘 사용량 탭 ── */}
            {tab === "today" && (
              <div className="px-6 py-4">
                {data.todayUsage.length === 0 ? (
                  <p className="py-12 text-center text-white/20 text-sm">오늘 이용 내역이 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {data.todayUsage.map((u) => (
                      <div key={u.menuId} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{FORTUNE_ICON[u.menuId] ?? "🔮"}</span>
                          <span className="text-white text-sm">{FORTUNE_LABEL[u.menuId] ?? u.menuId}</span>
                        </div>
                        <span className="text-purple-400 font-bold text-sm">{u.count}회</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
