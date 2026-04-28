import { hmacSha256, HMAC_SHA256_OUTPUT } from "../crypto/index.ts";

export interface KdfParams {
  salt: Buffer;
  info: Buffer;
  keyLength: number;
}

export function hkdfExtract(salt: Buffer, ikm: Buffer): Buffer {
  const actualSalt =
    salt.length > 0 ? salt : Buffer.alloc(HMAC_SHA256_OUTPUT, 0x00);
  return hmacSha256(actualSalt, ikm);
}

export function hkdfExpand(
  prk: Buffer,
  info: Buffer,
  length: number,
): Buffer {
  const N = Math.ceil(length / HMAC_SHA256_OUTPUT);
  if (N > 255) {
    throw new Error("[hkdf] Yêu cầu đầu ra quá lớn (> 255 * HashLen)");
  }
  const T: Buffer[] = [];
  let prev: Buffer = Buffer.alloc(0);
  for (let i = 1; i <= N; i++) {
    const block: Buffer = hmacSha256(
      prk,
      Buffer.concat([prev, info, Buffer.from([i])]),
    );
    T.push(block);
    prev = block;
  }
  return Buffer.concat(T).subarray(0, length);
}

export function deriveSessionKey(
  sharedSecret: Buffer,
  params: KdfParams,
): Buffer {
  const prk = hkdfExtract(params.salt, sharedSecret);
  return hkdfExpand(prk, params.info, params.keyLength);
}
