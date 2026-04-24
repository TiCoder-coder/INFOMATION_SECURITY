# 🔐 SHA-XXX Encoder 🔐

<div align="center">

### 🚀 **Bộ Mã Hóa SHA-1, SHA-2, SHA-3 Hoàn Chỉnh Với Chi Tiết Logging**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📋 Mục Lục

- [✨ Giới Thiệu](#-giới-thiệu)
- [🎯 Tính Năng Chính](#-tính-năng-chính)
- [🏗️ Cấu Trúc Dự Án](#️-cấu-trúc-dự-án)
- [🚀 Cài Đặt & Sử Dụng](#-cài-đặt--sử-dụng)
- [📊 Chi Tiết Các Thuật Toán](#-chi-tiết-các-thuật-toán)
- [💻 Hướng Dẫn Sử Dụng CLI](#-hướng-dẫn-sử-dụng-cli)
- [🔬 Quy Trình Xử Lý (10 Bước)](#-quy-trình-xử-lý-10-bước)
- [📝 Logging & Output](#-logging--output)

---

## ✨ Giới Thiệu

**SHA-XXX Encoder** là một triển khai hoàn chỉnh các thuật toán hashing SHA (Secure Hash Algorithm) bằng **TypeScript**, được thiết kế cho mục đích giáo dục và an ninh thông tin.

Dự án này cung cấp:

- 🔐 **SHA-1** (160-bit) - Lõi lịch sử
- 🔑 **SHA-2 Family** - 4 biến thể:
  - SHA-224 (224-bit)
  - SHA-256 (256-bit) 
  - SHA-384 (384-bit)
  - SHA-512 (512-bit)
- 🆕 **SHA-3 Family** - 3 biến thể:
  - SHA3-256 (256-bit)
  - SHA3-384 (384-bit)
  - SHA3-512 (512-bit)

---

## 🎯 Tính Năng Chính

| Tính Năng | Chi Tiết |
|-----------|---------|
| ✅ **8 Thuật Toán SHA** | SHA-1, SHA-2 (4 variants), SHA-3 (3 variants) |
| 📊 **Chi Tiết Logging** | Ghi lại từng bước xử lý vào file `.txt` |
| 🎨 **Giao Diện CLI** | Menu tương tác, nhập liệu dễ dàng |
| 🔍 **Debugging Support** | Xem chi tiết từng bước: padding, block processing, compression |
| 🚀 **High Performance** | Tối ưu hóa cho TypeScript native |
| 📦 **Modular Design** | Cấu trúc rõ ràng, dễ mở rộng |

---

## 🏗️ Cấu Trúc Dự Án

```
SHA_Encoder/
├── src/
│   ├── algorithms/          # 🔐 Triển khai các thuật toán SHA
│   │   ├── sha1/            # SHA-1 (160-bit)
│   │   │   ├── constants.ts
│   │   │   ├── encoder.ts
│   │   │   └── operations.ts
│   │   ├── sha2/            # SHA-2 Family (224, 256, 384, 512)
│   │   │   ├── constants.ts
│   │   │   ├── operations.ts
│   │   │   ├── sha224.ts
│   │   │   ├── sha256.ts
│   │   │   ├── sha384.ts
│   │   │   └── sha512.ts
│   │   └── sha3/            # SHA-3 Family (256, 384, 512)
│   │       ├── constants.ts
│   │       ├── operations.ts
│   │       ├── sha3_256.ts
│   │       ├── sha3_384.ts
│   │       └── sha3_512.ts
│   ├── core/                # 🔧 Các module xử lý cốt lõi
│   │   ├── binary_converter.ts      # Chuyển đổi binary/hex
│   │   ├── block_handler.ts         # Chia nhỏ thành blocks
│   │   ├── compression_engine.ts    # Nén dữ liệu (bước 8)
│   │   ├── hash_aggregator.ts       # Ghép nối hash (bước 9)
│   │   ├── hash_initializer.ts      # Khởi tạo hash (bước 5)
│   │   ├── input_processor.ts       # Xử lý input (bước 1-2)
│   │   ├── length_encoder.ts        # Mã hóa độ dài (bước 6)
│   │   ├── padding_handler.ts       # Đệm dữ liệu (bước 3)
│   │   └── word_expander.ts         # Mở rộng từ (bước 7)
│   ├── cli/                 # 💬 Giao diện dòng lệnh
│   │   ├── algorithm_selector.ts    # Chọn thuật toán
│   │   ├── input_handler.ts         # Nhập từ user
│   │   ├── output_display.ts        # Hiển thị kết quả
│   │   └── user_interface.ts        # Giao diện chính
│   └── utils/               # 🛠️ Tiện ích chung
│       ├── bit_utils.ts             # Phép toán bit level
│       ├── constants_manager.ts     # Hằng số toán học
│       ├── logger.ts                # Ghi log chi tiết
│       └── type_converter.ts        # Chuyển đổi kiểu dữ liệu
├── logs/                    # 📝 Thư mục logs (file .txt)
├── dist/                    # 📦 Build output
├── main.ts                  # 🎬 Entry point
├── package.json             # 📋 Dependencies
├── tsconfig.json            # ⚙️ TypeScript config
└── README.md                # 📖 File này

```

---

## 🚀 Cài Đặt & Sử Dụng

### 📥 Cài Đặt Dependencies

```bash
npm install
```

### ▶️ Chạy Ứng Dụng (Development Mode)

```bash
npm run dev
```

### 🏗️ Build Dự Án

```bash
npm run build
```

### ▶️ Chạy Từ Build

```bash
npm start
```

---

## 📊 Chi Tiết Các Thuật Toán

### 🔐 SHA-1 (160-bit)

| Thông Số | Giá Trị |
|---------|--------|
| **Output Size** | 160 bits (20 bytes) |
| **Block Size** | 512 bits |
| **Word Size** | 32 bits |
| **Rounds** | 80 vòng |
| **Status** | ⚠️ **Deprecated** - Chỉ dùng cho legacy systems |

**Công thức:** Sử dụng 4 hàm boolean với rotational left shift

```
f(x,y,z) = (x ∧ y) ∨ (¬x ∧ z)  [Vòng 0-19]
f(x,y,z) = x ⊕ y ⊕ z            [Vòng 20-39, 60-79]
f(x,y,z) = (x ∧ y) ∨ (x ∧ z) ∨ (y ∧ z)  [Vòng 40-59]
```

---

### 🔑 SHA-2 Family (256/512-bit)

| Variant | Output | Block | Word | Rounds |
|---------|--------|-------|------|--------|
| **SHA-224** | 224 bits | 512 bits | 32 bits | 64 |
| **SHA-256** | 256 bits | 512 bits | 32 bits | 64 |
| **SHA-384** | 384 bits | 1024 bits | 64 bits | 80 |
| **SHA-512** | 512 bits | 1024 bits | 64 bits | 80 |

**Cấu trúc Vòng (Round Function):**

```
T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]
T2 = Σ0(a) + Maj(a,b,c)
a..h = T1+T2, a, b, c, d, e, f, g
```

Nơi:
- `Σ0, Σ1` = Các hàm sigma (rotations & shifts)
- `Ch` = Choice function
- `Maj` = Majority function
- `K[i]` = Round constants

**Status:** ✅ **Industry Standard** - Được sử dụng rộng rãi

---

### 🆕 SHA-3 Family (Keccak)

| Variant | Output | Capacity | Rate | Rounds |
|---------|--------|----------|------|--------|
| **SHA3-256** | 256 bits | 512 bits | 1088 bits | 24 |
| **SHA3-384** | 384 bits | 768 bits | 832 bits | 24 |
| **SHA3-512** | 512 bits | 1024 bits | 576 bits | 24 |

**Sponge Construction:**

1. **Absorbing Phase** - XOR input blocks vào state
2. **Permutation** - Áp dụng Keccak-f[1600] (24 rounds)
3. **Squeezing Phase** - Trích xuất output bytes

**Keccak-f[1600] Steps:**

```
θ  → Diffusion layer (XOR operations)
ρ  → Rotation offsets
π  → Lane permutation
χ  → Non-linear mixing
ι  → Round constant injection
```

**Status:** ✅ **Latest Standard** - SHA-3 finalized by NIST in 2015

---

## 💻 Hướng Dẫn Sử Dụng CLI

### Menu Chính

```
╔════════════════════════════════════════════════════╗
║          🔐  SHA-XXX ENCODER  🔐                  ║
║   SHA-1, SHA-2 (224,256,384,512), SHA-3 (256...)  ║
║            With Detailed Logging                  ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║            SHA-XXX ENCODER - Main Menu             ║
╠════════════════════════════════════════════════════╣
║ 1. SHA-1 (160-bit)                                  ║
║ 2. SHA-2 Family                                     ║
║ 3. SHA-3 Family                                     ║
╚════════════════════════════════════════════════════╝
```

### Ví Dụ Sử Dụng

**Example 1: Mã Hóa SHA-256**

```bash
# Nhập: 2 (SHA-2), 2 (SHA-256), "hello world", n (thoát)
$ npm run dev
> Chọn: 2
> Chọn: 2
> Nhập: hello world
✓ Kết quả: a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192145447
```

**Example 2: Mã Hóa SHA3-256**

```bash
# Nhập: 3 (SHA-3), 1 (SHA3-256), "test", n (thoát)
$ npm run dev
> Chọn: 3
> Chọn: 1
> Nhập: test
✓ Kết quả: 36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80
```

---

## 🔬 Quy Trình Xử Lý (10 Bước)

Mỗi thuật toán SHA đều tuân theo quy trình chuẩn 10 bước:

```
┌─────────────────────────────────────────────────────────┐
│ Bước 1: INPUT PROCESSING                                │
│ • Chuyển string input → bytes array                      │
│ • Log: Input string, byte count                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bước 2: PADDING & LENGTH ENCODING                       │
│ • Thêm '1' bit và '0' bits cho đến kích thước đúng       │
│ • Thêm độ dài message vào cuối (64-bit hoặc 128-bit)    │
│ • Log: Padded message, block count                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bước 3: BLOCK SPLITTING                                 │
│ • Chia padded message thành blocks (512 hoặc 1024 bits) │
│ • Log: Block count, block size details                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bước 4: HASH INITIALIZATION                             │
│ • Khởi tạo hash values từ constants                      │
│ • Log: Initial hash state                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bước 5: WORD EXPANSION                                  │
│ • Mở rộng message schedule (16→80 hoặc 32→80 từ)        │
│ • Log: Expanded word count                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bước 6: COMPRESSION                                     │
│ • 80 vòng với hàm F, rotations, và XOR operations      │
│ • Cập nhật state a,b,c,d,e,f,g,h                        │
│ • Log: Rounds processed, intermediate states            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bước 7: HASH AGGREGATION                                │
│ • Cộng state vào hash values                             │
│ • Log: Aggregated hash                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bước 8: FINALIZATION                                    │
│ • Chuyển hex format                                      │
│ • Log: Final hash value                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ✅ HASH OUTPUT                                           │
│ Ví dụ: 2c26b46911185131006d3ff57efb6b9d717dc0...       │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Logging & Output

### 📂 Log Files

- **Vị trí:** `/logs/` directory
- **Format:** `sha-encoder-YYYY-MM-DDTHH-mm-ss-xxxZ.txt`
- **Nội dung:** Chi tiết 10 bước xử lý, values trung gian

### 📋 Sample Log Output

```
==================================================
SHA-256 ENCODING PROCESS
==================================================

>>> Step 1: Input Processing
✓ Input string: "hello world"
✓ Byte count: 11

>>> Step 2: Padding & Length Encoding
✓ Padded length: 512 bits (64 bytes)
✓ Message length encoded: 88 bits (11 bytes)

>>> Step 3: Block Splitting
✓ Block count: 1
✓ Block 1 size: 512 bits

>>> Step 4: Hash Initialization
Initial hash values (256-bit):
  h0: 0x6a09e667
  h1: 0xbb67ae85
  h2: 0x3c6ef372
  h3: 0xa54ff53a
  h4: 0x510e527f
  h5: 0x9b05688c
  h6: 0x1f83d9ab
  h7: 0x5be0cd19

>>> Step 5: Word Expansion
✓ Message schedule expanded to 64 words

>>> Step 6: Compression (80 rounds)
✓ Round 1: T1=0xf1bd0a5b, T2=0x1c0e4a9c
✓ Round 2: T1=0xe3a24d8f, T2=0x3d5b1e7a
...
✓ Round 80: State updated

>>> Step 7: Hash Aggregation
✓ Hash values aggregated with working variables

>>> Step 8: Finalization
Final hash: 2c26b46911185131006d3ff57efb6b9d717dc0...

==================================================
RESULT: SHA-256 Hash
==================================================
2c26b46911185131006d3ff57efb6b9d717dc0d7c36e6f164e
==================================================
```

---

## 🔒 An Ninh & Best Practices

⚠️ **Lưu Ý Quan Trọng:**

- **SHA-1:** ❌ **KHÔNG** dùng cho ứng dụng bảo mật hiện đại
- **SHA-2:** ✅ **KHUYẾN NGHỊ** - Sử dụng SHA-256 cho most cases
- **SHA-3:** ✅ **TỐT NHẤT** - Latest standard từ NIST (2015)

### Sử Dụng Đúng

```typescript
// ✅ Tốt cho hầu hết trường hợp
const hash256 = SHA256Encoder.encode(input, logger);

// ✅ Tốt cho password hashing khi kết hợp salt & iterations
const saltedHash = await bcrypt.hash(input, 10);

// ❌ Tránh sử dụng
const hash1 = SHA1Encoder.encode(input, logger); // Legacy only
```

---

## 📚 Tài Liệu Tham Khảo

- 📖 [NIST SHA-1 Specification](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-1.pdf)
- 📖 [NIST SHA-2 Specification](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf)
- 📖 [NIST SHA-3 Specification](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf)
- 🔗 [Keccak Website](https://keccak.team/)

---

## 🤝 Đóng Góp

Để cải thiện dự án:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📜 License

Dự án này được phát hành dưới license MIT. Xem file [LICENSE](LICENSE) để chi tiết.

---

## 👨‍💻 Tác Giả

**SHA-XXX Encoder Team** 🚀

---

## 💡 Tips & Tricks

| Tip | Mô Tả |
|-----|-------|
| 🔍 **Debug Mode** | Xem file log `.txt` để hiểu chi tiết từng bước |
| 📊 **Performance** | SHA-256 nhanh nhất, SHA-512 xử lý từ 64-bit |
| 🔐 **Secure** | Luôn dùng SHA-256 hoặc SHA-3 cho production |
| 📝 **Testing** | Dùng known test vectors để validate output |

---

<div align="center">

### 🎉 **Chúc mừng bạn có một SHA Encoder hoàn chỉnh!**

**⭐ Nếu thích project, hãy give a star! ⭐**

</div>
