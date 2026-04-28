import { State, MixColumnsColumnLog } from '../types';
import { gfMultiply } from '../math';
import { NB, STATE_ROWS } from '../constants';

const toHex = (n: number) => n.toString(16).padStart(2, '0');

export function mixColumns(state: State): State {
  const result: State = Array.from({ length: STATE_ROWS }, () =>
    new Array(NB).fill(0)
  );

  for (let col = 0; col < NB; col++) {
    const s0 = state[0][col];
    const s1 = state[1][col];
    const s2 = state[2][col];
    const s3 = state[3][col];

    result[0][col] = gfMultiply(2, s0) ^ gfMultiply(3, s1) ^ s2 ^ s3;
    result[1][col] = s0 ^ gfMultiply(2, s1) ^ gfMultiply(3, s2) ^ s3;
    result[2][col] = s0 ^ s1 ^ gfMultiply(2, s2) ^ gfMultiply(3, s3);
    result[3][col] = gfMultiply(3, s0) ^ s1 ^ s2 ^ gfMultiply(2, s3);
  }

  return result;
}

export function mixColumnsWithDetails(
  state: State
): { result: State; details: MixColumnsColumnLog[] } {
  const result = mixColumns(state);
  const details: MixColumnsColumnLog[] = [];

  for (let col = 0; col < NB; col++) {
    const s0 = state[0][col];
    const s1 = state[1][col];
    const s2 = state[2][col];
    const s3 = state[3][col];

    const r0 = result[0][col];
    const r1 = result[1][col];
    const r2 = result[2][col];
    const r3 = result[3][col];

    details.push({
      column: col,
      input: [toHex(s0), toHex(s1), toHex(s2), toHex(s3)],
      row0: `[2]×${toHex(s0)} ⊕ [3]×${toHex(s1)} ⊕ [1]×${toHex(s2)} ⊕ [1]×${toHex(s3)} = ${toHex(r0)}`,
      row1: `[1]×${toHex(s0)} ⊕ [2]×${toHex(s1)} ⊕ [3]×${toHex(s2)} ⊕ [1]×${toHex(s3)} = ${toHex(r1)}`,
      row2: `[1]×${toHex(s0)} ⊕ [1]×${toHex(s1)} ⊕ [2]×${toHex(s2)} ⊕ [3]×${toHex(s3)} = ${toHex(r2)}`,
      row3: `[3]×${toHex(s0)} ⊕ [1]×${toHex(s1)} ⊕ [1]×${toHex(s2)} ⊕ [2]×${toHex(s3)} = ${toHex(r3)}`,
      output: [toHex(r0), toHex(r1), toHex(r2), toHex(r3)],
    });
  }

  return { result, details };
}
