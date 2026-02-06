# Hướng dẫn chạy dự án từng bước

## Bước 1: Mở Terminal trong Cursor
- Nhấn **Ctrl + `** (phím ` cạnh số 1)  
  **hoặc** vào menu **Terminal** → **New Terminal**

---

## Bước 2: Chuyển vào thư mục dự án (bắt buộc)
**Phải làm bước này trước khi chạy bất kỳ lệnh npm nào.** Nếu không, bạn sẽ ở `C:\WINDOWS\system32` và gặp lỗi EPERM / "operation not permitted".

Gõ lệnh sau rồi nhấn **Enter**:

```powershell
cd "e:\cursor _ xin việc"
```

**Kiểm tra:** Đầu dòng prompt phải hiện `PS E:\cursor _ xin việc>` hoặc có đường dẫn chứa `cursor _ xin việc`. Nếu vẫn thấy `PS C:\WINDOWS\system32>` thì chưa đúng thư mục — gõ lại lệnh `cd` trên.

---

## Bước 3: Cài đặt thư viện (dependencies)
Dùng npm của Node.js (tránh lỗi npm trong AppData).

**Quan trọng:** Trong PowerShell phải gõ **`&`** (dấu và) + **dấu cách** trước đường dẫn, rồi mới đến `install`:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```
*(Ký tự & nằm ở phím 7, gõ Shift + 7)*

Đợi đến khi không còn chạy gì (có thể 1–2 phút). Nếu thành công sẽ không báo lỗi màu đỏ.

---

## Bước 4: Chuẩn bị MongoDB (bắt buộc)
Ứng dụng cần MongoDB để chạy.

**Cách A – MongoDB cài trên máy:**
- Cài MongoDB: https://www.mongodb.com/try/download/community  
- Mở **Services** (Windows: `Win + R` → gõ `services.msc` → Enter)  
- Tìm **MongoDB Server** → chuột phải → **Start**

**Cách B – Dùng MongoDB Atlas (trên mây):**
- Đăng ký miễn phí: https://www.mongodb.com/cloud/atlas  
- Tạo cluster, lấy chuỗi kết nối (connection string)  
- Mở file **`.env`** trong thư mục dự án  
- Sửa dòng `MONGODB_URI=...` thành chuỗi Atlas (ví dụ: `mongodb+srv://user:pass@cluster....mongodb.net/nest-api`)

---

## Bước 5: Chạy dự án
Trong cùng terminal (vẫn đang ở thư mục dự án), chạy (nhớ có **`&`** + dấu cách ở đầu):

```powershell
& "C:\Program Files\nodejs\npm.cmd" run start:dev
```

Đợi đến khi thấy dòng tương tự:
```text
Nest application successfully started
```
hoặc
```text
Application is running on: http://localhost:3000
```

---

## Bước 6: Kiểm tra API
- Mở trình duyệt hoặc Postman  
- Truy cập: **http://localhost:3000**  
- Nếu có trang hoặc JSON trả về là API đã chạy.

---

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `Cannot find module...` | Chạy lại **Bước 3** (`npm install`). |
| `connect ECONNREFUSED` / lỗi MongoDB | Kiểm tra **Bước 4**: MongoDB đã chạy hoặc `.env` đã đúng chuỗi Atlas. |
| Cửa sổ terminal đóng mất | Mở lại terminal (**Bước 1**), làm lại **Bước 2** rồi **Bước 5**. |
| Port 3000 đã được dùng | Đổi trong file `.env`: `PORT=3001` (hoặc số khác) rồi chạy lại **Bước 5**. |

---

## Tóm tắt nhanh (khi đã quen)
1. Mở Terminal → `cd "e:\cursor _ xin việc"`
2. `& "C:\Program Files\nodejs\npm.cmd" install`
3. Bật MongoDB (local hoặc Atlas + sửa `.env`)
4. `& "C:\Program Files\nodejs\npm.cmd" run start:dev`
5. Mở http://localhost:3000
