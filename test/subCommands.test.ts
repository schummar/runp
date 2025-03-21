import { describe, test } from 'vitest';
import { runp } from '../src';
import { TestTerminal } from './_helpers';

describe('subCommands', () => {
  test('success', async ({ expect }) => {
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
        "-- [subCommand 1] ->          ",
        "                              ",
        "subCommand 1                  ",
        "                              ",
        "<- [subCommand 1] --          ",
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
        "                              ",
        "                              ",
      ]
    `);
  });

  test('parallel failure', async ({ expect }) => {
    const term = new TestTerminal({ cols: 30, rows: 15 });

    await runp({
      commands: [
        {
          name: 'command',
          subCommands: ['exit 1', 'echo ok'],
        },
      ],
      target: term,
      linearOutput: true,
    });

    expect(term.getBuffer()).toMatchInlineSnapshot(`
      [
        "-- [echo ok] ->               ",
        "                              ",
        "ok                            ",
        "                              ",
        "<- [echo ok] --               ",
        "                              ",
        "✕ command [#.###s]            ",
        "  ✕ exit 1 [#.###s]           ",
        "  ✓ echo ok [#.###s]          ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
      ]
    `);
  });

  test('sequential failure', async ({ expect }) => {
    const term = new TestTerminal({ cols: 30, rows: 10 });

    await runp({
      commands: [
        {
          name: 'command',
          subCommands: [':s', 'exit 1', 'echo ok'],
        },
      ],
      target: term,
      linearOutput: true,
    });

    expect(term.getBuffer()).toMatchInlineSnapshot(`
      [
        "                              ",
        "✕ command [#.###s]            ",
        "  ✕ exit 1 [#.###s]           ",
        "  ↳ echo ok                   ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
      ]
    `);
  });
});
