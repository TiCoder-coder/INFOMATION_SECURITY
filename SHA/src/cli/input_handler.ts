// Nhập dữ liệu từ người dùng

import * as readline from 'readline';

const WIDTH = 52;
const TOP = '╔' + '═'.repeat(WIDTH) + '╗';
const BOT = '╚' + '═'.repeat(WIDTH) + '╝';

function center(text: string): string {
  const pad = Math.max(0, WIDTH - text.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

export class InputHandler {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async selectNumber(min: number, max: number, question: string): Promise<number> {
    while (true) {
      const input = await this.prompt(question);
      const num = parseInt(input, 10);

      if (isNaN(num) || num < min || num > max) {
        console.log(`Vui lòng nhập số từ ${min} đến ${max}`);
        continue;
      }

      return num;
    }
  }

  async getInputString(): Promise<string> {
    console.log('\n' + TOP);
    console.log('║' + center('Nhập dữ liệu cần mã hóa') + '║');
    console.log(BOT);

    const input = await this.prompt('Nhập chuỗi: ');

    if (!input) {
      console.log('Chuỗi không được để trống!');
      return this.getInputString();
    }

    return input;
  }

  close(): void {
    this.rl.close();
  }
}
