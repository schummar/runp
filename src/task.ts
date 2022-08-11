import { spawn } from 'child_process';
import { Store } from 'schummar-state/react';
import { RunpCommand } from '.';
import { abbrev, renderOutput } from './util';

export interface Task {
  command: RunpCommand;
  name: string;
  state: Store<TaskState>;
  result: Promise<void>;
}

export interface TaskState {
  status: 'pending' | 'inProgress' | 'done' | 'error';
  output: string;
  shortOutput: string;
  time?: number;
}

export function task(command: RunpCommand, allTasks: () => Task[]): Task {
  const { name, cmd, args = [], cwd, outputLength, dependsOn } = command;
  const fullCmd = [cmd, ...args].join(' ');
  const state = new Store<TaskState>({
    status: 'pending',
    output: '',
    shortOutput: '',
  });

  const result = new Promise<void>((resolve, reject) => {
    const cancel = state.subscribe(
      (x) => x.status,
      (status) => {
        if (status === 'done') {
          resolve();
          setTimeout(() => cancel());
        } else if (status === 'error') {
          reject(state.getState().shortOutput);
          setTimeout(() => cancel());
        }
      },
    );
  });
  result.catch(() => undefined);

  (async () => {
    await Promise.resolve();

    const dependencies = allTasks().filter(
      (j) =>
        dependsOn !== undefined &&
        j.command.id !== undefined &&
        (Array.isArray(dependsOn) ? dependsOn.includes(j.command.id) : dependsOn === j.command.id),
    );

    try {
      await Promise.all(dependencies.map((j) => j.result));
    } catch {
      return;
    }

    const start = performance.now();
    state.update((state) => {
      state.status = 'inProgress';
    });

    const subProcess = spawn(cmd, args, {
      stdio: 'pipe',
      cwd,
      env: {
        ...process.env,
        FORCE_COLOR: process.stdout.isTTY ? '1' : undefined, // Some libs color output when this env var is set
      },
    });

    const append = (data: any) => {
      state.update((state) => {
        state.output += data.toString();
      });
      updateShortOutput();
    };
    subProcess.stdout.on('data', append);
    subProcess.stderr.on('data', append);

    const updateShortOutput = () =>
      state.update((state) => {
        state.shortOutput = renderOutput(fullCmd, state.output, outputLength);
      });
    process.stdout.on('resize', updateShortOutput);

    subProcess.on('close', (code) =>
      state.update((state) => {
        state.status = code ? 'error' : 'done';
        state.time = performance.now() - start;

        if (code) {
          state.shortOutput = renderOutput(fullCmd, state.output);
        }
      }),
    );

    subProcess.on('error', (e) =>
      state.update((state) => {
        state.output = String(e);
      }),
    );
  })();

  return {
    command,
    name: (name ?? abbrev(fullCmd)) + (cwd ? ` (${cwd})` : ''),
    state,
    result,
  };
}
