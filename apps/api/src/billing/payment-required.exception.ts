import { HttpException, HttpStatus } from "@nestjs/common";
import type { EntitlementFeature } from "@onchain-reputation/shared";
import { UPGRADE_PATH } from "@onchain-reputation/shared";

export class PaymentRequiredException extends HttpException {
  constructor(feature: EntitlementFeature) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        code: "PAYMENT_REQUIRED",
        message: `Premium subscription required for ${feature}`,
        feature,
        upgradeUrl: UPGRADE_PATH,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
