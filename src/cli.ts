import { cli } from 'cleye';
import { runp } from '.';

const argv = cli({
  name: 'runp',

  parameters: [
    '<commands...>', // First name is required
  ],

  flags: {
    maxLines: {
      type: Number,
      description: 'Maximum number of lines for each command output',
      default: 10,
    },
    npm: {
      type: Boolean,
      description: 'Treat commands as npm scripts',
      default: false,
    },
    keepOutput: {
      type: Boolean,
      description: 'Keep output of successful commands visible',
      default: false,
    },
  },
});

runp({
  commands: argv._.commands,
  ...argv.flags,
});
