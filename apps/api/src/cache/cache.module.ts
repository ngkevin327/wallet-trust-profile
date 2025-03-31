import { Global, Module } from "@nestjs/common";
import { CacheInvalidationListener } from "./cache-invalidation.listener";
import { CacheService } from "./cache.service";

@Global()
@Module({
  providers: [CacheService, CacheInvalidationListener],
  exports: [CacheService],
})
export class CacheModule {}
