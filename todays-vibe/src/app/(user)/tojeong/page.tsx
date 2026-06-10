"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { type TojeongInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";

const STEM_LABELS = ["", "一", "二", "三", "四", "五"];
const MONTH_LABELS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const DAY_LABELS = ["", "一", "二", "三", "四", "五", "六"];

function calcTojeongNumbers(year: number, month: number, day: number) {
  const stemIdx = ((year - 4) % 10 + 10) % 10;
  const upper = Math.floor(stemIdx / 2) + 1;
  const middle = month;
  const lower = Math.min(Math.ceil(day / 5), 6);
  return { upper, middle, lower };
}

type AnnualReading = { result: string; createdAt: string | null; targetYear: number };

export default function TojeongPage() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  // 연간 캐시
  const [annualReading, setAnnualReading] = useState<AnnualReading | null>(null);
  const [cacheLoading, setCacheLoading] = useState(true);

  // 스트리밍 상태
  const [streamResult, setStreamResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 입력값
  const [isLunar, setIsLunar] = useState(true);
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

  // 연간 캐시 조회
  useEffect(() => {
    if (!user) { setCacheLoading(false); return; }
    fetch(`/api/fortune/tojeong?year=${currentYear}`)
      .then((r) => r.json())
      .then((d) => { if (d.reading) setAnnualReading(d.reading); })
      .catch(() => {})
      .finally(() => setCacheLoading(false));
  }, [user, currentYear]);

  const y = parseInt(year);
  const m = parseInt(month);
  const d = parseInt(day);
  const valid = y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 30;
  const nums = valid ? calcTojeongNumbers(y, m, d) : null;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    const input: TojeongInput = {
      lunarYear: y, lunarMonth: m, lunarDay: d,
      isLunar, gender, targetYear: currentYear,
    };

    setIsLoading(true);
    setStreamResult("");
    setError(null);

    try {
      const res = await fetch("/api/fortune/tojeong", {
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

      setAnnualReading({ result: full, createdAt: new Date().toISOString(), targetYear: currentYear });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [valid, y, m, d, isLunar, gender, currentYear]);

  // 로딩 중
  if (cacheLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 스트리밍 중 또는 완료
  if (streamResult || isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        {nums && <HexBadge nums={nums} />}
        <FortuneResult
          result={streamResult}
          isLoading={isLoading}
          onReset={() => { setStreamResult(""); setError(null); }}
          title="토정비결 풀이"
          icon="📿"
        />
      </div>
    );
  }

  // 연간 캐시 결과 표시
  if (annualReading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">📿</span>
          <h1 className="text-white font-bold text-2xl">토정비결</h1>
          <p className="text-white/50 text-sm mt-2">{currentYear}년 한 해 운세</p>
        </div>

        <div className="rounded-2xl bg-amber-950/20 border border-amber-800/30 px-4 py-3 mb-5 flex items-center gap-2">
          <span className="text-amber-400 text-sm">📿</span>
          <p className="text-amber-300/80 text-xs">
            {currentYear}년 토정비결을 이미 열람하셨습니다.
            {annualReading.createdAt && (
              <span className="text-amber-400/50 ml-1">
                ({new Date(annualReading.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 열람)
              </span>
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div
            className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: annualReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>'),
            }}
          />
        </div>
      </div>
    );
  }

  // 입력 폼
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">📿</span>
        <h1 className="text-white font-bold text-2xl">토정비결</h1>
        <p className="text-white/50 text-sm mt-2">음력 생년월일로 풀어보는 {currentYear}년 한 해 운세</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">

          {/* 음력/양력 선택 */}
          <div className="flex gap-2">
            {(["음력", "양력"] as const).map((t, i) => (
              <button key={t} type="button" onClick={() => setIsLunar(i === 0)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isLunar === (i === 0)
                    ? "bg-amber-600/70 border border-amber-500/50 text-amber-100"
                    : "bg-white/5 border border-white/10 text-white/40"
                }`}
              >{t}</button>
            ))}
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-white/50 text-xs mb-2">
              생년월일 <span className="text-white/30">({isLunar ? "음력" : "양력"})</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                  min={1900} max={currentYear} placeholder="1990" required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-white/25 text-[10px] mt-1 text-center">년</p>
              </div>
              <div>
                <select value={month} onChange={(e) => setMonth(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none"
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
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">일</option>
                  {Array.from({ length: isLunar ? 30 : 31 }, (_, i) => i + 1).map((dd) => (
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
                      ? "bg-amber-600/70 border border-amber-500/50 text-amber-100"
                      : "bg-white/5 border border-white/10 text-white/40"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* 괘수 미리보기 */}
          {nums && <HexBadge nums={nums} />}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button type="submit" disabled={!valid}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            !valid
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-700 to-yellow-700 text-white hover:opacity-90"
          }`}
        >
          📿 {currentYear}년 토정비결 보기
        </button>

        <p className="text-white/25 text-xs text-center">
          토정비결은 연 1회 열람할 수 있으며, 한 번 본 결과는 언제든 다시 확인할 수 있어요
        </p>
      </form>
    </div>
  );
}

function HexBadge({ nums }: { nums: { upper: number; middle: number; lower: number } }) {
  return (
    <div className="rounded-xl bg-amber-950/30 border border-amber-800/30 p-4">
      <p className="text-amber-400/60 text-[10px] text-center mb-3">괘수(卦數)</p>
      <div className="flex items-center justify-center gap-4">
        {[
          { label: "上", chinese: STEM_LABELS[nums.upper], desc: "상책수" },
          { label: "·", chinese: "", desc: "" },
          { label: "中", chinese: MONTH_LABELS[nums.middle], desc: "중책수" },
          { label: "·", chinese: "", desc: "" },
          { label: "下", chinese: DAY_LABELS[nums.lower], desc: "하책수" },
        ].map(({ label, chinese, desc }, i) =>
          label === "·" ? (
            <span key={i} className="text-amber-700/50 text-lg">·</span>
          ) : (
            <div key={label} className="text-center">
              <div className="w-14 h-14 rounded-lg bg-amber-900/40 border border-amber-700/30 flex flex-col items-center justify-center">
                <span className="text-amber-400/50 text-[9px]">{label}</span>
                <span className="text-amber-200 text-xl font-bold leading-tight">{chinese}</span>
              </div>
              <p className="text-amber-600/60 text-[9px] mt-1">{desc}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
