<div align="center">
  <h1>🛡️ CODE INFORMATION SECURITY & CRYPTOGRAPHY 🛡️</h1>
  <p><b>Hệ Sinh Thái Các Thuật Toán Mật Mã & An Toàn Thông Tin — Cài Đặt Thủ Công Bằng TypeScript</b></p>

  [![Architecture](https://img.shields.io/badge/Architecture-Micro--Services-FF7139?style=for-the-badge)](/)
  [![Language](https://img.shields.io/badge/Language-TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](/)
  [![Node](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=for-the-badge&logo=node.js&logoColor=white)](/)
  [![Verified](https://img.shields.io/badge/vs%20node%3Acrypto-verified-2ea44f?style=for-the-badge)](/)
</div>

---

## 📋 MỤC LỤC

1. [Tổng quan](#-tổng-quan-hệ-sinh-thái)
2. [Kiến trúc thư mục](#-kiến-trúc-thư-mục-các-dự-án)
3. [Cách các module liên kết](#️-cách-các-thuật-toán-liên-kết-với-nhau)
4. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
5. [Cài đặt nhanh](#-cài-đặt-nhanh)
6. [Cách chạy — CLI Hub](#-cách-chạy--cli-hub)
7. [Cách chạy — từng project riêng](#-cách-chạy--từng-project-riêng)
8. [Scripts kiểm thử (verify)](#-scripts-kiểm-thử-verify)
9. [Cấu hình `.env`](#-cấu-hình-env)
10. [Xem log chi tiết](#-xem-log-chi-tiết)
11. [Xử lý sự cố](#-xử-lý-sự-cố-troubleshooting)
12. [Thông tin liên hệ](#-thông-tin-liên-hệ)

---

## 🌟 TỔNG QUAN HỆ SINH THÁI

Đây là tập hợp **5 module thuật toán mật mã** được cài đặt từ đầu (không dùng các hàm sẵn có của `node:crypto` cho phần lõi) theo kiến trúc **Micro-architecture**. Mỗi nhánh thuật toán là một project TypeScript độc lập, nhưng có thể **"vay mượn"** lõi tính toán của nhau thông qua **Adapter / Proxy** để loại bỏ duplicate code.

| Tính chất | Chi tiết |
|---|---|
| **Ngôn ngữ** | TypeScript (ES2022 / ESNext) |
| **Runtime** | `tsx` hoặc `ts-node` (tuỳ project) |
| **Primitive** | Tự cài toàn bộ: SHA-2/3, AES, HMAC, HKDF, GCM, ECC, Schnorr |
| **Kiểm chứng** | So khớp **100%** với `node:crypto` qua các script `verify` (tổng **240+ test vector**) |
| **Chuẩn tham chiếu** | FIPS 197, FIPS 180-4, FIPS 202, RFC 5869, NIST SP 800-38D / 800-56A / 800-56C, SEC 1, SEC 2 |

---

## 📂 KIẾN TRÚC THƯ MỤC CÁC DỰ ÁN

| # | 🧩 Chuyên mục | 🔗 Thư mục | 📝 Mô tả | Runtime |
|:-:|:---|:---|:---|:-:|
| 1 | **Mã hoá đối xứng AES** | [`Code_Advanced_EncryPtion_Standard/`](./Code_Advanced_EncryPtion_Standard) | AES-128 / 192 / 256 thủ công (FIPS 197): S-box từ GF(2⁸), MixColumns, key expansion | `tsx` |
| 2 | **Hàm băm SHA** | [`SHA/`](./SHA) | Động cơ nén 1 chiều: SHA-224/256/384/512, SHA3-224/256/384/512, SHAKE128/256 | `tsx` |
| 3 | **ECC lõi** | [`Elliptic_Curve_Cryptography/`](./Elliptic_Curve_Cryptography) | Trái tim hệ sinh thái — cung cấp secp256k1/P-256, ECDH, ECIES, AES/HMAC nội tại | `tsx` |
| 4 | **ECDH (P-256)** | [`Elliptic_Curve_Diffie–Hellman/`](./Elliptic_Curve_Diffie–Hellman) | Trao đổi khoá theo NIST SP 800-56A + HKDF + AES-256-GCM (toàn bộ thủ công) | `tsx` |
| 5 | **Chữ ký số Schnorr** | [`Digital_Signature/`](./Digital_Signature) | Schnorr trên secp256k1: `s = k + e·d mod n`, `e = H(R‖P‖m)` | `ts-node` |
| 🎛️ | **Hub** | [`cli-hub.ts`](./cli-hub.ts) | Menu tương tác chọn project để chạy | `tsx` |

---

## ⚙️ CÁCH CÁC THUẬT TOÁN LIÊN KẾT VỚI NHAU

Hệ sinh thái được thiết kế để hạn chế **duplicate code** tối đa:

```
                    ┌─────────┐   ┌─────┐
                    │   SHA   │   │ ECC │
                    └────┬────┘   └──┬──┘
                         │           │
           ┌─ sha-adapter ┘           └─ ecc-proxy ─┐
           │                                        │
           ▼                                        ▼
  ┌──────────────┐                        ┌──────────────────┐
  │ Digital_Sign │  (Schnorr sign/verify) │ Elliptic_Curve_  │
  │    (SHA+ECC) │                        │  Diffie–Hellman  │
  └──────────────┘                        │   (SHA adapter)  │
                                          └──────────────────┘
```

1. **Trục xương sống**: `SHA` cung cấp mọi hàm băm; `Elliptic_Curve_Cryptography` cung cấp mọi phép toán trên đường cong.
2. **ECDH** và **Digital_Signature** gọi SHA qua `crypto/sha-adapter.ts` và (với Schnorr) gọi ECC qua `ecc-proxy/index.ts`.
3. **AES** standalone (không phụ thuộc module khác).

---

## 💻 YÊU CẦU HỆ THỐNG

| Thành phần | Phiên bản tối thiểu | Cách kiểm tra |
|---|---|---|
| **Node.js** | `≥ 18.0` (khuyến nghị 20 LTS trở lên) | `node -v` |
| **npm** | `≥ 9.0` | `npm -v` |
| **OS** | macOS / Linux (project dùng `/dev/urandom`) | `uname -s` |
| **Ổ đĩa** | ~500 MB cho `node_modules` của cả 5 project | — |

> **⚠️ Windows:** ECC / ECDH đọc entropy trực tiếp từ `/dev/urandom` — cần chạy qua **WSL2** trên Windows.

---

## 🚀 CÀI ĐẶT NHANH

### 1. Clone repository

```bash
git clone <repo-url> "CODE_INFOMATION_SECURITY"
cd "CODE_INFOMATION_SECURITY"
```

### 2. Cài đặt dependency cho hub + cả 5 project

```bash
# Cài cho hub trước
npm install

# Cài cho từng project con
cd Code_Advanced_EncryPtion_Standard && npm install && cd ..
cd SHA                                  && npm install && cd ..
cd Elliptic_Curve_Cryptography          && npm install && cd ..
cd Elliptic_Curve_Diffie–Hellman        && npm install && cd ..
cd Digital_Signature                    && npm install && cd ..
```

Hoặc cài nhanh 1 dòng (zsh/bash):

```bash
for d in . Code_Advanced_EncryPtion_Standard SHA Elliptic_Curve_Cryptography Elliptic_Curve_Diffie–Hellman Digital_Signature; do
  (cd "$d" && npm install)
done
```

### 3. Tạo file `.env` cho ECDH (Digital_Signature đã có sẵn `.env` mẫu)

```bash
cp Elliptic_Curve_Diffie–Hellman/.env.example Elliptic_Curve_Diffie–Hellman/.env
```

---

## 🎛️ CÁCH CHẠY — CLI HUB

Menu tương tác ở thư mục gốc giúp chọn nhanh project để chạy:

```bash
# Tại thư mục gốc
npm run dev
```

Output:

```
============================================================
  HE SINH THAI THUAT TOAN MAT MA & BAO MAT THONG TIN
============================================================

  [1] Mã Hóa Đối Xứng AES
  [2] Hệ Nén Băm SHA (SHA-256, SHA-512...)
  [3] Toán học Đường cong Elliptic (ECC Cốt Lõi)
  [4] Trao đổi Khóa Không Đồng Bộ (ECDH)
  [5] Chữ Ký Số Siêu Âm Schnorr (Digital Signature)

  [0] Thoát hệ thống

> Vui lòng nhập số tương ứng để chọn thuật toán chạy (0-5):
```

Chỉ cần gõ số (1–5), hub sẽ tự động `cd` vào project và chạy `npm run dev`.

---

## 🗂️ CÁCH CHẠY — TỪNG PROJECT RIÊNG

Nếu muốn bỏ qua hub và chạy trực tiếp, vào thư mục project tương ứng:

### 1️⃣ AES — `Code_Advanced_EncryPtion_Standard`

```bash
cd Code_Advanced_EncryPtion_Standard
npm run dev          # Demo AES-128/192/256: encrypt + decrypt roundtrip
```

### 2️⃣ SHA — `SHA`

```bash
cd SHA
npm run dev          # Demo SHA-256/512/SHA3 trên input mẫu
npm test             # 112 test vector (so khớp với node:crypto)
```

### 3️⃣ ECC — `Elliptic_Curve_Cryptography`

```bash
cd Elliptic_Curve_Cryptography
npm run dev          # Demo ECIES encrypt/decrypt trên secp256k1
npx jest             # 43 test (ECDH, ECIES, sanity secp256k1)
```

### 4️⃣ ECDH — `Elliptic_Curve_Diffie–Hellman`

```bash
cd Elliptic_Curve_Diffie–Hellman

# (chạy 1 lần) Sinh cặp khoá Alice & Bob vào thư mục keys/
npm run init-keys

# Demo end-to-end: trao đổi P-256 → HKDF → AES-256-GCM
npm run dev

# Type-check
npm run typecheck

# Verify toàn bộ primitive vs node:crypto (55 test)
npm run verify
```

### 5️⃣ Digital Signature Schnorr — `Digital_Signature`

```bash
cd Digital_Signature

# Demo ký + xác minh + giả lập tấn công Eve sửa message
npm run dev

# Type-check
npm run typecheck

# Verify Schnorr sign/verify + tamper detection (32 test)
npm run verify
```

---

## ✅ SCRIPTS KIỂM THỬ (VERIFY)

Toàn bộ primitive cài tay được đối chiếu với `node:crypto` (oracle chuẩn). Có thể chạy riêng từng project:

| Project | Lệnh | Số test | Nội dung |
|---|---|:-:|---|
| **SHA** | `cd SHA && npm test` | 112 | SHA-1/224/256/384/512 + SHA3-* + SHAKE |
| **ECC** | `cd Elliptic_Curve_Cryptography && npx jest` | 43 | ECDH, ECIES, AES-CTR, HMAC, HKDF |
| **ECDH** | `cd Elliptic_Curve_Diffie–Hellman && npm run verify` | 55 | AES-256 block/GCM, HKDF, ECDH P-256 |
| **Schnorr** | `cd Digital_Signature && npm run verify` | 32 | Sign/verify, tamper, `s·G ≡ R+e·P` |
| **Tổng cộng** | — | **242** | **Tất cả PASS khi so với `node:crypto`** |

---

## 🔧 CẤU HÌNH `.env`

### `Elliptic_Curve_Diffie–Hellman/.env`

```bash
ECDH_CURVE=prime256v1           # hỗ trợ: prime256v1 / secp256r1 / p-256
KDF_HASH=sha256
KDF_SALT_HEX=00112233445566778899aabbccddeeff
KDF_INFO=ECDH-AES-Session-Key
KDF_KEY_LENGTH=32
SYMMETRIC_ALGORITHM=aes-256-gcm
KEY_DIR=keys
PARTY_A_PRIVATE_KEY_FILE=alice-private.json
PARTY_A_PUBLIC_KEY_FILE=alice-public.json
PARTY_B_PRIVATE_KEY_FILE=bob-private.json
PARTY_B_PUBLIC_KEY_FILE=bob-public.json
```

### `Digital_Signature/.env`

```bash
# Khoá riêng của Alice (32-byte hex). Bỏ trống → tự sinh ngẫu nhiên
ALICE_PRIVATE_KEY=2b61c866bb4ad4ddcd4d02892c1d45a03d19f6e0a593c0f263ec12a8b451f977

DEFAULT_MESSAGE="Hello Schnorr! Day la van ban bi mat can ky."
TAMPERED_MESSAGE="Hello Schnorr! ... (Chuyen cho toi 1000 BTC)"
```

> **🔒 Bảo mật:** `.env` và thư mục `keys/` đã được thêm vào `.gitignore` của mỗi project.

---

## 📝 XEM LOG CHI TIẾT

Mỗi project ghi log chi tiết vào thư mục `logs/` theo timestamp. Ví dụ sau khi chạy `npm run dev`:

```
Elliptic_Curve_Diffie–Hellman/logs/ecdh-2026-04-24_12-49-32.txt
Digital_Signature/logs/schnorr-2026-04-23T18-27-50-321Z.txt
SHA/logs/sha-encoder-2026-04-23T14-27-43-463Z.txt
Code_Advanced_EncryPtion_Standard/logs/aes-256-1776969224778.json
```

Log chứa giá trị hex / bigint của **từng bước trung gian** (key schedule, round keys, shared secret, challenge, tag GCM, …) để tiện giảng dạy và debug.

---

## 🩹 XỬ LÝ SỰ CỐ (TROUBLESHOOTING)

| Lỗi | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `ENOENT: /dev/urandom` | Chạy trên Windows không qua WSL | Dùng WSL2 hoặc macOS/Linux |
| `Cannot find module 'tsx'` / `'ts-node'` | Chưa `npm install` | `cd <project>` rồi `npm install` |
| `[envLoader] Thiếu biến môi trường …` | Thiếu `.env` | `cp .env.example .env` trong project |
| `Không tìm thấy file: keys/alice-private.json` | Chưa init keys (ECDH) | Chạy `npm run init-keys` trước `npm run dev` |
| `TS2307: Cannot find module '../../../SHA/…'` | Xoá hoặc đổi tên thư mục anh em | Giữ nguyên cấu trúc `CODE_INFOMATION_SECURITY/` gốc |
| Demo chạy chậm | `scalarMultiply` P-256 thuần BigInt | Bình thường (~1–2 giây/lần) — đây là bản giáo dục, không tối ưu |

---

## 👤 THÔNG TIN LIÊN HỆ

<table>
  <tr>
    <td width="120" align="center">
      <img src="https://img.icons8.com/?size=100&id=kDoeEUYI1Ers&format=png&color=000000" width="80" alt="Author"/>
    </td>
    <td>
      <b>👨‍💻 Tác giả:</b> &nbsp; <b>Võ Anh Nhật</b><br/>
      <b>🏫 Trường:</b> &nbsp; Đại học Giao thông Vận tải Thành phố Hồ Chí Minh (UTH)<br/>
      <b>🎓 Chuyên ngành:</b> &nbsp; <b>Khoa học Dữ liệu</b> (Data Science)<br/>
      <b>📱 Điện thoại:</b> &nbsp; <a href="tel:+84335052899">0522 060 079</a><br/>
      <b>📧 Email:</b> &nbsp; <a href="mailto:voanhnhat1612@gmail.com">voanhnhat1612@gmail.com</a>
    </td>
  </tr>
</table>

---

<div align="center">

### 🏁 KHI MỌI THỨ ĐÃ SẴN SÀNG

```bash
npm run dev
```

<br/>

<i>Hệ thống được thiết kế và bảo dưỡng theo các tiêu chuẩn toán học nghiêm ngặt.</i><br/>
<b>HACKING IS AN ART, SECURING IS A SCIENCE</b>

</div>
