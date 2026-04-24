// ECDH shared secret — SEC 1 §3.3.1.
// Bên gửi:  z = k·QV     (QV là khóa công khai của bên nhận)
// Bên nhận: z = dV·R     (R là ephemeral public key từ bên gửi)
// Kết quả chia sẻ là tọa độ x của điểm.
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
