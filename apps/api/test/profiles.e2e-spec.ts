import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";

describe("Profiles (e2e)", () => {
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

  it("GET /v1/me/profile returns mock owner profile", () => {
    return request(app.getHttpServer())
      .get("/v1/me/profile")
      .expect(200)
      .expect((res) => {
        expect(res.body.slug).toBe("demo-builder");
        expect(res.body.wallets).toHaveLength(1);
        expect(res.headers["x-request-id"]).toBeDefined();
      });
  });

  it("GET /v1/profiles/:slug returns 404 for unknown slug", () => {
    return request(app.getHttpServer()).get("/v1/profiles/unknown-slug-xyz").expect(404);
  });
});
