import * as readline from 'readline';
import { AESKeySize } from './types';
import { isValidAESKeySize } from './constants';
import { aesEncrypt, aesDecrypt } from './aes';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function pickKeySize(): Promise<AESKeySize> {
  console.log('\nChọn độ dài key (bits):');
  console.log('  1) AES-128 (10 rounds)');
  console.log('  2) AES-192 (12 rounds)');
  console.log('  3) AES-256 (14 rounds)\n');

  while (true) {
    const choice = (await ask('Nhập lựa chọn (1/2/3): ')).trim();
    const map: Record<string, AESKeySize> = { '1': 128, '2': 192, '3': 256 };
    const ks = map[choice];
    if (isValidAESKeySize(ks)) return ks;
    console.log('Lựa chọn không hợp lệ. Vui lòng nhập 1, 2, hoặc 3.');
  }
}

async function runEncrypt(): Promise<void> {
  const keySize = await pickKeySize();
  console.log(`\n✓ Đã chọn AES-${keySize}\n`);

  const plaintext = await ask('Nhập chuỗi cần mã hoá: ');
  if (!plaintext.trim()) {
    console.log('Chuỗi không được để trống!');
    return;
  }

  console.log(`\nĐang mã hoá "${plaintext}" bằng AES-${keySize}...`);
  const result = aesEncrypt(plaintext, keySize);

  console.log('\n===== KẾT QUẢ ENCRYPT =====');
  console.log(`  Key Size:          AES-${result.keySize}`);
  console.log(`  Số rounds:         ${result.rounds}`);
  console.log(`  Plaintext:         "${result.plaintext}"`);
  console.log(`  Key (hex):         ${result.keyHex}`);
  console.log(`  IV (hex):          ${result.iv}`);
  console.log(`  Ciphertext (hex):  ${result.ciphertextHex}`);
  console.log(`  Ciphertext (b64):  ${result.ciphertextBase64}`);
  console.log('\nChi tiết từng bước đã được lưu trong thư mục logs/');
  console.log(
    `\n💡 Để giải mã lại, chạy lại chương trình và chọn [2] Decrypt với các thông số trên.`
  );
}

async function runDecrypt(): Promise<void> {
  const keySize = await pickKeySize();
  console.log(`\n✓ Đã chọn AES-${keySize}\n`);

  const ciphertextHex = (await ask('Nhập Ciphertext (hex): ')).trim();
  const keyHex = (await ask('Nhập Key (hex): ')).trim();
  const ivHex = (await ask('Nhập IV (hex): ')).trim();

  console.log(`\nĐang giải mã bằng AES-${keySize}...`);
  try {
    const result = aesDecrypt(ciphertextHex, keyHex, ivHex, keySize);

    console.log('\n===== KẾT QUẢ DECRYPT =====');
    console.log(`  Key Size:          AES-${result.keySize}`);
    console.log(`  Số rounds:         ${result.rounds}`);
    console.log(`  Ciphertext (hex):  ${result.ciphertextHex}`);
    console.log(`  Key (hex):         ${result.keyHex}`);
    console.log(`  IV (hex):          ${result.iv}`);
    console.log(`  Plaintext:         "${result.plaintext}"`);
    console.log(`  Plaintext (hex):   ${result.plaintextHex}`);
    console.log('\nChi tiết từng bước đã được lưu trong thư mục logs/');
  } catch (err) {
    console.error('\n❌ Giải mã thất bại:', (err as Error).message);
  }
}

async function runRoundtrip(): Promise<void> {
  const keySize = await pickKeySize();
  console.log(`\n✓ Đã chọn AES-${keySize}\n`);

  const plaintext = await ask('Nhập chuỗi cần test roundtrip: ');
  if (!plaintext.trim()) {
    console.log('Chuỗi không được để trống!');
    return;
  }

  console.log('\n[1/2] ENCRYPT...');
  const enc = aesEncrypt(plaintext, keySize, { writeLogFiles: false });
  console.log(`     Ciphertext (hex): ${enc.ciphertextHex}`);

  console.log('\n[2/2] DECRYPT...');
  const dec = aesDecrypt(
    enc.ciphertextHex,
    enc.keyHex,
    enc.iv,
    keySize,
    { writeLogFiles: false }
  );
  console.log(`     Decrypted:        "${dec.plaintext}"`);

  const ok = dec.plaintext === plaintext;
  console.log(`\n${ok ? '✅' : '❌'} Roundtrip ${ok ? 'THÀNH CÔNG' : 'THẤT BẠI'}`);
  console.log(`    Original: "${plaintext}"`);
  console.log(`    Decrypted: "${dec.plaintext}"`);
}

async function main(): Promise<void> {
  console.log('============================================================');
  console.log('  AES-CBC (FIPS 197) — Pure TypeScript Implementation ');
  console.log('============================================================');
  console.log('  [1] Encrypt  (Mã hoá)');
  console.log('  [2] Decrypt  (Giải mã)');
  console.log('  [3] Roundtrip test  (Encrypt → Decrypt)');
  console.log('  [0] Thoát');

  const choice = (await ask('\n> Chọn chức năng (0-3): ')).trim();

  switch (choice) {
    case '1':
      await runEncrypt();
      break;
    case '2':
      await runDecrypt();
      break;
    case '3':
      await runRoundtrip();
      break;
    case '0':
      console.log('Đã thoát.');
      break;
    default:
      console.log('Lựa chọn không hợp lệ.');
  }

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
