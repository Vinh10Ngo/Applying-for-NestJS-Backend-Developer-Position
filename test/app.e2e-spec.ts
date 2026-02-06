import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-e2e';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'e2e-refresh-secret';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const base = '/api/v1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
      defaultVersion: '1',
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /api/v1/health returns 200 and status', () => {
      return request(app.getHttpServer())
        .get(`${base}/health`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('mongodb');
        });
    });
  });

  describe('Auth', () => {
    const email = `e2e-${Date.now()}@example.com`;
    const password = '123456';
    let accessToken: string;

    it('POST /api/v1/auth/register returns 201 and tokens', () => {
      return request(app.getHttpServer())
        .post(`${base}/auth/register`)
        .send({ email, password, fullName: 'E2E User' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body.user).toMatchObject({ email });
          accessToken = res.body.access_token;
        });
    });

    it('POST /api/v1/auth/login returns 201 and tokens', () => {
      return request(app.getHttpServer())
        .post(`${base}/auth/login`)
        .send({ email, password })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          accessToken = res.body.access_token;
        });
    });

    it('GET /api/v1/users/me returns 200 with user when authorized', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(`${base}/auth/login`)
        .send({ email, password });
      const token = loginRes.body.access_token;

      return request(app.getHttpServer())
        .get(`${base}/users/me`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', email);
        });
    });

    it('GET /api/v1/users/me returns 401 without token', () => {
      return request(app.getHttpServer())
        .get(`${base}/users/me`)
        .expect(401);
    });
  });
});
