/**
 * Logger - Ghi log chi tiết quá trình xử lý
 *
 * Dùng buffer in-memory, flush xuống file một lần khi gọi `close()`
 * (hoặc flush thủ công). Tránh gọi `fs.appendFileSync` cho từng dòng
 * khiến log lớn chậm đáng kể.
 */

import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private logFile: string;
  private buffer: string[] = [];
  private closed: boolean = false;

  constructor() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(logsDir, `sha-encoder-${timestamp}.txt`);
    this.buffer.push('=== SHA Encoder Started ===\n');
  }

  /**
   * Ghi log (nối vào buffer, không I/O)
   */
  private writeLog(message: string): void {
    if (this.closed) return;
    const timestamp = new Date().toISOString();
    this.buffer.push(`[${timestamp}] ${message}\n`);
  }

  /**
   * Flush buffer xuống file. Có thể gọi nhiều lần.
   */
  flush(): void {
    if (this.buffer.length === 0) return;
    fs.appendFileSync(this.logFile, this.buffer.join(''));
    this.buffer = [];
  }

  /**
   * Đóng logger: flush toàn bộ log và chặn các ghi tiếp theo.
   */
  close(): void {
    this.flush();
    this.closed = true;
  }

  /**
   * Log thông tin
   */
  info(message: string, data?: any): void {
    this.writeLog(`[INFO] ${message}`);
    if (data) {
      this.writeLog(JSON.stringify(data, null, 2));
    }
    console.log(`✓ ${message}`);
  }

  /**
   * Log chi tiết (dùng cho tracing)
   */
  debug(message: string, data?: any): void {
    this.writeLog(`[DEBUG] ${message}`);
    if (data) {
      this.writeLog(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log lỗi
   */
  error(message: string, error?: Error): void {
    this.writeLog(`[ERROR] ${message}`);
    if (error) {
      this.writeLog(error.message);
      this.writeLog(error.stack || '');
    }
    console.error(`✗ ${message}`);
  }

  /**
   * Log tiêu đề section
   */
  section(title: string): void {
    const line = '='.repeat(50);
    this.writeLog(`\n${line}\n${title}\n${line}\n`);
    console.log(`\n${'='.repeat(50)}\n${title}\n${'='.repeat(50)}\n`);
  }

  /**
   * Log bước xử lý
   */
  step(stepNumber: number, description: string): void {
    const message = `Step ${stepNumber}: ${description}`;
    this.writeLog(`\n>>> ${message}`);
    console.log(`\n>>> ${message}`);
  }

  /**
   * Log hex values
   */
  hex(label: string, value: string, truncate: boolean = false): void {
    let displayValue = value;
    if (truncate && value.length > 64) {
      displayValue = value.substring(0, 64) + '...';
    }
    this.writeLog(`${label}: ${displayValue}`);
  }

  /**
   * Log binary
   */
  binary(label: string, value: string, truncate: boolean = false): void {
    let displayValue = value;
    if (truncate && value.length > 128) {
      displayValue = value.substring(0, 128) + '...';
    }
    this.writeLog(`${label}: ${displayValue}`);
  }

  /**
   * Log array
   */
  array(label: string, values: any[], showAll: boolean = false): void {
    if (showAll) {
      this.writeLog(`${label}:`);
      values.forEach((v, i) => {
        this.writeLog(`  [${i}]: ${v}`);
      });
    } else {
      this.writeLog(`${label}: [${values.slice(0, 8).join(', ')}${values.length > 8 ? '...' : ''}]`);
    }
  }

  /**
   * Giải thích dài (nhiều dòng) — dùng để mô tả cơ chế, công thức
   */
  explain(text: string): void {
    const lines = text.replace(/^\n+|\n+$/g, '').split('\n');
    this.writeLog('');
    this.writeLog('    ┌─ Giải thích ────────────────────────────────────────');
    for (const l of lines) this.writeLog('    │ ' + l);
    this.writeLog('    └──────────────────────────────────────────────────────');
  }

  /**
   * Log một công thức / định nghĩa
   */
  formula(label: string, expr: string): void {
    this.writeLog(`    [Công thức] ${label} = ${expr}`);
  }

  /**
   * Log một sub-step (bước nhỏ trong step lớn)
   */
  subStep(name: string, description: string): void {
    this.writeLog(`    → ${name}: ${description}`);
  }

  /**
   * Log một dòng note thường, có thụt đầu dòng
   */
  note(text: string): void {
    this.writeLog(`    • ${text}`);
  }

  /**
   * In ma trận 5×5 (Keccak state) dạng hex 16 ký tự
   * state[x][y] — x: cột, y: hàng
   */
  matrix5x5(label: string, state: bigint[][]): void {
    this.writeLog(`    ${label}:`);
    this.writeLog('         x=0              x=1              x=2              x=3              x=4');
    for (let y = 0; y < 5; y++) {
      const row: string[] = [];
      for (let x = 0; x < 5; x++) {
        row.push(state[x][y].toString(16).padStart(16, '0'));
      }
      this.writeLog(`    y=${y}  ${row.join(' ')}`);
    }
  }

  /**
   * Log một round compression ngắn gọn
   */
  round(roundNum: number, totalRounds: number, data: string): void {
    const r = roundNum.toString().padStart(totalRounds.toString().length, '0');
    this.writeLog(`    Round ${r}/${totalRounds - 1}: ${data}`);
  }

  /**
   * Log kết quả cuối cùng
   */
  result(label: string, value: string): void {
    this.writeLog('\n' + '='.repeat(50));
    this.writeLog(`${label}`);
    this.writeLog('='.repeat(50));
    this.writeLog(value);
    this.writeLog('='.repeat(50) + '\n');

    console.log('\n' + '='.repeat(50));
    console.log(`${label}`);
    console.log('='.repeat(50));
    console.log(value);
    console.log('='.repeat(50) + '\n');
  }

  /**
   * Lấy đường dẫn log file
   */
  getLogPath(): string {
    return this.logFile;
  }

  /**
   * In summary
   */
  summary(algorithm: string, input: string, output: string): void {
    const summaryMessage = `\n╔${'═'.repeat(48)}╗
║ SUMMARY                                          ║
╠${'═'.repeat(48)}╣
║ Algorithm: ${algorithm.padEnd(39)}║
║ Input:     ${input.substring(0, 38).padEnd(39)}║
║ Output:    ${output.substring(0, 38).padEnd(39)}║
║ Log File:  ${this.logFile.split('/').pop()?.padEnd(39) || ''.padEnd(39)}║
╚${'═'.repeat(48)}╝`;

    this.writeLog(summaryMessage);
    console.log(summaryMessage);
  }
}
