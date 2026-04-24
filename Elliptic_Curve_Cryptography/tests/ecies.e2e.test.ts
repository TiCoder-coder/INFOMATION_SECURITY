import { SECP256K1 } from '../src/domain/curves/secp256k1';
import { generateKeyPair } from '../src/keys/generate-key-pair';
import { eciesEncrypt } from '../src/ecies/encrypt/ecies-encrypt';
import { eciesDecrypt } from '../src/ecies/decrypt/ecies-decrypt';

describe('ECIES end-to-end', () => {
  it('encrypts and decrypts back to original plaintext', () => {
    const bob = generateKeyPair(SECP256K1);
    const M = Buffer.from('hello ecies', 'utf8');
    const C = eciesEncrypt(M, bob.publicKey);
    const M2 = eciesDecrypt(C, bob.privateKey, SECP256K1);
    expect(M2.equals(M)).toBe(true);
  });

  it('fails when TAG is tampered', () => {
    const bob = generateKeyPair(SECP256K1);
    const C = eciesEncrypt(Buffer.from('abc'), bob.publicKey);
    const tampered = { ...C, TAG: Buffer.from(C.TAG).fill(0) };
    expect(() => eciesDecrypt(tampered, bob.privateKey, SECP256K1)).toThrow();
  });
});
