import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { buildSignedSiweMessage, generateTestJwtKeys, TEST_ACCOUNT } from "./helpers/siwe-test.helper";

describe("Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    generateTestJwtKeys();
    process.env.NODE_ENV = "test";
    delete process.env.SKIP_DB_CONNECT;
    delete process.env.API_MOCK_MODE;
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? "postgresql://reputation:reputation@localhost:5432/reputation";
    process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
    process.env.JWT_ISSUER = "test";
    process.env.JWT_AUDIENCE = "test";
    process.env.SIWE_DOMAIN = "localhost";
    process.env.SIWE_URI = "http://localhost:3000";

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

  it("POST /v1/auth/nonce issues nonce", async () => {
    const res = await request(app.getHttpServer())
      .post("/v1/auth/nonce")
      .send({ address: TEST_ACCOUNT.address, chainId: 1 })
      .expect(201);

    expect(res.body.nonce).toBeDefined();
    expect(res.body.domain).toBe("localhost");
  });

  it("POST /v1/auth/verify rejects invalid signature", async () => {
    const nonceRes = await request(app.getHttpServer())
      .post("/v1/auth/nonce")
      .send({ address: TEST_ACCOUNT.address, chainId: 1 });

    const { message } = await buildSignedSiweMessage({
      nonce: nonceRes.body.nonce,
      domain: nonceRes.body.domain,
      uri: nonceRes.body.uri,
      chainId: 1,
    });

    await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ message, signature: "0xinvalid" })
      .expect(401);
  });

  it("POST /v1/auth/verify rejects replayed nonce", async () => {
    const nonceRes = await request(app.getHttpServer())
      .post("/v1/auth/nonce")
      .send({ address: TEST_ACCOUNT.address, chainId: 1 });

    const { message, signature } = await buildSignedSiweMessage({
      nonce: nonceRes.body.nonce,
      domain: nonceRes.body.domain,
      uri: nonceRes.body.uri,
      chainId: 1,
    });

    await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ message, signature })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });

    await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ message, signature })
      .expect(401);
  });

  it("POST /v1/auth/verify happy path returns JWT", async () => {
    const nonceRes = await request(app.getHttpServer())
      .post("/v1/auth/nonce")
      .send({ address: TEST_ACCOUNT.address, chainId: 1 })
      .expect(201);

    const { message, signature } = await buildSignedSiweMessage({
      nonce: nonceRes.body.nonce,
      domain: nonceRes.body.domain,
      uri: nonceRes.body.uri,
      chainId: 1,
    });

    const verifyRes = await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ message, signature })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });

    expect(verifyRes.body.accessToken).toBeDefined();
    expect(verifyRes.body.userId).toBeDefined();
  });
});
