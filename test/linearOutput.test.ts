import { setTimeout } from 'node:timers/promises';
import { describe, expect, test } from 'vitest';
import { runp } from '../src';
import { TestTerminal } from './_helpers';

describe('linear outout', () => {
  test('updating output', async () => {
    const term = new TestTerminal({ cols: 25, rows: 15 });

    await runp({
      commands: [
        {
          name: 'command',
          async cmd({ updateOutput }) {
            updateOutput('line 1');
            updateOutput('line 2');
            await setTimeout(1000);
            updateOutput('line 3');
          },
        },
      ],
      target: term,
      linearOutput: true,
    });

    expect(term.getBuffer()).toMatchInlineSnapshot(`
      [
        "-- [command] ->          ",
        "                         ",
        "line 1                   ",
        "line 2                   ",
        "line 3                   ",
        "                         ",
        "<- [command] --          ",
        "                         ",
        "✓ command [#.###s]       ",
        "                         ",
        "                         ",
        "                         ",
        "                         ",
        "                         ",
        "                         ",
      ]
    `);
  });

  test('error output', async () => {
    const term = new TestTerminal({ cols: 25, rows: 15 });

    await runp({
      commands: [
        {
          name: 'command',
          async cmd({ updateOutput }) {
            updateOutput('line 1');
            // updateStatus('error')
            throw Error('error line');
          },
        },
      ],
      target: term,
      linearOutput: true,
    });

    expect(term.getBuffer()).toMatchInlineSnapshot(`
      [
        "-- [command] ->          ",
        "                         ",
        "line 1                   ",
        "Error: error line        ",
        "                         ",
        "<- [command] --          ",
        "                         ",
        "✕ command [#.###s]       ",
        "                         ",
        "                         ",
        "                         ",
        "                         ",
        "                         ",
        "                         ",
        "                         ",
      ]
    `);
  });
});
