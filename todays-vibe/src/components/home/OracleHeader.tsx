"use client";

import { useState, useEffect } from "react";

const ORACLE_SETS = [
  { title: "달이 차오르는 밤", sub: "당신의 기운도 조용히 깨어납니다" },
  { title: "별이 오늘의 이름을 부르는 시간", sub: "흐름이 당신 곁에 머물고 있습니다" },
  { title: "보이지 않는 실이 오늘을 엮습니다", sub: "스치는 것들을 가볍게 여기지 마세요" },
  { title: "달빛이 닿는 곳에 기운이 열립니다", sub: "오늘, 무언가 달라집니다" },
  { title: "하늘이 오늘을 당신에게 건넵니다", sub: "이 기운, 그냥 지나치지 마세요" },
  { title: "인연의 기운이 오늘 조용히 흐릅니다", sub: "달의 뜻이 당신 곁에 와 있습니다" },
  { title: "어둠 속에서도 별은 당신을 기억합니다", sub: "오늘의 흐름에 몸을 맡겨보세요" },
  { title: "달이 기울 때마다 새로운 문이 열립니다", sub: "오늘이 당신에게 무언가를 건넵니다" },
  { title: "우주는 이미 당신의 오늘을 알고 있습니다", sub: "별빛 아래, 기운이 가장 강하게 흐릅니다" },
  { title: "고요한 밤, 기운이 당신에게 닿습니다", sub: "지나치는 것들 안에 답이 있습니다" },
  { title: "달이 차오를수록 기운도 차오릅니다", sub: "오늘의 실마리가 서서히 풀립니다" },
  { title: "별과 달이 오늘 하루를 조용히 읽습니다", sub: "당신만의 기운이 지금 깨어나고 있습니다" },
] as const;

export default function OracleHeader() {
  const [set, setSet] = useState<{ title: string; sub: string } | null>(null);

  useEffect(() => {
    setSet(ORACLE_SETS[Math.floor(Math.random() * ORACLE_SETS.length)]);
  }, []);

  if (!set) return (
    <div className="text-center mb-8 sm:mb-12">
      <p className="text-purple-400/70 text-xs font-semibold tracking-widest uppercase mb-3">✦ Today&apos;s Vibe ✦</p>
      <div className="h-8 sm:h-10 mb-2 sm:mb-3" />
      <div className="h-4 sm:h-5" />
    </div>
  );

  return (
    <div className="text-center mb-8 sm:mb-12">
      <p className="text-purple-400/70 text-xs font-semibold tracking-widest uppercase mb-3">✦ Today&apos;s Vibe ✦</p>
      <h1 className="oracle-breathe text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 leading-snug">
        {set.title}
      </h1>
      <p className="oracle-breathe text-purple-300/80 text-sm sm:text-base" style={{ animationDelay: "0.8s" }}>
        {set.sub}
      </p>
    </div>
  );
}
