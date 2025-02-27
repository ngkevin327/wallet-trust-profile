export type BadgeRule = {
  code: string;
  title: string;
  min_governance_votes?: number;
  min_governance_score?: number;
  min_dao_payments?: number;
  min_grant_patterns?: number;
  min_distinct_protocols?: number;
  min_payment_score?: number;
  min_unique_counterparties?: number;
  min_tenure_months?: number;
  min_wallet_age_days?: number;
  min_contribution_score?: number;
  min_reputation_index: number;
};

export type BadgeCatalog = {
  version: string;
  badges: BadgeRule[];
};
