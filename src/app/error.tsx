"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-semibold">The page could not be loaded.</h1>
      <p className="mt-4 text-neutral-500">Your cart is safe. Try loading the page again.</p>
      <button className="mt-7 rounded-full bg-[#c6ff3a] px-6 py-3 font-semibold text-[#0f1115]" onClick={reset} type="button">Try again</button>
    </main>
  );
}
