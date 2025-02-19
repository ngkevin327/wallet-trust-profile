import type { ClassifiedFact } from "../classifier/classifier.service";
import type { ScoringInputs } from "./scoring.types";

const RECENCY_MS = 90 * 24 * 60 * 60 * 1000;

export function buildScoringInputs(
  walletAddress: string,
  facts: ClassifiedFact[],
  linkedAt?: Date,
): ScoringInputs {
  const now = Date.now();
  const recencyCutoff = now - RECENCY_MS;

  let governanceVotes = 0;
  let governanceProtocols = new Set<string>();
  let daoPayments = 0;
  let grantPatterns = 0;
  let inboundPayments = 0;
  let outboundPayments = 0;
  const counterparties = new Set<string>();
  let distinctProtocols = new Set<string>();
  let recentProtocolInteractions = 0;
  let washPairs = 0;

  const wallet = walletAddress.toLowerCase();

  for (const fact of facts) {
    const from = String(fact.raw.from ?? "").toLowerCase();
    const to = String(fact.raw.to ?? "").toLowerCase();

    if (fact.category === "governance") {
      governanceVotes += 1;
      if (fact.protocolId) {
        governanceProtocols.add(fact.protocolId);
      }
    }

    if (fact.category === "dao_contribution") {
      daoPayments += 1;
    }

    if (fact.category === "grant" || fact.raw.grant === true) {
      grantPatterns += 1;
    }

    if (fact.category === "transfer" || fact.category === "protocol_interaction") {
      if (to === wallet) {
        inboundPayments += 1;
      }
      if (from === wallet) {
        outboundPayments += 1;
      }
      const counterparty = from === wallet ? to : from;
      if (counterparty && counterparty !== wallet) {
        counterparties.add(counterparty);
      }
      if (from === wallet && to && counterparties.has(to)) {
        washPairs += 1;
      }
    }

    if (fact.protocolId) {
      distinctProtocols.add(fact.protocolId);
      if (fact.blockTime.getTime() >= recencyCutoff) {
        recentProtocolInteractions += 1;
      }
    }
  }

  const walletAgeDays = linkedAt
    ? Math.max(1, Math.floor((now - linkedAt.getTime()) / (24 * 60 * 60 * 1000)))
    : 365;
  const tenureMonths = Math.min(36, Math.floor(walletAgeDays / 30));
  const totalPayments = inboundPayments + outboundPayments;
  const washRatio = totalPayments > 0 ? washPairs / totalPayments : 0;

  return {
    walletAddress,
    walletAgeDays,
    governanceVotes,
    governanceProtocols: governanceProtocols.size,
    tenureMonths,
    tokenBalanceWeight: Math.min(0.1, governanceVotes > 0 ? 0.05 : 0.02),
    daoPayments,
    grantPatterns,
    inboundPayments,
    outboundPayments,
    uniqueCounterparties: counterparties.size,
    washRatio,
    distinctProtocols: distinctProtocols.size,
    recentProtocolInteractions,
    totalTransactions: facts.length,
  };
}
