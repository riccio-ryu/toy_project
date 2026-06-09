"use client";

import { useState } from "react";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { type FortuneType, type LoveCompatibilityInput } from "@/types/fortune";
import FortuneResult from "./FortuneResult";

interface Config {
  type: FortuneType;
  title: string;
  icon: string;
  gradient: string;
  person2Label: string;
}

interface Props {
  config: Config;
}

const CURRENT_YEAR = new Date().getFullYear();

function BirthInputGroup({
  label,
  year, month, day, gender,
  onYear, onMonth, onDay, onGender,
  accentClass,
}: {
  label: string;
  year: string; month: string; day: string; gender: "male" | "female";
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
  onDay: (v: string) => void;
  onGender: (v: "male" | "female") => void;
  accentClass: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
      <p className="text-white/60 text-xs font-semibold">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-white/40 text-[10px] mb-1">년도</label>
          <input
            type="number"
            value={year}
            onChange={(e) => onYear(e.target.value)}
            min={1900}
            max={CURRENT_YEAR}
            placeholder="1990"
            required
            className={`w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none ${accentClass} transition-colors`}
          />
        </div>
        <div>
          <label className="block text-white/40 text-[10px] mb-1">월</label>
          <select
            value={month}
            onChange={(e) => onMonth(e.target.value)}
            required
            className={`w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none ${accentClass} transition-colors appearance-none`}
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
            onChange={(e) => onDay(e.target.value)}
            required
            className={`w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none ${accentClass} transition-colors appearance-none`}
          >
            <option value="" className="bg-gray-900 text-white/40">일</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d} className="bg-gray-900">{d}일</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        {([["male", "남성"], ["female", "여성"]] as const).map(([val, lbl]) => (
          <button
            key={val}
            type="button"
            onClick={() => onGender(val)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              gender === val ? "bg-purple-600 text-white" : "bg-white/10 text-white/50 hover:bg-white/15"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CompatibilityBirthForm({ config }: Props) {
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus(config.type);

  const [p1Year, setP1Year] = useState("");
  const [p1Month, setP1Month] = useState("");
  const [p1Day, setP1Day] = useState("");
  const [p1Gender, setP1Gender] = useState<"male" | "female">("male");

  const [p2Year, setP2Year] = useState("");
  const [p2Month, setP2Month] = useState("");
  const [p2Day, setP2Day] = useState("");
  const [p2Gender, setP2Gender] = useState<"male" | "female">("female");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y1 = parseInt(p1Year), m1 = parseInt(p1Month), d1 = parseInt(p1Day);
    const y2 = parseInt(p2Year), m2 = parseInt(p2Month), d2 = parseInt(p2Day);
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return;

    const pad = (n: number) => String(n).padStart(2, "0");
    const input: LoveCompatibilityInput = {
      person1BirthDate: `${y1}-${pad(m1)}-${pad(d1)}`,
      person2BirthDate: `${y2}-${pad(m2)}-${pad(d2)}`,
      person1Gender: p1Gender,
      person2Gender: p2Gender,
    };
    await submit(config.type, input);
  }

  if (result || isLoading) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        onReset={reset}
        title={`${config.title} 결과`}
        icon={config.icon}
      />
    );
  }

  const accentClass = "focus:border-purple-400";

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">{config.icon}</span>
        <h1 className="text-white font-bold text-2xl">{config.title}</h1>
        <p className="text-white/50 text-sm mt-2">두 사람의 생년월일로 풀어보는 사주 궁합</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <BirthInputGroup
          label="나"
          year={p1Year} month={p1Month} day={p1Day} gender={p1Gender}
          onYear={setP1Year} onMonth={setP1Month} onDay={setP1Day} onGender={setP1Gender}
          accentClass={accentClass}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <BirthInputGroup
          label={config.person2Label}
          year={p2Year} month={p2Month} day={p2Day} gender={p2Gender}
          onYear={setP2Year} onMonth={setP2Month} onDay={setP2Day} onGender={setP2Gender}
          accentClass={accentClass}
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
            fortuneStatus?.exhausted
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : `bg-gradient-to-r ${config.gradient} text-white hover:opacity-90`
          }`}
        >
          {fortuneStatus?.exhausted
            ? `오늘 ${config.title}을 이미 이용했어요`
            : `${config.icon} ${config.title} 보기`}
        </button>
      </form>

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
