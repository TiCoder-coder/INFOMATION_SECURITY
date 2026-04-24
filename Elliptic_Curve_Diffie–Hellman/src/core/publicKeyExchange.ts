/**
 * publicKeyExchange.ts
 * -----------------------------------------------------------
 * BƯỚC 4 CỦA LƯU ĐỒ — "Trao đổi khoá công khai QA và QB".
 *
 * Module này giả lập kênh trao đổi và chịu trách nhiệm
 * *kiểm tra hợp lệ* khoá công khai nhận từ đối phương:
 *   1. Giải mã điểm từ dạng SEC1 (04 || X || Y)
 *   2. X, Y ∈ [0, p-1]        (pointDecode đã gọi isOnCurve)
 *   3. Điểm nằm trên curve   (pointDecode đã gọi isOnCurve)
 *   4. Q ≠ O
 *   5. n·Q = O                (với cofactor h=1 của P-256, bước
 *      này thực chất chỉ cần kiểm tra điểm nằm trên curve &
 *      khác O — nhưng ta vẫn kiểm tra cho đúng SP 800-56A
 *      §5.6.2.3.3 "Full Public-Key Validation")
 * -----------------------------------------------------------
 */

import type { CurveParams, ECPoint } from "../math/index.ts";
import {
  decodePointUncompressed,
  scalarMultiply,
} from "../math/index.ts";

export interface PublicKeyEnvelope {
  owner: string;
  curveName: string;
  publicKey: Buffer; // SEC1 uncompressed
}

export function packPublicKey(
  owner: string,
  curveName: string,
  publicKey: Buffer,
): PublicKeyEnvelope {
  return { owner, curveName, publicKey };
}

/**
 * Mở gói + VALIDATE đầy đủ (NIST SP 800-56A §5.6.2.3.3).
 * Trả về điểm Q đã được xác minh nằm trên đường cong và khác O.
 */
export function unpackAndValidate(
  env: PublicKeyEnvelope,
  expectedCurveName: string,
  c: CurveParams,
): ECPoint {
  if (env.curveName !== expectedCurveName && env.curveName !== c.name) {
    throw new Error(
      `[publicKeyExchange] Curve không khớp: nhận "${env.curveName}", kỳ vọng "${expectedCurveName}"`,
    );
  }

  // (1)(2)(3) — decode + isOnCurve
  const Q: ECPoint = decodePointUncompressed(env.publicKey, c);

  // (4) Q ≠ O
  if (Q.infinity) {
    throw new Error("[publicKeyExchange] Khoá công khai là điểm vô cực");
  }

  // (5) n·Q = O  (kiểm tra bậc — đầy đủ theo SP 800-56A)
  const nQ = scalarMultiply(c.n, Q, c);
  if (!nQ.infinity) {
    throw new Error(
      "[publicKeyExchange] n·Q ≠ O — khoá công khai không nằm trong nhóm bậc n",
    );
  }

  return Q;
}

/**
 * Mô phỏng một vòng trao đổi: A gửi QA, B gửi QB.
 * Trả về điểm đã xác thực cho mỗi bên.
 */
export function exchangePublicKeys(
  envA: PublicKeyEnvelope,
  envB: PublicKeyEnvelope,
  curveName: string,
  c: CurveParams,
): { QA_receivedByB: ECPoint; QB_receivedByA: ECPoint } {
  return {
    QA_receivedByB: unpackAndValidate(envA, curveName, c),
    QB_receivedByA: unpackAndValidate(envB, curveName, c),
  };
}
