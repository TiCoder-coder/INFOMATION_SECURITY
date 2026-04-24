/**
 * keyGenerator.ts
 * -----------------------------------------------------------
 * BƯỚC 2 & 3 CỦA LƯU ĐỒ — Thuật toán Sinh_khóa_ECDH():
 *
 *   Bước 1 (mã giả): Chọn đường cong y² = x³ + ax + b (mod p)
 *   Bước 2 (mã giả): Chọn (G, n, h)
 *   Bước 3 (mã giả): Chọn ngẫu nhiên d,  1 ≤ d ≤ n − 1
 *   Bước 4 (mã giả): Tính Q = d × G
 *   Bước 5 (mã giả): Xuất (d, Q)
 *
 * CẤU TRÚC MICRO — từng thao tác nhỏ tách riêng hàm để dễ
 * kiểm tra và bám sát mã giả.
 *
 * Không dùng thư viện ECC — chỉ dùng `ecPoint.scalarMultiply`
 * do chính project tự cài.
 * -----------------------------------------------------------
 */

import type { CurveParams, ECPoint } from "../math/index.ts";
import {
  scalarMultiply,
  isOnCurve,
  encodePointUncompressed,
} from "../math/index.ts";
import { randomBytes } from "../math/index.ts";
import { bufferToBigInt, bigIntToBuffer } from "../math/index.ts";

export interface KeyPair {
  owner: string;
  curveName: string;
  /** Khoá riêng d (BigInt) */
  d: bigint;
  /** Khoá công khai Q = d·G (điểm affine) */
  Q: ECPoint;
  /** Serialized dạng SEC1 uncompressed: 04 || X || Y */
  publicKey: Buffer;
  /** d đóng gói thành Buffer 32 byte (big-endian) */
  privateKey: Buffer;
}

// ---------------------------------------------------------------
// Bước 3 (mã giả): chọn ngẫu nhiên d ∈ [1, n−1]
// ---------------------------------------------------------------
/**
 * Phương pháp rejection sampling:
 *  - Lấy ngẫu nhiên `byteLength` byte → ứng viên d'
 *  - Nếu 1 ≤ d' ≤ n−1 → nhận
 *  - Ngược lại → bốc lại
 *
 * Đây đúng cách sinh khoá ECDSA/ECDH theo FIPS 186-4 §B.4.2.
 */
export function generatePrivateScalar(c: CurveParams): bigint {
  const maxTries = 1024;
  for (let i = 0; i < maxTries; i++) {
    const raw = randomBytes(c.byteLength);
    const candidate = bufferToBigInt(raw);
    if (candidate >= 1n && candidate <= c.n - 1n) {
      return candidate;
    }
  }
  throw new Error("[keyGenerator] Không sinh được d hợp lệ sau nhiều lần thử");
}

// ---------------------------------------------------------------
// Bước 4 (mã giả): tính Q = d × G
// ---------------------------------------------------------------
/**
 * Dùng đúng thuật toán nhân vô hướng thủ công (double-and-add)
 * đã cài trong `math/ecPoint.ts`.
 */
export function derivePublicPoint(d: bigint, c: CurveParams): ECPoint {
  const G: ECPoint = { x: c.Gx, y: c.Gy, infinity: false };
  if (!isOnCurve(G, c)) {
    throw new Error("[keyGenerator] Điểm sinh G không nằm trên đường cong!");
  }
  const Q = scalarMultiply(d, G, c);
  if (Q.infinity) {
    throw new Error("[keyGenerator] Q = O (vô cực) — d không hợp lệ");
  }
  if (!isOnCurve(Q, c)) {
    throw new Error("[keyGenerator] Q tính ra không nằm trên đường cong!");
  }
  return Q;
}

// ---------------------------------------------------------------
// Bước 5 (mã giả): xuất (d, Q) dưới dạng Buffer
// ---------------------------------------------------------------
export function packKeyPair(
  owner: string,
  curveName: string,
  d: bigint,
  Q: ECPoint,
  c: CurveParams,
): KeyPair {
  return {
    owner,
    curveName,
    d,
    Q,
    privateKey: bigIntToBuffer(d, c.byteLength),
    publicKey: encodePointUncompressed(Q, c),
  };
}

// ---------------------------------------------------------------
// Orchestrator: gộp 3 bước trên thành 1 hàm duy nhất
// ---------------------------------------------------------------
export function generateKeyPair(
  owner: string,
  c: CurveParams,
): KeyPair {
  const d = generatePrivateScalar(c);
  const Q = derivePublicPoint(d, c);
  return packKeyPair(owner, c.name, d, Q, c);
}
