#!/usr/bin/env node
import { cli } from 'cleye';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { resolveCommands, runp } from '.';

const pkgFile = resolve(__dirname, '..', 'package.json');
const pkgJson = readFileSync(pkgFile, 'utf8');
const pkg = JSON.parse(pkgJson);

const argv = cli({
  name: 'runp',

  parameters: ['<commands...>'],

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
    print: {
      type: Boolean,
      description: `Print the commands that would be run`,
      default: false,
    },
    parallelTasks: {
      alias: 'p',
      type: Number,
      description: `Maximum number of parallel tasks`,
    },
    displayTimeOver: {
      alias: 't',
      type: Number,
      description: `Display time in status line if the task took more than the given ms`,
    },
    linearOutput: {
      alias: 'i',
      type: Boolean,
      description: '',
    },
    dynamicOutput: {
      alias: 'd',
      type: Boolean,
      description: '',
    },
  },

  version: pkg.version,
});

(async () => {
  const { linearOutput, dynamicOutput, ...restFlags } = argv.flags;
  const flags = {
    ...restFlags,
    linearOutput: linearOutput || !dynamicOutput,
  };

  if (flags.print) {
    const tasks = await resolveCommands({
      commands: argv._.commands,
      ...flags,
    });

    console.log(tasks);
    process.exit();
  }

  const results = await runp({
    commands: argv._.commands,
    ...flags,
  });

  const hasErrors = results.some(({ result }) => result === 'error');
  setTimeout(() => {
    process.exit(hasErrors ? 1 : 0);
  });
})();
