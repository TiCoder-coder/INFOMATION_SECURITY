// Lặp lại shiftRow và XOR trong mix columns
import { xtime } from './xtime';

export function gfMultiply(a: number, b: number): number {
  let result = 0;
  let temp = a & 0xff;

  for (let i = 0; i < 8; i++) {
    if (b & 1) {
      result ^= temp;
    }
    temp = xtime(temp);
    b >>= 1;
  }

  return result & 0xff;
}
