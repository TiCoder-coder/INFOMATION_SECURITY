/**
 * bigintMath.ts
 * -----------------------------------------------------------
 * Các phép toán số học modular TỰ CÀI bằng BigInt thuần.
 * Phục vụ cho toán tử trên đường cong elliptic (ECC).
 *
 * Không dùng bất kỳ thư viện crypto nào.
 * -----------------------------------------------------------
 */

/** mod dương — luôn trả về giá trị trong [0, m-1] */
export function mod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r < 0n ? r + m : r;
}

/**
 * Thuật toán Euclid mở rộng:
 *   trả về [g, x, y] thoả  g = gcd(a, b) = a*x + b*y
 */
export function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x1, y1] = egcd(b, mod(a, b));
  // a*x + b*y = g  với  x = y1,  y = x1 - (a/b)*y1
  return [g, y1, x1 - (a / b) * y1];
}

/** Nghịch đảo modular: trả về a^{-1} mod m (m nguyên tố hoặc gcd(a,m)=1). */
export function modInverse(a: bigint, m: bigint): bigint {
  const [g, x] = egcd(mod(a, m), m);
  if (g !== 1n) {
    throw new Error(`[bigintMath] Không tồn tại nghịch đảo của ${a} mod ${m}`);
  }
  return mod(x, m);
}

/** Lũy thừa modular nhanh bằng square-and-multiply. */
export function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  let result = 1n;
  let b = mod(base, m);
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    e >>= 1n;
    b = (b * b) % m;
  }
  return result;
}

/** Đổi BigInt thành Buffer độ dài cố định (big-endian, pad 0 phía trước). */
export function bigIntToBuffer(n: bigint, byteLength: number): Buffer {
  if (n < 0n) throw new Error("[bigintMath] Số âm không hợp lệ");
  let hex = n.toString(16);
  if (hex.length > byteLength * 2) {
    throw new Error(
      `[bigintMath] BigInt ${hex.length / 2} byte vượt quá độ dài ${byteLength}`,
    );
  }
  hex = hex.padStart(byteLength * 2, "0");
  return Buffer.from(hex, "hex");
}

/** Đổi Buffer big-endian thành BigInt không dấu. */
export function bufferToBigInt(buf: Buffer): bigint {
  if (buf.length === 0) return 0n;
  return BigInt("0x" + buf.toString("hex"));
}
