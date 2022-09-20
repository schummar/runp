import * as pty from 'node-pty';
import assert from 'node:assert';
import { test } from 'node:test';
import { Terminal } from 'xterm-headless';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

test('cli', async () => {
  const cols = 25,
    rows = 18;

  const terminal = new Terminal({
    cols,
    rows,
    allowProposedApi: true,
  });

  const p = pty.spawn(
    'tsx',
    [
      //
      'src/cli.ts',
      '-k',
      'echo short',
      'echo something very very very long',
      'sh -c "echo last && sleep 1"',
      'sh -c "echo some error && false"',
    ],
    {
      name: 'foo',
      cols,
      rows,
      cwd: process.cwd(),
      env: {
        ...process.env,
        RUNP: '',
        RUNP_TTY: '',
      },
    },
  );

  terminal.onData((data) => {
    p.write(data);
  });

  p.onData((data) => {
    terminal.write(data);
  });

  const getBuffer = () => {
    const buffer = terminal.buffer.active;
    const offset = buffer.baseY;

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

  await sleep(500);

  assert.deepStrictEqual(getBuffer(), [
    '✔ echo short [#.###s]    ',
    '                         ',
    '  short                  ',
    '                         ',
    '✔ echo someth... [#.###s]',
    '                         ',
    '  something very very    ',
    '  very long              ',
    '                         ',
    '⠋ sh -c echo last && s...',
    '                         ',
    '  last                   ',
    '                         ',
    '✖ sh -c echo ... [#.###s]',
    '                         ',
    '  some error             ',
    '                         ',
    '                         ',
  ]);

  const result = await new Promise<{ exitCode: number }>((resolve) => {
    p.onExit(resolve);
  });

  assert.deepStrictEqual(getBuffer(), [
    '✔ echo short [#.###s]    ',
    '                         ',
    '  short                  ',
    '                         ',
    '✔ echo someth... [#.###s]',
    '                         ',
    '  something very very    ',
    '  very long              ',
    '                         ',
    '✔ sh -c echo ... [#.###s]',
    '                         ',
    '  last                   ',
    '                         ',
    '✖ sh -c echo ... [#.###s]',
    '                         ',
    '  some error             ',
    '                         ',
    '                         ',
  ]);

  assert.deepEqual(result, { exitCode: 1, signal: 0 });
});
