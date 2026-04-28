import { Word } from '../types';
import { rotWord } from './rot-word';
import { subWord } from './sub-word';
import { RCON } from '../constants';

export function processWord(temp: Word, i: number, Nk: number): Word {
  if (i % Nk === 0) {
    const rotated = rotWord(temp);
    const substituted = subWord(rotated);
    const rconIndex = i / Nk;
    return [
      substituted[0] ^ RCON[rconIndex][0],
      substituted[1] ^ RCON[rconIndex][1],
      substituted[2] ^ RCON[rconIndex][2],
      substituted[3] ^ RCON[rconIndex][3],
    ];
  } else if (Nk === 8 && i % Nk === 4) {
    return subWord(temp);
  } else {
    return temp;
  }
}

export function xorWords(a: Word, b: Word): Word {
  return [a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3]];
}
