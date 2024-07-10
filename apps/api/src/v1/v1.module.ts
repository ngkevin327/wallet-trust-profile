import { Module } from "@nestjs/common";
import { ProfilesModule } from "../profiles/profiles.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";

@Module({
  imports: [UsersModule, WalletsModule, ProfilesModule],
})
export class V1Module {}
