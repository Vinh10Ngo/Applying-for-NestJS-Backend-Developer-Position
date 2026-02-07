# Tách commit theo từng chức năng

Bạn đã commit dồn một lần, giờ muốn tách thành nhiều commit theo chức năng.

---

## Cách 1: Chạy script (nhanh)

**Trong terminal**, mở tại thư mục dự án (ví dụ `E:\cursor _ xin việc`) rồi chạy:

```powershell
.\scripts\split-commits.ps1
```

Script sẽ:
1. **Reset soft** commit gần nhất (bỏ commit, giữ nguyên thay đổi trong working tree).
2. **Unstage** hết.
3. **Add + commit** lần lượt theo nhóm:
   - `feat(admin): PATCH /users/:id - đổi vai trò user`
   - `feat(admin): GET /articles/admin - quản lý bài viết (phân trang + tìm kiếm)`
   - `docs: API Admin - tài liệu API quản trị`
4. Hỏi có muốn commit **phần còn lại** (file khác) thành một commit nữa hay không.

Nếu commit gần nhất của bạn không phải "handle admin" mà là cả đống file khác, hãy **sửa lại** trong script `scripts/split-commits.ps1`: đổi danh sách `Paths` và `Name` cho từng nhóm cho đúng với dự án của bạn.

---

## Cách 2: Làm tay từng bước

### Bước 1: Hủy commit, giữ thay đổi

```powershell
git reset --soft HEAD~1
git reset
```

- `reset --soft HEAD~1`: bỏ 1 commit cuối, mọi thay đổi vẫn nằm trong staging.
- `reset`: bỏ hết khỏi staging (chỉ còn trong working tree).

### Bước 2: Commit từng nhóm

Thêm từng nhóm file rồi commit với message tương ứng:

```powershell
# Nhom 1: Admin - doi role user
git add src/users/dto/update-user-role.dto.ts src/users/users.service.ts src/users/users.controller.ts
git commit -m "feat(admin): PATCH /users/:id - doi vai tro user"

# Nhom 2: Admin - danh sach bai viet
git add src/articles/articles.controller.ts
git commit -m "feat(admin): GET /articles/admin, phan trang + search_term"

# Nhom 3: Docs
git add docs/API-ADMIN.md
git commit -m "docs: API Admin"

# Con lai (neu co)
git add -A
git status
git commit -m "chore: cac thay doi con lai"
```

Có thể đổi tên message và nhóm file cho đúng với từng chức năng bạn muốn.

### Bước 3: Kiểm tra

```powershell
git log --oneline -10
```

---

## Nếu đã push lên remote

Sau khi tách commit, lịch sử đã đổi nên push bình thường sẽ bị từ chối. Dùng:

```powershell
git push --force-with-lease
```

**Lưu ý:** Chỉ dùng khi bạn chắc không ai khác đang làm việc trên cùng nhánh (hoặc đã thống nhất với họ).

---

## Tóm tắt

| Cách | Khi nào dùng |
|------|----------------|
| **Script** | Commit gần nhất đúng là “handle admin” (users + articles admin + docs). |
| **Làm tay** | Commit có nhiều file khác, muốn tự quyết định nhóm và message. |

Sửa `scripts/split-commits.ps1` (paths + message) nếu cấu trúc repo hoặc tên file của bạn khác.
