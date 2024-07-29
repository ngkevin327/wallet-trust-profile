import { IsNotEmpty, IsString } from "class-validator";

export class VerifyRequestDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;
}

export class VerifyResponseDto {
  accessToken!: string;
  expiresIn!: number;
  userId!: string;
}
