export type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
};

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 1000,
};

export function getRetryDelay(attempt: number, policy: RetryPolicy = DEFAULT_RETRY_POLICY): number {
  return Math.min(policy.baseDelayMs * 2 ** (attempt - 1), 30_000);
}

export function shouldRetry(attempt: number, policy: RetryPolicy = DEFAULT_RETRY_POLICY): boolean {
  return attempt < policy.maxAttempts;
}
