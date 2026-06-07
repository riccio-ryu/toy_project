"use client";

type TodayReading = { result: string; createdAt: string | null } | null;

type Props = { todayReading: TodayReading };

export default function TarotTodayResult({ todayReading }: Props) {
  if (!todayReading) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">오늘의 타로 결과</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/40 text-xs">AI 카드 해석</p>
          {todayReading.createdAt && (
            <span className="text-white/30 text-xs">
              {new Date(todayReading.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 열람
            </span>
          )}
        </div>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
          {todayReading.result}
        </p>
      </div>
    </div>
  );
}
