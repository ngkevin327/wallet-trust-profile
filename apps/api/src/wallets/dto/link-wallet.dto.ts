import { IsArray, IsBoolean, IsEthereumAddress, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class LinkWalletDto {
  @IsEthereumAddress()
  address!: string;

  @IsInt()
  @Min(1)
  chainId!: number;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
