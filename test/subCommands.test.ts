import { test } from 'vitest';
import { runp } from '../src';
import { TestTerminal } from './_helpers';

test('subCommands', async ({ expect }) => {
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
          'echo subCommand 2',
        ],
      },
    ],
    target: term,
    linearOutput: true,
  });

  expect(term.getBuffer()).toMatchInlineSnapshot(`
    [
      "                              ",
      "-- [subCommand 1] ->          ",
      "                              ",
      "subCommand 1                  ",
      "                              ",
      "<- [subCommand 1] --          ",
      "                              ",
      "-- [echo subCommand 2] ->     ",
      "                              ",
      "subCommand 2                  ",
      "                              ",
      "<- [echo subCommand 2] --     ",
      "                              ",
      "✓ command [#.###s]            ",
      "  ✓ subCommand 1 [#.###s]     ",
      "  ✓ echo subCommand 2 [#.###s]",
      "                              ",
      "                              ",
      "                              ",
      "                              ",
    ]
  `);
});
