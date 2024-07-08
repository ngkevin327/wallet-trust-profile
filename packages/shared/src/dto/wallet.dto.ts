export type WalletDto = {
  id: string;
  address: string;
  chainScope: string[];
  isPrimary: boolean;
  linkedAt: string;
};

export type WalletOwnerDto = WalletDto & {
  userId: string;
};

export type LinkWalletRequestDto = {
  address: string;
  chainScope: string[];
  isPrimary?: boolean;
};
