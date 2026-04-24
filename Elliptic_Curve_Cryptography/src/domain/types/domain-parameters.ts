// Bộ tham số miền T = (p, a, b, G, n, h) theo SEC 1, §3.1.
import type { CurvePoint } from './curve-point';

export interface DomainParameters {
  /** Số nguyên tố xác định trường hữu hạn F_p. */
  readonly p: bigint;
  /** Hệ số a của đường cong y^2 = x^3 + a·x + b. */
  readonly a: bigint;
  /** Hệ số b của đường cong y^2 = x^3 + a·x + b. */
  readonly b: bigint;
  /** Điểm sinh (base point) G. */
  readonly G: CurvePoint;
  /** Bậc của điểm sinh G. */
  readonly n: bigint;
  /** Hệ số đồng nhân (cofactor) h. */
  readonly h: bigint;
  /** Tên curve (ví dụ "secp256k1"). */
  readonly name: string;
}
