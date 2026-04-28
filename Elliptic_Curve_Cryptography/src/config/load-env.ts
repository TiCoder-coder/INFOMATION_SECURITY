import { readFileSync } from 'node:fs';
import { resolve }      from 'node:path';

let loaded = false;

export function loadEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = resolve(process.cwd(), '.env');
  let content: string;
  try {
    content = readFileSync(envPath, 'utf8');
  } catch {
    return; 
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;

    const key   = line.slice(0, eq).trim();
    let   value = line.slice(eq + 1).trim();

    
    if (
      (value.startsWith('"')  && value.endsWith('"'))  ||
      (value.startsWith("'")  && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
