const personas = [
  {
    title: "DAO contributor",
    body: "Show governance participation and treasury inflows across communities you support.",
  },
  {
    title: "Freelancer",
    body: "Demonstrate payment reliability and counterparty diversity to clients.",
  },
  {
    title: "Builder",
    body: "Highlight protocol usage and long-tenure wallets for grants and partnerships.",
  },
];

export function Personas() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold text-slate-900">Built for on-chain professionals</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {personas.map((p) => (
            <article key={p.title} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-medium text-brand-700">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
