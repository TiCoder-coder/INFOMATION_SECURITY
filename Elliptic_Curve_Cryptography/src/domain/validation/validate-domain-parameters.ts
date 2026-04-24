// Kiểm tra tham số miền theo thủ tục SEC 1 §3.1.2.
import type { DomainParameters } from '../types/domain-parameters';
import { isCurveNonSingular } from './check-non-singular';
import { isPointOnCurve } from '../../curve/is-point-on-curve';

export function validateDomainParameters(T: DomainParameters): void {
  if (T.p <= 3n) throw new Error('p must be > 3');
  if (!isCurveNonSingular(T.a, T.b, T.p)) {
    throw new Error('Curve is singular: 4a^3 + 27b^2 ≡ 0 (mod p)');
  }
  if (T.G.infinity) throw new Error('Base point G must not be the point at infinity');
  if (!isPointOnCurve(T.G, T)) throw new Error('Base point G is not on the curve');
  if (T.n <= 1n) throw new Error('Order n must be > 1');
  if (T.h < 1n) throw new Error('Cofactor h must be >= 1');
}
