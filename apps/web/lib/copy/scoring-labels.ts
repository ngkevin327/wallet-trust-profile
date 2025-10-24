export type DimensionKey =
  | "governance"
  | "contribution"
  | "paymentReliability"
  | "protocolParticipation";

export type DimensionLabel = {
  title: string;
  shortDescription: string;
  tooltip: string;
  methodologyAnchor: string;
};

export const DIMENSION_LABELS: Record<DimensionKey, DimensionLabel> = {
  governance: {
    title: "Governance participation",
    shortDescription: "Votes, proposals, and delegate activity on DAOs you engage with.",
    tooltip: "Measures consistent participation in on-chain governance, not one-off votes.",
    methodologyAnchor: "#governance",
  },
  contribution: {
    title: "DAO contribution",
    shortDescription: "Treasury work, grants, bounties, and other sustained DAO contributions.",
    tooltip: "Rewards recurring contribution patterns rather than single large transfers.",
    methodologyAnchor: "#contribution",
  },
  paymentReliability: {
    title: "Payment reliability",
    shortDescription: "Timely settlements, stable payment patterns, and low dispute signals.",
    tooltip: "Reflects how reliably this wallet fulfills payment obligations on-chain.",
    methodologyAnchor: "#payment-reliability",
  },
  protocolParticipation: {
    title: "Protocol participation",
    shortDescription: "Breadth and depth of interaction with reputable DeFi and infra protocols.",
    tooltip: "Captures sustained protocol usage without exposing private weighting.",
    methodologyAnchor: "#protocol-participation",
  },
};

export function labelForDimension(key: string): DimensionLabel {
  const known = DIMENSION_LABELS[key as DimensionKey];
  if (known) {
    return known;
  }
  return {
    title: key,
    shortDescription: "On-chain activity contributing to this dimension.",
    tooltip: "See methodology for how this dimension is calculated.",
    methodologyAnchor: "#dimensions",
  };
}

export const INSUFFICIENT_HISTORY_COPY = {
  title: "Building your reputation history",
  body: "We need more indexed on-chain activity before a reputation index can be shown. This is normal for newer wallets.",
  actions: [
    "Participate in a DAO governance vote",
    "Complete a grant or bounty contribution",
    "Link additional wallets you use regularly",
  ],
};
