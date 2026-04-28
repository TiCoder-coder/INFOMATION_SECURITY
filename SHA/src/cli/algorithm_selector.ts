export interface AlgorithmOption {
  id: string;
  name: string;
  variants?: AlgorithmVariant[];
}

export interface AlgorithmVariant {
  id: string;
  name: string;
  outputSize: number;
}

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

export class AlgorithmSelector {
  static MAIN_ALGORITHMS: AlgorithmOption[] = [
    {
      id: 'sha1',
      name: 'SHA-1 (160-bit)',
      variants: [
        { id: 'sha1', name: 'SHA-1', outputSize: 160 },
      ],
    },
    {
      id: 'sha2',
      name: 'SHA-2 Family',
      variants: [
        { id: 'sha224', name: 'SHA-224 (224-bit)', outputSize: 224 },
        { id: 'sha256', name: 'SHA-256 (256-bit)', outputSize: 256 },
        { id: 'sha384', name: 'SHA-384 (384-bit)', outputSize: 384 },
        { id: 'sha512', name: 'SHA-512 (512-bit)', outputSize: 512 },
      ],
    },
    {
      id: 'sha3',
      name: 'SHA-3 Family',
      variants: [
        { id: 'sha3_256', name: 'SHA3-256 (256-bit)', outputSize: 256 },
        { id: 'sha3_384', name: 'SHA3-384 (384-bit)', outputSize: 384 },
        { id: 'sha3_512', name: 'SHA3-512 (512-bit)', outputSize: 512 },
      ],
    },
  ];

  static displayMainMenu(): void {
    console.log('\n' + TOP);
    console.log('║' + center('SHA-XXX ENCODER - Main Menu') + '║');
    console.log(MID);
    this.MAIN_ALGORITHMS.forEach((algo, index) => {
      console.log(line(`  ${index + 1}. ${algo.name}`));
    });
    console.log(BOT);
  }

  static displayVariants(algorithmId: string): AlgorithmVariant[] | null {
    const algo = this.MAIN_ALGORITHMS.find((a) => a.id === algorithmId);
    if (!algo || !algo.variants) return null;

    console.log('\n' + TOP);
    console.log('║' + center(`${algo.name} - Select Variant`) + '║');
    console.log(MID);
    algo.variants.forEach((variant, index) => {
      console.log(line(`  ${index + 1}. ${variant.name}`));
    });
    console.log(BOT);

    return algo.variants;
  }

  static getAlgorithmName(algorithmId: string): string {
    const algo = this.MAIN_ALGORITHMS.find((a) => a.id === algorithmId);
    return algo ? algo.name : 'Unknown';
  }
}
