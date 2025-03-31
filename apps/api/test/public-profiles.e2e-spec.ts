import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import {
  MOCK_PRIVATE_SLUG,
  PUBLIC_PROFILE_SLUG,
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
        expect(res.body.scoringVersion).toBe("1.0.0");
        expect(res.headers["x-profile-cache-version"]).toBeDefined();
      });
  });

  it("GET /v1/profiles/:slug returns 404 for private profile slug", () => {
    return request(app.getHttpServer()).get(`/v1/profiles/${MOCK_PRIVATE_SLUG}`).expect(404);
  });

  it("GET /v1/profiles/:slug returns 404 for unknown slug", () => {
    return request(app.getHttpServer()).get("/v1/profiles/unknown-slug-xyz").expect(404);
  });

  it("GET /v1/me/profile returns owner profile including private visibility in mock", () => {
    return request(app.getHttpServer())
      .get("/v1/me/profile")
      .expect(200)
      .expect((res) => {
        expect(res.body.slug).toBe(PUBLIC_PROFILE_SLUG);
        expect(res.body.wallets).toHaveLength(1);
      });
  });
});
