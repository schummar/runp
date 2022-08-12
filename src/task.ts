import { spawn } from 'child_process';
import { Store } from 'schummar-state/react';
import { RunpCommand, RUNP_TASK_DELEGATE, RUNP_TASK_V } from '.';
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
  subTasks?: Task[];
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

    const isTTY = process.stdout.isTTY || process.env.RUNP_TTY;

    const subProcess = spawn(cmd, args, {
      stdio: 'pipe',
      cwd,
      env: {
        ...process.env,
        FORCE_COLOR: isTTY ? '1' : undefined, // Some libs color output when this env var is set
        RUNP_TTY: isTTY ? RUNP_TASK_V : undefined, // Some libs color output when this env var is set
      },
    });

    const append = (data: any) => {
      const asString = data.toString() as string;

      state.update((state) => {
        if (asString.startsWith(RUNP_TASK_DELEGATE)) {
          const commands = JSON.parse(asString.slice(RUNP_TASK_DELEGATE.length)) as RunpCommand[];
          const tasks: Task[] = commands.map((command) => task(command, () => tasks));
          state.subTasks = tasks;
        } else {
          state.output += data.toString();
        }
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

    subProcess.on('close', async (code) => {
      const { subTasks } = state.getState();
      let hasErrors = !!code;

      if (subTasks) {
        const errors = await Promise.all(subTasks.map((task) => task.result.catch(() => true)));
        hasErrors = errors.some(Boolean);
      }

      state.update((state) => {
        state.status = hasErrors ? 'error' : 'done';
        state.time = performance.now() - start;

        if (hasErrors) {
          state.shortOutput = renderOutput(fullCmd, state.output);
        }
      });
    });

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
