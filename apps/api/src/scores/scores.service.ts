import { Injectable, NotFoundException } from "@nestjs/common";
import { EntitlementsService } from "../billing/entitlements.service";
import type { ScoreBreakdownDto } from "@onchain-reputation/shared";
import { loadScoringConfig } from "./scoring-config.loader";
import { ScoresRepository } from "./scores.repository";

type DimensionJson = Record<string, number>;

@Injectable()
export class ScoresService {
  constructor(
    private readonly scores: ScoresRepository,
    private readonly entitlements: EntitlementsService,
  ) {}

  async getBreakdownForWallet(walletId: string): Promise<ScoreBreakdownDto> {
    const snapshot = await this.scores.findLatestSnapshot(walletId);
    if (!snapshot) {
      throw new NotFoundException("No score snapshot available");
    }

    const config = loadScoringConfig();
    const dimensions = snapshot.dimensions as DimensionJson;

    const breakdown = Object.entries(dimensions).map(([key, score]) => ({
      key,
      score,
      weight: config.dimensions[key as keyof typeof config.dimensions]?.weight ?? 0,
      factors: [],
    }));

    return {
      scoringVersion: snapshot.scoringVersion,
      reputationIndex: snapshot.reputationIndex,
      inputsHash: snapshot.inputsHash,
      snapshotId: snapshot.id,
      createdAt: snapshot.createdAt.toISOString(),
      dimensions: breakdown,
    };
  }

  async getHistoryForWallet(userId: string, walletId: string) {
    await this.entitlements.assertEntitlement(userId, "score_history");

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const rows = await this.scores.findSnapshotsForWallet(walletId, since);
    return rows.map((row) => ({
      snapshotId: row.id,
      createdAt: row.createdAt.toISOString(),
      reputationIndex: row.reputationIndex,
      scoringVersion: row.scoringVersion,
    }));
  }
}
