"use client";

import { useState, useCallback } from "react";
import { FortuneType, FortuneInput } from "@/types/fortune";

interface UseFortuneStreamReturn {
  result: string;
  isLoading: boolean;
  error: string | null;
  submit: (type: FortuneType, input: FortuneInput) => Promise<void>;
  reset: () => void;
}

export function useFortuneStream(): UseFortuneStreamReturn {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (type: FortuneType, input: FortuneInput) => {
      setIsLoading(true);
      setResult("");
      setError(null);

      try {
        const response = await fetch("/api/fortune", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, input }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error ?? `서버 오류 (${response.status})`
          );
        }

        if (!response.body) {
          throw new Error("스트림 응답을 받을 수 없습니다.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          setResult((prev) => prev + text);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, submit, reset };
}
