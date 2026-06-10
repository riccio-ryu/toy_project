"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { getHexagramByLines, HEXAGRAMS } from "@/data/iching";
import { type IChingInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";

// 복희 선천 64괘도 위치 계산 (SVG 800×800, 중심 400,400, r≈170, 5.625°/괘)
function getFuxiPos(linesStr: string): number {
  const u = +linesStr[5] * 4 + +linesStr[4] * 2 + +linesStr[3];
  const l = +linesStr[2] * 4 + +linesStr[1] * 2 + +linesStr[0];
  return (7 - u) * 8 + (7 - l);
}
function posToXY(pos: number): [number, number] {
  const rad = (pos * 5.625 - 90) * (Math.PI / 180);
  return [400 + 170 * Math.cos(rad), 400 + 170 * Math.sin(rad)];
}

// 괘도 SVG 위에 그리는 하이라이트 오버레이
function DiagramOverlay({ matchingPositions, done, linesLen }: {
  matchingPositions: number[];
  done: boolean;
  linesLen: number;
}) {
  return (
    <svg
      viewBox="0 0 800 800"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ transform: "scale(1.46)", transformOrigin: "center" }}
    >
      {done
        ? matchingPositions.map(pos => {
            const [x, y] = posToXY(pos);
            return (
              <g key={pos}>
                <motion.circle
                  cx={x} cy={y} r={36} fill="none" stroke="#f59e0b" strokeWidth={1.2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.6, 0.15, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.circle
                  cx={x} cy={y} r={26} fill="#f59e0b" fillOpacity={0.18} stroke="#fbbf24" strokeWidth={2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.2, 0, 0.2, 1] }}
                />
                <motion.circle
                  cx={x} cy={y} r={3.5} fill="#fbbf24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                />
              </g>
            );
          })
        : matchingPositions.map(pos => {
            const [x, y] = posToXY(pos);
            return (
              <motion.circle
                key={`${pos}-${linesLen}`}
                cx={x} cy={y} r={4} fill="#f59e0b"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.25 }}
              />
            );
          })
      }
    </svg>
  );
}

// 양효: ──────────, 음효: ────  ────
function HexLine({ yang, isNew }: { yang: boolean; isNew: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.4 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.35 }}
      className={`flex items-center justify-center gap-1.5 h-5 ${isNew ? "opacity-100" : "opacity-70"}`}
    >
      {yang ? (
        <div className={`h-1.5 w-full rounded-full ${isNew ? "bg-amber-400" : "bg-amber-300/70"}`} />
      ) : (
        <>
          <div className={`h-1.5 w-[45%] rounded-full ${isNew ? "bg-amber-400" : "bg-amber-300/70"}`} />
          <div className="w-[10%]" />
          <div className={`h-1.5 w-[45%] rounded-full ${isNew ? "bg-amber-400" : "bg-amber-300/70"}`} />
        </>
      )}
    </motion.div>
  );
}

// spinning=true: 회전 중, face=H/T: 결과 표시, face=null: 대기
function Coin({ face, spinning, delay }: { face: "H" | "T" | null; spinning: boolean; delay: number }) {
  return (
    <div style={{ perspective: "500px" }} className="w-12 h-12 flex-shrink-0">
      <motion.div
        className={`w-full h-full rounded-full flex flex-col items-center justify-center gap-0.5 border-2 ${
          face === "H" ? "bg-amber-500/30 border-amber-400/60"
          : face === "T" ? "bg-slate-600/40 border-slate-400/40"
          : spinning ? "bg-white/10 border-white/20"
          : "bg-white/5 border-white/10"
        }`}
        animate={{ rotateY: spinning ? 360 : 0 }}
        transition={spinning ? { duration: 0.22, ease: "linear", repeat: Infinity, delay } : { duration: 0.05 }}
      >
        {face === "H" ? (
          <><span className="text-amber-200 text-[11px] font-bold leading-none">앞</span>
          <span className="text-amber-400/70 text-[9px] leading-none">☯</span></>
        ) : face === "T" ? (
          <span className="text-slate-300 text-[11px] font-bold leading-none">뒤</span>
        ) : (
          <span className="text-white/20 text-[11px] font-bold leading-none">?</span>
        )}
      </motion.div>
    </div>
  );
}

export default function IChingPage() {
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("iching");

  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<boolean[]>([]);
  const [coins, setCoins] = useState<("H" | "T")[]>([]);
  const [throwing, setThrowing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const hexagram = lines.length === 6 ? getHexagramByLines(lines) : null;
  const done = lines.length === 6;

  const matchingPositions = lines.length > 0
    ? HEXAGRAMS
        .filter(h => lines.every((line, i) => (h.lines[i] === "1") === line))
        .map(h => getFuxiPos(h.lines))
    : [];

  function handleThrow() {
    if (throwing || done) return;
    const newCoins: ("H" | "T")[] = [
      Math.random() < 0.5 ? "H" : "T",
      Math.random() < 0.5 ? "H" : "T",
      Math.random() < 0.5 ? "H" : "T",
    ];
    setThrowing(true);
    setSpinning(true);
    setCoins([]);
    setTimeout(() => { setCoins(newCoins); setSpinning(false); }, 900);
    setTimeout(() => {
      const yang = newCoins.filter(c => c === "H").length >= 2;
      setLines(prev => [...prev, yang]);
      setThrowing(false);
    }, 1250);
  }

  function handleReset() {
    reset();
    setLines([]);
    setCoins([]);
    setSpinning(false);
    setQuestion("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hexagram) return;
    const input: IChingInput = {
      hexagramNo: hexagram.no,
      hexagramName: hexagram.nameKo,
      hexagramNameZh: hexagram.nameZh,
      upperTrigram: hexagram.upper,
      lowerTrigram: hexagram.lower,
      keyword: hexagram.keyword,
      question: question.trim() || undefined,
    };
    await submit("iching", input);
  }

  // 괘도 원형 컨테이너 공통 내용
  const DiagramCircle = ({ size }: { size: number }) => (
    <div
      className="relative rounded-full overflow-hidden ring-1 ring-amber-400/20 shadow-[0_0_48px_rgba(200,164,85,0.18)] flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src="/images/hexagramsData/복희육십사괘도.svg"
        alt="복희 64괘도"
        className="absolute inset-0 w-full h-full"
        style={{ transform: "scale(1.46)", transformOrigin: "center" }}
      />
      <DiagramOverlay matchingPositions={matchingPositions} done={done} linesLen={lines.length} />
    </div>
  );

  if (result || isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        {hexagram && (
          <div className="text-center mb-6">
            <p className="text-amber-300/70 text-sm">제{hexagram.no}괘 {hexagram.nameZh} {hexagram.nameKo}</p>
            <p className="text-white/30 text-xs mt-1">{hexagram.upper}위 {hexagram.lower}아래</p>
          </div>
        )}
        <FortuneResult result={result} isLoading={isLoading} onReset={handleReset} title="주역 괘 풀이" icon="☯️" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">☯️</span>
        <h1 className="text-white font-bold text-2xl">주역 괘</h1>
        <p className="text-white/50 text-sm mt-2">동전을 6번 던져 64괘 중 하나를 뽑습니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 질문 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <label className="block text-white/50 text-xs mb-2">
            질문 <span className="text-white/25">(선택)</span>
          </label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="예: 지금 이 결정을 내려도 될까요?"
            className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* 동전 던지기 + 괘 형성 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
          <div>
            <p className="text-white/40 text-xs text-center mb-4">
              {done ? "6효 완성" : `${lines.length + 1}번째 효 — 동전 3개를 던지세요`}
            </p>
            <div className="flex justify-center gap-3">
              <Coin face={coins[0] ?? null} spinning={spinning} delay={0} />
              <Coin face={coins[1] ?? null} spinning={spinning} delay={0.07} />
              <Coin face={coins[2] ?? null} spinning={spinning} delay={0.14} />
            </div>
            {coins.length > 0 && !throwing && !done && (
              <p className="text-center text-amber-300/70 text-xs mt-3">
                앞({coins.filter(c => c === "H").length})개 →{" "}
                <span className="font-bold">
                  {coins.filter(c => c === "H").length >= 2 ? "양효 ——" : "음효 — —"}
                </span>
              </p>
            )}
          </div>

          {/* 괘 시각화 */}
          <div className="w-40 mx-auto space-y-2">
            {[5, 4, 3, 2, 1, 0].map(idx => {
              const filled = idx < lines.length;
              const isNew = idx === lines.length - 1;
              if (!filled) return (
                <div key={idx} className="flex items-center justify-center gap-1.5 h-5">
                  <div className="h-px w-full bg-white/10 rounded-full" />
                </div>
              );
              return <HexLine key={idx} yang={lines[idx]} isNew={isNew} />;
            })}
          </div>

          <AnimatePresence>
            {hexagram && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
                <p className="text-amber-300 font-bold text-xl">
                  {hexagram.nameZh} <span className="text-lg">{hexagram.nameKo}괘</span>
                </p>
                <p className="text-white/40 text-xs">제{hexagram.no}괘 · {hexagram.upper}위 {hexagram.lower}아래</p>
                <p className="text-amber-200/60 text-xs">{hexagram.keyword}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <button
              type="button" onClick={handleThrow} disabled={throwing}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                throwing ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-amber-700/40 border border-amber-600/30 text-amber-200 hover:bg-amber-700/60"
              }`}
            >
              {throwing ? "동전 던지는 중..." : `🪙 ${lines.length + 1}번째 효 던지기`}
            </button>
          )}

          {lines.length > 0 && !done && (
            <button
              type="button"
              onClick={() => { setLines([]); setCoins([]); setSpinning(false); }}
              className="w-full py-2 rounded-xl text-xs text-white/30 hover:text-white/50 border border-white/10 transition-colors"
            >
              처음부터 다시
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* 복희 64괘도 — 첫 효부터 등장 */}
        <AnimatePresence>
          {lines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.5, ease: [0.2, 0, 0.2, 1] }}
              className="flex flex-col items-center gap-2"
            >
              {/* 클릭 시 팝업, 호버 시 확대 */}
              <motion.button
                type="button"
                onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="rounded-full cursor-pointer focus:outline-none"
                aria-label="괘도 크게 보기"
              >
                <DiagramCircle size={288} />
              </motion.button>
              <p className="text-white/25 text-[10px] tracking-[0.2em]">
                {done ? `제${hexagram?.no}괘 확정` : `후보 ${matchingPositions.length}개`}
                {" · "}
                <span className="text-amber-400/40">눌러서 크게 보기</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {done && hexagram && (
          <div className="space-y-3">
            {/* 기본 괘사 풀이 — 항상 무료 제공 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-white/5 border border-amber-400/15 p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400/70 text-xs font-semibold tracking-wider">괘사 풀이</span>
                <div className="flex-1 h-px bg-amber-400/10" />
                <span className="text-white/20 text-[10px]">무료</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{hexagram.description}</p>
            </motion.div>

            {/* AI 심층해석 — 관리자 설정 횟수 제한 */}
            <button
              type="submit"
              disabled={fortuneStatus?.exhausted === true}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
                fortuneStatus?.exhausted
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-700 to-yellow-700 text-white hover:opacity-90"
              }`}
            >
              {fortuneStatus?.exhausted
                ? "오늘 AI 심층해석을 이미 이용했어요"
                : `☯️ ${hexagram.nameKo}괘 AI 심층해석 보기`}
            </button>

            <button
              type="button"
              onClick={() => { setLines([]); setCoins([]); setSpinning(false); }}
              className="w-full py-2 rounded-xl text-xs text-white/30 hover:text-white/50 border border-white/10 transition-colors"
            >
              괘 다시 뽑기
            </button>
          </div>
        )}
      </form>

      {fortuneStatus?.exhausted && fortuneStatus.todayReading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">오늘의 주역 해석</span>
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
                __html: fortuneStatus.todayReading.result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>'),
              }}
            />
          </div>
        </div>
      )}

      {/* 풀스크린 팝업 모달 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div>
                <p className="text-amber-300/80 text-sm font-semibold">복희 64괘도</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {done ? `제${hexagram?.no}괘 ${hexagram?.nameZh} ${hexagram?.nameKo}괘 확정` : `후보 ${matchingPositions.length}개 · ${lines.length}/6효`}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/12 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* 큰 괘도 */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0 px-4">
              <DiagramCircle size={Math.min(typeof window !== "undefined" ? window.innerWidth * 0.88 : 340, 400)} />
            </div>

            {/* 동전 던지기 섹션 */}
            <div className="flex-shrink-0 px-4 pb-8 pt-3 space-y-4">
              <div className="h-px bg-white/8" />

              {/* 동전 + 효 결과 */}
              <div className="flex items-center justify-between gap-4">
                {/* 동전 3개 */}
                <div className="flex gap-2">
                  <Coin face={coins[0] ?? null} spinning={spinning} delay={0} />
                  <Coin face={coins[1] ?? null} spinning={spinning} delay={0.07} />
                  <Coin face={coins[2] ?? null} spinning={spinning} delay={0.14} />
                </div>
                {/* 괘 시각화 (세로, 컴팩트) */}
                <div className="w-20 space-y-1.5">
                  {[5, 4, 3, 2, 1, 0].map(idx => {
                    const filled = idx < lines.length;
                    const isNew = idx === lines.length - 1;
                    if (!filled) return (
                      <div key={idx} className="flex items-center justify-center gap-1 h-3.5">
                        <div className="h-px w-full bg-white/10 rounded-full" />
                      </div>
                    );
                    return (
                      <div key={idx} className={`flex items-center justify-center gap-1 h-3.5 ${isNew ? "opacity-100" : "opacity-60"}`}>
                        {lines[idx] ? (
                          <div className={`h-1 w-full rounded-full ${isNew ? "bg-amber-400" : "bg-amber-300/70"}`} />
                        ) : (
                          <>
                            <div className={`h-1 w-[45%] rounded-full ${isNew ? "bg-amber-400" : "bg-amber-300/70"}`} />
                            <div className="w-[10%]" />
                            <div className={`h-1 w-[45%] rounded-full ${isNew ? "bg-amber-400" : "bg-amber-300/70"}`} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* 현재 결과 텍스트 */}
                <div className="text-right min-w-0">
                  {hexagram ? (
                    <>
                      <p className="text-amber-300 font-bold text-base leading-tight">{hexagram.nameZh}</p>
                      <p className="text-amber-200/70 text-xs">{hexagram.nameKo}괘</p>
                    </>
                  ) : coins.length > 0 && !throwing ? (
                    <p className="text-amber-300/70 text-xs font-semibold">
                      {coins.filter(c => c === "H").length >= 2 ? "양효 ——" : "음효 — —"}
                    </p>
                  ) : (
                    <p className="text-white/25 text-xs">{lines.length}/6효</p>
                  )}
                </div>
              </div>

              {/* 던지기 버튼 */}
              {!done ? (
                <button
                  type="button" onClick={handleThrow} disabled={throwing}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    throwing ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-amber-700/40 border border-amber-600/30 text-amber-200 hover:bg-amber-700/60"
                  }`}
                >
                  {throwing ? "동전 던지는 중..." : `🪙 ${lines.length + 1}번째 효 던지기`}
                </button>
              ) : (
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-amber-700/40 border border-amber-600/30 text-amber-200 hover:bg-amber-700/60 transition-all"
                >
                  ☯️ 돌아가서 AI 해석 보기
                </button>
              )}

              {lines.length > 0 && !done && (
                <button
                  type="button"
                  onClick={() => { setLines([]); setCoins([]); setSpinning(false); }}
                  className="w-full py-2 rounded-xl text-xs text-white/30 hover:text-white/50 border border-white/10 transition-colors"
                >
                  처음부터 다시
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
