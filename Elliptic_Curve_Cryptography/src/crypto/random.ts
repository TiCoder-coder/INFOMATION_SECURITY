// CSPRNG thuần — sử dụng Web Crypto API (globalThis.crypto.getRandomValues).
// globalThis.crypto có sẵn trong Node.js >= 19 mà không cần import.
// Không phụ thuộc vào node:crypto hay bất kỳ npm package nào.

/**
 * Sinh n byte ngẫu nhiên bằng CSPRNG (Cryptographically Secure PRNG).
 * Dùng `globalThis.crypto.getRandomValues` — API Web Crypto tiêu chuẩn,
 * có sẵn trong Node.js ≥ 19 và mọi trình duyệt hiện đại.
 *
 * @param n  Số byte cần sinh.
 * @returns  Uint8Array chứa n byte ngẫu nhiên an toàn mật mã.
 */
export function randomBytes(n: number): Uint8Array {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('randomBytes: n phải là số nguyên không âm');
  }
  const buf = new Uint8Array(n);
  // getRandomValues có giới hạn 65536 byte mỗi lần gọi.
  const chunkSize = 65536;
  for (let off = 0; off < n; off += chunkSize) {
    const chunk = buf.subarray(off, Math.min(off + chunkSize, n));
    globalThis.crypto.getRandomValues(chunk);
  }
  return buf;
}
