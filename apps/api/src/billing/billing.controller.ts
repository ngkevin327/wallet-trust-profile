import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtPayload } from "../auth/jwt.service";
import { UsersRepository } from "../users/users.repository";
import { EntitlementsService } from "./entitlements.service";
import { StripeService } from "./stripe.service";

@ApiTags("billing")
@Controller("billing")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(
    private readonly stripe: StripeService,
    private readonly entitlements: EntitlementsService,
    private readonly users: UsersRepository,
  ) {}

  @Post("checkout")
  @ApiOperation({ summary: "Create Stripe Checkout session for premium" })
  async createCheckout(@CurrentUser() user: JwtPayload) {
    const dbUser = await this.users.findById(user.sub);
    return this.stripe.createCheckoutSession({
      userId: user.sub,
      email: dbUser?.email,
    });
  }

  @Post("portal")
  @ApiOperation({ summary: "Create Stripe Customer Portal session" })
  async createPortal(@CurrentUser() user: JwtPayload) {
    return this.stripe.createPortalSession(user.sub);
  }

  @Get("subscription")
  @ApiOperation({ summary: "Get current subscription status" })
  async getSubscription(@CurrentUser() user: JwtPayload) {
    const plan = await this.entitlements.getEffectivePlan(user.sub);
    return { plan, upgradeUrl: "/pricing" };
  }
}
