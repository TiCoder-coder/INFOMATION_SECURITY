import * as crypto from 'crypto';
import { aes256ctr } from '../src/crypto/ctr';
import { sha256, sha384, sha512 } from '../src/crypto/sha-adapter';
import { hmac } from '../src/crypto/hmac';

describe('Crypto primitives compatibility with Node crypto', () => {
  describe('SHA adapter', () => {
    const cases = ['', 'abc', 'Xin chào! 🔐', 'A'.repeat(200)];
    for (const input of cases) {
      const label = input.length > 15 ? `${input.slice(0, 15)}... (len=${input.length})` : input;

      it(`sha256("${label}") matches Node crypto`, () => {
        const expected = crypto.createHash('sha256').update(input, 'utf8').digest();
        expect(Buffer.from(sha256(Buffer.from(input, 'utf8'))).equals(expected)).toBe(true);
      });

      it(`sha384("${label}") matches Node crypto`, () => {
        const expected = crypto.createHash('sha384').update(input, 'utf8').digest();
        expect(Buffer.from(sha384(Buffer.from(input, 'utf8'))).equals(expected)).toBe(true);
      });

      it(`sha512("${label}") matches Node crypto`, () => {
        const expected = crypto.createHash('sha512').update(input, 'utf8').digest();
        expect(Buffer.from(sha512(Buffer.from(input, 'utf8'))).equals(expected)).toBe(true);
      });
    }
  });

  describe('HMAC', () => {
    const key = Buffer.from('0123456789abcdef0123456789abcdef', 'utf8');
    const algs = ['sha256', 'sha384', 'sha512'] as const;
    const msgs = ['', 'hello', 'A'.repeat(300)];

    for (const alg of algs) {
      for (const msg of msgs) {
        it(`hmac-${alg} on "${msg.slice(0, 10)}" (len=${msg.length}) matches Node`, () => {
          const expected = crypto.createHmac(alg, key).update(msg, 'utf8').digest();
          expect(Buffer.from(hmac(alg, key, Buffer.from(msg, 'utf8'))).equals(expected)).toBe(true);
        });
      }
    }
  });

  describe('AES-256-CTR', () => {
    const key = Buffer.alloc(32, 0x42);
    const iv = Buffer.alloc(16, 0x01);
    const cases: Array<[string, Buffer]> = [
      ['empty', Buffer.alloc(0)],
      ['1 byte', Buffer.from([0x00])],
      ['15 bytes (partial block)', Buffer.from('123456789abcdef')],
      ['16 bytes (1 block)', Buffer.from('0123456789abcdef')],
      ['17 bytes (partial)', Buffer.from('0123456789abcdefX')],
      ['32 bytes (2 blocks)', Buffer.alloc(32, 0xaa)],
      ['100 bytes (multi-block)', Buffer.alloc(100, 0x55)],
    ];

    for (const [label, plaintext] of cases) {
      it(`aes256ctr(${label}) matches Node aes-256-ctr`, () => {
        const mine = Buffer.from(aes256ctr(key, iv, plaintext));
        const node = crypto.createCipheriv('aes-256-ctr', key, iv).update(plaintext);
        expect(mine.equals(node)).toBe(true);
      });
    }

    it('matches Node across 5 random key/iv/data combinations', () => {
      for (let i = 0; i < 5; i++) {
        const k = crypto.randomBytes(32);
        const v = crypto.randomBytes(16);
        const pt = crypto.randomBytes(50);
        const mine = Buffer.from(aes256ctr(k, v, pt));
        const node = crypto.createCipheriv('aes-256-ctr', k, v).update(pt);
        expect(mine.equals(node)).toBe(true);
      }
    });

    it('decrypt is the inverse of encrypt (CTR symmetry)', () => {
      const k = crypto.randomBytes(32);
      const v = crypto.randomBytes(16);
      const pt = Buffer.from('Thông điệp bí mật cần mã hóa bằng AES-256-CTR.', 'utf8');
      const ct = aes256ctr(k, v, pt);
      const back = aes256ctr(k, v, ct);
      expect(Buffer.from(back).equals(pt)).toBe(true);
    });
  });
});
