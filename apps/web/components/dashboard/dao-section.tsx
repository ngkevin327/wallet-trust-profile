import type { DaoContributionDto } from "@onchain-reputation/shared";
import { Badge } from "../ui/badge";

type Props = {
  contributions: DaoContributionDto[] | undefined;
};

const confidenceLabel: Record<DaoContributionDto["confidence"], string> = {
  direct_treasury: "Verified treasury",
  router_inferred: "Inferred",
  low_confidence: "Low confidence",
};

export function DaoSection({ contributions }: Props) {
  if (!contributions?.length) {
    return null;
  }

  return (
    <section className="ui-card">
      <h2 className="text-lg font-semibold text-slate-900">DAO contributions</h2>
      <p className="mt-1 text-sm text-slate-500">
        Top treasury inflows from the DAO registry. Confidence reflects attribution strength.
      </p>
      <ul className="mt-4 space-y-3">
        {contributions.map((dao) => (
          <li
            key={dao.daoSlug}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 last:border-0"
          >
            <div>
              <p className="font-medium text-slate-900">{dao.daoName}</p>
              <p className="text-xs text-slate-500">
                {dao.paymentCount} payments · {dao.tenureDays}d tenure
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                tone={
                  dao.confidence === "direct_treasury"
                    ? "success"
                    : dao.confidence === "router_inferred"
                      ? "warning"
                      : "neutral"
                }
              >
                {confidenceLabel[dao.confidence]}
              </Badge>
              <span className="text-sm font-mono text-slate-600">
                {Number(BigInt(dao.totalInflowWei) / BigInt(10 ** 18))} ETH
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
