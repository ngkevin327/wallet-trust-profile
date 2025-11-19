import { API_ROUTES } from "@onchain-reputation/shared";
import { apiFetch } from "./client";

export type ScoreHistoryPoint = {
  snapshotId: string;
  createdAt: string;
  reputationIndex: number;
  scoringVersion: string;
};

export async function fetchScoreHistory(): Promise<ScoreHistoryPoint[]> {
  return apiFetch(API_ROUTES.me.scoresHistory);
}
