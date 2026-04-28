import type { CurvePoint, AffinePoint } from '../domain/types/curve-point';
import { POINT_AT_INFINITY } from '../domain/types/curve-point';
import { modSub, modMul } from '../field/fp-arithmetic';
import { modInverse } from '../field/mod-inverse';
import { pointDouble } from './point-double';
import type { DomainParameters } from '../domain/types/domain-parameters';

export function pointAdd(P: CurvePoint, Q: CurvePoint, T: DomainParameters): CurvePoint {
  if (P.infinity) return Q;
  if (Q.infinity) return P;
  const { p } = T;
  if (P.x === Q.x) {
    if (P.y === Q.y) return pointDouble(P, T);
    return POINT_AT_INFINITY; 
  }
  
  const lambda = modMul(modSub(Q.y, P.y, p), modInverse(modSub(Q.x, P.x, p), p), p);
  const xR = modSub(modSub(modMul(lambda, lambda, p), P.x, p), Q.x, p);
  const yR = modSub(modMul(lambda, modSub(P.x, xR, p), p), P.y, p);
  const R: AffinePoint = { infinity: false, x: xR, y: yR };
  return R;
}
