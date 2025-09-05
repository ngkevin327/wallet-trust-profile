const props = [
  {
    title: "Verifiable",
    body: "Scores derive from indexed on-chain facts and immutable snapshots — not self-reported claims.",
  },
  {
    title: "Portable",
    body: "Share a public URL or resolve by wallet address. Your reputation travels with your identity.",
  },
  {
    title: "Privacy-aware",
    body: "Switch to a private profile anytime. Public endpoints return 404 — no existence leak.",
  },
];

export function ValueProps() {
  return (
    <section className="border-t border-slate-200 bg-white py-16">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-3">
        {props.map((item) => (
          <div key={item.title} className="ui-card">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
