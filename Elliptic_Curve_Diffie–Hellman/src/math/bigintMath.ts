export function mod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r < 0n ? r + m : r;
}

export function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x1, y1] = egcd(b, mod(a, b));
  
  return [g, y1, x1 - (a / b) * y1];
}

export function modInverse(a: bigint, m: bigint): bigint {
  const [g, x] = egcd(mod(a, m), m);
  if (g !== 1n) {
    throw new Error(`[bigintMath] Không tồn tại nghịch đảo của ${a} mod ${m}`);
  }
  return mod(x, m);
}

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

export function bufferToBigInt(buf: Buffer): bigint {
  if (buf.length === 0) return 0n;
  return BigInt("0x" + buf.toString("hex"));
}
