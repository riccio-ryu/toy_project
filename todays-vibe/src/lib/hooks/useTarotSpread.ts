"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { drawCards, type DrawnCard } from "@/lib/tarot/utils";
import type { FortuneStatus } from "@/types/fortune";

export type Phase = "input" | "shuffling" | "spread" | "drawn" | "reading";

export const SPREAD_COUNT = 78;
export const SPAN_DEG     = 140;
export const R_INNER      = 90;
export const CARD_W       = 54;
export const CARD_H       = 90;
export const FAN_H        = R_INNER + CARD_H + 28;

export function useTarotSpread(menuId: string, cardCount: number) {
  const { user } = useAuth();

  const [question,        setQuestion]        = useState("");
  const [phase,           setPhase]           = useState<Phase>("input");
  const [spreadCards,     setSpreadCards]     = useState<DrawnCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [spreadReady,     setSpreadReady]     = useState(false);
  const [drawn,           setDrawn]           = useState<DrawnCard[]>([]);
  const [revealed,        setRevealed]        = useState<boolean[]>(Array(cardCount).fill(false));
  const [interpretation,  setInterpretation]  = useState("");
  const [isLoading,       setIsLoading]       = useState(false);
  const [fortuneStatus,   setFortuneStatus]   = useState<FortuneStatus | null>(null);
  const interpretRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/user/fortune-status?menuId=${menuId}`)
      .then((r) => r.json())
      .then((d) => setFortuneStatus(d))
      .catch(() => {});
  }, [user, menuId]);

  function handleStartShuffle() {
    setPhase("shuffling");
    setTimeout(() => {
      setSpreadCards(drawCards(SPREAD_COUNT));
      setSelectedIndices([]);
      setSpreadReady(false);
      setPhase("spread");
      setTimeout(() => setSpreadReady(true), SPREAD_COUNT * 8 + 400);
    }, 1800);
  }

  function handleSelectCard(index: number) {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= cardCount) return prev;
      return [...prev, index];
    });
  }

  function handleConfirmSelection() {
    const selected = selectedIndices.map((i) => spreadCards[i]);
    setDrawn(selected);
    setRevealed(Array(cardCount).fill(false));
    setPhase("drawn");
    Array.from({ length: cardCount }, (_, i) => {
      setTimeout(() => {
        setRevealed((prev) => { const n = [...prev]; n[i] = true; return n; });
      }, 500 + i * 400);
    });
  }

  async function interpret(apiPath: string, body: Record<string, unknown>) {
    setIsLoading(true);
    setPhase("reading");
    setInterpretation("");
    setTimeout(() => interpretRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setInterpretation((prev) => prev + dec.decode(value, { stream: true }));
      }
    } catch {
      setInterpretation("해석을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
      if (user) {
        fetch(`/api/user/fortune-status?menuId=${menuId}`)
          .then((r) => r.json())
          .then((d) => setFortuneStatus(d))
          .catch(() => {});
      }
    }
  }

  function handleReset() {
    setPhase("input");
    setSpreadCards([]);
    setSelectedIndices([]);
    setSpreadReady(false);
    setDrawn([]);
    setRevealed(Array(cardCount).fill(false));
    setInterpretation("");
  }

  return {
    user,
    question,        setQuestion,
    phase,
    spreadCards,
    selectedIndices,
    spreadReady,
    drawn,
    revealed,
    interpretation,
    isLoading,
    fortuneStatus,
    interpretRef,
    handleStartShuffle,
    handleSelectCard,
    handleConfirmSelection,
    handleReset,
    interpret,
  };
}
