import { mod, modInverse } from "./bigintMath.ts";

export interface CurveParams {
  p: bigint; 
  a: bigint; 
  b: bigint; 
  Gx: bigint; 
  Gy: bigint; 
  n: bigint; 
  h: bigint; 
  byteLength: number; 
  name: string;
}

export interface ECPoint {
  x: bigint;
  y: bigint;
  infinity: boolean;
}

export const POINT_AT_INFINITY: ECPoint = {
  x: 0n,
  y: 0n,
  infinity: true,
};

export function isOnCurve(P: ECPoint, c: CurveParams): boolean {
  if (P.infinity) return true;
  const { p, a, b } = c;
  
  if (P.x < 0n || P.x >= p || P.y < 0n || P.y >= p) return false;
  const lhs = mod(P.y * P.y, p);
  const rhs = mod(P.x * P.x * P.x + a * P.x + b, p);
  return lhs === rhs;
}

export function pointNegate(P: ECPoint, c: CurveParams): ECPoint {
  if (P.infinity) return POINT_AT_INFINITY;
  return { x: P.x, y: mod(-P.y, c.p), infinity: false };
}

export function pointAdd(
  P: ECPoint,
  Q: ECPoint,
  c: CurveParams,
): ECPoint {
  if (P.infinity) return Q;
  if (Q.infinity) return P;

  const { p } = c;

  if (P.x === Q.x) {
    
    if (mod(P.y + Q.y, p) === 0n) return POINT_AT_INFINITY;
    
    if (P.y === Q.y) return pointDouble(P, c);
    return POINT_AT_INFINITY;
  }

  
  const num = mod(Q.y - P.y, p);
  const den = modInverse(mod(Q.x - P.x, p), p);
  const lam = mod(num * den, p);

  
  const x3 = mod(lam * lam - P.x - Q.x, p);
  
  const y3 = mod(lam * (P.x - x3) - P.y, p);

  return { x: x3, y: y3, infinity: false };
}

export function pointDouble(P: ECPoint, c: CurveParams): ECPoint {
  if (P.infinity) return POINT_AT_INFINITY;
  const { p, a } = c;

  if (P.y === 0n) return POINT_AT_INFINITY; 

  const num = mod(3n * P.x * P.x + a, p);
  const den = modInverse(mod(2n * P.y, p), p);
  const lam = mod(num * den, p);

  const x3 = mod(lam * lam - 2n * P.x, p);
  const y3 = mod(lam * (P.x - x3) - P.y, p);
  return { x: x3, y: y3, infinity: false };
}

export function scalarMultiply(
  k: bigint,
  P: ECPoint,
  c: CurveParams,
): ECPoint {
  if (k < 0n) {
    
    return scalarMultiply(-k, pointNegate(P, c), c);
  }
  if (k === 0n || P.infinity) return POINT_AT_INFINITY;

  let R: ECPoint = POINT_AT_INFINITY;
  let addend: ECPoint = P;
  let e = k;

  while (e > 0n) {
    if (e & 1n) {
      R = pointAdd(R, addend, c);
    }
    addend = pointDouble(addend, c);
    e >>= 1n;
  }
  return R;
}

export function encodePointUncompressed(P: ECPoint, c: CurveParams): Buffer {
  if (P.infinity) {
    throw new Error("[ecPoint] Không thể serialize điểm vô cực");
  }
  const xBuf = Buffer.from(
    P.x.toString(16).padStart(c.byteLength * 2, "0"),
    "hex",
  );
  const yBuf = Buffer.from(
    P.y.toString(16).padStart(c.byteLength * 2, "0"),
    "hex",
  );
  return Buffer.concat([Buffer.from([0x04]), xBuf, yBuf]);
}

export function decodePointUncompressed(
  buf: Buffer,
  c: CurveParams,
): ECPoint {
  const expected = 1 + 2 * c.byteLength;
  if (buf.length !== expected) {
    throw new Error(
      `[ecPoint] Độ dài khoá công khai sai: ${buf.length}, kỳ vọng ${expected}`,
    );
  }
  if (buf[0] !== 0x04) {
    throw new Error(
      `[ecPoint] Byte đầu phải là 0x04 (uncompressed), nhận 0x${buf[0]
        .toString(16)
        .padStart(2, "0")}`,
    );
  }
  const xHex = buf.slice(1, 1 + c.byteLength).toString("hex");
  const yHex = buf.slice(1 + c.byteLength).toString("hex");
  const P: ECPoint = {
    x: BigInt("0x" + xHex),
    y: BigInt("0x" + yHex),
    infinity: false,
  };
  if (!isOnCurve(P, c)) {
    throw new Error("[ecPoint] Điểm không nằm trên đường cong");
  }
  return P;
}
