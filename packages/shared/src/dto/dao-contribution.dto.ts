export type DaoContributionConfidenceDto =
  | "direct_treasury"
  | "router_inferred"
  | "low_confidence";

export type DaoContributionDto = {
  daoSlug: string;
  daoName: string;
  logoUrl: string | null;
  totalInflowWei: string;
  paymentCount: number;
  tenureDays: number;
  confidence: DaoContributionConfidenceDto;
};
