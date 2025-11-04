import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { EntitlementFeature } from "@onchain-reputation/shared";
import { JwtPayload } from "../auth/jwt.service";
import { EntitlementsService } from "./entitlements.service";
import { ENTITLEMENT_KEY } from "./requires-entitlement.decorator";

@Injectable()
export class EntitlementsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlements: EntitlementsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<EntitlementFeature | undefined>(
      ENTITLEMENT_KEY,
      context.getHandler(),
    );
    if (!feature) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const userId = request.user?.sub;
    if (!userId) {
      return false;
    }

    await this.entitlements.assertEntitlement(userId, feature);
    return true;
  }
}
