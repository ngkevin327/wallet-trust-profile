import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProtocolDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  slug!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsInt()
  chainId!: number;

  @IsOptional()
  @IsString()
  contract?: string;

  @IsString()
  @MaxLength(64)
  category!: string;
}

export class UpdateProtocolDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateDaoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  slug!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsInt()
  chainId!: number;

  @IsOptional()
  @IsString()
  treasury?: string;

  @IsOptional()
  @IsString()
  tokenAddress?: string;
}

export class UpdateDaoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  treasury?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateRiskLabelDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(128)
  title!: string;

  @IsString()
  description!: string;

  @IsIn(["low", "medium", "high"])
  severity!: "low" | "medium" | "high";
}

export class UpdateRiskLabelDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(["low", "medium", "high"])
  severity?: "low" | "medium" | "high";

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
