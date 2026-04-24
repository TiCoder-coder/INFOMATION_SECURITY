<div align="center">

# 🔐 Schnorr Digital Signature
**Hệ thống Chữ ký số Schnorr trên Nền tảng Đường cong Elliptic (ECC)**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Micro-Architecture](https://img.shields.io/badge/Architecture-Micro-FF7139?style=for-the-badge)](/)
[![Toán Học Mật Mã](https://img.shields.io/badge/Cryptography-Schnorr-8A2BE2?style=for-the-badge)](/)

</div>

---

## 🌟 Nhìn Nhận Chung <a name="overview"></a>

**Digital_Signature** là một module mật mã đỉnh cao chuyên biệt về thuật toán **Chữ ký số Schnorr** (Schnorr Digital Signature). Điểm đặc biệt của dự án này là nó không phải một khối mã nguyên khối (Monolith) cồng kềnh, mà linh hoạt tái sử dụng theo cấu trúc **Micro-architecture**:
- 🌐 Vay mượn khối lượng Toán Học Bậc Cao (Field Math & Modulo Inverse) và Đường cong `secp256k1` trực tiếp từ siêu dự án `Elliptic_Curve_Cryptography`.
- ⚡ Tích hợp thẳng cơ chế Hashing nguyên thủy từ hệ lõi nén của `SHA` thông qua proxy adapter tĩnh (với Logging chìm hoàn toàn).

<br/>

## 🔬 Thuật Toán \& Toán Học <a name="math"></a>

Hệ thống hoạt động dựa trên phương trình toán Modulo vòng kín cực kỳ tiên tiến:

### 1. Chuẩn Bị Khóa (Key Generation)
> Mỗi người dùng được hệ thống tạo riêng một tham biến số nguyên $d$.
- **Private Key ($d$)**: Chọn một số ngẫu nhiên thỏa mãn $1 \leq d < n$ ($n$ là bậc đường cong).
- **Public Key ($P$)**: Là một điểm tọa độ tính bằng tích vô hướng $P = d \times G$.

### 2. Tiến Trình Ký (Signing) ✍️
Khi Alice muốn cung cấp bằng chứng cho thông điệp $m$:
1. Khởi tạo một đại lượng vô hướng bí mật ngẫu nhiên $k$.
2. Xây dựng **Điểm R (Điểm sinh tạm thời)**: $R = k \times G$.
3. Tổng hợp Challenge $e$ siêu nén thông qua chuẩn SHA-256 nội suy hệ thống: 
   $e = H(R \ || \ P \ || \ m) \pmod n$
4. Cấu tạo đại lượng số $s$ tạo móc neo:
   $s = (k + e \times d) \pmod n$
👉 Chữ ký hoàn trả: $\text{Signature} = (R, s)$

### 3. Tiến Trình Xác Minh (Verification) 🕵️
Khi Bob nhận được thông điệp $m$, khóa công khai $P$ và Signature $(R, s)$:
1. Tự nội suy băm một tham số $e$ với công thức tương tự.
2. Kiểm tra tính toàn vẹn 2 vế của phương trình:
   $L = s \times G$
   $V = R + e \times P$
3. Chữ ký **Hợp Lệ** nếu $L \equiv V$. Sự xâm phạm của Eve (kẻ đánh cắp) vào thông điệp $m$ sẽ phá hủy tính đồng dư ngay lập tức khi Băm ra $e$ thay đổi.

<br/>

## 🚀 Tính Năng Nổi Bật <a name="features"></a>

- 🛡️ **Bảo Mật Kép (Uncompressed Focus)**: Tái mã hóa các điểm bằng 65 bytes hệ `0x04` để Hash. Nguy cơ va chạm SHA-256 gần bằng Không.
- 🎯 **Kiến trúc Proxy**: Adapter hóa toàn bộ. Digital Signature đứng độc lập, sạch sẽ.
- 📉 **Bảo vệ Điểm Vô Cực**: Toàn bộ thuật toán được giáp một lớp màng check `InfinityPoint`, tránh lỗi tràn logic Node.
- 🗃️ **Logger Ghi Dấu Sâu**: Demo tracking từng dòng ra bộ nhớ Memory vào thư mục `/logs` phân giải thành Hex Code rất dễ nhìn rà soát cho chuyên gia phân tích.

<br/>

## 🛠 Hướng Dẫn Chạy <a name="quick-start"></a>

Sử dụng môi trường NVM hoặc Node.js để chạy cấu trúc lệnh sau (đã có sẵn Makefile trong package):

```bash
# Trực tiếp tại thư mục dự án
cd "CODE_INFOMATION_SECURITY/Digital_Signature"

# Chạy Demo Script theo thời gian thực (TypeScript Node Engine)
npm run dev
```

> **📌 Kịch bản Demo được tích hợp sẵn gồm:**
> 1. Sinh Khóa bí mật cho Alice.
> 2. Alice ký thành công thư gửi Bob.
> 3. Bob kiểm chứng thành công bằng Toán học Schnorr L=V.
> 4. Kẻ lừa đảo Eve nhúng vào thay chữ "Chuyển tiền vào tài khoản" $\rightarrow$ Lập tức bị Toán Học bóc mẽ.

---
<div align="center">
<i>Kiến trúc được mã hóa tỉ mỉ bởi hệ Sinh Thái Mật Mã Tiêu Chuẩn.</i><br/>
<b>"Sức mạnh của Đường Cong Elliptic - Sự hoàn hảo từ những điểm vô cực"</b>
</div>
