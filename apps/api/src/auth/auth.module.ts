import { Module, forwardRef } from "@nestjs/common";
import { IndexerApiModule } from "../indexer/indexer-api.module";
import { ProfilesModule } from "../profiles/profiles.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtService } from "./jwt.service";
import { SiweService } from "./siwe.service";

@Module({
  imports: [
    UsersModule,
    forwardRef(() => WalletsModule),
    forwardRef(() => ProfilesModule),
    IndexerApiModule,
  ],
  controllers: [AuthController],
  providers: [SiweService, AuthService, JwtService, JwtAuthGuard],
  exports: [SiweService, AuthService, JwtService, JwtAuthGuard],
})
export class AuthModule {}
