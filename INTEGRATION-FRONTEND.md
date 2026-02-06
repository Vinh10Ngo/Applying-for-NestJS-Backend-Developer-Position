# Kết hợp Backend API với Frontend

## 1. Phía Backend (API) – đã sẵn sàng

- **CORS:** Đã bật `enableCors({ origin: true })` → frontend chạy ở domain/port bất kỳ (vd: `http://localhost:5173`) đều gọi được API.
- **Base URL API:** `http://localhost:3000/api/v1` (khi chạy local).
- **Tài liệu API:** Swagger tại `http://localhost:3000/api/docs` → frontend dùng để xem endpoint, body, response.

**Việc cần làm (tùy chọn):** Khi deploy production, nên giới hạn CORS theo domain frontend (xem mục 4 bên dưới).

---

## 2. Phía Frontend – cần làm

### 2.1. Cấu hình base URL API

Tạo biến môi trường (vd với Vite):

```env
# .env.development
VITE_API_URL=http://localhost:3000/api/v1
```

```env
# .env.production (khi deploy)
VITE_API_URL=https://your-api-domain.com/api/v1
```

Trong code: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'`.

### 2.2. Gọi API không cần đăng nhập (public)

- **Ví dụ:** Danh sách bài, chi tiết bài, đăng ký, đăng nhập.

```javascript
const res = await fetch(`${API_URL}/articles?page=1&limit=10&published=true`);
const data = await res.json();
```

```javascript
// Đăng nhập
const res = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: '...', password: '...' }),
});
const { access_token, refresh_token, user } = await res.json();
```

### 2.3. Lưu token sau khi đăng nhập

Lưu vào **localStorage** (hoặc sessionStorage / cookie):

```javascript
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token); // nếu dùng refresh
localStorage.setItem('user', JSON.stringify(user));
```

### 2.4. Gọi API cần đăng nhập (có Bearer token)

Gửi header **Authorization** cho mọi request cần bảo vệ:

```javascript
const token = localStorage.getItem('access_token');
const res = await fetch(`${API_URL}/users/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

Dùng **axios** thì set default header:

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### 2.5. Xử lý 401 (token hết hạn / không hợp lệ)

- Nếu **có refresh token:** gọi `POST /api/v1/auth/refresh` với body `{ "refresh_token": "..." }` → lấy `access_token` mới → lưu lại và gọi lại request lỗi.
- Nếu **không refresh được:** xóa token, chuyển user về trang đăng nhập.

### 2.6. Đăng xuất

- Xóa token ở frontend.
- (Tùy chọn) Gọi `POST /api/v1/auth/logout` với body `{ "refresh_token": "..." }` để vô hiệu hóa refresh token.

---

## 3. Tóm tắt checklist Frontend

| Việc | Mô tả |
|------|--------|
| Base URL | Dùng `http://localhost:3000/api/v1` (dev) hoặc biến env |
| Public request | Gọi GET/POST không cần header |
| Login/Register | POST body JSON, lưu `access_token` (+ `refresh_token`, `user`) |
| Request có auth | Gửi header `Authorization: Bearer <access_token>` |
| 401 | Thử refresh token hoặc chuyển về login |
| Logout | Xóa token, có thể gọi `/auth/logout` |

---

## 4. Production: giới hạn CORS (Backend)

Khi deploy, nên chỉ cho phép domain frontend. Trong **.env** thêm:

```env
FRONTEND_URL=https://your-frontend-domain.com
```

Rồi trong **main.ts** đổi thành:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
});
```

(Khi đó frontend cần gửi request với `credentials: 'include'` nếu dùng cookie.)

---

## 5. Danh sách endpoint gợi ý cho Frontend

| Chức năng | Method | Endpoint | Ghi chú |
|-----------|--------|----------|--------|
| Đăng ký | POST | `/api/v1/auth/register` | body: email, password, fullName? |
| Đăng nhập | POST | `/api/v1/auth/login` | body: email, password |
| Refresh token | POST | `/api/v1/auth/refresh` | body: refresh_token |
| Logout | POST | `/api/v1/auth/logout` | body: refresh_token |
| Đổi mật khẩu | POST | `/api/v1/auth/change-password` | Bearer, body: currentPassword, newPassword |
| Thông tin tôi | GET | `/api/v1/users/me` | Bearer |
| Danh sách user (admin) | GET | `/api/v1/users` | Bearer, role admin |
| Danh sách bài | GET | `/api/v1/articles?page=&limit=&published=&search=` | public |
| Chi tiết bài | GET | `/api/v1/articles/:id` | public |
| Tạo bài | POST | `/api/v1/articles` | Bearer, body: title, content?, published? |
| Sửa bài | PUT | `/api/v1/articles/:id` | Bearer |
| Xóa bài | DELETE | `/api/v1/articles/:id` | Bearer |
| Khôi phục bài | PATCH | `/api/v1/articles/:id/restore` | Bearer |

Chi tiết request/response xem tại **Swagger:** `http://localhost:3000/api/docs`.
