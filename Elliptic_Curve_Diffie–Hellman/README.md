# Elliptic Curve Diffie–Hellman (ECDH) — Key Agreement

Cài đặt TypeScript theo đúng lưu đồ & mã giả của bài lý thuyết, dựa trên
**NIST SP 800-56A Rev.3** (ECDH), **NIST SP 800-56C** (HKDF) và
**NIST SP 800-186** (domain parameters).

## Cấu trúc micro (mỗi file = 1 bước trong lưu đồ)

```
Elliptic_Curve_Diffie–Hellman/
├── .env                         # Cấu hình & "khoá cấu hình" (curve, salt, info…)
├── .env.example
├── package.json
├── tsconfig.json
├── keys/                        # Khoá dA, QA, dB, QB (sinh khi chạy init-keys)
└── src/
    ├── index.ts                 # Orchestrator — chạy đúng theo lưu đồ
    ├── config/
    │   └── domainParameters.ts  # [Bước 1] Chọn đường cong & T=(p,a,b,G,n,h)
    ├── core/
    │   ├── keyGenerator.ts      # [Bước 2,3] Sinh (d, Q=d·G)
    │   ├── publicKeyExchange.ts # [Bước 4]  Trao đổi QA, QB
    │   ├── sharedSecret.ts      # [Bước 5,6] SA=dA·QB, SB=dB·QA
    │   ├── secretVerifier.ts    # [Bước 7]  SA == SB ?
    │   ├── kdf.ts               # Nhánh "Có" — K = KDF(S)  (HKDF)
    │   └── symmetricCipher.ts   # Dùng K cho AES-256-GCM
    ├── io/
    │   ├── envLoader.ts         # Đọc .env
    │   └── keyStore.ts          # Ghi/đọc khoá ra file
    ├── scripts/
    │   └── initKeys.ts          # Sinh & lưu khoá cho A, B lần đầu
    └── utils/
        └── logger.ts            # Log có đánh số bước
```

## Chạy

```bash
# 1) Cài đặt dependencies
npm install

# 2) (Tuỳ chọn) Sinh sẵn khoá cho A và B, lưu vào keys/
npm run init-keys

# 3) Thực hiện trao đổi ECDH đầy đủ theo lưu đồ
npm start
```

Lần đầu chạy `npm start`, nếu chưa có khoá trong `keys/`, chương trình sẽ
tự sinh và lưu lại; lần chạy sau sẽ nạp khoá từ file (đúng yêu cầu
"load khoá từ file rồi mới trao đổi").

## Ánh xạ Lý thuyết ↔ Code

| Lý thuyết / Lưu đồ                                    | File thực thi                  |
| ----------------------------------------------------- | ------------------------------ |
| Chọn đường cong & T=(p,a,b,G,n,h)                     | `config/domainParameters.ts`   |
| A: $d_A$, $Q_A = d_A \cdot G$                         | `core/keyGenerator.ts`         |
| B: $d_B$, $Q_B = d_B \cdot G$                         | `core/keyGenerator.ts`         |
| Trao đổi $Q_A, Q_B$                                   | `core/publicKeyExchange.ts`    |
| $S_A = d_A \cdot Q_B$                                 | `core/sharedSecret.ts`         |
| $S_B = d_B \cdot Q_A$                                 | `core/sharedSecret.ts`         |
| $S_A \stackrel{?}{=} S_B$ (constant-time)             | `core/secretVerifier.ts`       |
| $K = \text{KDF}(S)$ (HKDF-SHA256)                     | `core/kdf.ts`                  |
| $C = \text{AES}_K(M)$                                 | `core/symmetricCipher.ts`      |

## Ghi chú bảo mật (đã tuân thủ)

- So sánh $S_A, S_B$ **hằng thời gian** (`crypto.timingSafeEqual`).
- KDF dùng **HKDF** theo SP 800-56C thay vì hash thẳng shared secret.
- Mã hoá đối xứng dùng **AES-256-GCM** (AEAD) với IV 96-bit ngẫu nhiên.
- File khoá riêng ghi với quyền `0600`.
- `.env` và `keys/` được `.gitignore`.
- ⚠️ Module `publicKeyExchange` **không** xác thực danh tính — trong
  triển khai thật cần ký ECDSA hoặc dùng chứng chỉ để chống MITM.
