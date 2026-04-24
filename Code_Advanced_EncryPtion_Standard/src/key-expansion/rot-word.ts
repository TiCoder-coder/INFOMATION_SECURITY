import { Word } from '../types';

export function rotWord(word: Word): Word {
  return [word[1], word[2], word[3], word[0]];
}
