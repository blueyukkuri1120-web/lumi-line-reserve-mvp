import Link from "next/link";
import { ReactNode } from "react";
import { getOptionalEnv } from "@/lib/env";

function buildPermanentLink(path: string) {
  const liffId = getOptionalEnv("NEXT_PUBLIC_LIFF_ID");
  if (!liffId) {
    return path;
  }

  if (path === "/") {
    return `https://miniapp.line.me/${liffId}`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `https://miniapp.line.me/${liffId}${normalized}`;
}

export function MiniAppLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const targetHref = buildPermanentLink(href);

  return (
    <Link className={className} href={targetHref}>
      {children}
    </Link>
  );
}
