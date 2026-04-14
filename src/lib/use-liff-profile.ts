"use client";

import { useEffect, useState } from "react";

interface LiffState {
  isReady: boolean;
  isInClient: boolean;
  profile?: {
    userId: string;
    displayName: string;
  };
  error?: string;
}

export function useLiffProfile(liffId?: string) {
  const [state, setState] = useState<LiffState>(() =>
    liffId
      ? {
          isReady: false,
          isInClient: false,
        }
      : {
          isReady: true,
          isInClient: false,
        },
  );

  useEffect(() => {
    if (!liffId) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const boot = async () => {
      if (!window.liff) {
        if (attempts < 20) {
          attempts += 1;
          window.setTimeout(boot, 200);
          return;
        }

        if (!cancelled) {
          setState({
            isReady: true,
            isInClient: false,
            error: "LIFF SDK を読み込めませんでした。",
          });
        }
        return;
      }

      try {
        await window.liff.init({ liffId });
        const isInClient = window.liff.isInClient();
        const isLoggedIn = window.liff.isLoggedIn();
        const profile = isLoggedIn ? await window.liff.getProfile() : undefined;

        if (!cancelled) {
          setState({
            isReady: true,
            isInClient,
            profile,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            isReady: true,
            isInClient: false,
            error: error instanceof Error ? error.message : "LIFF 初期化に失敗しました。",
          });
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [liffId]);

  return state;
}
