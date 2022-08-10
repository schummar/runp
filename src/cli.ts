import { cli } from 'cleye';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { runp } from '.';

const pkgJson = readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8');
const pkg = JSON.parse(pkgJson);

const argv = cli({
  name: 'runp',

  parameters: [
    '<commands...>', // First name is required
  ],

  flags: {
    outputLength: {
      alias: 'n',
      type: Number,
      description: 'Maximum number of lines for each command output',
      default: 10,
    },
    keepOutput: {
      alias: 'k',
      type: Boolean,
      description: 'Keep output of successful commands visible',
      default: false,
    },
  },

  version: pkg.version,
});

runp({
  commands: argv._.commands,
  ...argv.flags,
}).catch((e) => {
  console.error(e);
});
