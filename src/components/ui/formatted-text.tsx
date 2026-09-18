import React from "react";

import { isSafeHref } from "@/lib/article-utils";

export function FormattedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  // Split by **bold**, *italic*, ==highlight==, ~~strikethrough~~, `code`, and [link](url)
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|==.*?==|~~.*?~~|`.*?`|\[.*?\]\(.*?\))/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold text-on-surface">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={index} className="italic text-on-surface">
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith("==") && part.endsWith("==")) {
          return (
            <mark
              key={index}
              className="rounded-sm bg-highlight-marker px-1 py-0.5 text-on-highlight-marker [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
            >
              {part.slice(2, -2)}
            </mark>
          );
        }
        if (part.startsWith("~~") && part.endsWith("~~")) {
          return (
            <s key={index} className="text-on-surface-variant">
              {part.slice(2, -2)}
            </s>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const href = linkMatch[2];
          if (!isSafeHref(href)) {
            // Degrade to plain text rather than a dead or dangerous link -
            // the reader still gets the label, just not something clickable.
            return linkMatch[1];
          }
          const isExternal = href.startsWith("http");
          return (
            <a
              key={index}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="font-semibold text-primary underline underline-offset-2 hover:opacity-85 transition-opacity"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
}
