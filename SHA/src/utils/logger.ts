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

  private writeLog(message: string): void {
    if (this.closed) return;
    const timestamp = new Date().toISOString();
    this.buffer.push(`[${timestamp}] ${message}\n`);
  }

  flush(): void {
    if (this.buffer.length === 0) return;
    fs.appendFileSync(this.logFile, this.buffer.join(''));
    this.buffer = [];
  }

  close(): void {
    this.flush();
    this.closed = true;
  }

  info(message: string, data?: any): void {
    this.writeLog(`[INFO] ${message}`);
    if (data) {
      this.writeLog(JSON.stringify(data, null, 2));
    }
    console.log(`✓ ${message}`);
  }

  debug(message: string, data?: any): void {
    this.writeLog(`[DEBUG] ${message}`);
    if (data) {
      this.writeLog(JSON.stringify(data, null, 2));
    }
  }

  error(message: string, error?: Error): void {
    this.writeLog(`[ERROR] ${message}`);
    if (error) {
      this.writeLog(error.message);
      this.writeLog(error.stack || '');
    }
    console.error(`✗ ${message}`);
  }

  section(title: string): void {
    const line = '='.repeat(50);
    this.writeLog(`\n${line}\n${title}\n${line}\n`);
    console.log(`\n${'='.repeat(50)}\n${title}\n${'='.repeat(50)}\n`);
  }

  step(stepNumber: number, description: string): void {
    const message = `Step ${stepNumber}: ${description}`;
    this.writeLog(`\n>>> ${message}`);
    console.log(`\n>>> ${message}`);
  }

  hex(label: string, value: string, truncate: boolean = false): void {
    let displayValue = value;
    if (truncate && value.length > 64) {
      displayValue = value.substring(0, 64) + '...';
    }
    this.writeLog(`${label}: ${displayValue}`);
  }

  binary(label: string, value: string, truncate: boolean = false): void {
    let displayValue = value;
    if (truncate && value.length > 128) {
      displayValue = value.substring(0, 128) + '...';
    }
    this.writeLog(`${label}: ${displayValue}`);
  }

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

  explain(text: string): void {
    const lines = text.replace(/^\n+|\n+$/g, '').split('\n');
    this.writeLog('');
    this.writeLog('    ┌─ Giải thích ────────────────────────────────────────');
    for (const l of lines) this.writeLog('    │ ' + l);
    this.writeLog('    └──────────────────────────────────────────────────────');
  }

  formula(label: string, expr: string): void {
    this.writeLog(`    [Công thức] ${label} = ${expr}`);
  }

  subStep(name: string, description: string): void {
    this.writeLog(`    → ${name}: ${description}`);
  }

  note(text: string): void {
    this.writeLog(`    • ${text}`);
  }

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

  round(roundNum: number, totalRounds: number, data: string): void {
    const r = roundNum.toString().padStart(totalRounds.toString().length, '0');
    this.writeLog(`    Round ${r}/${totalRounds - 1}: ${data}`);
  }

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

  getLogPath(): string {
    return this.logFile;
  }

  summary(algorithm: string, input: string, output: string): void {
    const fileName = this.logFile.split('/').pop() || '';
    
    const labelWidth = 'Algorithm: '.length; 
    const contentWidth = Math.max(
      'SUMMARY'.length,
      labelWidth + algorithm.length,
      labelWidth + input.length,
      labelWidth + output.length,
      labelWidth + fileName.length,
      40,
    );
    const bar = '═'.repeat(contentWidth + 2);
    const pad = (s: string) => ` ${s.padEnd(contentWidth)} `;
    const summaryMessage = `\n╔${bar}╗
║${pad('SUMMARY')}║
╠${bar}╣
║${pad(`Algorithm: ${algorithm}`)}║
║${pad(`Input:     ${input}`)}║
║${pad(`Output:    ${output}`)}║
║${pad(`Log File:  ${fileName}`)}║
╚${bar}╝`;

    this.writeLog(summaryMessage);
    console.log(summaryMessage);
  }
}
