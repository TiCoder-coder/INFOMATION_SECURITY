// Bản mã ECIES: C = (R, EM, TAG). EM gồm IV || CT của mã hóa đối xứng.
import type { CurvePoint } from '../../domain/types/curve-point';

export interface Ciphertext {
  /** Ephemeral public key R = k·G. */
  readonly R: CurvePoint;
  /** IV || CT của AES-CTR. */
  readonly EM: Buffer;
  /** HMAC tag. */
  readonly TAG: Buffer;
}
