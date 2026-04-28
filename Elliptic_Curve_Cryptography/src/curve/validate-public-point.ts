import type { CurvePoint } from '../domain/types/curve-point';
import type { DomainParameters } from '../domain/types/domain-parameters';
import { isPointOnCurve } from './is-point-on-curve';
import { scalarMultiply } from './scalar-multiply';

export function validatePublicPoint(P: CurvePoint, T: DomainParameters): boolean {
  if (P.infinity) return false;
  if (P.x < 0n || P.x >= T.p || P.y < 0n || P.y >= T.p) return false;
  if (!isPointOnCurve(P, T)) return false;
  if (T.h !== 1n) {
    const nP = scalarMultiply(T.n, P, T);
    if (!nP.infinity) return false;
  }
  return true;
}
