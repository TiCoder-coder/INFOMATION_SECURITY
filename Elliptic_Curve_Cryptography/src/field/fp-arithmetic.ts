export function mod(a: bigint, p: bigint): bigint {
  const r = a % p;
  return r >= 0n ? r : r + p;
}

export function modAdd(a: bigint, b: bigint, p: bigint): bigint {
  return mod(a + b, p);
}

export function modSub(a: bigint, b: bigint, p: bigint): bigint {
  return mod(a - b, p);
}

export function modMul(a: bigint, b: bigint, p: bigint): bigint {
  return mod(a * b, p);
}

export function modNeg(a: bigint, p: bigint): bigint {
  return mod(-a, p);
}
