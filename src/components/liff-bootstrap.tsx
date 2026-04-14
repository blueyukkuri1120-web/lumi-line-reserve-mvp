"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getOptionalEnv } from "@/lib/env";

export function LiffBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const liffId = getOptionalEnv("NEXT_PUBLIC_LIFF_ID");
    if (!liffId) {
      return;
    }

    const hasPrimaryRedirectParams =
      window.location.search.includes("liff.state=") || window.location.hash.includes("access_token=");

    if (!hasPrimaryRedirectParams) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const boot = async () => {
      if (cancelled) {
        return;
      }

      if (!window.liff) {
        if (attempts < 20) {
          attempts += 1;
          window.setTimeout(boot, 200);
        }
        return;
      }

      try {
        await window.liff.init({ liffId });
      } catch (error) {
        console.error("LIFF bootstrap failed", error);
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
