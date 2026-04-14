"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getOptionalEnv } from "@/lib/env";

function decodeLiffState(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  let decoded = rawValue;

  for (let index = 0; index < 3; index += 1) {
    try {
      const nextValue = decodeURIComponent(decoded);
      if (nextValue === decoded) {
        break;
      }
      decoded = nextValue;
    } catch {
      break;
    }
  }

  return decoded;
}

function resolveLineTarget(rawValue: string | null) {
  const decoded = decodeLiffState(rawValue);

  if (!decoded) {
    return "/line";
  }

  try {
    const parsed = new URL(decoded, window.location.origin);
    if (parsed.pathname.startsWith("/line")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    if (parsed.pathname.startsWith("/")) {
      return `/line${parsed.pathname}${parsed.search}`;
    }
  } catch {
    if (decoded.startsWith("/line")) {
      return decoded;
    }
    if (decoded.startsWith("/")) {
      return `/line${decoded}`;
    }
    return `/line/${decoded.replace(/^\/+/, "")}`;
  }

  return "/line";
}

export function LiffBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/line") {
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

        const target = resolveLineTarget(new URLSearchParams(window.location.search).get("liff.state"));
        if (target !== pathname) {
          window.location.replace(target);
        }
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
