"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { drawSangaji, GRADE_INFO, type SangajiEntry } from "@/data/sangaji";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import FortuneResult from "@/components/fortune/FortuneResult";

// 50개 산가지 — 컨테이너 168px, 벽에서 10px 안쪽 → 최대 ±74px
const STICK_COUNT = 50;
const CONTAINER_W = 168;
const CONTAINER_H = 224;
const STICK_MARGIN = 10; // 벽 안쪽 여유
const MAX_X = CONTAINER_W / 2 - STICK_MARGIN; // 74px
const STICK_BOTTOM_OFFSET = 20; // 통 밑면에서 뜨는 높이

const STICK_BASES = Array.from({ length: STICK_COUNT }, (_, i) => {
  const t = i / (STICK_COUNT - 1);
  const baseX = -MAX_X + t * (MAX_X * 2);
  const jitter = [0.4, -0.3, 0.3, -0.4, 0.2, -0.3, 0.4, -0.2, 0.3, -0.1][i % 10];
  return {
    x: baseX + jitter,
    baseRotate: (i % 9 - 4) * 0.6,
    height: 285 + (i % 5) * 5, // 285~305px
    colorIdx: i % 3,
  };
});

// 대나무/상아 색상 3가지
const BAMBOO = [
  "linear-gradient(to right, #f4e8c1 0%, #dfc87a 40%, #c8a840 70%, #b09030 100%)",
  "linear-gradient(to right, #ede0a0 0%, #d4b85a 40%, #c0a030 70%, #a87820 100%)",
  "linear-gradient(to right, #f0e4b0 0%, #dac060 40%, #c4a438 70%, #aa8428 100%)",
];
const BAMBOO_HOVER =
  "linear-gradient(to right, #fef9e0 0%, #fde68a 40%, #fbbf24 70%, #d97706 100%)";
const BAMBOO_PICKED =
  "linear-gradient(to right, #fef3c7 0%, #fcd34d 40%, #f59e0b 70%, #d97706 100%)";

type ShakeFrames = Array<{ x: number[]; y: number[]; rotate: number[] }>;
type LayoutOffset = { x: number; rotate: number };
type Phase = "idle" | "shaking" | "ready" | "drawing" | "drawn" | "ai";

// 흔들기 후 새 안착 위치 생성 — base.x 기준 ±12px 이동, 컨테이너 내 클램프
function makeNewLayout(current: LayoutOffset[]): LayoutOffset[] {
  return STICK_BASES.map((base, i) => {
    const rawX = current[i].x + (Math.random() - 0.5) * 24;
    const clampedX = Math.max(-MAX_X - 1 - base.x, Math.min(MAX_X - 1 - base.x, rawX));
    return { x: clampedX, rotate: (Math.random() - 0.5) * 8 };
  });
}

function GradeTag({ grade }: { grade: SangajiEntry["grade"] }) {
  const cls: Record<SangajiEntry["grade"], string> = {
    대길: "bg-yellow-500/20 border-yellow-400/60 text-yellow-300",
    길: "bg-green-500/20 border-green-400/60 text-green-300",
    중길: "bg-lime-500/20 border-lime-400/60 text-lime-300",
    소길: "bg-emerald-500/20 border-emerald-400/60 text-emerald-300",
    평: "bg-slate-500/20 border-slate-400/60 text-slate-300",
    흉: "bg-orange-500/20 border-orange-400/60 text-orange-300",
    대흉: "bg-red-500/20 border-red-400/60 text-red-300",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${cls[grade]}`}>
      {GRADE_INFO[grade].label}
    </span>
  );
}

const GRADE_GRADIENT: Record<SangajiEntry["grade"], string> = {
  대길: "from-yellow-600 to-amber-500",
  길: "from-green-600 to-emerald-500",
  중길: "from-lime-600 to-green-500",
  소길: "from-emerald-700 to-teal-600",
  평: "from-slate-600 to-gray-500",
  흉: "from-orange-700 to-red-600",
  대흉: "from-red-800 to-red-600",
};

export default function SangajiPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [drawn, setDrawn] = useState<SangajiEntry | null>(null);
  const [question, setQuestion] = useState("");
  const [shakeCount, setShakeCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [pickInfo, setPickInfo] = useState<{ idx: number; rotate: number } | null>(null);
  const [layoutOffsets, setLayoutOffsets] = useState<LayoutOffset[]>(() =>
    STICK_BASES.map(() => ({ x: 0, rotate: 0 }))
  );
  const [shakeFrames, setShakeFrames] = useState<ShakeFrames>(() =>
    STICK_BASES.map((b) => ({ x: [0], y: [0], rotate: [b.baseRotate] }))
  );

  const { fortuneStatus } = useFortuneStatus("sangaji");
  const { result, isLoading, error, submit, reset: resetStream } = useFortuneStream();

  function handleShake() {
    if (isAnimating) return;
    setIsAnimating(true);
    setHoverIdx(null);
    setPhase("shaking");

    // 1) 새 안착 위치 미리 계산
    const newLayout = makeNewLayout(layoutOffsets);

    // 2) 흔들기 키프레임: 현재 위치 출발 → 좌우상하 랜덤 → 새 위치 착지
    const frames: ShakeFrames = STICK_BASES.map((base, i) => {
      const r = Math.random;
      const cx = layoutOffsets[i].x;
      const cr = base.baseRotate + layoutOffsets[i].rotate;
      const nx = newLayout[i].x;
      const nr = base.baseRotate + newLayout[i].rotate;
      return {
        x: [cx, cx + (r() - 0.5) * 1.5, cx + (r() - 0.5) * 2, cx + (r() - 0.5) * 1.5, nx],
        y: [0, -(r() * 10), r() * 12, -(r() * 7), 0],
        rotate: [cr, cr + (r() - 0.5) * 7, cr + (r() - 0.5) * 10, cr + (r() - 0.5) * 6, nr],
      };
    });
    setShakeFrames(frames);

    setTimeout(() => {
      setIsAnimating(false);
      setShakeCount((c) => c + 1);
      setLayoutOffsets(newLayout); // 새 위치로 안착
      setPhase("ready");
    }, 1100);
  }

  function pickStick(idx: number) {
    if (phase !== "ready" || isAnimating) return;
    const rotate = idx % 2 === 0 ? 11 : -13;
    setPickInfo({ idx, rotate });
    setHoverIdx(null);
    setPhase("drawing");
    setTimeout(() => {
      setDrawn(drawSangaji());
      setPhase("drawn");
    }, 900);
  }

  function handleAreaClick(e: React.MouseEvent<HTMLDivElement>) {
    if (phase !== "ready" || isAnimating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    let nearestIdx = 0;
    let minDist = Infinity;
    STICK_BASES.forEach((base, i) => {
      const actualX = base.x + layoutOffsets[i].x; // 실제 렌더 위치
      const d = Math.abs(clickX - actualX);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    });
    pickStick(nearestIdx);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (phase !== "ready") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    let nearestIdx = 0;
    let minDist = Infinity;
    STICK_BASES.forEach((base, i) => {
      const actualX = base.x + layoutOffsets[i].x;
      const d = Math.abs(mx - actualX);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    });
    setHoverIdx(nearestIdx);
  }

  function handleReset() {
    setPhase("idle");
    setDrawn(null);
    setShakeCount(0);
    setPickInfo(null);
    setHoverIdx(null);
    setLayoutOffsets(STICK_BASES.map(() => ({ x: 0, rotate: 0 })));
    setShakeFrames(STICK_BASES.map((b) => ({ x: [0], y: [0], rotate: [b.baseRotate] })));
    resetStream();
  }

  async function handleAiRead() {
    if (!drawn) return;
    setPhase("ai");
    await submit("sangaji", {
      no: drawn.no,
      grade: drawn.grade,
      title: drawn.title,
      question: question.trim() || undefined,
    });
  }

  // 각 막대 animate 값 계산
  function getAnim(i: number) {
    const base = STICK_BASES[i];
    const lo = layoutOffsets[i];
    const lx = lo.x;
    const lr = base.baseRotate + lo.rotate;

    if (phase === "shaking") {
      return { x: shakeFrames[i].x, y: shakeFrames[i].y, rotate: shakeFrames[i].rotate, opacity: 1 };
    }
    if ((phase === "drawing" || phase === "drawn") && pickInfo) {
      if (pickInfo.idx === i) return { x: lx, y: -110, rotate: pickInfo.rotate, opacity: 1 };
      return { x: lx, y: 0, rotate: lr, opacity: 0.3 };
    }
    if (phase === "ready" && hoverIdx === i) {
      return { x: lx, y: -14, rotate: lr, opacity: 1 };
    }
    return { x: lx, y: 0, rotate: lr, opacity: 1 };
  }

  function getStickBg(i: number) {
    if ((phase === "drawing" || phase === "drawn") && pickInfo?.idx === i) return BAMBOO_PICKED;
    if (phase === "ready" && hoverIdx === i) return BAMBOO_HOVER;
    return BAMBOO[STICK_BASES[i].colorIdx];
  }

  if (phase === "ai") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-gray-900">
        <FortuneResult result={result} isLoading={isLoading} onReset={handleReset} title="산가지 점 풀이" icon="🎋" />
        {error && <p className="text-center text-red-400 text-sm mt-2 px-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-gray-900 text-white px-4 py-8">
      <div className="max-w-sm mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🥢</div>
          <h1 className="text-2xl font-bold text-amber-200">산가지 점</h1>
          <p className="text-amber-400/60 text-sm mt-1">마음속 질문을 품고 막대를 흔드세요</p>
        </div>

        {/* 질문 — 항상 공간 유지, idle/ready만 활성 */}
        <div
          className="mb-6 transition-opacity duration-300"
          style={{
            opacity: phase === "idle" || phase === "ready" ? 1 : 0,
            pointerEvents: phase === "idle" || phase === "ready" ? "auto" : "none",
          }}
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="궁금한 것을 적어보세요 (선택)"
            className="w-full bg-amber-950/40 border border-amber-700/30 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder-amber-700/50 resize-none focus:outline-none focus:border-amber-500/60"
            rows={2}
          />
        </div>

        {/* 통 + 막대 영역 */}
        {phase !== "drawn" && (
          <div className="w-full flex flex-col items-center mb-6">
            {/* 상호작용 래퍼 */}
            <div
              style={{
                position: "relative",
                width: 210,
                height: 370,
                cursor: phase === "ready" ? "pointer" : "default",
              }}
              onClick={handleAreaClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {/* 막대 50개 — 각자 독립 motion */}
              {STICK_BASES.map((base, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: "absolute",
                    bottom: STICK_BOTTOM_OFFSET, // 통 밑면 20px 띄움
                    left: `calc(50% + ${base.x}px)`,
                    width: 2,
                    height: base.height,
                    transformOrigin: "bottom center",
                    background: getStickBg(i),
                    borderRadius: "1px 1px 0 0",
                    zIndex:
                      pickInfo?.idx === i ? 50 : hoverIdx === i ? 30 : 5,
                  }}
                  animate={getAnim(i)}
                  transition={
                    phase === "shaking"
                      ? { duration: 1.0, ease: "easeInOut" }
                      : phase === "drawing" && pickInfo?.idx === i
                      ? { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }
                      : { duration: 0.3, ease: "easeOut" }
                  }
                />
              ))}

              {/* 나무 통 — 168 × 224 (너비 50% 증가, 벽 10px 여유) */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: CONTAINER_W,
                  height: CONTAINER_H,
                  zIndex: 20,
                  pointerEvents: "none",
                  background:
                    "linear-gradient(160deg, #7c3010 0%, #5a1e06 35%, #3e1003 100%)",
                  borderRadius: "3px 3px 22px 22px",
                  boxShadow:
                    "inset 8px 0 16px rgba(255,255,255,0.06), inset -8px 0 22px rgba(0,0,0,0.7), 0 14px 48px rgba(0,0,0,0.7)",
                  border: "2px solid #8a3a12",
                  overflow: "hidden",
                }}
              >
                {/* 놋쇠 링 5개 */}
                {[18, 64, 116, 168, 214].map((top) => (
                  <div
                    key={top}
                    style={{
                      position: "absolute",
                      top,
                      left: 0,
                      right: 0,
                      height: 6,
                      background:
                        "linear-gradient(to right, #7a5810, #e8b030, #f5d060, #e8b030, #7a5810)",
                    }}
                  />
                ))}
                {/* 나무 결 */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 6px)",
                  }}
                />
                {/* 상단 입구 그림자 (깊이감) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 30,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
                  }}
                />
              </div>

              {/* 바닥 그림자 */}
              <div
                style={{
                  position: "absolute",
                  bottom: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 142,
                  height: 16,
                  background:
                    "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)",
                  zIndex: 1,
                }}
              />
            </div>

            {/* 흔든 횟수 — 항상 공간 유지 */}
            <p
              className="text-amber-600/55 text-xs mt-2 h-4 transition-opacity duration-300"
              style={{ opacity: shakeCount > 0 && phase === "ready" ? 1 : 0 }}
            >
              {shakeCount}번 흔들었습니다
            </p>

            {/* 버튼 — 고정 높이로 레이아웃 시프트 방지 */}
            <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-xs">
              <motion.button
                whileHover={!isAnimating ? { scale: 1.04 } : {}}
                whileTap={!isAnimating ? { scale: 0.96 } : {}}
                onClick={handleShake}
                disabled={isAnimating || phase === "drawing"}
                className="w-full py-3 rounded-full font-bold text-base text-amber-100 disabled:opacity-40"
                style={{ background: "linear-gradient(to right, #92400e, #c2500a)" }}
              >
                {phase === "shaking"
                  ? "흔드는 중..."
                  : phase === "ready"
                  ? "🎋 한 번 더 흔들기"
                  : "🎋 산가지 흔들기"}
              </motion.button>

              {/* 뽑기 버튼 — 항상 공간 예약, opacity만 전환 */}
              <div
                className="w-full flex flex-col gap-2 transition-opacity duration-300"
                style={{
                  opacity: phase === "ready" ? 1 : 0,
                  pointerEvents: phase === "ready" ? "auto" : "none",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => pickStick(Math.floor(Math.random() * STICK_COUNT))}
                  className="w-full py-3 rounded-full font-bold text-base text-yellow-100 border border-yellow-600/40"
                  style={{ background: "linear-gradient(to right, #b45309, #d97706)" }}
                >
                  ✨ 산가지 뽑기
                </motion.button>
                <p className="text-center text-amber-700/55 text-xs">
                  또는 위 막대를 직접 터치해서 뽑으세요
                </p>
              </div>

              {/* 안내 문구 — 항상 공간 예약 */}
              <p
                className="text-xs text-amber-800/55 text-center transition-opacity duration-500"
                style={{ opacity: phase === "idle" ? 1 : 0 }}
              >
                막대를 원하는 만큼 흔든 뒤 산가지를 뽑으세요
              </p>
            </div>
          </div>
        )}

        {/* 결과 카드 */}
        <AnimatePresence>
          {drawn && phase === "drawn" && (
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              <div className="rounded-2xl overflow-hidden border border-amber-700/30 shadow-2xl mb-3">
                <div className={`bg-gradient-to-r ${GRADE_GRADIENT[drawn.grade]} px-6 py-4 text-center`}>
                  <div className="text-5xl font-bold text-white/90 mb-2">{drawn.no}번</div>
                  <GradeTag grade={drawn.grade} />
                </div>
                <div className="bg-amber-950/55 px-6 py-5">
                  <h2 className="text-xl font-bold text-amber-200 mb-3 text-center">{drawn.title}</h2>
                  <p className="text-amber-100/80 text-sm leading-relaxed text-center">{drawn.description}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mb-4 py-2 text-sm text-amber-700/60 hover:text-amber-400 transition-colors"
              >
                처음부터 다시
              </button>

              {fortuneStatus?.exhausted ? (
                <div className="text-center py-3 text-amber-600/70 text-sm rounded-xl bg-amber-950/30 border border-amber-800/20">
                  오늘의 AI 풀이를 모두 사용했습니다. 내일 다시 이용해 주세요.
                </div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAiRead}
                  className="w-full py-3 rounded-xl text-amber-100 font-semibold text-sm shadow-lg"
                  style={{ background: "linear-gradient(to right, #7c2d0a, #c05008)" }}
                >
                  ✨ AI 심층 풀이 보기
                  {fortuneStatus && fortuneStatus.limit !== null && fortuneStatus.limit !== -1 && (
                    <span className="ml-2 text-amber-300/60 text-xs">
                      ({fortuneStatus.used}/{fortuneStatus.limit})
                    </span>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 전통 설명 — 항상 공간 예약 */}
        <div
          className="mt-2 rounded-xl bg-amber-950/30 border border-amber-800/20 p-4 text-xs text-amber-800/60 text-center leading-relaxed transition-opacity duration-500"
          style={{ opacity: phase === "idle" ? 1 : 0, pointerEvents: "none" }}
        >
          산가지(算가지)는 조선시대부터 전해 내려오는 한국 전통 점술입니다.<br />
          대나무 막대를 통에 담고 흔들어 나온 괘로 길흉을 판단합니다.
        </div>
      </div>
    </div>
  );
}
