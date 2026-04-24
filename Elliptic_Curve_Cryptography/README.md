# Elliptic Curve Cryptography (ECIES) — TypeScript

Triển khai **ECIES** (Elliptic Curve Integrated Encryption Scheme) theo chuẩn **SEC 1** bằng TypeScript, chia nhỏ theo kiểu **micro-module**: mỗi bước thuật toán / mỗi phép toán toán học là một file riêng.

## Sơ đồ lược đồ (khớp với flowchart)

```
 (Chọn đường cong + tham số miền T)
            ↓
 (Bên nhận sinh khóa riêng dV, khóa công khai QV = dV·G)
            ↓
 (Bên gửi nhận QV)
            ↓
 (Nhập thông điệp M)
            ↓
 (Bên gửi sinh cặp khóa tạm thời (k, R),  R = k·G)
            ↓
 (Tính bí mật chung z = k·QV  → Z)
            ↓
 (KDF(Z) → K  → tách EK || MK)
            ↓
 (EM = Encrypt_EK(M) ; TAG = MAC_MK(EM))
            ↓
 (Gửi C = (R, EM, TAG))
            ↓
 (Bên nhận: z = dV·R → KDF → EK, MK)
            ↓
 (Verify TAG ?)
      ├─ Sai → "Không hợp lệ"
      └─ Đúng → M = Decrypt_EK(EM)
```

## Cấu trúc thư mục

Xem thư mục `src/`. Mỗi module **chỉ làm đúng một việc**.

## Chạy demo

```bash
npm install
npm run build
npm start       # chạy src/demo/run-demo.ts
npm test        # chạy unit tests
```
