import { setTimeout } from 'timers/promises';
import { Terminal } from 'xterm-headless';
import { runp } from '../src';
import { test, expect, describe } from 'vitest';
import { RenderOptions } from '@schummar/react-terminal';

type Target = RenderOptions['target'] extends infer T | undefined ? T : never;

class TestTerminal implements Target {
  // options = { cols: 25, rows: 22 };
  constructor(private options: { cols: number; rows: number }) {}

  term = new Terminal({
    cols: this.options.cols,
    rows: this.options.rows,
    allowProposedApi: true,
  });

  write = this.term.write.bind(this.term) as Target['write'];
  columns = this.options.cols;
  rows = this.options.rows;

  getBuffer = (all = false) => {
    const buffer = this.term.buffer.active;
    const offset = all ? 0 : buffer.baseY;

    return Array(buffer.length - offset)
      .fill(0)
      .map((x, i) =>
        buffer
          .getLine(offset + i)
          ?.translateToString()
          .replace(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/g, '⠋')
          .replace(/\[(.*)s\]/g, (x, y) => `[${''.padEnd(y.length - 4, '#')}.###s]`)
          .replace(/\xA0/g, ' '),
      );
  };
}

describe('runp', () => {
  test('cli', async () => {
    const term = new TestTerminal({ cols: 25, rows: 24 });
    term.write('first line\n');

    const finished = runp({
      keepOutput: true,
      outputLength: 2,
      commands: ['echo short', 'echo something very very very long', './test/succeedingScript.sh', './test/failingScript.sh'],
      target: term,
    });

    await setTimeout(2500);
    term.write('additional line\n');

    expect(term.getBuffer()).toEqual([
      'first line               ',
      '✔ echo short [#.###s]    ',
      '                         ',
      '  short                  ',
      '                         ',
      '✔ echo someth... [#.###s]',
      '                         ',
      '  something very very    ',
      '  very long              ',
      '                         ',
      '⠋ ./test/succeedingScr...',
      '                         ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      '⠋ ./test/failingScript.sh',
      '                         ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      '                         ',
      '                         ',
      '                         ',
      '                         ',
    ]);

    await finished;
    await setTimeout();

    expect(term.getBuffer()).toEqual([
      'first line               ',
      '✔ echo short [#.###s]    ',
      '                         ',
      '  short                  ',
      '                         ',
      '✔ echo someth... [#.###s]',
      '                         ',
      '  something very very    ',
      '  very long              ',
      '                         ',
      '✔ ./test/succ... [#.###s]',
      '                         ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      '✖ ./test/fail... [#.###s]',
      '                         ',
      '  line1                  ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      'additional line          ',
      '                         ',
      '                         ',
    ]);

    // expect(result).toEqual({ exitCode: 1, signal: 0 });
  });

  test('long script', async () => {
    const term = new TestTerminal({ cols: 25, rows: 5 });
    term.write('first line\n');

    const finished = runp({
      keepOutput: true,
      outputLength: 2,
      commands: ['./test/longScript.mjs'],
      target: term,
    });

    await setTimeout(2500);

    expect(term.getBuffer()).toEqual([
      '                         ',
      '  some output (8)        ',
      '  some output (9)        ',
      '                         ',
      '                         ',
    ]);

    await finished;
    await setTimeout();

    expect(term.getBuffer(true)).toEqual([
      '✖ ./test/long... [#.###s]',
      '                         ',
      '  some output (0)        ',
      '  some output (1)        ',
      '  some output (2)        ',
      '  some output (3)        ',
      '  some output (4)        ',
      '  some output (5)        ',
      '  some output (6)        ',
      '  some output (7)        ',
      '  some output (8)        ',
      '  some output (9)        ',
      '                         ',
      '                         ',
    ]);

    // assert.deepEqual(result, { exitCode: 1, signal: 0 });
  });
});
