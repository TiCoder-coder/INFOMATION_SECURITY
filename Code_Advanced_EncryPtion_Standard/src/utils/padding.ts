import { BLOCK_SIZE_BYTES } from '../constants';

// PKCS#7 Padding: thêm (blockSize - len % blockSize) bytes, mỗi byte = số lượng pad
export function pkcs7Pad(data: number[]): number[] {
  const padLen = BLOCK_SIZE_BYTES - (data.length % BLOCK_SIZE_BYTES);
  return [...data, ...new Array(padLen).fill(padLen)];
}

// Loại bỏ PKCS#7 padding, validate chặt theo chuẩn
export function pkcs7Unpad(data: number[]): number[] {
  if (data.length === 0 || data.length % BLOCK_SIZE_BYTES !== 0) {
    throw new Error('Invalid PKCS7 data length');
  }
  const padLen = data[data.length - 1];
  if (padLen < 1 || padLen > BLOCK_SIZE_BYTES) {
    throw new Error('Invalid PKCS7 padding');
  }
  // Kiểm tra tất cả padding bytes đều = padLen
  for (let i = data.length - padLen; i < data.length; i++) {
    if (data[i] !== padLen) {
      throw new Error('Corrupted PKCS7 padding');
    }
  }
  return data.slice(0, data.length - padLen);
}
