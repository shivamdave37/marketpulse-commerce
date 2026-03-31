import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFile(filePath) {
  const sql = await fs.readFile(filePath, 'utf8');
  await pool.query(sql);
}

async function main() {
  const migrationPath = path.resolve(__dirname, '../../../database/migrations/001_init.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seeds/001_seed.sql');

  try {
    await runFile(migrationPath);
    await runFile(seedPath);
    console.log('Database migration and seed completed.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to run SQL files:', error.message);
  process.exit(1);
});
