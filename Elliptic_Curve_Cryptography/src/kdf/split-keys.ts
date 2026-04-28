export interface SplitKeys {
  readonly EK: Buffer;
  readonly MK: Buffer;
}

export function splitKeys(K: Buffer, encKeyLen: number, macKeyLen: number): SplitKeys {
  if (K.length < encKeyLen + macKeyLen) {
    throw new Error('Keying material too short to split into EK and MK');
  }
  return {
    EK: K.subarray(0, encKeyLen),
    MK: K.subarray(encKeyLen, encKeyLen + macKeyLen),
  };
}
