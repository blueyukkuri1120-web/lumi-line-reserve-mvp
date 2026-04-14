import Link from "next/link";
import { ReactNode } from "react";

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
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
