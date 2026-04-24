// sha-adapter.ts
// ─────────────────────────────────────────────────────────────────────────────
// Adapter để ECC project gọi SHA logic từ SHA project (sibling directory).
// Không thay đổi bất kỳ file nào trong SHA project.
//
// Vấn đề API:
//   SHA project : SHA256Encoder.encode(input: string, logger: Logger): string
//   ECC cần     : sha256(data: Uint8Array): Uint8Array
//
// Giải pháp: tạo silentLogger (object thỏa giao diện Logger nhưng no-op)
// rồi gọi trực tiếp các core modules của SHA project với data đã convert.
// ─────────────────────────────────────────────────────────────────────────────

import { PaddingHandler }    from '../../../SHA/src/core/padding_handler';
import { BlockHandler }      from '../../../SHA/src/core/block_handler';
import { HashInitializer }   from '../../../SHA/src/core/hash_initializer';
import { WordExpander }      from '../../../SHA/src/core/word_expander';
import { CompressionEngine } from '../../../SHA/src/core/compression_engine';
import { HashAggregator }    from '../../../SHA/src/core/hash_aggregator';
import { Logger }            from '../../../SHA/src/utils/logger';

// ─── Silent Logger ───────────────────────────────────────────────────────────
// No-op object thỏa interface của SHA project:
//   - Không ghi file, không console.log
//   - Không ảnh hưởng đến runtime của ECC
//
// Dùng Object.create(Logger.prototype) để bypass constructor (tránh tạo file log),
// rồi override toàn bộ methods thành no-op functions.
const _logger: Logger = Object.assign(
  Object.create(Logger.prototype) as Logger,
  {
    info:       () => {},
    debug:      () => {},
    error:      () => {},
    section:    () => {},
    step:       () => {},
    hex:        () => {},
    binary:     () => {},
    array:      () => {},
    explain:    () => {},
    formula:    () => {},
    subStep:    () => {},
    note:       () => {},
    matrix5x5:  () => {},
    round:      () => {},
    result:     () => {},
    summary:    () => {},
    getLogPath: () => '',
  }
);

// ─── Helper: Uint8Array → number[] ──────────────────────────────────────────
function toNumberArray(data: Uint8Array): number[] {
  return Array.from(data);
}

// ─── Helper: hex string → Uint8Array ────────────────────────────────────────
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// ─── SHA-256 via SHA project ──────────────────────────────────────────────────
/**
 * SHA-256 — delegates toàn bộ logic sang SHA project.
 *
 * Luồng xử lý (theo các bước của SHA project):
 *   1. Convert Uint8Array → number[]
 *   2. PaddingHandler.padSHA256    — padding FIPS 180-4
 *   3. BlockHandler.split512       — chia thành blocks 512-bit
 *   4. HashInitializer.initSHA256  — khởi tạo H0..H7
 *   5. (mỗi block) WordExpander + CompressionEngine + HashAggregator
 *   6. HashAggregator.finalizeSHA256 — ghép kết quả hex
 *   7. Convert hex string → Uint8Array (32 bytes)
 *
 * @param data  Dữ liệu cần băm (Uint8Array)
 * @returns     32-byte Uint8Array chứa SHA-256 digest
 */
export function sha256(data: Uint8Array): Uint8Array {
  const bytes     = toNumberArray(data);
  const padded    = PaddingHandler.padSHA256([...bytes], _logger);
  const blocks    = BlockHandler.split512(padded, _logger);
  const initState = HashInitializer.initSHA256(_logger);
  let hashState   = initState.h!;

  for (let i = 0; i < blocks.length; i++) {
    const words      = BlockHandler.bytesToWords32(blocks[i]);
    const expanded   = WordExpander.expandSHA256(words, _logger);
    const compressed = CompressionEngine.compressSHA256(expanded, hashState, _logger);
    hashState        = HashAggregator.updateSHA256(hashState, compressed, i, _logger);
  }

  const hexResult = HashAggregator.finalizeSHA256(hashState, _logger);
  return hexToUint8Array(hexResult); // 32 bytes
}

// ─── SHA-512 via SHA project ──────────────────────────────────────────────────
/**
 * SHA-512 — delegates toàn bộ logic sang SHA project.
 *
 * @param data  Dữ liệu cần băm (Uint8Array)
 * @returns     64-byte Uint8Array chứa SHA-512 digest
 */
export function sha512(data: Uint8Array): Uint8Array {
  const bytes     = toNumberArray(data);
  const padded    = PaddingHandler.padSHA512([...bytes], _logger);
  const blocks    = BlockHandler.split1024(padded, _logger);
  const initState = HashInitializer.initSHA512(_logger);
  let hashState   = initState.h64!;

  for (let i = 0; i < blocks.length; i++) {
    const words      = BlockHandler.bytesToWords64(blocks[i]);
    const expanded   = WordExpander.expandSHA512(words, _logger);
    const compressed = CompressionEngine.compressSHA512(expanded, hashState, _logger);
    hashState        = HashAggregator.updateSHA512(hashState, compressed, i, _logger);
  }

  const hexResult = HashAggregator.finalizeSHA512(hashState, _logger);
  return hexToUint8Array(hexResult); // 64 bytes
}

// ─── SHA-384 via SHA project ──────────────────────────────────────────────────
/**
 * SHA-384 — delegates sang SHA project (SHA-512 với IV khác, truncate 48 bytes).
 *
 * @param data  Dữ liệu cần băm (Uint8Array)
 * @returns     48-byte Uint8Array chứa SHA-384 digest
 */
export function sha384(data: Uint8Array): Uint8Array {
  const bytes     = toNumberArray(data);
  const padded    = PaddingHandler.padSHA512([...bytes], _logger);
  const blocks    = BlockHandler.split1024(padded, _logger);
  const initState = HashInitializer.initSHA384(_logger);
  let hashState   = initState.h64!;

  for (let i = 0; i < blocks.length; i++) {
    const words      = BlockHandler.bytesToWords64(blocks[i]);
    const expanded   = WordExpander.expandSHA512(words, _logger);
    const compressed = CompressionEngine.compressSHA384(expanded, hashState, _logger);
    hashState        = HashAggregator.updateSHA512(hashState, compressed, i, _logger);
  }

  const hexResult = HashAggregator.finalizeSHA384(hashState, _logger);
  return hexToUint8Array(hexResult); // 48 bytes
}
