import { State } from '../types';

export function addRoundKey(state: State, roundKey: number[][]): State {
  return state.map((row, r) =>
    row.map((byte, c) => byte ^ roundKey[r][c])
  );
}
