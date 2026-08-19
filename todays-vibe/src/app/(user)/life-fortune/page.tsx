"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { type LifeFortuneInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";

type CachedReading = { result: string; createdAt: string | null };

export default function LifeFortunePage() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const [cachedReading, setCachedReading] = useState<CachedReading | null>(null);
  const [cacheLoading, setCacheLoading] = useState(true);

  const [streamResult, setStreamResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");

  // 저장된 생년월일 불러오기
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/birth-info")
      .then((r) => r.json())
      .then((d) => {
        if (d.birthInfo) {
          setYear(String(d.birthInfo.year));
          setMonth(String(d.birthInfo.month));
          setDay(String(d.birthInfo.day));
          setGender(d.birthInfo.gender ?? "male");
        }
      })
      .catch(() => {});
  }, [user]);

  // 생년월일+성별이 채워지면 캐시 확인
  const y = parseInt(year);
  const m = parseInt(month);
  const d = parseInt(day);
  const valid = y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31;

  useEffect(() => {
    if (!user || !valid) { setCacheLoading(false); return; }
    setCacheLoading(true);
    fetch(`/api/fortune/life-fortune?y=${y}&mo=${m}&d=${d}&g=${gender}`)
      .then((r) => r.json())
      .then((data) => { if (data.reading) setCachedReading(data.reading); else setCachedReading(null); })
      .catch(() => setCachedReading(null))
      .finally(() => setCacheLoading(false));
  }, [user, y, m, d, gender, valid]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    const input: LifeFortuneInput = { birthYear: y, birthMonth: m, birthDay: d, gender };

    setIsLoading(true);
    setStreamResult("");
    setError(null);

    try {
      const res = await fetch("/api/fortune/life-fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `오류 (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        full += text;
        setStreamResult((prev) => prev + text);
      }

      setCachedReading({ result: full, createdAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [valid, y, m, d, gender]);

  if (cacheLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 스트리밍 중 또는 완료
  if (streamResult || isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <FortuneResult
          result={streamResult}
          isLoading={isLoading}
          onReset={() => { setStreamResult(""); setError(null); }}
          title="평생운세"
          icon=""
        />
      </div>
    );
  }

  // 캐시된 결과 표시
  if (cachedReading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-white font-bold text-2xl">평생운세</h1>
          <p className="text-white/50 text-sm mt-2">
            {y}년 {m}월 {d}일생의 운명 풀이
          </p>
        </div>

        <div className="rounded-2xl bg-purple-950/20 border border-purple-800/30 px-4 py-3 mb-5 flex items-center gap-2">
          <span className="text-purple-400 text-sm">·</span>
          <p className="text-purple-300/80 text-xs">
            이 생년월일의 평생운세가 저장되어 있습니다.
            {cachedReading.createdAt && (
              <span className="text-purple-400/50 ml-1">
                ({new Date(cachedReading.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })} 열람)
              </span>
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div
            className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: cachedReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>'),
            }}
          />
        </div>

        <button
          onClick={() => setCachedReading(null)}
          className="mt-4 w-full py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors"
        >
          다른 생년월일로 보기
        </button>
      </div>
    );
  }

  // 입력 폼
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-white font-bold text-2xl">평생운세</h1>
        <p className="text-white/50 text-sm mt-2">타고난 운명과 인생의 흐름을 AI로 풀어드립니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">

          {/* 생년월일 */}
          <div>
            <label className="block text-white/50 text-xs mb-2">생년월일 (양력)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="number" value={year} onChange={(e) => setYear(e.target.value)}
                  min={1900} max={currentYear} placeholder="1990" required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <p className="text-white/25 text-[10px] mt-1 text-center">년</p>
              </div>
              <div>
                <select value={month} onChange={(e) => setMonth(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">월</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mo) => (
                    <option key={mo} value={mo} className="bg-gray-900">{mo}월</option>
                  ))}
                </select>
                <p className="text-white/25 text-[10px] mt-1 text-center">월</p>
              </div>
              <div>
                <select value={day} onChange={(e) => setDay(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">일</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dd) => (
                    <option key={dd} value={dd} className="bg-gray-900">{dd}일</option>
                  ))}
                </select>
                <p className="text-white/25 text-[10px] mt-1 text-center">일</p>
              </div>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-white/50 text-xs mb-2">성별</label>
            <div className="flex gap-2">
              {([["male", "남성"], ["female", "여성"]] as const).map(([val, label]) => (
                <button key={val} type="button" onClick={() => setGender(val)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    gender === val
                      ? "bg-purple-600/70 border border-purple-500/50 text-purple-100"
                      : "bg-white/5 border border-white/10 text-white/40"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* 안내 */}
          <div className="rounded-xl bg-white/5 border border-white/5 px-4 py-3 space-y-1">
            <p className="text-white/40 text-xs">평생운세 이용 안내</p>
            <p className="text-white/25 text-xs">• 같은 생년월일+성별은 즉시 저장된 결과를 불러옵니다</p>
            <p className="text-white/25 text-xs">• 새 생년월일은 하루 1회 생성할 수 있습니다</p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button type="submit" disabled={!valid || cacheLoading}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            !valid
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:opacity-90"
          }`}
        >
          내 평생운세 보기
        </button>
      </form>
    </div>
  );
}
