const WIDTH = 52;
const TOP = '╔' + '═'.repeat(WIDTH) + '╗';
const MID = '╠' + '═'.repeat(WIDTH) + '╣';
const BOT = '╚' + '═'.repeat(WIDTH) + '╝';

function line(text: string = ''): string {
  return '║' + text.padEnd(WIDTH) + '║';
}

function center(text: string): string {
  const pad = Math.max(0, WIDTH - text.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.substring(0, max - 3) + '...' : text;
}

export class OutputDisplay {
  static displayResult(algorithm: string, input: string, hash: string, logPath: string): void {
    const labelWidth = 14; 
    const valueWidth = WIDTH - labelWidth;

    console.log('\n' + TOP);
    console.log('║' + center('RESULT') + '║');
    console.log(MID);
    console.log(line(`  Algorithm:  ${truncate(algorithm, valueWidth)}`));
    console.log(line(`  Input:      ${truncate(input, valueWidth)}`));

    
    const firstChunk = hash.substring(0, valueWidth);
    console.log(line(`  Hash:       ${firstChunk}`));
    for (let i = valueWidth; i < hash.length; i += valueWidth) {
      console.log(line(' '.repeat(labelWidth) + hash.substring(i, i + valueWidth)));
    }

    console.log(MID);
    const logName = logPath.split('/').pop() || '';
    console.log(line(`  Log File:   ${truncate(logName, valueWidth)}`));
    console.log(BOT + '\n');
  }

  static displayError(message: string): void {
    console.log('\n' + TOP);
    console.log('║' + center('ERROR') + '║');
    console.log(MID);
    console.log(line(`  ${truncate(message, WIDTH - 4)}`));
    console.log(BOT + '\n');
  }

  static displayWelcome(): void {
    console.log('\n' + TOP);
    console.log(line());
    console.log('║' + center('SHA-XXX ENCODER') + '║');
    console.log(line());
    console.log('║' + center('SHA-1, SHA-2 (224,256,384,512), SHA-3 (256...)') + '║');
    console.log('║' + center('With Detailed Logging') + '║');
    console.log(line());
    console.log(BOT + '\n');
  }
}
