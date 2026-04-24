// Điểm đối -P = (x, -y mod p).
import type { CurvePoint } from '../domain/types/curve-point';
import { POINT_AT_INFINITY } from '../domain/types/curve-point';
import { modNeg } from '../field/fp-arithmetic';

export function pointNegate(P: CurvePoint, p: bigint): CurvePoint {
  if (P.infinity) return POINT_AT_INFINITY;
  return { infinity: false, x: P.x, y: modNeg(P.y, p) };
}
