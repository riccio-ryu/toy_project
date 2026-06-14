"use client";

import { useState, useCallback } from "react";

// ── 컬렉션 메타 ────────────────────────────────────────────────────
const COLLECTIONS = [
  { id: "zodiac_weekly",          label: "별자리 주간", icon: "⭐", period: "weekly"  },
  { id: "chinese_zodiac_weekly",  label: "띠 주간",     icon: "🐉", period: "weekly"  },
  { id: "zodiac_monthly",         label: "별자리 월간", icon: "🌙", period: "monthly" },
  { id: "chinese_zodiac_monthly", label: "띠 월간",     icon: "🗓️", period: "monthly" },
  { id: "zodiac_yearly",          label: "별자리 연간", icon: "✨", period: "yearly"  },
  { id: "chinese_zodiac_yearly",  label: "띠 연간",     icon: "🎯", period: "yearly"  },
] as const;

type CollectionId = (typeof COLLECTIONS)[number]["id"];

interface DocMeta {
  id: string;
  signCount: number;
  generatedAt: string | null;
}

interface SignData {
  summary?: string;
  content?: string;
  weekStart?: string;
  weekEnd?: string;
  monthKey?: string;
  yearKey?: string;
  weekKey?: string;
  lucky?: { color: string; number: number; keyword: string };
  [key: string]: unknown;
}

// ── 문서 ID에서 사람이 읽기 쉬운 레이블 추출 ─────────────────────
function docLabel(id: string): string {
  // zw_2026-w-24 → 2026 W24주
  const wMatch = id.match(/(\d{4})-w-(\d+)/);
  if (wMatch) return `${wMatch[1]} W${wMatch[2]}주`;
  // zm_2026-m-06 → 2026년 6월
  const mMatch = id.match(/(\d{4})-m-(\d+)/);
  if (mMatch) return `${mMatch[1]}년 ${parseInt(mMatch[2]!)}월`;
  // zy_2026 / czy_2026 → 2026년
  const yMatch = id.match(/(\d{4})$/);
  if (yMatch) return `${yMatch[1]}년`;
  return id;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── 단일 컬렉션 패널 ──────────────────────────────────────────────
function CollectionPanel({ colId, label, icon }: { colId: CollectionId; label: string; icon: string }) {
  const [docs,        setDocs]        = useState<DocMeta[] | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [detail,      setDetail]      = useState<Record<string, SignData> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/fortune-docs?collection=${colId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "조회 실패");
      setDocs(data.docs ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [colId]);

  async function toggleDetail(docId: string) {
    if (expandedId === docId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(docId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/fortune-docs?collection=${colId}&docId=${docId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetail(data.doc.data as Record<string, SignData>);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm(`"${docLabel(docId)}" 운세를 삭제할까요?\n복구할 수 없습니다.`)) return;
    setDeleting(docId);
    try {
      const res = await fetch("/api/admin/fortune-docs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: colId, docId }),
      });
      if (!res.ok) throw new Error("삭제 실패");
      setDocs((prev) => prev?.filter((d) => d.id !== docId) ?? null);
      if (expandedId === docId) { setExpandedId(null); setDetail(null); }
    } catch (e) {
      alert(String(e));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-white font-semibold text-sm">{label}</span>
          {docs !== null && (
            <span className="text-white/30 text-xs ml-1">{docs.length}개</span>
          )}
        </div>
        <button
          onClick={docs === null ? load : () => { setDocs(null); setExpandedId(null); setDetail(null); }}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 text-xs transition-colors disabled:opacity-40"
        >
          {loading ? "로딩 중..." : docs === null ? "불러오기" : "닫기"}
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <p className="px-5 py-3 text-red-400 text-xs">{error}</p>
      )}

      {/* 문서 목록 */}
      {docs !== null && (
        <div>
          {docs.length === 0 ? (
            <p className="px-5 py-6 text-white/20 text-sm text-center">등록된 운세가 없습니다.</p>
          ) : (
            docs.map((doc) => (
              <div key={doc.id} className="border-b border-white/5 last:border-0">
                {/* 문서 행 */}
                <div className="flex items-center gap-3 px-5 py-3">
                  <button
                    onClick={() => toggleDetail(doc.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <span className={`text-xs transition-transform ${expandedId === doc.id ? "rotate-90" : ""} text-white/30`}>▶</span>
                    <div>
                      <p className="text-white text-sm font-medium">{docLabel(doc.id)}</p>
                      <p className="text-white/30 text-xs font-mono">{doc.id}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-4 mr-2">
                      <span className="text-white/30 text-xs">{doc.signCount}개 사인</span>
                      <span className="text-white/20 text-xs">{formatDate(doc.generatedAt)}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={!!deleting}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs transition-colors disabled:opacity-40 shrink-0"
                  >
                    {deleting === doc.id ? "삭제 중..." : "삭제"}
                  </button>
                </div>

                {/* 상세 펼치기 */}
                {expandedId === doc.id && (
                  <div className="bg-black/20 px-5 py-4 border-t border-white/5">
                    {detailLoading ? (
                      <div className="flex items-center gap-2 text-white/30 text-xs">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                        내용 로딩 중...
                      </div>
                    ) : detail ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(detail).map(([sign, data]) => (
                          <div key={sign} className="bg-white/5 rounded-lg p-3">
                            <p className="text-white/70 text-xs font-bold mb-1 capitalize">{sign}</p>
                            <p className="text-white/40 text-xs leading-relaxed line-clamp-3">
                              {data.summary ?? data.content ?? "-"}
                            </p>
                            {data.lucky && (
                              <p className="text-purple-400/60 text-xs mt-1">
                                🍀 {data.lucky.color} · {data.lucky.number} · {data.lucky.keyword}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/20 text-xs">내용을 불러올 수 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function FortuneViewer() {
  return (
    <div className="space-y-4">
      {COLLECTIONS.map((col) => (
        <CollectionPanel
          key={col.id}
          colId={col.id}
          label={col.label}
          icon={col.icon}
        />
      ))}
    </div>
  );
}
