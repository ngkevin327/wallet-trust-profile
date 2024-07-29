import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { SiweService } from "./siwe.service";

@Module({
  controllers: [AuthController],
  providers: [SiweService],
  exports: [SiweService],
})
export class AuthModule {}
