import { boldHighlight } from "@/lib/utils/format";

interface Props {
  label: string;
  todayReading: { result: string; createdAt: string | null };
  highlightColor?: string;
}

export default function TodayFortuneCard({ label, todayReading, highlightColor = "text-purple-300" }: Props) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">{label}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        {todayReading.createdAt && (
          <p className="text-white/30 text-xs mb-3 text-right">
            {new Date(todayReading.createdAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            열람
          </p>
        )}
        <div
          className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: boldHighlight(todayReading.result, highlightColor) }}
        />
      </div>
    </div>
  );
}
