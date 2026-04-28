import { Word, AESConfig } from '../types';
import { processWord, xorWords } from './key-schedule-core';

export function keyExpansion(keyBytes: number[], config: AESConfig): Word[] {
  const { Nk, Nb, Nr } = config;
  const totalWords = Nb * (Nr + 1);
  const W: Word[] = [];

  for (let i = 0; i < Nk; i++) {
    W.push([
      keyBytes[4 * i],
      keyBytes[4 * i + 1],
      keyBytes[4 * i + 2],
      keyBytes[4 * i + 3],
    ]);
  }

  for (let i = Nk; i < totalWords; i++) {
    let temp: Word = [...W[i - 1]] as Word;
    temp = processWord(temp, i, Nk);
    W.push(xorWords(temp, W[i - Nk]));
  }

  return W;
}

export function getRoundKey(expandedKey: Word[], round: number): number[][] {
  const start = round * 4;
  const key: number[][] = Array.from({ length: 4 }, () => new Array(4).fill(0));
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      key[row][col] = expandedKey[start + col][row];
    }
  }
  return key;
}
