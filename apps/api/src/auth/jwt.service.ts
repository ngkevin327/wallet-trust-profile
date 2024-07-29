import { Injectable } from "@nestjs/common";
import { importPKCS8, importSPKI, SignJWT, jwtVerify } from "jose";

export type JwtPayload = {
  sub: string;
  walletAddress: string;
};

@Injectable()
export class JwtService {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly expiresInSec = 86400;

  constructor() {
    this.issuer = process.env.JWT_ISSUER ?? "onchain-reputation";
    this.audience = process.env.JWT_AUDIENCE ?? "onchain-reputation-api";
  }

  private async getPrivateKey() {
    const pem = process.env.JWT_PRIVATE_KEY;
    if (!pem) {
      throw new Error("JWT_PRIVATE_KEY is required");
    }
    return importPKCS8(pem.replace(/\\n/g, "\n"), "RS256");
  }

  private async getPublicKey() {
    const pem = process.env.JWT_PUBLIC_KEY;
    if (!pem) {
      throw new Error("JWT_PUBLIC_KEY is required");
    }
    return importSPKI(pem.replace(/\\n/g, "\n"), "RS256");
  }

  async signAccessToken(payload: JwtPayload): Promise<{ token: string; expiresIn: number }> {
    const key = await this.getPrivateKey();
    const token = await new SignJWT({
      walletAddress: payload.walletAddress,
    })
      .setProtectedHeader({ alg: "RS256" })
      .setSubject(payload.sub)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(`${this.expiresInSec}s`)
      .sign(key);

    return { token, expiresIn: this.expiresInSec };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const key = await this.getPublicKey();
    const { payload } = await jwtVerify(token, key, {
      issuer: this.issuer,
      audience: this.audience,
    });

    const sub = payload.sub;
    const walletAddress = payload.walletAddress;
    if (!sub || typeof sub !== "string") {
      throw new Error("Invalid token subject");
    }
    if (!walletAddress || typeof walletAddress !== "string") {
      throw new Error("Invalid token wallet");
    }

    return { sub, walletAddress };
  }
}
