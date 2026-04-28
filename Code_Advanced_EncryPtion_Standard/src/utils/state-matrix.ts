import { State } from '../types';

export function bytesToState(bytes: number[]): State {
  const state: State = Array.from({ length: 4 }, () => new Array(4).fill(0));
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      state[row][col] = bytes[row + 4 * col];
    }
  }
  return state;
}

export function stateToBytes(state: State): number[] {
  const bytes: number[] = new Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      bytes[row + 4 * col] = state[row][col];
    }
  }
  return bytes;
}

export function cloneState(state: State): State {
  return state.map(row => [...row]);
}
