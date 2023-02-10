import { spawn } from 'child_process';
import { Store } from 'schummar-state/react';
import { RunpCommand, RUNP_TASK_DELEGATE, RUNP_TASK_V } from '.';

export interface Task {
  command: RunpCommand;
  name: string;
  state: Store<TaskState>;
  result: Promise<string>;
}

export interface TaskState {
  status: 'pending' | 'inProgress' | 'done' | 'error' | 'dependencyError';
  output: string;
  time?: number;
  subTasks?: Task[];
}

export function task(command: RunpCommand, allTasks: () => Task[]): Task {
  const { name, cmd, args = [], env = process.env, cwd, dependsOn } = command;
  const fullCmd = [cmd, ...args].join(' ');
  const state = new Store<TaskState>({
    status: 'pending',
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
      state.update((state) => {
        state.status = 'dependencyError';
      });

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
        ...env,
        FORCE_COLOR: isTTY ? '1' : undefined, // Some libs color output when this env var is set
        RUNP: RUNP_TASK_V, // Tell child processes, especially runp itself, that they are running in runp
        RUNP_TTY: isTTY ? '1' : undefined, // Runp child processes can print as if they were running in a tty
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
    };
    subProcess.stdout.on('data', append);
    subProcess.stderr.on('data', append);

    subProcess.on('close', async (code) => {
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

    subProcess.on('error', (e) =>
      state.update((state) => {
        state.output = String(e);
      }),
    );
  })();

  return {
    command,
    name: (name ?? fullCmd) + (cwd && cwd !== process.cwd() ? ` (${cwd})` : ''),
    state,
    result,
  };
}
