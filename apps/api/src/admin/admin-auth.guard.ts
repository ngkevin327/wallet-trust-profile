import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { loadApiEnv } from "../config/env.schema";
import { adminActorId } from "./admin-audit";

export type AdminRequest = Request & { adminActorId?: string };

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const env = loadApiEnv();
    if (!env.adminApiKey) {
      throw new NotFoundException();
    }

    if (env.adminWritesDisabled && env.nodeEnv === "production") {
      throw new ForbiddenException("Admin writes disabled in production");
    }

    const request = context.switchToHttp().getRequest<AdminRequest>();
    const provided = request.headers["x-admin-api-key"];
    if (typeof provided !== "string" || provided !== env.adminApiKey) {
      throw new UnauthorizedException("Invalid admin API key");
    }

    if (env.adminIpAllowlist.length > 0) {
      const clientIp =
        (request.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
        request.ip ??
        request.socket.remoteAddress ??
        "";
      if (!env.adminIpAllowlist.includes(clientIp)) {
        throw new ForbiddenException("IP not in admin allowlist");
      }
    }

    request.adminActorId = adminActorId(provided);
    return true;
  }
}
