# NestJS + MongoDB API (Middle Level)

REST API với NestJS và MongoDB: JWT, Refresh Token, RBAC, Articles (CRUD, soft delete, search), Health check, Swagger, Rate limit, Docker.

## Yêu cầu

- Node.js 18+
- MongoDB (local hoặc Atlas)
- npm hoặc yarn

## Biến môi trường

Tạo file `.env` từ `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nest-api
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES=7d
```

**Lưu ý:** Ứng dụng validate các biến bắt buộc khi khởi động. Thiếu hoặc sai sẽ báo lỗi rõ ràng.

## Cài đặt & Chạy

```bash
npm install
npm run start:dev
```

**API version:** Mọi route dùng prefix **/api/v1/** (API versioning).

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`
- Health: `http://localhost:3000/api/v1/health`

## Chạy bằng Docker

```bash
docker-compose up -d
```

API chạy tại `http://localhost:3000`, MongoDB tại `localhost:27017`.

## Cấu trúc chính

```
src/
├── auth/           # Register, Login, Refresh, Logout, Change password
├── users/          # User, GET /me, GET / (admin)
├── articles/       # CRUD, soft delete, restore, search, pagination
├── health/         # GET /health (MongoDB status)
├── common/         # Guards, decorators, filters, interceptors, config
├── app.module.ts
└── main.ts
```

## API Endpoints (base: `/api/v1`)

### Health (public)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/v1/health` | Trạng thái API và kết nối MongoDB |

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/v1/auth/register` | Đăng ký → access_token + refresh_token |
| POST | `/api/v1/auth/login` | Đăng nhập → access_token + refresh_token |
| POST | `/api/v1/auth/refresh` | Body: `{ "refresh_token": "..." }` → cặp token mới |
| POST | `/api/v1/auth/logout` | Body: `{ "refresh_token": "..." }` → vô hiệu hóa refresh |
| POST | `/api/v1/auth/change-password` | Body: currentPassword, newPassword (cần JWT) |

### Users (JWT)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/v1/users/me` | Thông tin user hiện tại |
| GET | `/api/v1/users` | Danh sách user (chỉ **admin**) |

### Articles
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/v1/articles` | Danh sách (query: page, limit, published, search, includeDeleted) — public |
| GET | `/api/v1/articles/:id` | Chi tiết — public |
| POST | `/api/v1/articles` | Tạo bài — JWT |
| PUT | `/api/v1/articles/:id` | Cập nhật (author hoặc admin) — JWT |
| DELETE | `/api/v1/articles/:id` | Xóa mềm (author hoặc admin) — JWT |
| PATCH | `/api/v1/articles/:id/restore` | Khôi phục bài đã xóa mềm — JWT |

## Tính năng middle-level

- **Health check** – GET /api/health (MongoDB, uptime)
- **Validate env** – Fail fast nếu thiếu/sai biến môi trường
- **Exception filter** – Format lỗi thống nhất (statusCode, message, timestamp, path)
- **CORS + Helmet** – Bảo mật header, cấu hình CORS
- **Rate limiting** – 100 request/phút/IP (Throttler)
- **Logging interceptor** – Log method, URL, status, thời gian xử lý
- **Docker** – Dockerfile + docker-compose (API + MongoDB)
- **Swagger** – Tài liệu API tại /api/docs, Bearer auth
- **API versioning** – Prefix /api/v1, dễ mở rộng v2 sau này
- **Unit + E2E test** – Jest, supertest
- **CI** – GitHub Actions: lint, build, test, test:e2e (với MongoDB service)

## Công nghệ

- **NestJS** – Backend framework
- **MongoDB + Mongoose** – Database
- **Passport JWT** – Xác thực
- **class-validator / class-transformer** – Validation DTO
- **bcrypt** – Mã hóa mật khẩu
- **Swagger** – API docs
- **Throttler** – Rate limit
- **Helmet** – Security headers

## Test & CI

- **Unit test:** `npm run test` (Jest, AuthService, ArticlesService)
- **E2E test:** `npm run test:e2e` (cần MongoDB, dùng `MONGODB_URI` hoặc mặc định `localhost:27017/test-e2e`)
- **CI:** GitHub Actions chạy trên push/PR (lint → build → unit test → e2e). MongoDB dùng service container.

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run start:dev` | Chạy development (watch) |
| `npm run build` | Build production |
| `npm run start:prod` | Chạy bản build |
| `npm run lint` | Chạy ESLint |
| `npm run test` | Chạy unit test |
| `npm run test:e2e` | Chạy e2e test |
| `npm run test:cov` | Unit test + coverage |
