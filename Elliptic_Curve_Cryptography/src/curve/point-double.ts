// Nhân đôi điểm 2·P trên đường cong elliptic (affine).
import type { CurvePoint, AffinePoint } from '../domain/types/curve-point';
import { POINT_AT_INFINITY } from '../domain/types/curve-point';
import { modAdd, modMul, modSub } from '../field/fp-arithmetic';
import { modInverse } from '../field/mod-inverse';
import type { DomainParameters } from '../domain/types/domain-parameters';

export function pointDouble(P: CurvePoint, T: DomainParameters): CurvePoint {
  if (P.infinity) return POINT_AT_INFINITY;
  if (P.y === 0n) return POINT_AT_INFINITY;
  const { p, a } = T;
  // λ = (3·x^2 + a) / (2·y) mod p
  const numerator = modAdd(modMul(3n, modMul(P.x, P.x, p), p), a, p);
  const denom = modInverse(modMul(2n, P.y, p), p);
  const lambda = modMul(numerator, denom, p);
  const xR = modSub(modSub(modMul(lambda, lambda, p), P.x, p), P.x, p);
  const yR = modSub(modMul(lambda, modSub(P.x, xR, p), p), P.y, p);
  const R: AffinePoint = { infinity: false, x: xR, y: yR };
  return R;
}
