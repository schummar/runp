import { spawn } from 'child_process';
import { RunpCommand } from '.';
import { abbrev, renderOutput } from './util';

export function job({ name, cmd, args = [], maxLines, keepOutput }: RunpCommand) {
  const fullCmd = [cmd, ...args].join(' ');

  const start = performance.now();
  const output = [''];
  let onOutput: ((out: string) => void) | undefined;

  const subProcess = spawn(cmd, args, {
    stdio: 'pipe',
    env: {
      ...process.env,
      FORCE_COLOR: process.stdout.isTTY ? '1' : undefined, // Some libs color output when this env var is set
    },
  });

  const append = (data: any) => {
    const [first, ...rest] = data.toString().split('\n');
    output[output.length - 1] += first;
    output.push(...rest);
    updateOutput();
  };

  const updateOutput = () => {
    onOutput?.(renderOutput(fullCmd, output, maxLines));
  };

  subProcess.stdout.on('data', append);
  subProcess.stderr.on('data', append);

  const done = new Promise<void>((resolve, reject) => {
    subProcess.on('close', (code) => {
      if (!code) resolve();
      else reject(renderOutput(fullCmd, output));
    });
    subProcess.on('error', (e) => {
      reject(renderOutput(fullCmd, [String(e)]));
    });
  });

  process.stdout.on('resize', updateOutput);
  done
    .finally(() => {
      process.stdout.off('resize', updateOutput);
    })
    .catch(() => undefined);

  return {
    name: name ?? abbrev(fullCmd),
    done,
    onOutput: (cb: (out: string) => void) => (onOutput = cb),
    time: () => performance.now() - start,
    keepOutput,
  };
}
