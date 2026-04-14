"use client";

import { startTransition, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveLineEntryTarget, resolveTargetFromLiffState } from "@/lib/liff-routing";

export function LiffBootstrap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const entryTarget = resolveLineEntryTarget(searchParams.get("entry"));
    const stateTarget = resolveTargetFromLiffState(searchParams.get("liff.state"));
    const redirectTarget = entryTarget ?? stateTarget;

    if (pathname === "/" && redirectTarget && redirectTarget !== pathname && !hasRedirected.current) {
      hasRedirected.current = true;
      startTransition(() => {
        router.replace(redirectTarget);
      });
    }
  }, [pathname, router, searchParams]);

  return null;
}
