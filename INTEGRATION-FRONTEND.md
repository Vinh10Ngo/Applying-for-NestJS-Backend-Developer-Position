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
| Danh sách bài | GET | `/api/v1/articles?page=&limit=&published=&search_term=&sort=&order=&authorId=` | public, xem bảng query bên dưới |
| Danh sách bài (admin) | GET | `/api/v1/articles/admin?page=&limit=&search_term=&sort=&order=&authorId=` | Bearer, admin |
| Bài của tôi | GET | `/api/v1/articles/me?includeDeleted=` | Bearer |
| Chi tiết bài | GET | `/api/v1/articles/:id` | public |
| Tạo bài | POST | `/api/v1/articles` | Bearer, body: title, content?, published? |
| Sửa bài | PUT | `/api/v1/articles/:id` | Bearer |
| Xóa bài | DELETE | `/api/v1/articles/:id` | Bearer |
| Khôi phục bài | PATCH | `/api/v1/articles/:id/restore` | Bearer |
| **Audit log (admin)** | GET | `/api/v1/audit?page=&limit=&userId=&resource=&action=` | Bearer, admin |

**Query danh sách bài (GET /articles):**

| Query | Kiểu | Mô tả |
|-------|------|--------|
| `page` | number | Trang (mặc định 1) |
| `limit` | number | Số bài/trang (tối đa 50, mặc định 10) |
| `published` | "true" \| "false" | Chỉ bài đã xuất bản |
| `search_term` | string | Tìm kiếm full-text trong title, content |
| `includeDeleted` | "true" \| "false" | Bao gồm bài đã xóa mềm (admin/me) |
| **`sort`** | "createdAt" \| "updatedAt" \| "title" | Sắp xếp theo trường |
| **`order`** | "asc" \| "desc" | Thứ tự |
| **`authorId`** | string (ObjectId) | Lọc theo tác giả |

Chi tiết request/response xem tại **Swagger:** `http://localhost:3000/api/docs`.

---

## 6. Frontend cần thêm gì (sau khi backend có tính năng nâng cao)

Backend đã có: **cache**, **audit log**, **sort/filter articles**, **full-text search**, **request ID**. Phía frontend có thể bổ sung như sau.

### 6.1. Không bắt buộc (API vẫn tương thích cũ)

- **Cache:** Backend tự cache GET danh sách bài 1 phút. Frontend không cần đổi gì.
- **Full-text search:** Vẫn dùng query `search_term` như trước (backend đã chuyển sang tìm full-text).
- **Request ID:** Nếu cần trace lỗi, frontend có thể đọc header `x-request-id` từ response và gửi kèm khi báo lỗi cho support.

### 6.2. Nên thêm (trải nghiệm tốt hơn)

**Trang danh sách bài (và trang admin bài):**

- **Ô chọn sắp xếp:** dropdown hoặc tab `sort` = `createdAt` | `updatedAt` | `title`.
- **Ô thứ tự:** `order` = `asc` | `desc` (ví dụ: “Mới nhất / Cũ nhất”, “A→Z / Z→A”).
- **Lọc theo tác giả (admin):** nếu có danh sách user, thêm filter `authorId` khi gọi `GET /articles` hoặc `GET /articles/admin`.

Ví dụ URL:

```
GET /api/v1/articles?page=1&limit=10&sort=updatedAt&order=desc
GET /api/v1/articles?search_term=hello&sort=title&order=asc
GET /api/v1/articles/admin?authorId=507f1f77bcf86cd799439011
```

### 6.3. Trang mới (admin) – Audit log

- Chỉ dành cho **role admin**, gọi `GET /api/v1/audit` với Bearer token.
- Query: `page`, `limit`, `userId`, `resource` (vd: `article`, `auth`), `action` (vd: `create`, `login`, `soft_delete`).
- Hiển thị bảng: thời gian, user, action, resource, resourceId, ip, userAgent (tùy chọn).

Ví dụ:

```javascript
const res = await fetch(
  `${API_URL}/audit?page=1&limit=20&resource=article`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const { items, total, page, totalPages } = await res.json();
```

### 6.4. Tóm tắt

| Hạng mục | Frontend cần |
|----------|----------------|
| Cache, full-text search, request ID | Không bắt buộc thay đổi |
| Sort / order / authorId | Thêm UI chọn sort, order, filter author (admin) |
| Audit log | Trang admin mới: gọi GET /audit, hiển thị bảng log |
