import { ConflictException } from "@nestjs/common";

export class WalletConflictError extends ConflictException {
  constructor(address: string) {
    super({
      code: "WALLET_ALREADY_LINKED",
      message:
        "This wallet is already linked to another account. Sign in with that wallet or contact support.",
      address: address.toLowerCase(),
    });
  }
}
