#!/usr/bin/env node

import console from 'node:console';
import process from 'node:process';
import { setTimeout } from 'node:timers/promises';

for (let i = 0; i < 10; i++) {
  console.log(`some output (${i})`);
}

await setTimeout(1000);
process.exit(1);
