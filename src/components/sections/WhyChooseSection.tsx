import { Container } from "@/components/ui/Container";

const reasons = [
  {
    number: "01",
    title: "Comfort that lasts",
    description:
      "Every style is selected with daily wear, support, and easy movement in mind.",
  },
  {
    number: "02",
    title: "Versatile design",
    description:
      "Clean silhouettes and wearable colors make each pair easy to style.",
  },
  {
    number: "03",
    title: "Personal guidance",
    description:
      "Talk directly with Shoesco for sizing, availability, and product advice.",
  },
  {
    number: "04",
    title: "Simple ordering",
    description:
      "Choose your pair online, then complete your order through WhatsApp.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="overflow-hidden py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="relative rounded-[2rem] bg-[#e9e3d8] p-8 sm:p-10">
            <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
            <p className="eyebrow">Why Shoesco</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Less noise. Better choices.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-neutral-600">
              A focused collection, straightforward service, and footwear made
              to feel as good as it looks.
            </p>
            <p className="relative mt-14 text-7xl font-semibold tracking-[-0.08em] text-white/80 sm:text-8xl">
              01-04
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {reasons.map((reason) => (
              <article
                className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#c7a77f] hover:shadow-[0_18px_45px_rgba(35,31,25,0.07)]"
                key={reason.number}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#9a7042]">
                    {reason.number}
                  </p>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c7a77f]" />
                </div>
                <h3 className="mt-10 text-xl font-semibold">{reason.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {reason.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
