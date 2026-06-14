"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { type NumerologyInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";
import TodayFortuneCard from "@/components/common/TodayFortuneCard";

// ─── 수비학 계산 ──────────────────────────────────────────────────────────────

function reduceToSingleDigit(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((sum, d) => sum + parseInt(d), 0);
  }
  return n;
}

function calcLifePathNumber(year: number, month: number, day: number): number {
  const digits = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const sum = digits.split("").reduce((acc, d) => acc + parseInt(d), 0);
  return reduceToSingleDigit(sum);
}

const NUMBER_INFO: Record<number, { keyword: string; color: string }> = {
  1:  { keyword: "독립·리더십",        color: "from-red-500 to-orange-500" },
  2:  { keyword: "조화·협력",          color: "from-pink-500 to-rose-500" },
  3:  { keyword: "창의·소통",          color: "from-yellow-400 to-amber-500" },
  4:  { keyword: "안정·성실",          color: "from-green-500 to-emerald-600" },
  5:  { keyword: "자유·모험",          color: "from-cyan-500 to-blue-500" },
  6:  { keyword: "책임·가족",          color: "from-indigo-500 to-violet-500" },
  7:  { keyword: "지혜·탐구",          color: "from-purple-500 to-indigo-600" },
  8:  { keyword: "성취·풍요",          color: "from-amber-500 to-yellow-600" },
  9:  { keyword: "인도주의·완성",      color: "from-teal-500 to-cyan-600" },
  11: { keyword: "영감·직관 (마스터)", color: "from-violet-500 to-purple-600" },
  22: { keyword: "건축가·현실화 (마스터)", color: "from-blue-600 to-indigo-700" },
  33: { keyword: "치유·봉사 (마스터)", color: "from-rose-500 to-pink-600" },
};

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function NumerologyPage() {
  const { user } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("numerology");

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);
  const [saveBirth, setSaveBirth] = useState(false);
  const [savedInfo, setSavedInfo] = useState<{ year: number; month: number; day: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/birth-info")
      .then((r) => r.json())
      .then((d) => {
        if (d.birthInfo) {
          setSavedInfo(d.birthInfo);
          setYear(String(d.birthInfo.year));
          setMonth(String(d.birthInfo.month));
          setDay(String(d.birthInfo.day));
        }
      })
      .catch(() => {});
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!y || !m || !d) return;

    const lp = calcLifePathNumber(y, m, d);
    setLifePathNumber(lp);

    if (saveBirth && user) {
      setSaveStatus("saving");
      fetch("/api/user/birth-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: y, month: m, day: d }),
      })
        .then(() => { setSaveStatus("saved"); setSavedInfo({ year: y, month: m, day: d }); })
        .catch(() => setSaveStatus("idle"));
    }

    const input: NumerologyInput = { birthYear: y, birthMonth: m, birthDay: d };
    await submit("numerology", input);
  }

  function handleReset() {
    reset();
    setLifePathNumber(null);
    setSaveStatus("idle");
  }

  // ─── 결과 화면 ──────────────────────────────────────────────────────────────
  if (lifePathNumber !== null && (result || isLoading)) {
    const info = NUMBER_INFO[lifePathNumber] ?? { keyword: "", color: "from-blue-500 to-cyan-500" };

    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* 생명수 카드 */}
        <div className="text-center mb-8">
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20`}>
            <span className="text-white text-5xl font-bold">{lifePathNumber}</span>
          </div>
          <p className="text-white/50 text-xs mb-1">생명수 (Life Path Number)</p>
          <p className={`bg-gradient-to-r ${info.color} bg-clip-text text-transparent font-bold text-lg`}>
            {info.keyword}
          </p>
        </div>

        {saveStatus === "saved" && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-400/20 text-center">
            <p className="text-green-400 text-sm">출생 정보가 저장되었습니다</p>
          </div>
        )}

        <FortuneResult
          result={result}
          isLoading={isLoading}
          onReset={handleReset}
          title="생일 숫자 운세 결과"
          icon="🔢"
        />
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  // ─── 입력 폼 ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">🔢</span>
        <h1 className="text-white font-bold text-2xl">생일 숫자 운세</h1>
        <p className="text-white/50 text-sm mt-2">생년월일 숫자로 풀어보는 나의 인생 에너지</p>
      </div>

      {/* 저장된 정보 알림 */}
      {savedInfo && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-between">
          <p className="text-amber-300 text-sm">저장된 생년월일 정보가 있습니다</p>
          <button
            onClick={() => {
              setYear(""); setMonth(""); setDay(""); setSavedInfo(null);
              fetch("/api/user/birth-info", { method: "DELETE" }).catch(() => {});
            }}
            className="text-white/40 text-xs hover:text-white/70 transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">

          {/* 생년월일 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">생년월일</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-white/40 text-[10px] mb-1">년도</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={1900}
                  max={currentYear}
                  placeholder="1990"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/40 text-[10px] mb-1">월</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-blue-400 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">월</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m} className="bg-gray-900">{m}월</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/40 text-[10px] mb-1">일</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-blue-400 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">일</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-gray-900">{d}일</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 출생 정보 저장 토글 */}
          {user && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setSaveBirth((v) => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                  saveBirth ? "bg-blue-500" : "bg-white/20"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  saveBirth ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </div>
              <div>
                <p className="text-white/80 text-sm">출생 정보 저장</p>
                <p className="text-white/40 text-xs">다음에 자동으로 불러옵니다</p>
              </div>
            </label>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
          }`}
        >
          {fortuneStatus?.exhausted
            ? "오늘 생일 숫자 운세를 이미 이용했어요"
            : "🔢 내 생명수 알아보기"}
        </button>
      </form>

      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <TodayFortuneCard
          label="오늘의 생일 숫자 운세 결과"
          todayReading={fortuneStatus.todayReading}
          highlightColor="text-blue-300"
        />
      )}
    </div>
  );
}
