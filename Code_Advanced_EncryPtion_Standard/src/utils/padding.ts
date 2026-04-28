import { BLOCK_SIZE_BYTES } from '../constants';

export function pkcs7Pad(data: number[]): number[] {
  const padLen = BLOCK_SIZE_BYTES - (data.length % BLOCK_SIZE_BYTES);
  return [...data, ...new Array(padLen).fill(padLen)];
}

export function pkcs7Unpad(data: number[]): number[] {
  if (data.length === 0 || data.length % BLOCK_SIZE_BYTES !== 0) {
    throw new Error('Invalid PKCS7 data length');
  }
  const padLen = data[data.length - 1];
  if (padLen < 1 || padLen > BLOCK_SIZE_BYTES) {
    throw new Error('Invalid PKCS7 padding');
  }
  
  for (let i = data.length - padLen; i < data.length; i++) {
    if (data[i] !== padLen) {
      throw new Error('Corrupted PKCS7 padding');
    }
  }
  return data.slice(0, data.length - padLen);
}
