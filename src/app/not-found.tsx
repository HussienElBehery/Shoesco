import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">404 / Off route</p>
      <h1 className="mt-4 text-4xl font-semibold">That pair is not here.</h1>
      <p className="mt-4 text-neutral-500">Browse the current Shoesoco collection instead.</p>
      <Link className="mt-7 rounded-full bg-[#c6ff3a] px-6 py-3 font-semibold text-[#0f1115]" href="/products">Explore products</Link>
    </main>
  );
}
