import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const LOG_DIR = path.join(PROJECT_ROOT, "logs");

function timestampTag(d: Date = new Date()): string {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, `ecdh-${timestampTag()}.txt`);
const fileStream = fs.createWriteStream(LOG_FILE, { flags: "a" });

fileStream.write(
  `# ECDH run log\n` +
    `# Started at : ${new Date().toISOString()}\n` +
    `# Log file   : ${LOG_FILE}\n` +
    `# ------------------------------------------------------------\n\n`,
);

process.on("exit", () => {
  try {
    fileStream.end();
  } catch {
    
  }
});

function stripForFile(line: string): string {
  
  return line.replace(/\x1b\[[0-9;]*m/g, "");
}

function writeBoth(consoleLine: string, fileLine?: string): void {
  console.log(consoleLine);
  fileStream.write(stripForFile(fileLine ?? consoleLine) + "\n");
}

function writeBothErr(consoleLine: string, fileLine?: string): void {
  console.error(consoleLine);
  fileStream.write(stripForFile(fileLine ?? consoleLine) + "\n");
}

function padHex(n: bigint, byteLength: number): string {
  return n.toString(16).padStart(byteLength * 2, "0");
}

export const logger = {
  
  logFile: LOG_FILE,

  step(n: number | string, msg: string): void {
    writeBoth(`\n[Bước ${n}] ${msg}`);
  },

  info(msg: string): void {
    writeBoth(`   • ${msg}`);
  },

  detail(msg: string): void {
    writeBoth(`       ↳ ${msg}`);
  },

  success(msg: string): void {
    writeBoth(`   ✓ ${msg}`);
  },

  warn(msg: string): void {
    writeBoth(`   ! ${msg}`);
  },

  error(msg: string): void {
    writeBothErr(`   ✗ ${msg}`);
  },

  section(title: string): void {
    const bar = "═".repeat(70);
    writeBoth(`\n${bar}\n${title}\n${bar}`);
  },

  subsection(title: string): void {
    const bar = "─".repeat(70);
    writeBoth(`\n${bar}\n${title}\n${bar}`);
  },

  divider(ch: string = "─", width = 70): void {
    writeBoth(ch.repeat(width));
  },

  raw(text: string): void {
    writeBoth(text);
  },

  kv(label: string, value: string | number | bigint): void {
    writeBoth(`       ${label.padEnd(22)} = ${value}`);
  },

  hex(label: string, buf: Buffer): void {
    writeBoth(
      `       ${label.padEnd(22)} = ${buf.toString("hex")}  (${buf.length} B)`,
    );
  },

  bigHex(label: string, n: bigint, byteLength: number): void {
    writeBoth(`       ${label.padEnd(22)} = 0x${padHex(n, byteLength)}`);
  },

  block(title: string, text: string): void {
    writeBoth(`       ── ${title} ──`);
    for (const line of text.split("\n")) {
      writeBoth(`         ${line}`);
    }
  },
};
