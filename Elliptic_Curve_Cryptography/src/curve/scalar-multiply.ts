// Scalar multiplication k·P bằng thuật toán double-and-add.
import type { CurvePoint } from '../domain/types/curve-point';
import { POINT_AT_INFINITY } from '../domain/types/curve-point';
import { pointAdd } from './point-add';
import { pointDouble } from './point-double';
import type { DomainParameters } from '../domain/types/domain-parameters';

export function scalarMultiply(k: bigint, P: CurvePoint, T: DomainParameters): CurvePoint {
  if (P.infinity) return POINT_AT_INFINITY;

  // Normalize k để hỗ trợ số 0, chiều âm, và chống tràn mod n
  let scalar = k % T.n;
  if (scalar < 0n) scalar += T.n;

  if (scalar === 0n) return POINT_AT_INFINITY;

  let result: CurvePoint = POINT_AT_INFINITY;
  let addend: CurvePoint = P;

  while (scalar > 0n) {
    if (scalar & 1n) result = pointAdd(result, addend, T);
    addend = pointDouble(addend, T);
    scalar >>= 1n;
  }
  return result;
}
