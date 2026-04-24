<p align="center">
  <img src="https://img.shields.io/badge/AES-Encryption-blue?style=for-the-badge&logo=lock&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
</p>

<h1 align="center">🔐 AES Encryption — Pure TypeScript</h1>

<p align="center">
  <b>Triển khai thuật toán mã hoá AES (Advanced Encryption Standard) từ đầu, không dùng thư viện mã hoá bên ngoài.</b>
  <br/>
  Hỗ trợ AES-128 · AES-192 · AES-256 — Theo chuẩn FIPS 197
</p>

---

## ✨ Tính năng

| | Tính năng | Mô tả |
|---|---|---|
| 🔑 | **3 độ dài key** | AES-128 (10 rounds), AES-192 (12 rounds), AES-256 (14 rounds) |
| 🧩 | **Chia nhỏ từng bước** | SubBytes, ShiftRows, MixColumns, AddRoundKey — mỗi bước một file |
| 📐 | **Key Expansion đầy đủ** | RotWord → SubWord → XOR Rcon, xử lý đúng logic `i % Nk` cho cả 3 key size |
| 📊 | **Log chi tiết** | Ghi lại state matrix sau **mỗi bước** của **mỗi round** |
| 📁 | **Xuất JSON + TXT** | Dễ dàng phân tích hoặc đọc trực tiếp |
| 🧮 | **GF(2⁸) arithmetic** | Phép nhân trên trường Galois dùng irreducible polynomial $x^8+x^4+x^3+x+1$ |

---

## 📂 Cấu trúc dự án

```
📦 Code_Advanced_EncryPtion_Standard
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 README.md
│
├── 📂 src/
│   ├── 🚀 index.ts                    ← Entry point (menu + input)
│   ├── 🎯 aes.ts                      ← Điều phối mã hoá
│   │
│   ├── 📂 types/
│   │   └── index.ts                   ← TypeScript interfaces
│   │
│   ├── 📂 constants/
│   │   ├── sbox.ts                    ← Bảng S-Box (256 giá trị)
│   │   ├── inv-sbox.ts               ← Inverse S-Box
│   │   ├── rcon.ts                    ← Round Constants [Rcon 1→10]
│   │   └── rounds-config.ts          ← 128→10r / 192→12r / 256→14r
│   │
│   ├── 📂 math/
│   │   ├── xtime.ts                   ← xtime (×2 trong GF(2⁸))
│   │   └── gf-multiply.ts            ← Nhân 2 số trong GF(2⁸)
│   │
│   ├── 📂 key-expansion/
│   │   ├── rot-word.ts                ← RotWord: xoay trái 1 byte
│   │   ├── sub-word.ts               ← SubWord: thay thế qua S-Box
│   │   ├── key-schedule-core.ts      ← Logic i%Nk (RotWord+Rcon / SubWord / XOR)
│   │   ├── key-expansion.ts          ← Sinh tất cả round keys
│   │   └── index.ts
│   │
│   ├── 📂 operations/
│   │   ├── sub-bytes.ts               ← SubBytes
│   │   ├── shift-rows.ts             ← ShiftRows
│   │   ├── mix-columns.ts            ← MixColumns
│   │   ├── add-round-key.ts          ← AddRoundKey (XOR)
│   │   └── index.ts
│   │
│   └── 📂 utils/
│       ├── converter.ts               ← Hex / String / Bytes chuyển đổi
│       ├── state-matrix.ts            ← Bytes ↔ State 4×4
│       ├── padding.ts                 ← PKCS7 Padding
│       └── logger.ts                  ← Ghi log JSON + TXT
│
└── 📂 logs/                           ← Output (tự tạo khi chạy)
    ├── aes-128-xxxxx.json
    ├── aes-128-xxxxx.txt
    └── ...
```

---

## 🔄 Luồng mã hoá AES

```
            ┌─────────────────┐
            │   Plaintext     │
            │   + Key         │
            └────────┬────────┘
                     │
              ┌──────▼──────┐
              │Key Expansion │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │ AddRoundKey  │  ← Round 0 (Initial)
              └──────┬──────┘
                     │
         ┌───────────▼───────────┐
         │   Round 1 → Nr - 1   │
         │  ┌─────────────────┐  │
         │  │   SubBytes      │  │
         │  │   ShiftRows     │  │
         │  │   MixColumns    │  │
         │  │   AddRoundKey   │  │
         │  └─────────────────┘  │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Final Round (Nr)    │
         │  ┌─────────────────┐  │
         │  │   SubBytes      │  │
         │  │   ShiftRows     │  │
         │  │   AddRoundKey   │  │  ← ⚠️ KHÔNG có MixColumns
         │  └─────────────────┘  │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  Ciphertext  │
              └─────────────┘
```

---

## 🧮 Key Expansion — Logic `i % Nk`

```
W[i] được tính như sau:

  ✅ i % Nk == 0           →  RotWord → SubWord → ⊕ Rcon → ⊕ W[i-Nk]
  ✅ Nk == 8 && i % Nk == 4 →  SubWord → ⊕ W[i-Nk]        (chỉ AES-256)
  ✅ Còn lại                →  W[i-1] ⊕ W[i-Nk]
```

---

## 📋 Bảng cấu hình

| Key Size | Nk (words) | Nb (block) | Nr (rounds) | Key bytes | Round Keys |
|:--------:|:----------:|:----------:|:-----------:|:---------:|:----------:|
| 🟢 128  | 4          | 4          | **10**      | 16        | 44 words   |
| 🟡 192  | 6          | 4          | **12**      | 24        | 52 words   |
| 🔴 256  | 8          | 4          | **14**      | 32        | 60 words   |

---

## 🚀 Cách chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy chương trình
npm run dev

# 3. Hoặc build rồi chạy
npm run build
node dist/index.js
```

### 🖥️ Ví dụ sử dụng

```
╔══════════════════════════════════════════════╗
║   AES ENCRYPTION (Advanced Encryption Standard)  ║
║   Supported: AES-128 / AES-192 / AES-256    ║
╚══════════════════════════════════════════════╝

Chọn độ dài key (bits):
  1) AES-128 (10 rounds)
  2) AES-192 (12 rounds)
  3) AES-256 (14 rounds)

Nhập lựa chọn (1/2/3): 3

✓ Đã chọn AES-256

Nhập chuỗi cần mã hoá: Hello World

🔐 Đang mã hoá "Hello World" bằng AES-256...

╔══════════════════════════════════════════════╗
║                 KẾT QUẢ                     ║
╚══════════════════════════════════════════════╝
  Key Size:          AES-256
  Số rounds:         14
  Ciphertext (hex):  a1b2c3d4e5f6...
  Ciphertext (b64):  obLD1OX2...

📁 Chi tiết từng bước đã được lưu trong thư mục logs/
```

---

## 📖 Tham khảo

- 📘 [FIPS 197 — Advanced Encryption Standard](https://csrc.nist.gov/publications/detail/fips/197/final)
- 📗 [The Rijndael Block Cipher](https://csrc.nist.gov/archive/aes/rijndael/Rijndael-ammended.pdf)

---

<p align="center">
  Made with ❤️ in TypeScript
</p>
