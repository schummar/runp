import type { RenderOptions } from '@schummar/react-terminal';
import { setTimeout } from 'node:timers/promises';
import { Terminal } from '@xterm/headless';

export type Target = RenderOptions['target'] extends infer T | undefined ? T : never;

export class TestTerminal implements Target {
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

export const poll = async (assertion: () => void, max = 9_000) => {
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
