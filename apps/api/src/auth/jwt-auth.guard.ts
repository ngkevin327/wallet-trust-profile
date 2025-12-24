import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthenticatedRequest } from "./current-user.decorator";
import { JwtService } from "./jwt.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid authorization header");
    }

    const token = header.slice(7).trim();
    if (!token || token.split(".").length !== 3) {
      throw new UnauthorizedException("Malformed JWT");
    }

    if (request.path.startsWith("/v1/admin") && !request.headers["x-admin-api-key"]) {
      throw new UnauthorizedException("Admin routes require X-Admin-Api-Key");
    }

    try {
      request.user = await this.jwt.verifyAccessToken(token);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
