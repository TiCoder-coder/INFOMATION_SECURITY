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
  
  d: bigint;
  
  Q: ECPoint;
  
  publicKey: Buffer;
  
  privateKey: Buffer;
}

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

export function generateKeyPair(
  owner: string,
  c: CurveParams,
): KeyPair {
  const d = generatePrivateScalar(c);
  const Q = derivePublicPoint(d, c);
  return packKeyPair(owner, c.name, d, Q, c);
}
