import { Module } from "@nestjs/common";
import { ProfilesModule } from "../profiles/profiles.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "./jwt.service";
import { SiweService } from "./siwe.service";

@Module({
  imports: [UsersModule, WalletsModule, ProfilesModule],
  controllers: [AuthController],
  providers: [SiweService, AuthService, JwtService, JwtAuthGuard],
  exports: [SiweService, AuthService, JwtService, JwtAuthGuard],
})
export class AuthModule {}
