import type { CurveParams } from "../math/index.ts";

const P256: CurveParams = {
  name: "P-256 (secp256r1 / prime256v1)",
  byteLength: 32,
  p: 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn,
  a: 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn, 
  b: 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn,
  Gx: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
  Gy: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
  n: 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n,
  h: 1n,
};

const TABLE: Record<string, CurveParams> = {
  prime256v1: P256,
  secp256r1: P256,
  "p-256": P256,
};

export function selectDomainParameters(curveName: string): CurveParams {
  const key = curveName.toLowerCase();
  const dp = TABLE[key];
  if (!dp) {
    throw new Error(
      `[domainParameters] Đường cong "${curveName}" không được hỗ trợ. ` +
        `Hỗ trợ: ${Object.keys(TABLE).join(", ")}`,
    );
  }
  return dp;
}

export function describeCurve(c: CurveParams): string {
  return (
    `Tên: ${c.name}\n` +
    `   p  = 0x${c.p.toString(16)}\n` +
    `   a  = 0x${c.a.toString(16)}  (= p − 3)\n` +
    `   b  = 0x${c.b.toString(16)}\n` +
    `   Gx = 0x${c.Gx.toString(16)}\n` +
    `   Gy = 0x${c.Gy.toString(16)}\n` +
    `   n  = 0x${c.n.toString(16)}\n` +
    `   h  = ${c.h}`
  );
}
