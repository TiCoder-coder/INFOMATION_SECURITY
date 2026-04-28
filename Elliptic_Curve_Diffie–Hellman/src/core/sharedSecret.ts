import type { CurveParams, ECPoint } from "../math/index.ts";
import { scalarMultiply } from "../math/index.ts";
import { bigIntToBuffer } from "../math/index.ts";

export interface SharedSecret {
  
  point: ECPoint;
  
  Z: Buffer;
}

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
