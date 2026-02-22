const personas = [
  {
    title: "DAO contributor",
    body: "Show governance participation and treasury inflows across communities you support.",
    accent: "from-violet-500/20 to-brand-500/10",
  },
  {
    title: "Freelancer",
    body: "Demonstrate payment reliability and counterparty diversity to clients.",
    accent: "from-cyan-500/20 to-brand-500/10",
  },
  {
    title: "Builder",
    body: "Highlight protocol usage and long-tenure wallets for grants and partnerships.",
    accent: "from-indigo-500/20 to-brand-500/10",
  },
];

export function Personas() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-bold text-slate-900">
          Built for on-chain professionals
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Whether you coordinate in DAOs, ship as a freelancer, or apply for grants — one profile
          summarizes what matters.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {personas.map((p) => (
            <article
              key={p.title}
              className={`rounded-2xl border border-slate-200/80 bg-gradient-to-br ${p.accent} p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-card`}
            >
              <h3 className="font-display font-semibold text-brand-800">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
