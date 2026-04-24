// SEC 1 §2.3.3: Elliptic-Curve-Point-to-Octet-String (uncompressed form 0x04 || X || Y).
import type { CurvePoint } from '../domain/types/curve-point';
import { fieldElementToOctets } from './field-element-to-octets';

export function pointToOctets(P: CurvePoint, fieldSizeBytes: number): Buffer {
  if (P.infinity) return Buffer.from([0x00]);
  const X = fieldElementToOctets(P.x, fieldSizeBytes);
  const Y = fieldElementToOctets(P.y, fieldSizeBytes);
  return Buffer.concat([Buffer.from([0x04]), X, Y]);
}
