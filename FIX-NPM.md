# Sửa lỗi: Cannot find module '...npm-prefix.js'

Lỗi xảy ra khi cấu hình npm trỏ sai thư mục (thường do cài Node/npm không chuẩn hoặc copy Node sang ổ khác).

---

## Cách 1: Cài lại Node.js (khuyên dùng)

1. **Gỡ Node.js**
   - Windows: Cài đặt → Ứng dụng → Node.js → Gỡ cài đặt.

2. **Xóa thư mục npm cũ (tránh dùng lại cấu hình hỏng)**
   - Xóa folder: `C:\Users\PC MSI\AppData\Roaming\npm`
   - Xóa folder: `C:\Users\PC MSI\AppData\Roaming\npm-cache`
   - (Nếu có) Xóa: `C:\Program Files\nodejs`

3. **Cài lại Node.js LTS**
   - Vào https://nodejs.org → tải bản **LTS**.
   - Chạy installer, next đến hết (sẽ cài cả Node + npm vào `C:\Program Files\nodejs`).

4. **Mở terminal mới**, chạy:
   ```powershell
   node -v
   npm -v
   ```
   Cả hai có version là được.

5. **Chạy lại dự án**
   ```powershell
   cd "E:\cursor _ xin việc"
   npm run start:dev
   ```

---

## Cách 2: Chỉ sửa cấu hình npm (nếu không muốn gỡ Node)

Nếu bạn đang dùng Node cài ở **C:\Program Files\nodejs**:

1. **Mở file (hoặc tạo mới):**
   ```
   C:\Users\PC MSI\.npmrc
   ```

2. **Sửa/xóa dòng `prefix` sai.** Ví dụ file chỉ nên có:
   ```
   prefix=C:\Users\PC MSI\AppData\Roaming\npm
   ```
   Hoặc xóa hết nội dung file `.npmrc` để npm dùng mặc định.

3. **Reset prefix bằng lệnh** (chạy trong CMD/PowerShell **mở bằng Run as Administrator**):
   ```powershell
   "C:\Program Files\nodejs\npm.cmd" config delete prefix
   "C:\Program Files\nodejs\npm.cmd" config delete cache
   ```

4. Đóng terminal, mở lại rồi chạy:
   ```powershell
   "C:\Program Files\nodejs\npm.cmd" -v
   ```

---

## Cách 3: Máy đang dùng Node trên ổ E:\

Trong thư mục dự án bạn có thể **không cần npm toàn cục**, chỉ cần dùng `node` và `node_modules` local:

- Chạy script bằng **node** (đã dùng ở bước trước):
  ```powershell
  cd "E:\cursor _ xin việc"
  node node_modules\@nestjs\cli\bin\nest.js start --watch
  ```

- Hoặc thêm **npm local** vào PATH tạm thời trong session PowerShell:
  ```powershell
  cd "E:\cursor _ xin việc"
  $env:PATH = "E:\cursor _ xin việc\node_modules\.bin;$env:PATH"
  npm run start:dev
  ```
  (Chỉ dùng được nếu lệnh `npm` tìm thấy là bản trong project hoặc bản trên E: đúng cấu trúc.)

---

## Tóm tắt

| Cách | Khi nào dùng |
|------|----------------|
| **Cách 1** | Muốn npm chạy chuẩn cho mọi dự án, không ngại cài lại Node. |
| **Cách 2** | Node đã cài ở Program Files, chỉ bị lỗi prefix/config. |
| **Cách 3** | Tạm thời chạy dự án bằng `node ... nest.js` hoặc PATH local. |

Sau khi sửa xong, chạy `npm -v` và `npm run start:dev` trong thư mục `E:\cursor _ xin việc` để kiểm tra.
