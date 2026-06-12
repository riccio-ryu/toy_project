"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { type NameFortuneInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";
import { ChevronRight } from "lucide-react";

export default function NameFortunePage() {
  const { user } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("name-fortune");

  const [name, setName] = useState("");
  const [showBirth, setShowBirth] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  // 저장된 생년월일 자동 불러오기
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/birth-info")
      .then((r) => r.json())
      .then((d) => {
        if (d.birthInfo) {
          setYear(String(d.birthInfo.year));
          setMonth(String(d.birthInfo.month));
          setDay(String(d.birthInfo.day));
        }
      })
      .catch(() => {});
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    const input: NameFortuneInput = {
      name: name.trim(),
      birthYear: y || undefined,
      birthMonth: m || undefined,
      birthDay: d || undefined,
    };
    await submit("name-fortune", input);
  }

  if (result || isLoading) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        onReset={reset}
        title="성명학 결과"
        icon="✍️"
      />
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">✍️</span>
        <h1 className="text-white font-bold text-2xl">성명학</h1>
        <p className="text-white/50 text-sm mt-2">이름 획수와 음양오행으로 풀어보는 나의 운세</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">

          {/* 이름 입력 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김민준"
              maxLength={6}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-xl text-center placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors tracking-widest"
            />
            <p className="text-white/30 text-xs mt-1.5 text-center">
              한국어 이름을 입력해주세요 (성+이름)
            </p>
          </div>

          {/* 생년월일 토글 */}
          <div>
            <button
              type="button"
              onClick={() => setShowBirth((v) => !v)}
              className="flex items-center gap-2 text-white/50 text-xs hover:text-white/70 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${showBirth ? "rotate-90" : ""}`} />
              생년월일 추가 <span className="text-white/30">(선택 — 더 정확한 분석)</span>
            </button>

            {showBirth && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">년도</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min={1900}
                    max={currentYear}
                    placeholder="1990"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">월</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors appearance-none"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors appearance-none"
                  >
                    <option value="" className="bg-gray-900 text-white/40">일</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-gray-900">{d}일</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:opacity-90"
          }`}
        >
          {fortuneStatus?.exhausted
            ? "오늘 성명학 분석을 이미 이용했어요"
            : "✍️ 내 이름 분석하기"}
        </button>
      </form>

      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">오늘의 성명학 결과</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            {fortuneStatus.todayReading.createdAt && (
              <p className="text-white/30 text-xs mb-3 text-right">
                {new Date(fortuneStatus.todayReading.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 열람
              </p>
            )}
            <div
              className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: fortuneStatus.todayReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>'),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
