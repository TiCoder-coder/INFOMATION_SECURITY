import type { CurvePoint } from '../domain/types/curve-point';
import type { DomainParameters } from '../domain/types/domain-parameters';
import { scalarMultiply } from '../curve/scalar-multiply';

export function computeSharedSecret(
  scalar: bigint,
  point: CurvePoint,
  T: DomainParameters,
): bigint {
  const S = scalarMultiply(scalar, point, T);
  if (S.infinity) throw new Error('Shared secret is point at infinity');
  return S.x;
}
