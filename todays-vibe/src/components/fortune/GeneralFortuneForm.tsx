"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { type FortuneType, type GeneralFortuneInput } from "@/types/fortune";
import FortuneResult from "./FortuneResult";

interface Config {
  type: FortuneType;
  title: string;
  icon: string;
  questionLabel: string;
  questionPlaceholder: string;
}

interface Props {
  config: Config;
}

export default function GeneralFortuneForm({ config }: Props) {
  const { user } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus(config.type);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [question, setQuestion] = useState("");

  // 저장된 출생 정보 자동 불러오기
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!y || !m || !d) return;

    const input: GeneralFortuneInput = {
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      gender,
      question: question.trim() || undefined,
    };

    await submit(config.type, input);
  }

  if (result || isLoading) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        onReset={() => { reset(); setQuestion(""); }}
        title={`${config.title} 결과`}
        icon={config.icon}
      />
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">{config.icon}</span>
        <h1 className="text-white font-bold text-2xl">{config.title}</h1>
        <p className="text-white/50 text-sm mt-2">{config.questionLabel}</p>
      </div>

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
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
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

          {/* 상황/질문 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">
              상황 / 질문 <span className="text-white/30">(선택)</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={config.questionPlaceholder}
              className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
          }`}
        >
          {fortuneStatus?.exhausted
            ? `오늘 ${config.title}을 이미 이용했어요`
            : `${config.icon} ${config.title} 보기`}
        </button>
      </form>

      {/* 오늘 결과 (소진 시) */}
      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">오늘의 {config.title} 결과</span>
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
                __html: fortuneStatus.todayReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>'),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
