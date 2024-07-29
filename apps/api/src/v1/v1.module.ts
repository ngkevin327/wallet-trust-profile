import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ProfilesModule } from "../profiles/profiles.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";

@Module({
  imports: [AuthModule, UsersModule, WalletsModule, ProfilesModule],
})
export class V1Module {}
