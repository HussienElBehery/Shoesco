"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const INTRO_STORAGE_KEY = "shoesoco-intro-seen";

export function HomeExperience({
  hero,
  content,
}: {
  hero: ReactNode;
  content: ReactNode;
}) {
  const [introVisible, setIntroVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const alreadySeen = window.sessionStorage.getItem(INTRO_STORAGE_KEY);

    if (alreadySeen) {
      const skipTimer = window.setTimeout(() => setIntroVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const readyTimer = window.setTimeout(
      () => setIntroReady(true),
      reduceMotion ? 0 : 1250,
    );
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(readyTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (introReady) continueButtonRef.current?.focus();
  }, [introReady]);

  useEffect(() => {
    if (!introVisible || !introReady) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") continueToStore();
      if (event.key === "Tab") {
        event.preventDefault();
        continueButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  function continueToStore() {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
    setLeaving(true);
    document.body.style.overflow = "";
    window.setTimeout(() => setIntroVisible(false), 700);
  }

  return (
    <>
      {introVisible && (
        <div
          aria-label="Welcome to Shoesoco"
          aria-modal="true"
          className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0f1115] transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${
            leaving ? "-translate-y-full" : "translate-y-0"
          }`}
          data-testid="site-intro"
          role="dialog"
        >
          <div className="absolute inset-x-0 top-1/2 h-px origin-left bg-[#c6ff3a] intro-line" />
          <div className="relative flex w-full max-w-3xl flex-col items-center px-7 text-center">
            <div className="intro-logo relative h-44 w-full max-w-xl sm:h-64">
              <Image
                alt="Shoesoco"
                className="object-contain"
                fill
                priority
                sizes="(min-width: 640px) 576px, 90vw"
                src="/images/Logo-transparent.png"
              />
            </div>
            <p className="intro-subtitle mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-[#c6ff3a] sm:mt-3">
              Everyday movement, refined
            </p>
            <button
              className={`mt-10 inline-flex min-w-48 items-center justify-center rounded-full border border-[#c6ff3a] bg-[#c6ff3a] px-7 py-4 text-sm font-black text-[#0f1115] shadow-[0_0_42px_rgba(198,255,58,0.28)] transition duration-500 hover:bg-[#d4ff6b] focus-visible:outline-[#f4f1ea] ${
                introReady
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              }`}
              disabled={!introReady}
              onClick={continueToStore}
              ref={continueButtonRef}
              type="button"
            >
              Continue to Shoesoco
            </button>
          </div>
        </div>
      )}
      <div className={introVisible ? "home-hero-wait" : "home-hero-ready"}>
        {hero}
      </div>
      <div className={introVisible ? "home-content-wait" : "home-content-ready"}>
        {content}
      </div>
    </>
  );
}
