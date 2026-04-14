import Link from "next/link";
import { ReactNode } from "react";
import { getOptionalEnv } from "@/lib/env";

function normalizePath(path: string) {
  if (path === "/") {
    return "";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function resolveHref(path: string) {
  const liffId = getOptionalEnv("NEXT_PUBLIC_LIFF_ID");

  if (liffId) {
    return `https://miniapp.line.me/${liffId}${normalizePath(path)}`;
  }

  return path;
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
  return (
    <Link className={className} href={resolveHref(href)}>
      {children}
    </Link>
  );
}
