"use client";

import { useState } from "react";

type RefreshState = "idle" | "checking" | "ready" | "issue";

export function StoreConnectionRefresh() {
  const [state, setState] = useState<RefreshState>("idle");
  const [message, setMessage] = useState("Refresh store");

  async function refreshStore() {
    setState("checking");
    setMessage("Checking...");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
        headers: { accept: "application/json" },
        signal: controller.signal,
      });

      setState(response.ok ? "ready" : "issue");
      setMessage(response.ok ? "Store ready" : "Service issue");
    } catch {
      setState("issue");
      setMessage("Service issue");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const statusClass =
    state === "ready"
      ? "border-[#c6ff3a]/50 text-[#c6ff3a]"
      : state === "issue"
        ? "border-red-400/50 text-red-300"
        : "border-[#2a2e36] text-[#f4f1ea]";

  return (
    <div className="flex items-center gap-2">
      <button
        className={`rounded-full border px-4 py-2 text-xs font-semibold transition hover:border-[#c6ff3a] hover:text-[#c6ff3a] disabled:cursor-wait disabled:opacity-70 ${statusClass}`}
        disabled={state === "checking"}
        onClick={refreshStore}
        type="button"
      >
        {message}
      </button>
      <span className="sr-only" role="status">
        {state === "idle" ? "" : message}
      </span>
    </div>
  );
}
