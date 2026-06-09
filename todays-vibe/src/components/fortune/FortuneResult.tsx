"use client";

import AILoadingIndicator from "@/components/common/AILoadingIndicator";

interface FortuneResultProps {
  result: string;
  isLoading: boolean;
  onReset: () => void;
  title: string;
  icon: string;
  fortuneType?: "tarot" | "saju" | "dream" | "default";
}

// 마크다운 헤더(## 제목)를 간단하게 렌더링하는 파서
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      // ## 섹션 헤더
      nodes.push(
        <h2
          key={i}
          className="text-purple-300 font-bold text-base mt-6 mb-2 first:mt-0"
        >
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      // **굵은 텍스트** (단독 줄)
      nodes.push(
        <p key={i} className="text-white font-semibold text-sm my-1">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    } else if (line.startsWith("- ")) {
      // 리스트 항목
      nodes.push(
        <li key={i} className="text-white/80 text-sm ml-4 list-disc my-0.5">
          {line.replace("- ", "")}
        </li>
      );
    } else if (line.trim() === "") {
      // 빈 줄 — 단락 구분
      nodes.push(<div key={i} className="h-1" />);
    } else {
      // 일반 텍스트 (인라인 **bold** 처리)
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const inlineNodes = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="text-white font-semibold">
              {part.replace(/\*\*/g, "")}
            </strong>
          );
        }
        return part;
      });

      nodes.push(
        <p key={i} className="text-white/80 text-sm leading-relaxed">
          {inlineNodes}
        </p>
      );
    }
  }

  return nodes;
}

export default function FortuneResult({
  result,
  isLoading,
  onReset,
  title,
  icon,
  fortuneType = "default",
}: FortuneResultProps) {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{icon}</div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>

      {/* 결과 카드 */}
      <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-6 py-5 min-h-[200px]">
        {isLoading && result === "" ? (
          <AILoadingIndicator type={fortuneType} />
        ) : (
          <div>
            {parseMarkdown(result)}
            {/* 스트리밍 중 커서 */}
            {isLoading && (
              <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      {!isLoading && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
          >
            다시 해석하기
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title, text: result }).catch((e) => {
                  if (e?.name !== "AbortError") throw e;
                });
              } else {
                navigator.clipboard.writeText(result);
                alert("결과가 클립보드에 복사됐어요!");
              }
            }}
            className="flex-1 py-3 rounded-xl bg-purple-700/50 border border-purple-500/30 text-purple-200 text-sm font-medium hover:bg-purple-600/50 transition-colors"
          >
            📤 공유하기
          </button>
        </div>
      )}
    </div>
  );
}
