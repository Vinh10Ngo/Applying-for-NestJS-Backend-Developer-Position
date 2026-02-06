# Tao .git bang tay (khong can script)

**Mo PowerShell**, chay **tung lenh** sau (copy paste). Dam bao dang o dung thu muc: `E:\cursor _ xin viec`

---

## Buoc 1: Vao dung thu muc

```powershell
cd "E:\cursor _ xin viec"
Get-Location
```

(Kiem tra: Get-Location phai hien `E:\cursor _ xin viec`)

---

## Buoc 2: Xoa .git cu (neu co) roi dung lenh GIT de init

```powershell
if (Test-Path .git) { Remove-Item -Recurse -Force .git }
git init
```

- Neu `git init` thanh cong, ban se thay dong "Initialized empty Git repository..."
- Neu van loi "could not set core.repositoryformatversion": thu dong Cursor/VS Code, mo PowerShell **moi** (Run as Administrator), `cd "E:\cursor _ xin viec"` roi chay lai `git init`.

---

## Buoc 3: Add va commit

```powershell
git add .
git status
git commit -m "Initial commit: NestJS API"
```

---

## Buoc 4: Ket noi GitHub va push

(Tao repo tren https://github.com/new truoc, thay USERNAME va TEN-REPO)

```powershell
git remote add origin https://github.com/USERNAME/TEN-REPO.git
git branch -M main
git push -u origin main
```

---

**Lu y:** Neu ban mo project bang Cursor ma terminal mac dinh la `C:\Users\...\e-cursor-xin-vi-c`, thi thu muc code that la o **C:** chua phai **E:**. Khi do hay mo **File > Open Folder** va chon dung `E:\cursor _ xin viec` de lam viec dung tren o E:.
