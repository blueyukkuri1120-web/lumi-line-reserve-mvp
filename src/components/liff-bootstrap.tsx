"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getOptionalEnv } from "@/lib/env";
import { resolveLineEntryTarget, resolveTargetFromLiffState } from "@/lib/liff-routing";

export function LiffBootstrap() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const entryTarget = resolveLineEntryTarget(searchParams.get("entry"));
    const stateTarget = resolveTargetFromLiffState(searchParams.get("liff.state"));
    const redirectTarget = entryTarget ?? stateTarget;

    if (pathname === "/" && redirectTarget && redirectTarget !== pathname && !hasRedirected.current) {
      hasRedirected.current = true;
      window.location.replace(redirectTarget);
      return;
    }

    const liffId = getOptionalEnv("NEXT_PUBLIC_LIFF_ID");
    if (!liffId) {
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
  }, [pathname, searchParams]);

  return null;
}
