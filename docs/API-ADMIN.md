# API cho màn hình Quản trị (Admin)

Base URL: `http://localhost:3000/api/v1`  
Tất cả request (trừ GET công khai) cần header: `Authorization: Bearer <access_token>` và user có `role: admin`.

---

## 1. Quản lý người dùng

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| **GET** | `/users` | Danh sách user (email, tên, vai trò). Chỉ admin. |
| **PATCH** | `/users/:id` | Đổi vai trò user. Body: `{ "role": "admin" }` hoặc `{ "role": "user" }`. Chỉ admin. |

**Ví dụ GET /users response:**
```json
[
  { "id": "...", "email": "user@example.com", "fullName": "...", "name": "...", "role": "user" },
  { "id": "...", "email": "admin@example.com", "fullName": "...", "name": "...", "role": "admin" }
]
```

---

## 2. Quản lý bài viết

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| **GET** | `/articles/admin` | Danh sách tất cả bài (nháp, đã xuất bản, đã xóa). Phân trang + tìm kiếm. Chỉ admin. |
| **PUT** | `/articles/:id` | Sửa bài (title, content, published). Admin hoặc tác giả. |
| **DELETE** | `/articles/:id` | Xóa mềm bài. Admin hoặc tác giả. |
| **PATCH** | `/articles/:id/restore` | Khôi phục bài đã xóa mềm. Admin hoặc tác giả. |

### GET /articles/admin – Query

| Tham số | Kiểu | Mô tả |
|---------|------|--------|
| `page` | number | Trang (mặc định 1). |
| `limit` | number | Số bài mỗi trang (mặc định 10, tối đa 50). |
| `search_term` | string | Tìm trong title và content. |

**Ví dụ:** `GET /articles/admin?page=1&limit=10&search_term=hello`

**Response:**
```json
{
  "items": [
    {
      "_id": "...",
      "title": "...",
      "content": "...",
      "published": true,
      "deletedAt": null,
      "authorId": { "_id": "...", "email": "...", "fullName": "..." },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

## Tóm tắt

- **Màn "Quản trị"** (/) chỉ có hai link: **Quản lý người dùng** → dùng **GET /users**, **PATCH /users/:id**; **Quản lý bài viết** → dùng **GET /articles/admin**, **PUT/DELETE/PATCH /articles/:id**.
- Phân trang và tìm kiếm được xử lý phía server (page, limit, search_term).
