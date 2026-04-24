// Kiểm tra điều kiện không suy biến: 4·a^3 + 27·b^2 ≢ 0 (mod p).
import { modMul, modAdd } from '../../field/fp-arithmetic';

export function isCurveNonSingular(a: bigint, b: bigint, p: bigint): boolean {
  const a3 = modMul(modMul(a, a, p), a, p);
  const b2 = modMul(b, b, p);
  const lhs = modAdd(modMul(4n, a3, p), modMul(27n, b2, p), p);
  return lhs !== 0n;
}
