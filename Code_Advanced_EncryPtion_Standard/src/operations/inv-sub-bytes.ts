import { State, SubBytesByteLog, SubBytesDetail } from '../types';
import { invSBoxLookup, STATE_ROWS, NB } from '../constants';

const toHex = (n: number) => n.toString(16).padStart(2, '0');

/** InvSubBytes: mỗi byte → Inverse S-Box lookup */
export function invSubBytes(state: State): State {
  return state.map(row => row.map(byte => invSBoxLookup(byte)));
}

/** InvSubBytes kèm chi tiết từng byte để logging */
export function invSubBytesWithDetails(
  state: State
): { result: State; details: SubBytesDetail } {
  const result = invSubBytes(state);
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
