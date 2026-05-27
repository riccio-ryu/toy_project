/**
 * 스프라이트 시트에서 개별 카드를 잘라 보여주는 컴포넌트
 * 두 이미지 모두 6열 × 2행 구조
 */

// ─── 별자리 스프라이트 위치 (col, row) ──────────────────────────────
const ZODIAC_SPRITE: Record<string, [number, number]> = {
  aries:       [0, 0], taurus:    [1, 0], gemini:      [2, 0],
  cancer:      [3, 0], leo:       [4, 0], virgo:       [5, 0],
  libra:       [0, 1], scorpio:   [1, 1], sagittarius: [2, 1],
  capricorn:   [3, 1], aquarius:  [4, 1], pisces:      [5, 1],
};

// ─── 띠 스프라이트 위치 (col, row) ──────────────────────────────────
const CHINESE_SPRITE: Record<string, [number, number]> = {
  rat:     [0, 0], ox:      [1, 0], tiger:   [2, 0],
  rabbit:  [3, 0], dragon:  [4, 0], snake:   [5, 0],
  horse:   [0, 1], goat:    [1, 1], monkey:  [2, 1],
  rooster: [3, 1], dog:     [4, 1], pig:     [5, 1],
};

interface SpriteCardProps {
  type: "zodiac" | "chinese";
  id: string;
  className?: string;
}

export default function SpriteCard({ type, id, className = "" }: SpriteCardProps) {
  const spriteMap = type === "zodiac" ? ZODIAC_SPRITE : CHINESE_SPRITE;
  const imgSrc =
    type === "zodiac"
      ? "/images/zodiac/img_zodiac.png"
      : "/images/chinese-zodiac/img_zodiac_chinese.png";

  const [col, row] = spriteMap[id] ?? [0, 0];

  // 6열 2행 → background-size: 600% 200%
  // 각 칸의 위치: xPercent = col/5 * 100, yPercent = row * 100
  const xPercent = (col / 5) * 100;
  const yPercent = row * 100;

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        backgroundImage: `url('${imgSrc}')`,
        backgroundSize: "600% 200%",
        backgroundPosition: `${xPercent}% ${yPercent}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
