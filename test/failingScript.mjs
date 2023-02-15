#!/usr/bin/env node
import console from 'node:console';
import process from 'node:process';
import { setTimeout } from 'node:timers/promises';

console.log('line1');
console.log('line2');
console.log('line3');

await setTimeout(1000);
process.exit(1);
