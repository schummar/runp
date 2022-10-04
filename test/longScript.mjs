#!/usr/bin/env node

import { setTimeout } from 'node:timers/promises';

for (let i = 0; i < 10; i++) {
  console.log(`some output (${i})`);
}

await setTimeout(5000);
process.exit(1);
