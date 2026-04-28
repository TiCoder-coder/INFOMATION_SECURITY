import { State } from '../types';

export function invShiftRows(state: State): State {
  return [
    [state[0][0], state[0][1], state[0][2], state[0][3]],
    [state[1][3], state[1][0], state[1][1], state[1][2]],
    [state[2][2], state[2][3], state[2][0], state[2][1]],
    [state[3][1], state[3][2], state[3][3], state[3][0]],
  ];
}
