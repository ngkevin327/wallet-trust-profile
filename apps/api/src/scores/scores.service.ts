import { Injectable, NotFoundException } from "@nestjs/common";
import type { ScoreBreakdownDto } from "@onchain-reputation/shared";
import { loadScoringConfig } from "./scoring-config.loader";
import { ScoresRepository } from "./scores.repository";

type DimensionJson = Record<string, number>;

@Injectable()
export class ScoresService {
  constructor(private readonly scores: ScoresRepository) {}

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
}
