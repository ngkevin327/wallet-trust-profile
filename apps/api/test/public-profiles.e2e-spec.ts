import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import {
  MOCK_PRIVATE_SLUG,
  PUBLIC_PROFILE_SLUG,
  PUBLIC_WALLET_LOWERCASE,
  mockPublicProfileResponse,
} from "./helpers/seed-profiles";

describe("Public profiles (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? "postgresql://reputation:reputation@localhost:5432/reputation";
    process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
    process.env.JWT_ISSUER = "test";
    process.env.JWT_AUDIENCE = "test";
    process.env.NODE_ENV = "test";
    process.env.SKIP_DB_CONNECT = "true";
    process.env.API_MOCK_MODE = "true";

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1", { exclude: ["health", "ready"] });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /v1/profiles/:slug returns public projection for known slug", () => {
    return request(app.getHttpServer())
      .get(`/v1/profiles/${PUBLIC_PROFILE_SLUG}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.slug).toBe(PUBLIC_PROFILE_SLUG);
        expect(res.body.visibility).toBe("public");
        expect(res.body.scoringVersion).toBe(mockPublicProfileResponse.scoringVersion);
        expect(res.headers["x-profile-cache-version"]).toBeDefined();
      });
  });

  it("GET /v1/profiles/:slug returns 404 for private profile slug", () => {
    return request(app.getHttpServer()).get(`/v1/profiles/${MOCK_PRIVATE_SLUG}`).expect(404);
  });

  it("GET /v1/profiles/:slug returns 404 for unknown slug", () => {
    return request(app.getHttpServer()).get("/v1/profiles/unknown-slug-xyz").expect(404);
  });

  it("GET /v1/profiles/by-wallet/:address resolves profile with mixed-case address", () => {
    return request(app.getHttpServer())
      .get(`/v1/profiles/by-wallet/${PUBLIC_WALLET_LOWERCASE}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.slug).toBe(PUBLIC_PROFILE_SLUG);
        expect(res.headers["x-canonical-slug"]).toBe(PUBLIC_PROFILE_SLUG);
      });
  });

  it("GET /v1/profiles/by-wallet/:address?redirect=true returns 302 to /u/{slug}", () => {
    return request(app.getHttpServer())
      .get(`/v1/profiles/by-wallet/${PUBLIC_WALLET_LOWERCASE}?redirect=true`)
      .expect(302)
      .expect((res) => {
        expect(res.headers.location).toContain(`/u/${PUBLIC_PROFILE_SLUG}`);
      });
  });

  it("cache version header is present on public reads", async () => {
    const first = await request(app.getHttpServer()).get(`/v1/profiles/${PUBLIC_PROFILE_SLUG}`);
    expect(first.headers["x-profile-cache-version"]).toBeDefined();
  });

  it("GET /v1/me/profile returns owner profile (mock does not require auth in dev)", () => {
    return request(app.getHttpServer())
      .get("/v1/me/profile")
      .expect(200)
      .expect((res) => {
        expect(res.body.slug).toBe(PUBLIC_PROFILE_SLUG);
        expect(res.body.wallets).toHaveLength(1);
      });
  });
});
