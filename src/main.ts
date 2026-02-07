import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

// CDN cho Swagger UI - fix lỗi path /api/docs/docs/ và MIME type trên Vercel
const SWAGGER_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';

function getSwaggerHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="${SWAGGER_CDN}/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_CDN}/swagger-ui-bundle.js"></script>
  <script src="${SWAGGER_CDN}/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs-json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>`;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: false, // Tắt CSP để Swagger UI chạy được trên Vercel
    }),
  );
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: frontendUrl ? frontendUrl.split(',').map((o) => o.trim()) : true,
    credentials: true,
  });
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

  const config = new DocumentBuilder()
    .setTitle('NestJS API - Xin việc')
    .setDescription('API Auth, Users, Articles (base path: **/api/v1**). Các route có ổ khóa cần bấm **Authorize** và dán access_token.')
    .setVersion('1')
    .addServer('http://localhost:3000', 'Local')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
      'bearer',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Dùng custom HTML + CDN thay vì SwaggerModule.setup để fix lỗi /api/docs/docs/ trên Vercel
  // Dùng full path /api/docs vì getHttpAdapter() không áp dụng global prefix
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/docs-json', (_req: unknown, res: { setHeader: (k: string, v: string) => void; json: (o: unknown) => void }) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(document);
  });
  httpAdapter.get('/api/docs', (_req: unknown, res: { setHeader: (k: string, v: string) => void; send: (html: string) => void }) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getSwaggerHtml());
  });
  httpAdapter.get('/api/docs/', (_req: unknown, res: { setHeader: (k: string, v: string) => void; send: (html: string) => void }) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getSwaggerHtml());
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
