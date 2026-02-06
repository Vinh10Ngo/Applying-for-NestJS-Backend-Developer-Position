# Đẩy dự án lên Git (GitHub)

Làm **từng bước** trong Terminal (mở bằng **Ctrl + `** trong Cursor), đảm bảo đang ở thư mục dự án (`e:\cursor _ xin việc`).

---

## Bước 1: Vào thư mục dự án

```powershell
cd "e:\cursor _ xin việc"
```

---

## Bước 2: Khởi tạo Git (nếu chưa có)

```powershell
git init
```

---

## Bước 3: Thêm file và commit

```powershell
git add .
git status
git commit -m "Initial commit: NestJS API - Auth, Users, Articles, Swagger, Test, CI, Docker"
```

*(File `.env` đã nằm trong `.gitignore` nên sẽ không bị đẩy lên — an toàn.)*

---

## Bước 4: Tạo repository trên GitHub

1. Vào **https://github.com/new**
2. Điền **Repository name** (vd: `nestjs-mongodb-api`)
3. Chọn **Public**, không tick "Add a README" (vì bạn đã có sẵn)
4. Bấm **Create repository**

---

## Bước 5: Kết nối và đẩy code lên GitHub

GitHub sẽ hiển thị lệnh dạng:

```powershell
git remote add origin https://github.com/TEN-DANG-NHAP-GITHUB/nestjs-mongodb-api.git
git branch -M main
git push -u origin main
```

**Thay `TEN-DANG-NHAP-GITHUB`** bằng username GitHub của bạn, **`nestjs-mongodb-api`** bằng tên repo bạn vừa tạo.

Ví dụ nếu username là `nguyenvan` và repo là `nestjs-api`:

```powershell
git remote add origin https://github.com/nguyenvan/nestjs-api.git
git branch -M main
git push -u origin main
```

Nếu GitHub yêu cầu đăng nhập: dùng **Personal Access Token** thay cho mật khẩu (Settings → Developer settings → Personal access tokens).

---

## Lần sau (đã có remote rồi)

Khi sửa code xong, chỉ cần:

```powershell
cd "e:\cursor _ xin việc"
git add .
git commit -m "Mô tả thay đổi"
git push
```

---

## Lưu ý

- **Không** đẩy file `.env` (đã có trong `.gitignore`).
- Nếu dùng **SSH** thay vì HTTPS, remote sẽ dạng: `git@github.com:TEN-DANG-NHAP/nestjs-mongodb-api.git`.
