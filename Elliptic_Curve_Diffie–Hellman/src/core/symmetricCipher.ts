/**
 * symmetricCipher.ts
 * -----------------------------------------------------------
 * BƯỚC CUỐI CỦA LƯU ĐỒ:
 *   "Dùng K cho mã hoá đối xứng"
 *
 * C = AES-256-GCM_K(M)  — toàn bộ AES & GCM do project tự cài.
 * -----------------------------------------------------------
 */

import { aesGcmEncrypt, aesGcmDecrypt, type GcmCiphertext } from "../crypto/index.ts";
import { randomBytes } from "../math/index.ts";

export interface Ciphertext {
  algorithm: "aes-256-gcm";
  iv: Buffer;
  authTag: Buffer;
  data: Buffer;
}

export function encryptWithSessionKey(
  plaintext: string | Buffer,
  sessionKey: Buffer,
): Ciphertext {
  if (sessionKey.length !== 32) {
    throw new Error("[symmetricCipher] AES-256 cần khoá 32 byte");
  }
  const iv = randomBytes(12);
  const input = Buffer.isBuffer(plaintext)
    ? plaintext
    : Buffer.from(plaintext, "utf8");

  const out: GcmCiphertext = aesGcmEncrypt(sessionKey, iv, input);
  return {
    algorithm: "aes-256-gcm",
    iv: out.iv,
    authTag: out.authTag,
    data: out.data,
  };
}

export function decryptWithSessionKey(
  ciphertext: Ciphertext,
  sessionKey: Buffer,
): Buffer {
  return aesGcmDecrypt(sessionKey, {
    iv: ciphertext.iv,
    authTag: ciphertext.authTag,
    data: ciphertext.data,
  });
}
