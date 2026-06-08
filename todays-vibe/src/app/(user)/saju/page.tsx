"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSaju, HOUR_OPTIONS, type BirthInput, type SajuResult } from "@/lib/saju/calculator";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import AILoadingIndicator from "@/components/common/AILoadingIndicator";

// ─── 사주 원국 테이블 ──────────────────────────────────────────────────
function SajuTable({ result }: { result: SajuResult }) {
  const pillars = [
    { label: "시주", pillar: result.hour, sub: "시간" },
    { label: "일주", pillar: result.day, sub: "나 자신", highlight: true },
    { label: "월주", pillar: result.month, sub: "부모·형제" },
    { label: "년주", pillar: result.year, sub: "조상·사회" },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-1 text-center mb-1">
        {pillars.map(({ label, sub }) => (
          <div key={label}>
            <p className="text-white/40 text-[10px]">{label}</p>
            <p className="text-white/25 text-[9px]">{sub}</p>
          </div>
        ))}
      </div>
      {/* 천간 행 */}
      <div className="grid grid-cols-4 gap-1 mb-1">
        {pillars.map(({ label, pillar, highlight }) => (
          <div
            key={label + "-stem"}
            className={`flex flex-col items-center justify-center rounded-lg py-3 ${
              highlight
                ? "bg-amber-500/20 border border-amber-400/40"
                : "bg-white/8 border border-white/10"
            }`}
          >
            {pillar ? (
              <>
                <span className="text-white text-2xl font-bold leading-none">{pillar.stem}</span>
                <span className="text-white/50 text-xs mt-1">{pillar.stemKo}</span>
                <span className="text-white/30 text-[10px]">{pillar.element}</span>
              </>
            ) : (
              <span className="text-white/20 text-sm">미상</span>
            )}
          </div>
        ))}
      </div>
      {/* 지지 행 */}
      <div className="grid grid-cols-4 gap-1">
        {pillars.map(({ label, pillar }) => (
          <div
            key={label + "-branch"}
            className="flex flex-col items-center justify-center rounded-lg py-3 bg-white/5 border border-white/8"
          >
            {pillar ? (
              <>
                <span className="text-white text-2xl font-bold leading-none">{pillar.branch}</span>
                <span className="text-white/50 text-xs mt-1">{pillar.branchKo}</span>
                {pillar.animal && (
                  <span className="text-white/30 text-[10px]">{pillar.animal}</span>
                )}
              </>
            ) : (
              <span className="text-white/20 text-sm">미상</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────
export default function SajuPage() {
  const { user } = useAuth();

  // 입력 상태
  const [year, setYear]     = useState("");
  const [month, setMonth]   = useState("");
  const [day, setDay]       = useState("");
  const [hour, setHour]     = useState(-1);
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [question, setQuestion] = useState("");

  // 저장 옵션
  const [saveBirth, setSaveBirth] = useState(false);
  const [savedInfo, setSavedInfo] = useState<BirthInput | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // 결과 상태
  const [result, setResult]         = useState<SajuResult | null>(null);
  const [interpretation, setInterp] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const interpRef = useRef<HTMLDivElement>(null);

  const { fortuneStatus, refreshFortuneStatus } = useFortuneStatus("saju");

  // 저장된 출생 정보 불러오기
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
          setHour(d.birthInfo.hour ?? -1);
          setIsLunar(d.birthInfo.isLunar ?? false);
          setGender(d.birthInfo.gender ?? "male");
        }
      })
      .catch(() => {});
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInterp("");
    setResult(null);

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (!y || !m || !d) { setError("생년월일을 입력해주세요."); return; }
    if (y < 1900 || y > 2025) { setError("1900~2025년 사이의 연도를 입력해주세요."); return; }

    const input: BirthInput = { year: y, month: m, day: d, hour, isLunar, gender };

    // 사주 계산
    let saju: SajuResult;
    try {
      saju = calculateSaju(input);
    } catch {
      setError("생년월일 계산 중 오류가 발생했습니다. 날짜를 확인해주세요.");
      return;
    }
    setResult(saju);

    // 저장 처리
    if (saveBirth && user) {
      setSaveStatus("saving");
      fetch("/api/user/birth-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then(() => { setSaveStatus("saved"); setSavedInfo(input); })
        .catch(() => setSaveStatus("idle"));
    }

    // AI 해석
    setLoading(true);
    try {
      const res = await fetch("/api/fortune/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: saju.summary, question: question || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setInterp(text);
        interpRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    } catch (err) {
      setError("AI 해석 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
      refreshFortuneStatus();
    }
  }

  function handleReset() {
    if (savedInfo) {
      setYear(String(savedInfo.year));
      setMonth(String(savedInfo.month));
      setDay(String(savedInfo.day));
      setHour(savedInfo.hour);
      setIsLunar(savedInfo.isLunar);
      setGender(savedInfo.gender);
    }
    setResult(null);
    setInterp("");
    setError("");
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">📜</span>
        <h1 className="text-white font-bold text-2xl">사주팔자</h1>
        <p className="text-white/50 text-sm mt-2">생년월일시로 풀어보는 나의 운명</p>
      </div>

      {/* 저장된 정보 알림 */}
      {savedInfo && !result && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-between">
          <p className="text-amber-300 text-sm">
            저장된 생년월일 정보가 있습니다
          </p>
          <button
            onClick={() => {
              setYear(""); setMonth(""); setDay(""); setHour(-1);
              setIsLunar(false); setGender("male"); setSavedInfo(null);
              fetch("/api/user/birth-info", { method: "DELETE" }).catch(() => {});
            }}
            className="text-white/40 text-xs hover:text-white/70 transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      {/* 입력 폼 */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">

            {/* 양력/음력 */}
            <div className="flex gap-2">
              {(["양력", "음력"] as const).map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setIsLunar(i === 1)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isLunar === (i === 1)
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-white/50 hover:bg-white/15"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-white/60 text-xs mb-2">생년월일</label>
              <div className="grid grid-cols-3 gap-2">
                {/* 년도 */}
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
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
                {/* 월 */}
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">월</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-400 transition-colors appearance-none"
                  >
                    <option value="" className="bg-gray-900 text-white/40">월</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m} className="bg-gray-900">{m}월</option>
                    ))}
                  </select>
                </div>
                {/* 일 */}
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">일</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-400 transition-colors appearance-none"
                  >
                    <option value="" className="bg-gray-900 text-white/40">일</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-gray-900">{d}일</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 태어난 시간 */}
            <div>
              <label className="block text-white/60 text-xs mb-2">태어난 시간</label>
              <select
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-400 transition-colors appearance-none"
              >
                {HOUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-white/60 text-xs mb-2">성별</label>
              <div className="flex gap-2">
                {([["male", "남성"], ["female", "여성"]] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGender(val)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      gender === val
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-white/50 hover:bg-white/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 질문 (선택) */}
            <div>
              <label className="block text-white/60 text-xs mb-2">궁금한 점 <span className="text-white/30">(선택)</span></label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 올해 직장운이 궁금해요"
                className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* 출생 정보 저장 (로그인 시) */}
            {user && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setSaveBirth((v) => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                    saveBirth ? "bg-purple-600" : "bg-white/20"
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
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
            }`}
          >
            {fortuneStatus?.exhausted ? "오늘 사주풀이를 이미 이용했어요" : "사주 풀이 보기"}
          </button>
        </form>
      )}

      {/* 오늘의 사주 결과 (사용량 소진 시) */}
      {fortuneStatus?.exhausted && fortuneStatus.todayReading && !result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">오늘의 사주 결과</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest">AI 사주 해석</h2>
              {fortuneStatus.todayReading.createdAt && (
                <span className="text-white/30 text-xs">
                  {new Date(fortuneStatus.todayReading.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 열람
                </span>
              )}
            </div>
            <div
              className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: fortuneStatus.todayReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>') }}
            />
          </div>
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className="space-y-6">
          {/* 사주 원국 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4 text-center">사주 원국</h2>
            <SajuTable result={result} />
            <div className="mt-4 text-center">
              <p className="text-white/50 text-xs">
                일간 <span className="text-amber-300 font-semibold">{result.dayMaster}({result.day.stemKo})</span>
                {" "}— {result.dayMasterElement}의 기운
              </p>
            </div>
          </div>

          {/* 저장 완료 알림 */}
          {saveStatus === "saved" && (
            <div className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-400/20 text-center">
              <p className="text-green-400 text-sm">출생 정보가 저장되었습니다</p>
            </div>
          )}

          {/* AI 해석 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">AI 사주 해석</h2>
            {loading && !interpretation && (
              <AILoadingIndicator type="saju" />
            )}
            {interpretation && (
              <div
                ref={interpRef}
                className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: interpretation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>') }}
              />
            )}
          </div>

          {/* 다시 보기 */}
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-semibold hover:bg-white/15 transition-colors"
          >
            다시 입력하기
          </button>
        </div>
      )}
    </div>
  );
}
