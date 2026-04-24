import { spawn } from 'child_process';
import * as readline from 'readline';
import * as path from 'path';

interface ProjectInfo {
  id: number;
  name: string;
  dir: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const projects: ProjectInfo[] = [
  { id: 1, name: 'Mã Hóa Đối Xứng AES', dir: 'Code_Advanced_EncryPtion_Standard' },
  { id: 2, name: 'Hệ Nén Băm SHA (SHA-256, SHA-512...)', dir: 'SHA' },
  { id: 3, name: 'Toán học Đường cong Elliptic (ECC Cốt Lõi)', dir: 'Elliptic_Curve_Cryptography' },
  { id: 4, name: 'Trao đổi Khóa Không Đồng Bộ (ECDH)', dir: 'Elliptic_Curve_Diffie–Hellman' },
  { id: 5, name: 'Chữ Ký Số Siêu Âm Schnorr (Digital Signature)', dir: 'Digital_Signature' }
];

console.log('\n============================================================');
console.log('  HE SINH THAI THUAT TOAN MAT MA & BAO MAT THONG TIN ');
console.log('============================================================\n');

projects.forEach(p => {
  console.log(`  [${p.id}] ${p.name}`);
});
console.log('\n  [0] Thoát hệ thống\n');

rl.question('> Vui lòng nhập số tương ứng để chọn thuật toán chạy (0-5): ', (answer: string) => {
  const choice = parseInt(answer.trim(), 10);
  
  if (choice === 0) {
    console.log('Đã thoát phiên điều khiển.');
    process.exit(0);
  }

  const selectedProject = projects.find(p => p.id === choice);

  if (!selectedProject) {
    console.log('[!] Lựa chọn không hợp lệ! Vui lòng chạy lại tiến trình.');
    process.exit(1);
  }

  const targetDir = path.join(__dirname, selectedProject.dir);
  console.log(`\n[+] ĐANG KHỞI CHẠY LIÊN KẾT: [${selectedProject.name}] ...\n`);
  console.log(`- Thư mục đích: ${targetDir}\n- Tiến trình: npm run dev\n`);
  console.log('------------------------------------------------------------\n');

  // Khởi chạy tiến trình con trong thư mục của project đó
  const child = spawn('npm', ['run', 'dev'], {
    cwd: targetDir,
    stdio: 'inherit',
    shell: true // Sử dụng shell để tương thích môi trường npm path
  });

  child.on('close', (code: number | null) => {
    console.log('\n------------------------------------------------------------');
    console.log(`[INFO] Tiến trình hoàn tất với mã thoát (Exit code): ${code}`);
    process.exit(code ?? 0);
  });

  rl.close();
});
