import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RegistryModule } from "../registry/registry.module";
import { ProfilesModule } from "../profiles/profiles.module";
import { ScoresModule } from "../scores/scores.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";

@Module({
  imports: [
    AuthModule,
    RegistryModule,
    UsersModule,
    WalletsModule,
    ProfilesModule,
    ScoresModule,
  ],
})
export class V1Module {}
