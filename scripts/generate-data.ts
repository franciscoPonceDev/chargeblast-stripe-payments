import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { generatePayments, MOCK_NOW } from '../lib/payments/generate';

const out = resolve(__dirname, '../data/payments.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(generatePayments(600, 42, MOCK_NOW), null, 1) + '\n');
console.log(`wrote ${out}`);
