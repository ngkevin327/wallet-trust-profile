/** Basic EVM address check (0x + 40 hex chars). */
export function isValidEthAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function normalizeEthAddress(value: string): string {
  return value.trim().toLowerCase();
}
