import { Container } from "@/components/ui/Container";

const services = [
  ["01", "Two focused categories", "Sneakers and running shoes, chosen well."],
  ["02", "Personal sizing", "Talk directly with us before you order."],
  ["03", "Easy ordering", "Reserve your pair quickly through WhatsApp."],
];

export function ServiceStrip() {
  return (
    <section className="border-y border-neutral-200/80 bg-[#181b21]">
      <Container className="grid divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
        {services.map(([number, title, description]) => (
          <div
            className="flex gap-5 py-7 md:px-8 md:first:pl-0 md:last:pr-0 lg:py-9"
            key={number}
          >
            <span className="pt-0.5 text-xs font-bold text-[#c6ff3a]">
              {number}
            </span>
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {description}
              </p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
