"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { navLinks } from "@/components/layout/nav-links";
import { isActivePath } from "@/components/layout/is-active";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";

/**
 * Mobile navigation.
 *
 * Radix Dialog supplies the focus trap, Escape handling, scroll lock and the
 * aria wiring; the styling stays entirely ours (pasal 6 & 24).
 */
export function MobileMenu({ inverse = false }: { inverse?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeParent = navLinks.find(
    (link) => link.children && isActivePath(pathname, link.href)
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(
    activeParent ? activeParent.label : null
  );
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setExpandedSection(activeParent ? activeParent.label : null);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          "inline-flex size-10 pointer-coarse:size-11 items-center justify-center rounded-md border shadow-hairline transition-[background-color,border-color,color,translate] duration-200 active:translate-y-px lg:hidden",
          inverse
            ? "border-border-hairline-dark bg-deep-black/20 text-inverse-on-surface backdrop-blur-xl hover:bg-pure-white/10"
            : "border-border-hairline bg-surface-container-lowest/80 text-on-surface backdrop-blur-xl hover:bg-surface-container"
        )}
        aria-label="Buka menu navigasi"
      >
        <Menu aria-hidden className="size-5" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-deep-black/40 backdrop-blur-sm data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out" />
        {/*
          The panel is capped and scrolls inside itself.

          Radix locks the body while the dialog is open, so anything that falls
          past the bottom edge is not merely off-screen, it is unreachable -
          there is no scroll left to bring it back. Left uncapped the panel ran
          466px tall, which fits a portrait phone but overflows a landscape one
          (375px) by 95px, stranding the last nav link and the WhatsApp button.

          Capping it against the viewport rather than a fixed height keeps the
          menu correct at any height, and `overscroll-contain` stops a flick at
          the end of the list from being handed to the page behind it.
        */}
        <Dialog.Content
          data-lenis-prevent
          className="fixed left-space-md right-space-md top-space-md z-[70] max-h-[calc(100dvh-2rem)] origin-top overflow-y-auto overscroll-contain rounded-lg border border-border-hairline bg-surface/95 p-space-lg shadow-panel backdrop-blur-xl data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out focus:outline-none"
        >
          <Dialog.Title className="sr-only">Menu navigasi</Dialog.Title>
          <Dialog.Description className="sr-only">
            Tautan ke seluruh halaman SAVOY.
          </Dialog.Description>

          <div className="flex items-center justify-between">
            <span className="text-label-md font-semibold text-on-surface">
              SAVOY
            </span>
            <Dialog.Close
              className="inline-flex size-10 pointer-coarse:size-11 items-center justify-center rounded-md border border-border-hairline text-on-surface transition-colors hover:bg-surface-container"
              aria-label="Tutup menu"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          <nav className="mt-space-lg">
            <ul className="space-y-space-2xs">
              {navLinks.map((link) => {
                const hasChildren = Boolean(link.children && link.children.length > 0);
                const active = isActivePath(pathname, link.href);
                const isExpanded = expandedSection === link.label;

                if (hasChildren && link.children) {
                  return (
                    <li key={link.href} className="space-y-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSection(isExpanded ? null : link.label)
                        }
                        aria-expanded={isExpanded}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-space-md py-space-sm text-label-lg transition-[background-color,color,translate] duration-200 active:translate-y-px",
                          active
                            ? "bg-surface-container-lowest font-semibold text-on-surface shadow-hairline"
                            : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                        )}
                      >
                        <span>{link.label}</span>
                        <div className="flex items-center gap-2">
                          {active && !isExpanded ? (
                            <span
                              aria-hidden
                              className="size-2 rounded-xs bg-primary-container"
                            />
                          ) : null}
                          <ChevronDown
                            aria-hidden
                            className={cn(
                              "size-4 text-muted-gray transition-transform duration-200",
                              isExpanded && "rotate-180 text-on-surface"
                            )}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <ul className="my-1 ml-3 space-y-0.5 border-l-2 border-primary-container/40 pl-3">
                          <li>
                            <Link
                              href={link.href}
                              aria-current={pathname === link.href ? "page" : undefined}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-3 py-2 text-label-md font-semibold transition-[background-color,color] duration-150 mb-1 border-b border-border-hairline/60",
                                pathname === link.href
                                  ? "bg-surface-container-lowest text-primary shadow-hairline"
                                  : "text-primary hover:bg-surface-container-low"
                              )}
                            >
                              <span>Semua {link.label}</span>
                              <span aria-hidden className="text-xs">→</span>
                            </Link>
                          </li>
                          {link.children.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  aria-current={childActive ? "page" : undefined}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between rounded-md px-3 py-2 text-label-md transition-[background-color,color] duration-150",
                                    childActive
                                      ? "bg-surface-container-lowest font-semibold text-primary shadow-hairline"
                                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                                  )}
                                >
                                  <span>{child.label}</span>
                                  {childActive ? (
                                    <span
                                      aria-hidden
                                      className="size-1.5 rounded-full bg-primary-container"
                                    />
                                  ) : null}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      // Close on navigation: the dialog would otherwise stay
                      // open behind the page the visitor just asked for.
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-space-md py-space-sm text-label-lg transition-[background-color,color,translate] duration-200 active:translate-y-px",
                        active
                          ? "bg-surface-container-lowest font-semibold text-on-surface shadow-hairline"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      )}
                    >
                      {link.label}
                      {active ? (
                        <span
                          aria-hidden
                          className="size-2 rounded-xs bg-primary-container"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-space-lg grid gap-space-xs">
            <WhatsAppCta source="header" className="w-full">
              Konsultasi via WhatsApp
            </WhatsAppCta>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
