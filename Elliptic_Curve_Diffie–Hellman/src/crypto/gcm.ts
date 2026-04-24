/**
 * gcm.ts
 * -----------------------------------------------------------
 * AES-256-GCM cài thủ công theo NIST SP 800-38D.
 *
 * Gồm:
 *   - GHASH trên GF(2^128)
 *   - CTR-mode encryption (counter bắt đầu = J0 + 1)
 *   - Tag = GHASH(...) XOR E_K(J0)
 *
 * Dùng IV 96 bit (khuyến nghị).  Khi IV = 96 bit:
 *   J0 = IV || 0x00000001
 * -----------------------------------------------------------
 */

import { keyExpansion256, aes256EncryptBlock } from "./aes256.ts";

// ---------- GF(2^128) multiplication (GHASH) ----------
// Phần tử 128 bit = 2 × 64 bit (hi, lo).  Đa thức tối giản
// x^128 + x^7 + x^2 + x + 1 → hằng số R = 0xE1 << 120 (big-endian).

interface U128 {
  hi: bigint;
  lo: bigint;
}

function bufToU128(buf: Buffer): U128 {
  const hi = buf.readBigUInt64BE(0);
  const lo = buf.readBigUInt64BE(8);
  return { hi, lo };
}

function u128ToBuf(x: U128): Buffer {
  const b = Buffer.alloc(16);
  b.writeBigUInt64BE(x.hi & 0xffffffffffffffffn, 0);
  b.writeBigUInt64BE(x.lo & 0xffffffffffffffffn, 8);
  return b;
}

const MASK64 = 0xffffffffffffffffn;

/** Phép nhân 128-bit trong GF(2^128) theo định nghĩa GHASH. */
function gfMul(X: U128, Y: U128): U128 {
  let Zhi = 0n;
  let Zlo = 0n;
  let Vhi = Y.hi;
  let Vlo = Y.lo;
  const R_HI = 0xe100000000000000n;

  for (let i = 0; i < 128; i++) {
    // bit i của X (MSB trước): kiểm tra bit (127 - i)
    const byteIdx = i >> 3;
    const bitIdx = 7 - (i & 7);
    const xByte = Number(
      (byteIdx < 8
        ? (X.hi >> BigInt((7 - byteIdx) * 8)) & 0xffn
        : (X.lo >> BigInt((15 - byteIdx) * 8)) & 0xffn),
    );
    if (((xByte >> bitIdx) & 1) === 1) {
      Zhi ^= Vhi;
      Zlo ^= Vlo;
    }

    // V = V >> 1 (có phản hồi bằng R nếu bit thấp nhất = 1)
    const lsb = Vlo & 1n;
    Vlo = (Vlo >> 1n) | ((Vhi & 1n) << 63n);
    Vhi = Vhi >> 1n;
    if (lsb === 1n) {
      Vhi ^= R_HI;
    }

    Zhi &= MASK64;
    Zlo &= MASK64;
    Vhi &= MASK64;
    Vlo &= MASK64;
  }

  return { hi: Zhi, lo: Zlo };
}

function xorU128(a: U128, b: U128): U128 {
  return { hi: (a.hi ^ b.hi) & MASK64, lo: (a.lo ^ b.lo) & MASK64 };
}

/** GHASH(H, A, C) — dùng cho GCM. A = AAD, C = ciphertext. */
function ghash(H: U128, A: Buffer, C: Buffer): Buffer {
  let X: U128 = { hi: 0n, lo: 0n };

  // Xử lý AAD theo block 16-byte, pad 0 ở block cuối nếu cần
  const processBlocks = (data: Buffer) => {
    for (let i = 0; i < data.length; i += 16) {
      const chunk = data.slice(i, i + 16);
      const block = Buffer.alloc(16);
      chunk.copy(block, 0);
      X = gfMul(xorU128(X, bufToU128(block)), H);
    }
  };

  processBlocks(A);
  processBlocks(C);

  // Block cuối = [len(A)]_64 || [len(C)]_64  (tính bằng bit)
  const lenBlock = Buffer.alloc(16);
  lenBlock.writeBigUInt64BE(BigInt(A.length) * 8n, 0);
  lenBlock.writeBigUInt64BE(BigInt(C.length) * 8n, 8);
  X = gfMul(xorU128(X, bufToU128(lenBlock)), H);

  return u128ToBuf(X);
}

// ---------- CTR encryption ----------

/** Tăng 32 bit thấp nhất của counter (16 byte) theo SP 800-38D. */
function inc32(counter: Buffer): Buffer {
  const out = Buffer.from(counter);
  let c = (out.readUInt32BE(12) + 1) >>> 0;
  out.writeUInt32BE(c, 12);
  return out;
}

function xorBuffers(a: Buffer, b: Buffer): Buffer {
  const out = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

export interface GcmCiphertext {
  iv: Buffer;
  authTag: Buffer;
  data: Buffer;
}

export function aesGcmEncrypt(
  key: Buffer,
  iv: Buffer,
  plaintext: Buffer,
  aad: Buffer = Buffer.alloc(0),
): GcmCiphertext {
  if (iv.length !== 12) {
    throw new Error("[gcm] Chỉ hỗ trợ IV 96 bit (12 byte)");
  }

  const W = keyExpansion256(key);

  // H = E_K(0^128)
  const H = bufToU128(aes256EncryptBlock(Buffer.alloc(16), W));

  // J0 = IV || 0x00000001
  const J0 = Buffer.concat([iv, Buffer.from([0, 0, 0, 1])]);

  // Encrypt blocks with CTR starting from J0 + 1
  const data = Buffer.alloc(plaintext.length);
  let counter = inc32(J0);
  for (let i = 0; i < plaintext.length; i += 16) {
    const keystream = aes256EncryptBlock(counter, W);
    const chunk = plaintext.slice(i, i + 16);
    const xored = xorBuffers(chunk, keystream.slice(0, chunk.length));
    xored.copy(data, i);
    counter = inc32(counter);
  }

  // Tag = GHASH(H, aad, data) XOR E_K(J0)
  const S = ghash(H, aad, data);
  const Ek_J0 = aes256EncryptBlock(J0, W);
  const authTag = xorBuffers(S, Ek_J0);

  return { iv, authTag, data };
}

export function aesGcmDecrypt(
  key: Buffer,
  ct: GcmCiphertext,
  aad: Buffer = Buffer.alloc(0),
): Buffer {
  if (ct.iv.length !== 12) {
    throw new Error("[gcm] IV phải 12 byte");
  }
  if (ct.authTag.length !== 16) {
    throw new Error("[gcm] Auth tag phải 16 byte");
  }

  const W = keyExpansion256(key);
  const H = bufToU128(aes256EncryptBlock(Buffer.alloc(16), W));
  const J0 = Buffer.concat([ct.iv, Buffer.from([0, 0, 0, 1])]);

  // Kiểm tra tag TRƯỚC khi giải mã (an toàn hơn)
  const S = ghash(H, aad, ct.data);
  const Ek_J0 = aes256EncryptBlock(J0, W);
  const expectedTag = xorBuffers(S, Ek_J0);

  // So sánh hằng thời gian
  let diff = 0;
  for (let i = 0; i < 16; i++) diff |= expectedTag[i] ^ ct.authTag[i];
  if (diff !== 0) {
    throw new Error("[gcm] Auth tag không khớp — dữ liệu bị sửa đổi");
  }

  // Giải mã bằng chính CTR (XOR lại)
  const plain = Buffer.alloc(ct.data.length);
  let counter = inc32(J0);
  for (let i = 0; i < ct.data.length; i += 16) {
    const keystream = aes256EncryptBlock(counter, W);
    const chunk = ct.data.slice(i, i + 16);
    const xored = xorBuffers(chunk, keystream.slice(0, chunk.length));
    xored.copy(plain, i);
    counter = inc32(counter);
  }
  return plain;
}
