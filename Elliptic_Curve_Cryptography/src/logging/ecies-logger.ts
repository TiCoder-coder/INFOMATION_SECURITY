// Logger ghi lại chi tiết từng bước của quy trình ECIES ra file .txt
// và ĐỒNG THỜI in ra terminal (stdout) theo thời gian thực.
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export class EciesLogger {
  private readonly filePath: string;
  private step = 0;

  constructor(logDir = 'logs') {
    const absDir = resolve(process.cwd(), logDir);
    mkdirSync(absDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.filePath = join(absDir, `ecies-${stamp}.txt`);
    writeFileSync(this.filePath, '');
  }

  get path(): string {
    return this.filePath;
  }

  /** Ghi một dòng raw ra FILE và TERMINAL cùng lúc. */
  line(text = ''): void {
    appendFileSync(this.filePath, text + '\n');
    process.stdout.write(text + '\n');
  }

  /** Ghi tiêu đề section. */
  section(title: string): void {
    const bar = '='.repeat(80);
    this.line('');
    this.line(bar);
    this.line(title);
    this.line(bar);
  }

  /** Ghi tiêu đề sub-section. */
  subsection(title: string): void {
    this.line('');
    this.line('-'.repeat(80));
    this.line(title);
    this.line('-'.repeat(80));
  }

  /** Ghi một bước có đánh số tự động. */
  stepLog(title: string, detail?: string): void {
    this.step += 1;
    this.line(`[Bước ${this.step}] ${title}`);
    if (detail) {
      for (const ln of detail.split('\n')) this.line('    ' + ln);
    }
  }

  /** Ghi cặp key: value. */
  kv(key: string, value: string | number | bigint | boolean): void {
    this.line(`    • ${key.padEnd(28)} = ${String(value)}`);
  }

  /** Ghi giá trị hex của bigint. */
  hex(key: string, value: bigint): void {
    this.kv(key, '0x' + value.toString(16));
  }

  /** Ghi buffer dưới dạng hex. */
  buf(key: string, value: Buffer): void {
    this.kv(key, `${value.length} bytes → ${value.toString('hex')}`);
  }
}
