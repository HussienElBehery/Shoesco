"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const panel = panelRef.current;
    const focusable = panel?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((item) => !item.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div aria-label={title} aria-modal="true" className="fixed inset-0 z-[80]" role="dialog">
      <button
        aria-label="Close overlay"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "animate-reveal absolute inset-y-0 w-full max-w-xl overflow-y-auto border-[#2a2e36] bg-[#0f1115] shadow-2xl",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
        )}
        ref={panelRef}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2a2e36] bg-[#0f1115]/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            aria-label={`Close ${title}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2e36] text-xl"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
