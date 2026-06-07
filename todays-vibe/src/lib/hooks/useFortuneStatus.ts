"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { FortuneStatus } from "@/types/fortune";

export function useFortuneStatus(menuId: string) {
  const { user } = useAuth();
  const [fortuneStatus, setFortuneStatus] = useState<FortuneStatus | null>(null);

  const refresh = useCallback(() => {
    if (!user) return;
    fetch(`/api/user/fortune-status?menuId=${menuId}`)
      .then((r) => r.json())
      .then((d) => setFortuneStatus(d))
      .catch(() => {});
  }, [user, menuId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { fortuneStatus, refreshFortuneStatus: refresh };
}
