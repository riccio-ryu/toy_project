"use client";

import { useState } from "react";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { DreamInput } from "@/types/fortune";
import FortuneResult from "./FortuneResult";

const MOOD_OPTIONS = [
  { value: "행복함", label: "😊 행복함" },
  { value: "무서움", label: "😨 무서움" },
  { value: "슬픔", label: "😢 슬픔" },
  { value: "설렘", label: "🥰 설렘" },
  { value: "불안함", label: "😰 불안함" },
  { value: "신기함", label: "🤔 신기함" },
  { value: "평온함", label: "😌 평온함" },
];

export default function DreamForm() {
  const [dreamDescription, setDreamDescription] = useState("");
  const [mood, setMood] = useState<string>("");
  const { result, isLoading, error, submit, reset } = useFortuneStream();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamDescription.trim()) return;

    const input: DreamInput = {
      dreamDescription: dreamDescription.trim(),
      mood: mood || undefined,
    };

    await submit("dream", input);
  };

  const handleReset = () => {
    reset();
    setDreamDescription("");
    setMood("");
  };

  // 결과가 있거나 로딩 중이면 결과 화면 표시
  if (result || isLoading) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        onReset={handleReset}
        title="꿈해몽 결과"
        icon="💭"
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">💭</div>
        <h1 className="text-3xl font-bold text-white mb-2">꿈해몽</h1>
        <p className="text-purple-300 text-sm">
          꾼 꿈을 자세히 적어주세요. AI가 전통 해몽과 심리학적 관점으로 풀이해
          드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 꿈 내용 입력 */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            꿈 내용 <span className="text-purple-400">*</span>
          </label>
          <textarea
            value={dreamDescription}
            onChange={(e) => setDreamDescription(e.target.value)}
            placeholder="어떤 꿈을 꾸셨나요? 기억나는 내용을 최대한 자세히 적어주세요. (사람, 장소, 사건, 색깔 등)"
            rows={6}
            maxLength={1000}
            className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none transition-colors"
            required
          />
          <div className="text-right text-white/30 text-xs mt-1">
            {dreamDescription.length}/1000
          </div>
        </div>

        {/* 감정 선택 (선택) */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            꿈에서 느낀 감정{" "}
            <span className="text-white/40 font-normal">(선택)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setMood(mood === option.value ? "" : option.value)
                }
                className={`px-3 py-1.5 rounded-full text-sm transition-all duration-150 ${
                  mood === option.value
                    ? "bg-purple-600 text-white border border-purple-400"
                    : "bg-white/10 text-white/60 border border-white/20 hover:bg-white/15 hover:text-white/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!dreamDescription.trim() || isLoading}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-900/50"
        >
          ✨ 꿈 해석하기
        </button>
      </form>
    </div>
  );
}
