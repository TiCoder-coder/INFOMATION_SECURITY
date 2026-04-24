import { Word } from '../types';
import { sBoxLookup } from '../constants';

export function subWord(word: Word): Word {
  return [
    sBoxLookup(word[0]),
    sBoxLookup(word[1]),
    sBoxLookup(word[2]),
    sBoxLookup(word[3]),
  ];
}
