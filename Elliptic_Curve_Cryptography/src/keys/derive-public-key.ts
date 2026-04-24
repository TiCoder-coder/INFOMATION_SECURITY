// Tính khóa công khai Q = d·G.
import type { CurvePoint } from '../domain/types/curve-point';
import type { DomainParameters } from '../domain/types/domain-parameters';
import { scalarMultiply } from '../curve/scalar-multiply';

export function derivePublicKey(d: bigint, T: DomainParameters): CurvePoint {
  return scalarMultiply(d, T.G, T);
}
