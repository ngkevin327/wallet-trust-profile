import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let code = "INTERNAL_ERROR";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "string") {
        message = body;
      } else if (typeof body === "object" && body !== null && "message" in body) {
        const msg = (body as { message: string | string[] }).message;
        message = Array.isArray(msg) ? msg.join(", ") : msg;
        const extra = body as Record<string, unknown>;
        if (typeof extra.code === "string") {
          code = extra.code;
        }
        if (extra.feature) {
          response.status(status).json({
            statusCode: status,
            code,
            message,
            feature: extra.feature,
            upgradeUrl: extra.upgradeUrl,
            requestId: request.requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
          });
          return;
        }
      }
      if (code === "ERROR") {
        code = this.codeFromStatus(status);
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        status = HttpStatus.CONFLICT;
        message = "Resource already exists";
        code = "CONFLICT";
      } else if (exception.code === "P2025") {
        status = HttpStatus.NOT_FOUND;
        message = "Resource not found";
        code = "NOT_FOUND";
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      case HttpStatus.PAYMENT_REQUIRED:
        return "PAYMENT_REQUIRED";
      case 429:
        return "RATE_LIMITED";
      default:
        return "ERROR";
    }
  }
}
