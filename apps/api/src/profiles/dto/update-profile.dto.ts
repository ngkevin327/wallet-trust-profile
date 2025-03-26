import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import type { ProfileVisibilityDto } from "@onchain-reputation/shared";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  displayName?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(["public", "private"])
  visibility?: ProfileVisibilityDto;
}
