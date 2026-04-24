/**
 * AES-CBC (FIPS 197) — orchestrator.
 *
 * CBC Mode (Cipher Block Chaining):
 *   - Encrypt: C[i] = AES_Encrypt(P[i] XOR C[i-1]),  C[-1] = IV
 *   - Decrypt: P[i] = AES_Decrypt(C[i]) XOR C[i-1],  C[-1] = IV
 *   - Padding: PKCS#7 áp dụng trên toàn bộ plaintext trước khi chia block (chỉ chạy ở lần cuối).
 */
import * as crypto from 'crypto';
import {
  AESKeySize,
  AESConfig,
  Word,
  State,
  RoundLog,
  AESOperationLog,
} from './types';
import { getAESConfig, BLOCK_SIZE_BYTES } from './constants';
import { keyExpansion, getRoundKey } from './key-expansion';
import {
  subBytesWithDetails,
  invSubBytesWithDetails,
  shiftRows,
  invShiftRows,
  mixColumnsWithDetails,
  invMixColumnsWithDetails,
  addRoundKey,
} from './operations';
import {
  bytesToState,
  stateToBytes,
  cloneState,
  stringToBytes,
  bytesToHex,
  hexToBytes,
  bytesToBase64,
  pkcs7Pad,
  pkcs7Unpad,
  createStepLog,
  saveLog,
} from './utils';

// ====================================================================
// Helpers
// ====================================================================

function roundKeyToHex(rk: number[][]): string {
  const flat = rk[0].concat(rk[1], rk[2], rk[3]);
  return flat.map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatRoundKeys(expandedKey: Word[], Nr: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= Nr; i++) {
    const rk = getRoundKey(expandedKey, i);
    const flat = rk[0].concat(rk[1], rk[2], rk[3]);
    out.push(bytesToHex(flat));
  }
  return out;
}

function ensureKeyBytes(
  key: number[] | undefined,
  keySize: AESKeySize
): number[] {
  const expected = keySize / 8;
  if (!key) {
    return Array.from(crypto.randomBytes(expected));
  }
  if (key.length !== expected) {
    throw new Error(
      `Key length mismatch: AES-${keySize} cần ${expected} bytes, nhận được ${key.length}`
    );
  }
  return key;
}

function ensureIV(iv: number[] | undefined): number[] {
  if (!iv) {
    return Array.from(crypto.randomBytes(BLOCK_SIZE_BYTES));
  }
  if (iv.length !== BLOCK_SIZE_BYTES) {
    throw new Error(
      `IV length mismatch: cần ${BLOCK_SIZE_BYTES} bytes, nhận được ${iv.length}`
    );
  }
  return iv;
}

// ====================================================================
// Block-level: Encrypt & Decrypt một block 16 bytes
// ====================================================================

function encryptBlock(
  block: number[],
  expandedKey: Word[],
  config: AESConfig
): { cipherBlock: number[]; roundDetails: RoundLog[] } {
  const { Nr } = config;
  const roundDetails: RoundLog[] = [];

  let state: State = bytesToState(block);

  // Round 0: AddRoundKey (Initial)
  const rk0 = getRoundKey(expandedKey, 0);
  state = addRoundKey(state, rk0);
  const log0 = createStepLog('AddRoundKey (Initial)', cloneState(state));
  log0.roundKeyIndex = 0;
  log0.roundKeyHex = roundKeyToHex(rk0);
  roundDetails.push({ round: 0, steps: [log0] });

  // Rounds 1 → Nr-1
  for (let round = 1; round < Nr; round++) {
    const steps = [];

    const sub = subBytesWithDetails(state);
    state = sub.result;
    const subLog = createStepLog('SubBytes', cloneState(state));
    subLog.subBytesDetails = sub.details;
    steps.push(subLog);

    state = shiftRows(state);
    steps.push(createStepLog('ShiftRows', cloneState(state)));

    const mix = mixColumnsWithDetails(state);
    state = mix.result;
    const mixLog = createStepLog('MixColumns', cloneState(state));
    mixLog.mixColumnsDetails = mix.details;
    steps.push(mixLog);

    const rk = getRoundKey(expandedKey, round);
    state = addRoundKey(state, rk);
    const rkLog = createStepLog('AddRoundKey', cloneState(state));
    rkLog.roundKeyIndex = round;
    rkLog.roundKeyHex = roundKeyToHex(rk);
    steps.push(rkLog);

    roundDetails.push({ round, steps });
  }

  // Final round (không MixColumns)
  {
    const steps = [];

    const sub = subBytesWithDetails(state);
    state = sub.result;
    const subLog = createStepLog('SubBytes', cloneState(state));
    subLog.subBytesDetails = sub.details;
    steps.push(subLog);

    state = shiftRows(state);
    steps.push(createStepLog('ShiftRows', cloneState(state)));

    const rkFinal = getRoundKey(expandedKey, Nr);
    state = addRoundKey(state, rkFinal);
    const finalLog = createStepLog('AddRoundKey (Final)', cloneState(state));
    finalLog.roundKeyIndex = Nr;
    finalLog.roundKeyHex = roundKeyToHex(rkFinal);
    steps.push(finalLog);

    roundDetails.push({ round: Nr, steps });
  }

  return { cipherBlock: stateToBytes(state), roundDetails };
}

function decryptBlock(
  block: number[],
  expandedKey: Word[],
  config: AESConfig
): { plainBlock: number[]; roundDetails: RoundLog[] } {
  const { Nr } = config;
  const roundDetails: RoundLog[] = [];

  let state: State = bytesToState(block);

  // Round 0 của decrypt: AddRoundKey với rk[Nr]
  const rkStart = getRoundKey(expandedKey, Nr);
  state = addRoundKey(state, rkStart);
  const log0 = createStepLog('AddRoundKey (Initial)', cloneState(state));
  log0.roundKeyIndex = Nr;
  log0.roundKeyHex = roundKeyToHex(rkStart);
  roundDetails.push({ round: 0, steps: [log0] });

  // Rounds Nr-1 → 1 (inverse cipher)
  for (let round = Nr - 1; round >= 1; round--) {
    const steps = [];

    state = invShiftRows(state);
    steps.push(createStepLog('InvShiftRows', cloneState(state)));

    const sub = invSubBytesWithDetails(state);
    state = sub.result;
    const subLog = createStepLog('InvSubBytes', cloneState(state));
    subLog.subBytesDetails = sub.details;
    steps.push(subLog);

    const rk = getRoundKey(expandedKey, round);
    state = addRoundKey(state, rk);
    const rkLog = createStepLog('AddRoundKey', cloneState(state));
    rkLog.roundKeyIndex = round;
    rkLog.roundKeyHex = roundKeyToHex(rk);
    steps.push(rkLog);

    const mix = invMixColumnsWithDetails(state);
    state = mix.result;
    const mixLog = createStepLog('InvMixColumns', cloneState(state));
    mixLog.mixColumnsDetails = mix.details;
    steps.push(mixLog);

    roundDetails.push({ round: Nr - round, steps });
  }

  // Final round: InvShiftRows → InvSubBytes → AddRoundKey(rk[0]) (không InvMixColumns)
  {
    const steps = [];

    state = invShiftRows(state);
    steps.push(createStepLog('InvShiftRows', cloneState(state)));

    const sub = invSubBytesWithDetails(state);
    state = sub.result;
    const subLog = createStepLog('InvSubBytes', cloneState(state));
    subLog.subBytesDetails = sub.details;
    steps.push(subLog);

    const rk0 = getRoundKey(expandedKey, 0);
    state = addRoundKey(state, rk0);
    const finalLog = createStepLog('AddRoundKey (Final)', cloneState(state));
    finalLog.roundKeyIndex = 0;
    finalLog.roundKeyHex = roundKeyToHex(rk0);
    steps.push(finalLog);

    roundDetails.push({ round: Nr, steps });
  }

  return { plainBlock: stateToBytes(state), roundDetails };
}

// ====================================================================
// Public API: AES-CBC Encrypt
// ====================================================================

export interface AESEncryptOptions {
  /** Key bytes (nếu không truyền sẽ random) */
  key?: number[];
  /** IV bytes (nếu không truyền sẽ random) — phải = 16 bytes */
  iv?: number[];
  /** Có ghi log ra file không (default: true) */
  writeLogFiles?: boolean;
}

export interface AESDecryptOptions {
  /** Có ghi log ra file không (default: true) */
  writeLogFiles?: boolean;
}

/**
 * Mã hoá plaintext bằng AES-CBC với PKCS#7 padding.
 *
 * @param plaintext  Chuỗi cần mã hoá (UTF-8)
 * @param keySize    128 | 192 | 256
 * @param options    Cho phép truyền key/IV có sẵn (dùng để test với FIPS 197 vectors)
 */
export function aesEncrypt(
  plaintext: string,
  keySize: AESKeySize,
  options: AESEncryptOptions = {}
): AESOperationLog {
  const config = getAESConfig(keySize);
  const keyBytes = ensureKeyBytes(options.key, keySize);
  const ivBytes = ensureIV(options.iv);

  const plaintextBytes = stringToBytes(plaintext);
  // PKCS#7 padding áp dụng TRƯỚC khi chia block — đảm bảo mảng là bội của 16
  const paddedBytes = pkcs7Pad(plaintextBytes);

  const expandedKey = keyExpansion(keyBytes, config);
  const roundKeys = formatRoundKeys(expandedKey, config.Nr);

  const allRoundDetails: RoundLog[] = [];
  const cipherBytes: number[] = [];

  // CBC: C[-1] = IV
  let previousBlock = [...ivBytes];

  for (let offset = 0; offset < paddedBytes.length; offset += BLOCK_SIZE_BYTES) {
    const block = paddedBytes.slice(offset, offset + BLOCK_SIZE_BYTES);
    // CBC XOR: P[i] XOR C[i-1]
    const xorBlock = block.map((b, i) => b ^ previousBlock[i]);

    const { cipherBlock, roundDetails } = encryptBlock(xorBlock, expandedKey, config);

    previousBlock = [...cipherBlock];
    allRoundDetails.push(...roundDetails);
    cipherBytes.push(...cipherBlock);
  }

  const log: AESOperationLog = {
    mode: 'encrypt',
    timestamp: new Date().toISOString(),
    keySize,
    rounds: config.Nr,
    plaintext,
    plaintextHex: bytesToHex(plaintextBytes),
    keyHex: bytesToHex(keyBytes),
    iv: bytesToHex(ivBytes),
    roundKeys,
    roundDetails: allRoundDetails,
    ciphertextHex: bytesToHex(cipherBytes),
    ciphertextBase64: bytesToBase64(cipherBytes),
  };

  if (options.writeLogFiles !== false) {
    const { jsonPath, txtPath } = saveLog(log);
    console.log(`\n[LOG] JSON saved: ${jsonPath}`);
    console.log(`[LOG] TXT saved:  ${txtPath}`);
  }

  return log;
}

// ====================================================================
// Public API: AES-CBC Decrypt
// ====================================================================

/**
 * Giải mã ciphertext bằng AES-CBC.
 *
 * @param ciphertextHex  Hex string của ciphertext
 * @param keyHex         Hex string của key (length phải khớp keySize)
 * @param ivHex          Hex string của IV (16 bytes)
 * @param keySize        128 | 192 | 256
 */
export function aesDecrypt(
  ciphertextHex: string,
  keyHex: string,
  ivHex: string,
  keySize: AESKeySize,
  options: AESDecryptOptions = {}
): AESOperationLog {
  const config = getAESConfig(keySize);

  const keyBytes = hexToBytes(keyHex);
  const ivBytes = hexToBytes(ivHex);
  const cipherBytes = hexToBytes(ciphertextHex);

  ensureKeyBytes(keyBytes, keySize);
  ensureIV(ivBytes);

  if (cipherBytes.length === 0 || cipherBytes.length % BLOCK_SIZE_BYTES !== 0) {
    throw new Error('Ciphertext length phải là bội của 16 bytes (AES block size)');
  }

  const expandedKey = keyExpansion(keyBytes, config);
  const roundKeys = formatRoundKeys(expandedKey, config.Nr);

  const allRoundDetails: RoundLog[] = [];
  const plainPadded: number[] = [];

  // CBC decrypt: C[-1] = IV
  let previousBlock = [...ivBytes];

  for (let offset = 0; offset < cipherBytes.length; offset += BLOCK_SIZE_BYTES) {
    const block = cipherBytes.slice(offset, offset + BLOCK_SIZE_BYTES);
    const { plainBlock: decryptedBlock, roundDetails } = decryptBlock(
      block,
      expandedKey,
      config
    );
    // CBC XOR: AES_Decrypt(C[i]) XOR C[i-1]
    const xorBlock = decryptedBlock.map((b, i) => b ^ previousBlock[i]);
    previousBlock = [...block];

    allRoundDetails.push(...roundDetails);
    plainPadded.push(...xorBlock);
  }

  const plaintextBytes = pkcs7Unpad(plainPadded);
  const plaintext = Buffer.from(plaintextBytes).toString('utf-8');

  const log: AESOperationLog = {
    mode: 'decrypt',
    timestamp: new Date().toISOString(),
    keySize,
    rounds: config.Nr,
    plaintext,
    plaintextHex: bytesToHex(plaintextBytes),
    keyHex: bytesToHex(keyBytes),
    iv: bytesToHex(ivBytes),
    roundKeys,
    roundDetails: allRoundDetails,
    ciphertextHex: bytesToHex(cipherBytes),
    ciphertextBase64: bytesToBase64(cipherBytes),
  };

  if (options.writeLogFiles !== false) {
    const { jsonPath, txtPath } = saveLog(log);
    console.log(`\n[LOG] JSON saved: ${jsonPath}`);
    console.log(`[LOG] TXT saved:  ${txtPath}`);
  }

  return log;
}
