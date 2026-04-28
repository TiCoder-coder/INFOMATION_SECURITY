

import * as crypto from 'crypto';
import { aesEncrypt, aesDecrypt } from './aes';
import { hexToBytes } from './utils';

let passed = 0;
let failed = 0;

function check(name: string, actual: string, expected: string): void {
  const ok = actual.toLowerCase() === expected.toLowerCase();
  console.log(`  ${ok ? '✅' : '❌'} ${name}`);
  if (!ok) {
    console.log(`       expected: ${expected}`);
    console.log(`       actual:   ${actual}`);
    failed++;
  } else {
    passed++;
  }
}

function nodeCbcEncrypt(
  plaintext: string,
  keyHex: string,
  ivHex: string,
  size: 128 | 192 | 256
): string {
  const algo = `aes-${size}-cbc`;
  const cipher = crypto.createCipheriv(
    algo,
    Buffer.from(keyHex, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  return Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]).toString('hex');
}

console.log('============================================================');
console.log('  AES VERIFICATION — vs Node crypto + Roundtrip');
console.log('============================================================\n');

const testCases: Array<{
  label: string;
  size: 128 | 192 | 256;
  keyHex: string;
  ivHex: string;
  plaintext: string;
}> = [
  {
    label: 'AES-128-CBC: short text',
    size: 128,
    keyHex: '2b7e151628aed2a6abf7158809cf4f3c',
    ivHex: '000102030405060708090a0b0c0d0e0f',
    plaintext: 'Hello AES-CBC!',
  },
  {
    label: 'AES-128-CBC: đúng 16 bytes (full-block padding)',
    size: 128,
    keyHex: '2b7e151628aed2a6abf7158809cf4f3c',
    ivHex: '000102030405060708090a0b0c0d0e0f',
    plaintext: '16bytesexactly!!',
  },
  {
    label: 'AES-128-CBC: multi-block + Unicode',
    size: 128,
    keyHex: 'deadbeefdeadbeefdeadbeefdeadbeef',
    ivHex: '00112233445566778899aabbccddeeff',
    plaintext: 'Khối dữ liệu nhiều block — CBC chaining 🔐 FIPS 197!',
  },
  {
    label: 'AES-192-CBC: short text',
    size: 192,
    keyHex: '000102030405060708090a0b0c0d0e0f1011121314151617',
    ivHex: 'ffeeddccbbaa99887766554433221100',
    plaintext: 'Test AES-192.',
  },
  {
    label: 'AES-192-CBC: multi-block',
    size: 192,
    keyHex: '8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b',
    ivHex: '000102030405060708090a0b0c0d0e0f',
    plaintext:
      'The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet.',
  },
  {
    label: 'AES-256-CBC: short',
    size: 256,
    keyHex:
      '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    ivHex: '0f0e0d0c0b0a09080706050403020100',
    plaintext: 'Advanced Encryption Standard — 256-bit.',
  },
  {
    label: 'AES-256-CBC: multi-block Unicode',
    size: 256,
    keyHex:
      '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4',
    ivHex: '000102030405060708090a0b0c0d0e0f',
    plaintext:
      'Mật mã AES-256 là chuẩn mã hoá mạnh nhất hiện nay. 🔐 Chain multi-block!',
  },
];

console.log('📋 GROUP 1: So sánh ciphertext với Node crypto\n');
for (const tc of testCases) {
  const keyBytes = hexToBytes(tc.keyHex);
  const ivBytes = hexToBytes(tc.ivHex);

  const ours = aesEncrypt(tc.plaintext, tc.size, {
    key: keyBytes,
    iv: ivBytes,
    writeLogFiles: false,
  });
  const expected = nodeCbcEncrypt(tc.plaintext, tc.keyHex, tc.ivHex, tc.size);

  check(tc.label, ours.ciphertextHex, expected);
}

console.log('\n📋 GROUP 2: Roundtrip encrypt→decrypt (với key/IV random)\n');
{
  const samples = [
    'A',
    'Hello!',
    '16bytesexactly!!',
    'Một chuỗi tiếng Việt có dấu!',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Khối dữ liệu dài hơn một block để test CBC chaining nhiều block 🔥',
    'x'.repeat(100),
  ];
  const sizes: (128 | 192 | 256)[] = [128, 192, 256];
  let ok = 0;
  let total = 0;
  for (const size of sizes) {
    for (const pt of samples) {
      total++;
      const enc = aesEncrypt(pt, size, { writeLogFiles: false });
      const dec = aesDecrypt(enc.ciphertextHex, enc.keyHex, enc.iv, size, {
        writeLogFiles: false,
      });
      if (dec.plaintext === pt) {
        ok++;
      } else {
        console.log(`  ❌ AES-${size} roundtrip thất bại: "${pt}"`);
        console.log(`       decrypted: "${dec.plaintext}"`);
      }
    }
  }
  check(
    `Roundtrip ${total} lần (${sizes.length} key sizes × ${samples.length} inputs)`,
    String(ok),
    String(total)
  );
}

console.log('\n📋 GROUP 3: Decrypt ciphertext do Node crypto sinh ra\n');
{
  for (const tc of testCases) {
    const ct = nodeCbcEncrypt(tc.plaintext, tc.keyHex, tc.ivHex, tc.size);
    const dec = aesDecrypt(ct, tc.keyHex, tc.ivHex, tc.size, {
      writeLogFiles: false,
    });
    check(`Decrypt (${tc.label})`, dec.plaintext, tc.plaintext);
  }
}

console.log('\n📋 GROUP 4: Validation / edge cases\n');
{
  
  try {
    aesEncrypt('abc', 128, {
      key: [1, 2, 3],
      iv: new Array(16).fill(0),
      writeLogFiles: false,
    });
    console.log('  ❌ Không throw khi key length sai');
    failed++;
  } catch {
    console.log('  ✅ Throw khi key length sai');
    passed++;
  }

  
  try {
    aesEncrypt('abc', 128, {
      key: new Array(16).fill(0),
      iv: [1, 2, 3],
      writeLogFiles: false,
    });
    console.log('  ❌ Không throw khi IV length sai');
    failed++;
  } catch {
    console.log('  ✅ Throw khi IV length sai');
    passed++;
  }

  
  try {
    aesEncrypt('abc', 100 as 128, { writeLogFiles: false });
    console.log('  ❌ Không throw khi key size không hợp lệ');
    failed++;
  } catch {
    console.log('  ✅ Throw khi key size không hợp lệ');
    passed++;
  }

  
  try {
    aesDecrypt(
      'aabbcc',
      '00112233445566778899aabbccddeeff',
      '000102030405060708090a0b0c0d0e0f',
      128,
      { writeLogFiles: false }
    );
    console.log('  ❌ Không throw khi ciphertext length sai');
    failed++;
  } catch {
    console.log('  ✅ Throw khi ciphertext length không phải bội của 16');
    passed++;
  }
}

console.log('\n============================================================');
console.log(`  KẾT QUẢ: ${passed} passed, ${failed} failed`);
console.log('============================================================');
process.exit(failed === 0 ? 0 : 1);
