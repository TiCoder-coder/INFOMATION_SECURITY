import type { CurvePoint } from '../domain/types/curve-point';
import type { DomainParameters } from '../domain/types/domain-parameters';
import { mod, modMul, modAdd } from '../field/fp-arithmetic';

export function isPointOnCurve(P: CurvePoint, T: DomainParameters): boolean {
  if (P.infinity) return true;
  const { p, a, b } = T;
  const lhs = modMul(P.y, P.y, p);
  const x3 = modMul(modMul(P.x, P.x, p), P.x, p);
  const rhs = modAdd(modAdd(x3, modMul(a, P.x, p), p), mod(b, p), p);
  return lhs === rhs;
}
