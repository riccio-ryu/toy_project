"use client";

import { useState, useEffect } from "react";
import BatchRunner from "./BatchRunner";
import FortuneViewer from "./FortuneViewer";

function useNowKST() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatNowKST(date: Date): string {
  const kst = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const yyyy = kst.getFullYear();
  const mm   = String(kst.getMonth() + 1).padStart(2, "0");
  const dd   = String(kst.getDate()).padStart(2, "0");
  const hh   = String(kst.getHours()).padStart(2, "0");
  const min  = String(kst.getMinutes()).padStart(2, "0");
  const ss   = String(kst.getSeconds()).padStart(2, "0");

  const d = new Date(kst);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const weekYear = d.getFullYear();
  const yearStart = new Date(weekYear, 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${yyyy}년 ${mm}월 ${dd}일 ${hh}:${min}:${ss} (${weekYear}, W${String(week).padStart(2, "0")}주)`;
}

type Tab = "runner" | "viewer";

export default function BatchPage() {
  const [tab, setTab] = useState<Tab>("runner");
  const now = useNowKST();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">운세 배치 관리</h2>
        <p className="mt-3 font-mono text-sm text-purple-300/80 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2 inline-block">
          {now ? formatNowKST(now) : "—"}
        </p>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {(["runner", "viewer"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            {t === "runner" ? "⚡ 배치 실행" : "📋 등록 현황"}
          </button>
        ))}
      </div>

      {tab === "runner" ? <BatchRunner /> : <FortuneViewer />}
    </div>
  );
}
