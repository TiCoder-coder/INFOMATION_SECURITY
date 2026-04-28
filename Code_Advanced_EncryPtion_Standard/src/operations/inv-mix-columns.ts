import { State, MixColumnsColumnLog } from '../types';
import { gfMultiply } from '../math';
import { NB, STATE_ROWS } from '../constants';

const toHex = (n: number) => n.toString(16).padStart(2, '0');

export function invMixColumns(state: State): State {
  const result: State = Array.from({ length: STATE_ROWS }, () =>
    new Array(NB).fill(0)
  );

  for (let col = 0; col < NB; col++) {
    const s0 = state[0][col];
    const s1 = state[1][col];
    const s2 = state[2][col];
    const s3 = state[3][col];

    result[0][col] =
      gfMultiply(0x0e, s0) ^ gfMultiply(0x0b, s1) ^ gfMultiply(0x0d, s2) ^ gfMultiply(0x09, s3);
    result[1][col] =
      gfMultiply(0x09, s0) ^ gfMultiply(0x0e, s1) ^ gfMultiply(0x0b, s2) ^ gfMultiply(0x0d, s3);
    result[2][col] =
      gfMultiply(0x0d, s0) ^ gfMultiply(0x09, s1) ^ gfMultiply(0x0e, s2) ^ gfMultiply(0x0b, s3);
    result[3][col] =
      gfMultiply(0x0b, s0) ^ gfMultiply(0x0d, s1) ^ gfMultiply(0x09, s2) ^ gfMultiply(0x0e, s3);
  }

  return result;
}

export function invMixColumnsWithDetails(
  state: State
): { result: State; details: MixColumnsColumnLog[] } {
  const result = invMixColumns(state);
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
      row0: `[0e]×${toHex(s0)} ⊕ [0b]×${toHex(s1)} ⊕ [0d]×${toHex(s2)} ⊕ [09]×${toHex(s3)} = ${toHex(r0)}`,
      row1: `[09]×${toHex(s0)} ⊕ [0e]×${toHex(s1)} ⊕ [0b]×${toHex(s2)} ⊕ [0d]×${toHex(s3)} = ${toHex(r1)}`,
      row2: `[0d]×${toHex(s0)} ⊕ [09]×${toHex(s1)} ⊕ [0e]×${toHex(s2)} ⊕ [0b]×${toHex(s3)} = ${toHex(r2)}`,
      row3: `[0b]×${toHex(s0)} ⊕ [0d]×${toHex(s1)} ⊕ [09]×${toHex(s2)} ⊕ [0e]×${toHex(s3)} = ${toHex(r3)}`,
      output: [toHex(r0), toHex(r1), toHex(r2), toHex(r3)],
    });
  }

  return { result, details };
}
