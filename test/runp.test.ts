import { RenderOptions } from '@schummar/react-terminal';
import { setTimeout } from 'timers/promises';
import { describe, expect, test } from 'vitest';
import { Terminal } from 'xterm-headless';
import { runp } from '../src';
import pty from 'node-pty';

type Target = RenderOptions['target'] extends infer T | undefined ? T : never;

class TestTerminal implements Target {
  term: Terminal;
  write: Target['write'];
  columns: number;
  rows: number;

  constructor(private options: { cols: number; rows: number }) {
    this.term = new Terminal({
      cols: this.options.cols,
      rows: this.options.rows,
      allowProposedApi: true,
    });

    this.write = this.term.write.bind(this.term) as Target['write'];
    this.columns = this.options.cols;
    this.rows = this.options.rows;
  }

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

const poll = async (assertion: () => void, max = 9_000) => {
  const start = performance.now();

  for (;;) {
    try {
      assertion();
      return;
    } catch (e) {
      if (performance.now() - start > max) {
        throw e;
      }
      await setTimeout(10);
    }
  }
};

describe.concurrent('runp', () => {
  test('node api', async () => {
    const term = new TestTerminal({ cols: 25, rows: 24 });
    term.write('first line\n');

    const finished = runp({
      keepOutput: true,
      outputLength: 2,
      commands: ['echo short', 'echo something very very very long', './test/succeedingScript.mjs', './test/failingScript.mjs'],
      target: term,
    });

    await poll(() =>
      expect(term.getBuffer()).toStrictEqual([
        'first line               ',
        '                         ',
        '✓ echo short [#.###s]    ',
        '                         ',
        '  short                  ',
        '                         ',
        '✓ echo someth... [#.###s]',
        '                         ',
        '  something very very    ',
        '  very long              ',
        '                         ',
        '⠋ ./test/succeedingScr...',
        '                         ',
        '  line2                  ',
        '  line3                  ',
        '                         ',
        '⠋ ./test/failingScript...',
        '                         ',
        '  line2                  ',
        '  line3                  ',
        '                         ',
        '                         ',
        '                         ',
        '                         ',
      ]),
    );
    term.write('additional line\n');

    const result = await finished;
    await setTimeout();

    expect(term.getBuffer()).toEqual([
      'first line               ',
      'additional line          ',
      '                         ',
      '✓ echo short [#.###s]    ',
      '                         ',
      '  short                  ',
      '                         ',
      '✓ echo someth... [#.###s]',
      '                         ',
      '  something very very    ',
      '  very long              ',
      '                         ',
      '✓ ./test/succ... [#.###s]',
      '                         ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      '✕ ./test/fail... [#.###s]',
      '                         ',
      '  line1                  ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      '                         ',
    ]);

    expect(result.some((r) => r.result === 'error')).toBe(true);
  }, 10_000);

  test('long script', async () => {
    const term = new TestTerminal({ cols: 25, rows: 5 });
    term.write('first line\n');

    const finished = runp({
      keepOutput: true,
      outputLength: 2,
      commands: ['./test/longScript.mjs'],
      target: term,
    });

    await poll(() =>
      expect(term.getBuffer()).toStrictEqual([
        '  some output (7)        ',
        '  some output (8)        ',
        '  some output (9)        ',
        '                         ',
        '                         ',
      ]),
    );

    const result = await finished;
    await setTimeout();

    expect(term.getBuffer(true)).toEqual([
      '                         ',
      '✕ ./test/long... [#.###s]',
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

    expect(result.some((r) => r.result === 'error')).toBe(true);
  }, 10_000);

  test('forever mode', async () => {
    const term = new TestTerminal({ cols: 25, rows: 10 });

    runp({
      forever: true,
      commands: [
        { name: 'task1', cmd: 'node', args: ['-e', 'console.log("task1 output"); setTimeout(()=>{},10000)'] },
        { name: 'task2', cmd: 'node', args: ['-e', 'console.log("task2 output"); setTimeout(()=>{},10000)'] },
      ],
      target: term,
    });

    await poll(() =>
      expect(term.getBuffer()).toStrictEqual([
        '                         ',
        '⯈ task1 ──────────────── ',
        '                         ',
        '  task1 output           ',
        '                         ',
        '⯈ task2 ──────────────── ',
        '                         ',
        '  task2 output           ',
        '                         ',
        '                         ',
      ]),
    );
  }, 10_000);

  test('cli', async () => {
    const term = new TestTerminal({ cols: 25, rows: 24 });
    term.write('first line\n');

    const p = pty.spawn(
      'tsx',
      [
        //
        'src/cli.ts',
        '-d',
        '-k',
        '-n=2',
        'echo short',
        'echo something very very very long',
        './test/succeedingScript.mjs',
        './test/failingScript.mjs',
      ],
      {
        name: 'foo',
        cols: 25,
        rows: 24,
        cwd: process.cwd(),
        env: {
          ...process.env,
          RUNP: '',
          RUNP_TTY: '',
        },
      },
    );

    term.term.onData((data) => {
      p.write(data);
    });

    p.onData((data) => {
      term.write(data);
    });

    const result = await new Promise<{ exitCode: number }>((resolve) => {
      p.onExit(resolve);
    });

    expect(result).toEqual({
      exitCode: 1,
      signal: 0,
    });

    await poll(() => term.getBuffer().length === 24);

    expect(term.getBuffer()).toStrictEqual([
      'first line               ',
      '                         ',
      '✓ echo short [#.###s]    ',
      '                         ',
      '  short                  ',
      '                         ',
      '✓ echo someth... [#.###s]',
      '                         ',
      '  something very very    ',
      '  very long              ',
      '                         ',
      '✓ ./test/succ... [#.###s]',
      '                         ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      '✕ ./test/fail... [#.###s]',
      '                         ',
      '  line1                  ',
      '  line2                  ',
      '  line3                  ',
      '                         ',
      '                         ',
      '                         ',
    ]);
  }, 10_000);

  describe.only('parallel execution', () => {
    test.only('api', async () => {
      const term = new TestTerminal({ cols: 25, rows: 100 });

      const finished = runp({
        commands: [{ cmd: 'task:*', cwd: 'test' }],
        target: term,
        linearOutput: true,
      });

      await finished;
      await setTimeout();

      const text = term.getBuffer().join('\n');
      const maxStartIndex = Math.max(...['start 1', 'start 2', 'start 3'].map((s) => text.indexOf(s)));
      const minDoneIndex = Math.min(...['done 1', 'done 2', 'done 3'].map((s) => text.indexOf(s)));

      expect(minDoneIndex).toBeGreaterThan(maxStartIndex);
    });
  });

  describe.only('sequential execution', () => {
    test('api', async () => {
      const term = new TestTerminal({ cols: 25, rows: 100 });

      const finished = runp({
        commands: [':s', { cmd: 'task:*', cwd: 'test' }],
        target: term,
        linearOutput: true,
      });

      await finished;
      await setTimeout();

      const text = term.getBuffer().join('\n');
      const events = ['start 1', 'done 1', 'start 2', 'done 2', 'start 3', 'done 3'];
      const eventOrder = [...events].sort((a, b) => text.indexOf(a) - text.indexOf(b));

      expect(eventOrder).toStrictEqual(events);
    });
  });
});
