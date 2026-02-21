import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CommonModule } from "../common/common.module";
import { UsersModule } from "../users/users.module";
import { WalletsController } from "./wallets.controller";
import { WalletsRepository } from "./wallets.repository";
import { WalletsService } from "./wallets.service";

@Module({
  imports: [forwardRef(() => AuthModule), CommonModule, UsersModule],
  controllers: [WalletsController],
  providers: [WalletsRepository, WalletsService],
  exports: [WalletsRepository, WalletsService],
})
export class WalletsModule {}
