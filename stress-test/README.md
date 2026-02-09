# Stress Test

Stress test cho NestJS API sử dụng [Artillery](https://www.artillery.io/).

## Yêu cầu

- API đang chạy: `npm run start:dev`
- MongoDB đang chạy

## Cài đặt

```bash
npm install
```

(Artillery đã có trong devDependencies)

## Chạy Stress Test

### Test đầy đủ (2 phút 30 giây)

```bash
npm run stress-test
```

Gồm 3 phase:
- **Warm-up** (30s): 5 request/giây
- **Stress** (60s): 20 request/giây
- **Spike** (30s): 50 request/giây

### Test nhanh (20 giây)

```bash
npm run stress-test:quick
```

### Với base URL tùy chỉnh

```bash
npx artillery run stress-test/artillery.yml --target "http://localhost:3000"
```

### Xuất báo cáo HTML

```bash
npx artillery run stress-test/artillery.yml --output report.json
npx artillery report report.json --output report.html
```

Sau đó mở `report.html` trong trình duyệt.

## Endpoints được test

| Endpoint | Mô tả |
|----------|--------|
| GET /api/v1/health | Health check |
| GET /api/v1/articles | Danh sách bài viết |
| GET /api/v1/articles/:id | Chi tiết bài (có thể 404) |
| POST /api/v1/auth/login | Đăng nhập (admin@example.com/admin123) |

**Lưu ý:** Để test login thành công, chạy trước: `node scripts/seed-admin.js`

## Ý nghĩa kết quả

- **Requests**: Tổng số request đã gửi
- **Latency p95/p99**: Thời gian phản hồi (95%, 99% request)
- **RPS**: Requests per second
- **Codes**: Phân bố HTTP status (200, 429 rate limit, v.v.)

Nếu thấy nhiều **429** → API rate limit (100 req/phút) đang hoạt động.
