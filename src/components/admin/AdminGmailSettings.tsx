"use client";

import {
  removeGmailConnection,
  saveGmailConnection,
} from "@/app/admin/actions";

export function AdminGmailSettings({
  configured,
  managedByEnvironment,
  result,
  error,
}: {
  configured: boolean;
  managedByEnvironment: boolean;
  result?: string;
  error?: string;
}) {
  const errorMessage =
    error === "invalid"
      ? "Google did not accept that app password. Check that 2-Step Verification is enabled and generate a new 16-character app password."
      : error === "save"
        ? "The Gmail connection was verified, but the encrypted password could not be saved."
        : error === "remove"
          ? "The saved Gmail connection could not be removed."
          : error === "environment"
            ? "Gmail is managed through Vercel environment variables and cannot be changed here."
            : "";

  return (
    <section className="mt-8 max-w-5xl rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gmail confirmation delivery</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Connect Ahmed.rag789@gmail.com with a dedicated Google app password. The password is encrypted in Supabase Vault and is never displayed after saving.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            configured
              ? "bg-emerald-500/15 text-emerald-200"
              : "bg-amber-500/15 text-amber-100"
          }`}
        >
          {configured ? "Email active" : "Not configured"}
        </span>
      </div>

      {result === "saved" && (
        <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Gmail was verified and the encrypted connection was saved.
        </p>
      )}
      {result === "removed" && (
        <p className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          The saved Gmail connection was removed. Buyer emails are now disabled.
        </p>
      )}
      {errorMessage && (
        <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </p>
      )}

      {managedByEnvironment ? (
        <p className="mt-5 text-sm leading-6 text-neutral-400">
          This deployment currently uses Gmail credentials from Vercel. Remove those environment variables and redeploy before managing Gmail here.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <form action={saveGmailConnection} className="contents">
            <label className="text-sm font-semibold">
              {configured ? "Replace Gmail app password" : "Gmail app password"}
              <input
                autoComplete="new-password"
                className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4"
                inputMode="text"
                maxLength={32}
                minLength={16}
                name="gmailAppPassword"
                placeholder="16-character app password"
                required
                type="password"
              />
            </label>
            <button className="h-12 rounded-full bg-[#c6ff3a] px-6 text-sm font-semibold text-[#0f1115]" type="submit">
              Save and test Gmail
            </button>
          </form>
        </div>
      )}

      {configured && !managedByEnvironment && (
        <form
          action={removeGmailConnection}
          className="mt-5"
          onSubmit={(event) => {
            if (!window.confirm("Remove the Gmail connection and stop buyer confirmation emails?")) {
              event.preventDefault();
            }
          }}
        >
          <button className="text-xs font-semibold text-red-300 underline" type="submit">
            Remove Gmail connection
          </button>
        </form>
      )}
    </section>
  );
}
