import type { CurvePoint } from '../domain/types/curve-point';
import { POINT_AT_INFINITY } from '../domain/types/curve-point';

export function octetsToPoint(bytes: Buffer, fieldSizeBytes: number): CurvePoint {
  if (bytes.length === 1 && bytes[0] === 0x00) return POINT_AT_INFINITY;
  if (bytes.length !== 1 + 2 * fieldSizeBytes || bytes[0] !== 0x04) {
    throw new Error('Only uncompressed points (0x04 prefix) are supported');
  }
  const x = BigInt('0x' + bytes.subarray(1, 1 + fieldSizeBytes).toString('hex'));
  const y = BigInt('0x' + bytes.subarray(1 + fieldSizeBytes).toString('hex'));
  return { infinity: false, x, y };
}
