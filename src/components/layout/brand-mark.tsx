import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

type BrandMarkProps = {
  className?: string;
  asLink?: boolean;
  eager?: boolean;
};

export function BrandMark({ className, asLink = true, eager = false }: BrandMarkProps) {
  const image = (
    <Image
      src="/brand/savoy-logo.jpg"
      alt={site.name}
      width={216}
      height={216}
      sizes="(min-width: 768px) 96px, 76px"
      loading={eager ? "eager" : "lazy"}
      className="size-16 object-contain md:size-20"
    />
  );

  if (!asLink) {
    return <span className={cn("inline-flex items-center", className)}>{image}</span>;
  }

  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="SAVOY beranda">
      {image}
    </Link>
  );
}
