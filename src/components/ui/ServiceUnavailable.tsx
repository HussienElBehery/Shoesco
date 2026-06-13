import Link from "next/link";

export function ServiceUnavailable({
  title = "The store is temporarily unavailable.",
  message = "We cannot safely confirm current products or availability right now. Please try again shortly or contact Shoesoco directly.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <p className="eyebrow">Temporary service issue</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-5 max-w-xl leading-7 text-neutral-500">{message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="rounded-full bg-[#c6ff3a] px-6 py-3 font-semibold text-[#0f1115]" href="/">
          Try again
        </Link>
        <Link className="rounded-full border border-[#2a2e36] px-6 py-3 font-semibold" href="/contact">
          Contact Shoesoco
        </Link>
      </div>
    </section>
  );
}
