import { cli } from 'cleye';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { runp } from '.';

const pkgFile = resolve(__dirname, '..', 'package.json');
const pkgJson = readFileSync(pkgFile, 'utf8');
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
    forever: {
      alias: 'f',
      type: Boolean,
      description: `Task will run forever. It won't display a spinner but a different symbol instead`,
      default: false,
    },
    flattenNpmScripts: {
      alias: 'm',
      type: Boolean,
      description: 'If npm scripts call nested npm scripts which also use runp, flatten them into one task list',
      default: true,
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
