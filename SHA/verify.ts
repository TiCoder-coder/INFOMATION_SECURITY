

import * as crypto from 'crypto';
import { SHA1Encoder } from './src/algorithms/sha1/encoder';
import { SHA224Encoder } from './src/algorithms/sha2/sha224';
import { SHA256Encoder } from './src/algorithms/sha2/sha256';
import { SHA384Encoder } from './src/algorithms/sha2/sha384';
import { SHA512Encoder } from './src/algorithms/sha2/sha512';
import { SHA3_256Encoder } from './src/algorithms/sha3/sha3_256';
import { SHA3_384Encoder } from './src/algorithms/sha3/sha3_384';
import { SHA3_512Encoder } from './src/algorithms/sha3/sha3_512';

const silentLogger: any = new Proxy(
  {},
  {
    get: (_t, prop) => {
      if (prop === 'getLogPath') return () => '';
      return () => {};
    },
  }
);

interface TestCase {
  label: string;
  input: string;
}

const cases: TestCase[] = [
  { label: 'empty',         input: '' },
  { label: 'abc',           input: 'abc' },
  { label: 'fox',           input: 'The quick brown fox jumps over the lazy dog' },
  { label: 'long 1000 A',   input: 'a'.repeat(1000) },
  { label: 'utf8-vi',       input: 'Xin chào thế giới!' },
  { label: 'emoji',         input: 'Xin chào! 🔐🇻🇳' },
  { label: 'boundary 55',   input: 'A'.repeat(55) },
  { label: 'boundary 56',   input: 'A'.repeat(56) },
  { label: 'boundary 64',   input: 'A'.repeat(64) },
  { label: 'boundary 111',  input: 'A'.repeat(111) },
  { label: 'boundary 112',  input: 'A'.repeat(112) },
  { label: 'boundary 127',  input: 'A'.repeat(127) },
  { label: 'boundary 128',  input: 'A'.repeat(128) },
  { label: 'multi-block',   input: 'X'.repeat(500) },
];

const algos: Array<{
  name: string;
  node: string;
  fn: (s: string) => string;
}> = [
  { name: 'SHA-1',    node: 'sha1',     fn: (s) => SHA1Encoder.encode(s, silentLogger) },
  { name: 'SHA-224',  node: 'sha224',   fn: (s) => SHA224Encoder.encode(s, silentLogger) },
  { name: 'SHA-256',  node: 'sha256',   fn: (s) => SHA256Encoder.encode(s, silentLogger) },
  { name: 'SHA-384',  node: 'sha384',   fn: (s) => SHA384Encoder.encode(s, silentLogger) },
  { name: 'SHA-512',  node: 'sha512',   fn: (s) => SHA512Encoder.encode(s, silentLogger) },
  { name: 'SHA3-256', node: 'sha3-256', fn: (s) => SHA3_256Encoder.encode(s, silentLogger) },
  { name: 'SHA3-384', node: 'sha3-384', fn: (s) => SHA3_384Encoder.encode(s, silentLogger) },
  { name: 'SHA3-512', node: 'sha3-512', fn: (s) => SHA3_512Encoder.encode(s, silentLogger) },
];

let pass = 0;
let fail = 0;
const failures: string[] = [];

for (const algo of algos) {
  for (const tc of cases) {
    const expected = crypto.createHash(algo.node).update(tc.input, 'utf8').digest('hex');
    let actual = '';
    try {
      actual = algo.fn(tc.input);
    } catch (e) {
      actual = `ERROR: ${(e as Error).message}`;
    }
    if (actual === expected) {
      pass++;
    } else {
      fail++;
      failures.push(
        `  [${algo.name}] ${tc.label} (len=${tc.input.length})\n` +
          `     expected: ${expected}\n` +
          `     actual:   ${actual}`
      );
    }
  }
}

console.log(`\n=== SHA Verification vs Node crypto ===`);
console.log(`Total : ${pass + fail}`);
console.log(`PASS  : ${pass}`);
console.log(`FAIL  : ${fail}`);

if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(f));
  process.exit(1);
} else {
  console.log('\n✅ All tests passed.');
  process.exit(0);
}
