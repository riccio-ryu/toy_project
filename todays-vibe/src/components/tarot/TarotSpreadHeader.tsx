"use client";

interface Props {
  cardCount: number;
  selectedCount: number;
  onReshuffle: () => void;
}

export default function TarotSpreadHeader({ cardCount, selectedCount, onReshuffle }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-white/60 text-sm">카드 {cardCount}장을 선택하세요</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onReshuffle}
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          🔀 다시 섞기
        </button>
        <span className="text-purple-300 font-semibold tabular-nums">
          {selectedCount}
          <span className="text-white/30 font-normal"> / {cardCount}</span>
        </span>
      </div>
    </div>
  );
}
