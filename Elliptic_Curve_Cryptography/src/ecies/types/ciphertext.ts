import type { CurvePoint } from '../../domain/types/curve-point';

export interface Ciphertext {
  
  readonly R: CurvePoint;
  
  readonly EM: Buffer;
  
  readonly TAG: Buffer;
}
