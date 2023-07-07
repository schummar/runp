import { spawn } from 'child_process';
import { Queue } from 'schummar-queue';
import { Store } from 'schummar-state/react';
import { RunpCommand, RUNP_TASK_DELEGATE, RUNP_TASK_V } from '.';

export interface Task {
  command: RunpCommand;
  state: Store<TaskState>;
  result: Promise<string>;
}

export interface TaskState {
  status: 'pending' | 'inProgress' | 'done' | 'error' | 'dependencyError';
  statusString?: string;
  title: string;
  rawOutput: string;
  output: string;
  time?: number;
  subTasks?: Task[];
}

export function task(command: RunpCommand, allTasks: () => Task[], q = new Queue()): Task {
  const { name, cmd, args = [], env = process.env, cwd, dependsOn } = command;
  const fullCmd = [cmd, ...args].join(' ');
  const state = new Store<TaskState>({
    status: 'pending',
    title: (name ?? fullCmd) + (cwd && cwd !== process.cwd() ? ` (${cwd})` : ''),
    rawOutput: '',
    output: '',
  });

  const result = new Promise<string>((resolve, reject) => {
    const cancel = state.subscribe(
      (x) => x.status,
      (status) => {
        if (status === 'done') {
          resolve(state.getState().output);
          setTimeout(() => cancel());
        } else if (status === 'error' || status === 'dependencyError') {
          reject(state.getState().output);
          setTimeout(() => cancel());
        }
      },
    );
  });
  result.catch(() => undefined);

  q.schedule(async () => {
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
      state.update((state) => {
        state.status = 'dependencyError';
      });

      return;
    }

    const start = performance.now();
    state.update((state) => {
      state.status = 'inProgress';
    });

    if (cmd instanceof Function) {
      try {
        await cmd({
          updateStatus(status) {
            state.update((state) => {
              state.statusString = status;
            });
          },
          updateTitle(title) {
            state.update((state) => {
              state.title = title;
            });
          },
          updateOutput(output) {
            state.update((state) => {
              state.rawOutput += output;
              state.output = output;
            });
          },
        });

        state.update((state) => {
          state.status = 'done';
        });
      } catch (error) {
        state.update((state) => {
          state.status = 'error';
          state.output = String(error);
        });
      } finally {
        state.update((state) => {
          state.time = performance.now() - start;
        });
      }

      return;
    }

    const isTTY = process.stdout.isTTY || process.env.RUNP_TTY;

    const subProcess = spawn(cmd, args, {
      shell: process.platform === 'win32',
      stdio: 'pipe',
      cwd,
      env: {
        ...env,
        FORCE_COLOR: isTTY ? '1' : undefined, // Some libs color output when this env var is set
        RUNP: RUNP_TASK_V, // Tell child processes, especially runp itself, that they are running in runp
        RUNP_TTY: isTTY ? '1' : undefined, // Runp child processes can print as if they were running in a tty
      },
    });

    const append = (data: any) => {
      state.update((state) => {
        state.rawOutput += data.toString();
        state.output = state.rawOutput.includes(RUNP_TASK_DELEGATE) ? '' : state.rawOutput;
      });
    };
    subProcess.stdout.on('data', append);
    subProcess.stderr.on('data', append);

    subProcess.on('close', async (code) => {
      const { rawOutput } = state.getState();

      const delegationStart = rawOutput.indexOf(RUNP_TASK_DELEGATE);
      const delegationEnd = rawOutput.indexOf(RUNP_TASK_DELEGATE, delegationStart + 1);
      if (delegationStart >= 0 && delegationEnd > delegationStart) {
        const json = rawOutput.slice(delegationStart + RUNP_TASK_DELEGATE.length, delegationEnd);
        const commands = JSON.parse(json) as RunpCommand[];
        const tasks: Task[] = commands.map((command) => task(command, () => tasks));

        state.update((state) => {
          state.output = '';
          state.subTasks = tasks;
        });
      }

      const { subTasks } = state.getState();
      let hasErrors = !!code;

      if (subTasks) {
        const errors = await Promise.all(subTasks.map((task) => task.result.then(() => undefined).catch(() => true)));
        hasErrors = errors.some(Boolean);
      }

      state.update((state) => {
        state.status = hasErrors ? 'error' : 'done';
        state.time = performance.now() - start;
      });
    });

    subProcess.on('error', (error) =>
      state.update((state) => {
        state.output = String(error);
      }),
    );

    await result.catch(() => undefined);
  });

  return {
    command,
    state,
    result,
  };
}
