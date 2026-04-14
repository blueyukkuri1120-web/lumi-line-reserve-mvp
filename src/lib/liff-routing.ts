export const lineEntryRouteMap = {
  reserve: "/reserve",
  check: "/reservation/check",
  manage: "/reservation/manage",
  access: "/access",
} as const;

export type LineEntryKey = keyof typeof lineEntryRouteMap;

export function resolveLineEntryTarget(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().trim() as LineEntryKey;
  return lineEntryRouteMap[normalized] ?? null;
}

export function decodeLiffState(rawValue?: string | null) {
  if (!rawValue) {
    return null;
  }

  let decoded = rawValue;

  for (let index = 0; index < 3; index += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        break;
      }
      decoded = next;
    } catch {
      break;
    }
  }

  return decoded;
}

export function resolveTargetFromLiffState(rawValue?: string | null) {
  const decoded = decodeLiffState(rawValue);

  if (!decoded) {
    return null;
  }

  if (decoded.startsWith("/")) {
    return decoded;
  }

  if (decoded.startsWith("?")) {
    const params = new URLSearchParams(decoded.slice(1));
    return resolveLineEntryTarget(params.get("entry"));
  }

  try {
    const parsed = new URL(decoded, "https://placeholder.local");
    const entryTarget = resolveLineEntryTarget(parsed.searchParams.get("entry"));

    if (entryTarget) {
      return entryTarget;
    }

    if (parsed.pathname && parsed.pathname !== "/") {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return resolveLineEntryTarget(decoded);
  }

  return null;
}

export function buildMiniAppEntryUrl(liffId: string, entry: LineEntryKey) {
  return `https://miniapp.line.me/${liffId}?entry=${entry}`;
}
