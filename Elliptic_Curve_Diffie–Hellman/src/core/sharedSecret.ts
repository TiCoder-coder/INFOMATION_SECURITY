/**
 * sharedSecret.ts
 * -----------------------------------------------------------
 * BƯỚC 5 & 6 CỦA LƯU ĐỒ:
 *   Bước 5: Bên A tính SA = dA × QB
 *   Bước 6: Bên B tính SB = dB × QA
 *
 * Theo NIST SP 800-56A: shared secret Z là toạ độ x của điểm
 * kết quả (được pad về đúng byteLength của p, big-endian).
 *
 * CÀI BẰNG scalarMultiply THỦ CÔNG — không dùng thư viện.
 * -----------------------------------------------------------
 */

import type { CurveParams, ECPoint } from "../math/index.ts";
import { scalarMultiply } from "../math/index.ts";
import { bigIntToBuffer } from "../math/index.ts";

export interface SharedSecret {
  /** Điểm kết quả S = d · Q trên đường cong */
  point: ECPoint;
  /** Toạ độ x của S dưới dạng Buffer big-endian (đây là Z theo NIST) */
  Z: Buffer;
}

/**
 * Tính shared secret cho một bên:
 *   S = d × Q  (trên đường cong elliptic)
 *   Z = bigIntToBuffer(S.x, byteLength)
 */
export function computeSharedSecret(
  d: bigint,
  Q: ECPoint,
  c: CurveParams,
): SharedSecret {
  const S = scalarMultiply(d, Q, c);
  if (S.infinity) {
    throw new Error("[sharedSecret] S = O — shared secret không hợp lệ");
  }
  const Z = bigIntToBuffer(S.x, c.byteLength);
  return { point: S, Z };
}
