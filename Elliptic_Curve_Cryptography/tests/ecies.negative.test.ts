import { SECP256K1 } from '../src/domain/curves/secp256k1';
import { generateKeyPair } from '../src/keys/generate-key-pair';
import { eciesEncrypt } from '../src/ecies/encrypt/ecies-encrypt';
import { eciesDecrypt } from '../src/ecies/decrypt/ecies-decrypt';

describe('ECIES — xử lý các trường hợp sai', () => {
  it('1) TAG bị sửa → ném lỗi "TAG kiểm tra thất bại"', () => {
    const bob = generateKeyPair(SECP256K1);
    const C = eciesEncrypt(Buffer.from('hello'), bob.publicKey);
    const tampered = { ...C, TAG: Buffer.from(C.TAG).map((b) => b ^ 0xff) as unknown as Buffer };
    expect(() => eciesDecrypt(tampered, bob.privateKey, SECP256K1)).toThrow(/TAG/);
  });

  it('2) EM bị sửa → TAG verify fail', () => {
    const bob = generateKeyPair(SECP256K1);
    const C = eciesEncrypt(Buffer.from('hello'), bob.publicKey);
    const badEM = Buffer.from(C.EM);
    badEM[badEM.length - 1] ^= 0x01;
    expect(() => eciesDecrypt({ ...C, EM: badEM }, bob.privateKey, SECP256K1)).toThrow(/TAG/);
  });

  it('3) Sai private key (không phải của receiver) → TAG verify fail', () => {
    const bob = generateKeyPair(SECP256K1);
    const eve = generateKeyPair(SECP256K1);
    const C = eciesEncrypt(Buffer.from('secret'), bob.publicKey);
    expect(() => eciesDecrypt(C, eve.privateKey, SECP256K1)).toThrow(/TAG/);
  });

  it('4) R không nằm trên curve → ném lỗi ephemeral point', () => {
    const bob = generateKeyPair(SECP256K1);
    const C = eciesEncrypt(Buffer.from('abc'), bob.publicKey);
    const fakeR = { infinity: false as const, x: 1n, y: 2n };
    expect(() => eciesDecrypt({ ...C, R: fakeR }, bob.privateKey, SECP256K1)).toThrow(
      /ephemeral point/,
    );
  });

  it('5) R là điểm vô cực → ném lỗi', () => {
    const bob = generateKeyPair(SECP256K1);
    const C = eciesEncrypt(Buffer.from('abc'), bob.publicKey);
    expect(() =>
      eciesDecrypt({ ...C, R: { infinity: true } }, bob.privateKey, SECP256K1),
    ).toThrow(/ephemeral point/);
  });

  it('6) QV sai khi encrypt (không trên curve) → ném lỗi', () => {
    const bob = generateKeyPair(SECP256K1);
    const badPub = {
      Q: { infinity: false as const, x: 1n, y: 2n },
      params: bob.publicKey.params,
    };
    expect(() => eciesEncrypt(Buffer.from('abc'), badPub)).toThrow(/QV/);
  });
});
