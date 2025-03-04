export type TrustSignalDto = {
  code: string;
  label: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  reason: string;
};
