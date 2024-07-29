import { IsEthereumAddress, IsInt, Min } from "class-validator";

export class NonceRequestDto {
  @IsEthereumAddress()
  address!: string;

  @IsInt()
  @Min(1)
  chainId!: number;
}

export class NonceResponseDto {
  nonce!: string;
  domain!: string;
  uri!: string;
  chainId!: number;
  expirationTime!: string;
}
