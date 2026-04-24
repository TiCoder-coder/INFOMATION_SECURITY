import { State, SubBytesByteLog, SubBytesDetail } from '../types';
import { sBoxLookup, STATE_ROWS, NB } from '../constants';

const toHex = (n: number) => n.toString(16).padStart(2, '0');

/** SubBytes: mỗi byte → S-Box lookup */
export function subBytes(state: State): State {
  return state.map(row => row.map(byte => sBoxLookup(byte)));
}

/** SubBytes kèm chi tiết từng byte để logging */
export function subBytesWithDetails(
  state: State
): { result: State; details: SubBytesDetail } {
  const result = subBytes(state);
  const byteDetails: SubBytesByteLog[] = [];

  for (let row = 0; row < STATE_ROWS; row++) {
    for (let col = 0; col < NB; col++) {
      byteDetails.push({
        position: `[${row},${col}]`,
        inputByte: toHex(state[row][col]),
        sBoxValue: toHex(result[row][col]),
      });
    }
  }

  return { result, details: { byteDetails } };
}
