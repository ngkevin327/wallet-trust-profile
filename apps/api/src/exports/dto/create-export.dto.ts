import { IsIn } from "class-validator";

export class CreateExportDto {
  @IsIn(["json", "pdf"])
  format!: "json" | "pdf";
}
