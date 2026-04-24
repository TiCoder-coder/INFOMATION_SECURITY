import * as fs from 'fs';
import * as path from 'path';
import { AESOperationLog, State, StepLog } from '../types';
import { stateToHexMatrix } from './converter';

const LOGS_DIR = path.resolve(__dirname, '../../logs');

function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

/** Tạo log entry cho một step */
export function createStepLog(step: string, state: State): StepLog {
  return { step, state: stateToHexMatrix(state) };
}

/** Tạo base filename chung cho JSON & TXT để 2 file luôn khớp timestamp */
function makeBaseFilename(log: AESOperationLog, timestamp: number): string {
  return `aes-${log.keySize}-${log.mode}-${timestamp}`;
}

/** Ghi log ra file JSON */
export function saveLogJSON(log: AESOperationLog, timestamp: number = Date.now()): string {
  ensureLogsDir();
  const filename = `${makeBaseFilename(log, timestamp)}.json`;
  const filepath = path.join(LOGS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(log, null, 2), 'utf-8');
  return filepath;
}

/** Ghi log ra file TXT (readable) */
export function saveLogTXT(log: AESOperationLog, timestamp: number = Date.now()): string {
  ensureLogsDir();
  const filename = `${makeBaseFilename(log, timestamp)}.txt`;
  const filepath = path.join(LOGS_DIR, filename);

  const modeLabel = log.mode === 'encrypt' ? 'ENCRYPTION' : 'DECRYPTION';
  const lines: string[] = [];
  lines.push('='.repeat(60));
  lines.push(`  AES-${log.keySize} ${modeLabel} LOG`);
  lines.push(`  Time: ${log.timestamp}`);
  lines.push('='.repeat(60));
  lines.push('');
  if (log.plaintext) {
    lines.push(`Plaintext:       "${log.plaintext}"`);
  }
  lines.push(`Plaintext (hex): ${log.plaintextHex}`);
  lines.push(`Key (hex):       ${log.keyHex}`);
  lines.push(`IV (hex):        ${log.iv}`);
  lines.push(`Total Rounds:    ${log.rounds}`);
  lines.push(`Mode:            ${log.mode.toUpperCase()} (AES-CBC)`);
  lines.push('');

  lines.push('--- Round Keys ---');
  log.roundKeys.forEach((rk, i) => {
    lines.push(`  Round Key ${i.toString().padStart(2, ' ')}: ${rk}`);
  });
  lines.push('');

  for (const round of log.roundDetails) {
    lines.push('-'.repeat(40));
    lines.push(`ROUND ${round.round}`);
    lines.push('-'.repeat(40));
    for (const step of round.steps) {
      lines.push(`  [${step.step}]`);
      if (step.roundKeyIndex !== undefined && step.roundKeyHex) {
        lines.push(`    Round Key ${step.roundKeyIndex}: ${step.roundKeyHex}`);
      }
      for (let r = 0; r < step.state.length; r++) {
        lines.push(`    ${step.state[r].join(' ')}`);
      }

      if (step.subBytesDetails) {
        lines.push('');
        lines.push('  --- SubBytes Detail (S-Box Lookup) ---');
        for (const byteLog of step.subBytesDetails.byteDetails) {
          lines.push(`  ${byteLog.position}: ${byteLog.inputByte} → ${byteLog.sBoxValue}`);
        }
      }

      if (step.mixColumnsDetails) {
        lines.push('');
        lines.push('  --- MixColumns Detail (Ma trận × từng cột) ---');
        for (const col of step.mixColumnsDetails) {
          lines.push(`  Cột ${col.column}: [${col.input.join(', ')}]`);
          lines.push(`     Row 0: ${col.row0}`);
          lines.push(`     Row 1: ${col.row1}`);
          lines.push(`     Row 2: ${col.row2}`);
          lines.push(`     Row 3: ${col.row3}`);
          lines.push(`     Output: [${col.output.join(', ')}]`);
          lines.push('');
        }
      }

      lines.push('');
    }
  }

  lines.push('='.repeat(60));
  lines.push(`Ciphertext (hex):    ${log.ciphertextHex}`);
  lines.push(`Ciphertext (base64): ${log.ciphertextBase64}`);
  if (log.mode === 'decrypt' && log.plaintext) {
    lines.push(`Plaintext decoded:   "${log.plaintext}"`);
  }
  lines.push('='.repeat(60));

  fs.writeFileSync(filepath, lines.join('\n'), 'utf-8');
  return filepath;
}

/** Ghi cả JSON + TXT với cùng 1 timestamp (giải pháp cho lỗi 2 file lệch tên) */
export function saveLog(log: AESOperationLog): { jsonPath: string; txtPath: string } {
  const ts = Date.now();
  return {
    jsonPath: saveLogJSON(log, ts),
    txtPath: saveLogTXT(log, ts),
  };
}
