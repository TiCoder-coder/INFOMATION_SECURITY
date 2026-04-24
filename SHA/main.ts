/**
 * Main Entry Point
 * SHA-XXX Encoder
 */

import { UserInterface } from './src/cli/user_interface';

async function main() {
  const ui = new UserInterface();
  await ui.run();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
