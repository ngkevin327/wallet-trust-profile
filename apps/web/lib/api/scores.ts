import { API_ROUTES } from "@onchain-reputation/shared";
import type { ScoreBreakdownDto } from "@onchain-reputation/shared";
import { apiFetch } from "./client";

export function getScoreBreakdown(): Promise<ScoreBreakdownDto> {
  return apiFetch<ScoreBreakdownDto>(API_ROUTES.me.scoresBreakdown);
}
