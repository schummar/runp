import { expect, test } from 'vitest';
import { runp } from '../src';
import { poll, TestTerminal } from './_helpers';
import { setTimeout } from 'timers/promises';

test('subCommands', async () => {
  const term = new TestTerminal({ cols: 30, rows: 20 });

  await runp({
    commands: [
      {
        name: 'command',
        subCommands: [
          {
            name: 'subCommand 1',
            cmd: 'echo',
            args: ['subCommand 1'],
          },
          {
            name: 'subCommand 2',
            cmd: 'echo',
            args: ['subCommand 2'],
          },
        ],
      },
    ],
    target: term,
    linearOutput: true,
  });

  await poll(
    () =>
      expect(term.getBuffer()).toMatchInlineSnapshot(`
    [
      "                              ",
      "-- [subCommand 1] ->          ",
      "                              ",
      "subCommand 1                  ",
      "                              ",
      "<- [subCommand 1] --          ",
      "                              ",
      "-- [subCommand 2] ->          ",
      "                              ",
      "subCommand 2                  ",
      "                              ",
      "<- [subCommand 2] --          ",
      "                              ",
      "✓ command [#.###s]            ",
      "  ✓ subCommand 1 [#.###s]     ",
      "  ✓ subCommand 2 [#.###s]     ",
      "                              ",
      "                              ",
      "                              ",
      "                              ",
    ]
  `),
    1000,
  );
});
