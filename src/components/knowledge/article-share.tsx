"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/social-icons";

type ArticleShareProps = {
  title: string;
  url: string;
  /**
   * "inline" sits under the byline, right after the title - small and quiet.
   * "footer" sits at the end of the article, once the reader has actually
   * gotten the value out of it - bigger, and framed as a favour to ask
   * ("share this if it helped") rather than a generic social-row afterthought.
   */
  variant?: "inline" | "footer";
};

/**
 * Share row for an article page.
 *
 * Instagram and TikTok have no web share-intent URL - neither app accepts an
 * incoming link the way `facebook.com/sharer` or `wa.me` do, so there is no
 * honest "share to Instagram" button to build. `navigator.share` is the real
 * mechanism: on a phone it opens the OS's own share sheet, which lists every
 * app actually installed there, Instagram and TikTok included. WhatsApp and
 * Facebook get their own always-visible icons because they have real web
 * intents that work on desktop too, where `navigator.share` mostly doesn't
 * exist. Copy Link covers everything else, and is also how a link actually
 * gets into an Instagram bio or a TikTok caption - neither takes a shared URL
 * directly.
 */
export function ArticleShare({ title, url, variant = "inline" }: ArticleShareProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const detect = () => setCanNativeShare(typeof navigator.share === "function");
    detect();
  }, []);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const isFooter = variant === "footer";

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
      track("article_share_click", { channel: "native", placement: variant });
    } catch {
      // The visitor cancelled the share sheet - not an error worth surfacing.
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("article_share_click", { channel: "copy", placement: variant });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the link is still
      // visible and selectable on the page, so this fails quietly.
    }
  };

  const iconButtonClasses = cn(
    "inline-flex items-center justify-center rounded-full border border-border-hairline-strong bg-surface-container-lowest text-on-surface-variant shadow-hairline transition-[background-color,color,transform] hover:-translate-y-0.5 hover:bg-surface-container hover:text-on-surface",
    isFooter ? "size-16" : "size-14"
  );
  const iconClasses = isFooter ? "size-7" : "size-6";

  const buttons = (
    <div className={cn("flex flex-wrap items-center", isFooter ? "gap-space-md" : "gap-space-sm")}>
      {!isFooter ? (
        <span className="text-label-lg font-semibold text-on-surface-variant">Bagikan:</span>
      ) : null}
      {canNativeShare ? (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Bagikan artikel ini"
          title="Bagikan"
          className={iconButtonClasses}
        >
          <Share2 aria-hidden className={iconClasses} />
        </button>
      ) : null}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke WhatsApp"
        title="Bagikan ke WhatsApp"
        onClick={() => track("article_share_click", { channel: "whatsapp", placement: variant })}
        className={iconButtonClasses}
      >
        <WhatsAppIcon className={iconClasses} />
      </a>
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke Facebook"
        title="Bagikan ke Facebook"
        onClick={() => track("article_share_click", { channel: "facebook", placement: variant })}
        className={iconButtonClasses}
      >
        <FacebookIcon className={iconClasses} />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Salin tautan artikel"
        title={copied ? "Tersalin!" : "Salin tautan"}
        className={cn(iconButtonClasses, copied && "text-primary hover:text-primary")}
      >
        {copied ? (
          <Check aria-hidden className={iconClasses} />
        ) : (
          <Copy aria-hidden className={iconClasses} />
        )}
      </button>
    </div>
  );

  if (!isFooter) return buttons;

  return (
    <div className="flex flex-col items-center gap-space-sm rounded-lg border border-border-hairline bg-surface-container-low px-space-lg py-space-xl text-center">
      <p className="text-headline-sm font-semibold text-on-surface">
        Artikel ini membantu?
      </p>
      <p className="text-body-md text-on-surface-variant">
        Bagikan ke teman atau keluarga yang sedang merencanakan ruangannya sendiri.
      </p>
      {buttons}
    </div>
  );
}
