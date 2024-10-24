import { spawn } from 'child_process';
import { createQueue } from 'schummar-queue';
import { createStore, Store } from 'cross-state';
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

export function task(command: RunpCommand, allTasks: () => Task[], q = createQueue()): Task {
  const { name, cmd, args = [], env = process.env, cwd, dependsOn } = command;
  const fullCmd = [cmd, ...args].join(' ');
  const cwdDisplay =
    cwd && cwd !== process.cwd() ? (cwd.startsWith(process.cwd()) ? ` (./${cwd.slice(process.cwd().length + 1)})` : ` (${cwd})`) : '';
  const state = createStore<TaskState>({
    status: 'pending',
    title: (name ?? fullCmd) + cwdDisplay,
    rawOutput: '',
    output: '',
  });

  const result = new Promise<string>((resolve, reject) => {
    const cancel = state
      .map((x) => x.status)
      .subscribe((status) => {
        if (status === 'done') {
          resolve(state.get().output);
          setTimeout(() => cancel());
        } else if (status === 'error' || status === 'dependencyError') {
          reject(state.get().output);
          setTimeout(() => cancel());
        }
      });
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
      state.set('status', 'dependencyError');
      return;
    }

    const start = performance.now();
    state.set('status', 'inProgress');

    if (cmd instanceof Function) {
      try {
        await cmd({
          updateStatus(status) {
            state.set('statusString', status);
          },
          updateTitle(title) {
            state.set('title', title);
          },
          updateOutput(output) {
            state.set('rawOutput', (rawOutput) => rawOutput + output);
            state.set('output', output);
          },
        });

        state.set('status', 'done');
      } catch (error) {
        state.set('status', 'error');
        state.set('output', String(error));
      } finally {
        state.set('time', performance.now() - start);
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
      state.set('rawOutput', (rawOutput) => rawOutput + data.toString());
      state.set('output', state.get().rawOutput.includes(RUNP_TASK_DELEGATE) ? '' : state.get().rawOutput);
    };
    subProcess.stdout.on('data', append);
    subProcess.stderr.on('data', append);

    subProcess.on('close', async (code) => {
      const { rawOutput } = state.get();

      const delegationStart = rawOutput.indexOf(RUNP_TASK_DELEGATE);
      const delegationEnd = rawOutput.indexOf(RUNP_TASK_DELEGATE, delegationStart + 1);
      if (delegationStart >= 0 && delegationEnd > delegationStart) {
        const json = rawOutput.slice(delegationStart + RUNP_TASK_DELEGATE.length, delegationEnd);
        const commands = JSON.parse(json) as RunpCommand[];
        const tasks: Task[] = commands.map((command) => task(command, () => tasks));

        state.set('output', '');
        state.set('subTasks', tasks);
      }

      const { subTasks } = state.get();
      let hasErrors = !!code;

      if (subTasks) {
        const errors = await Promise.all(subTasks.map((task) => task.result.then(() => undefined).catch(() => true)));
        hasErrors = errors.some(Boolean);
      }

      state.set('status', hasErrors ? 'error' : 'done');
      state.set('time', performance.now() - start);
    });

    subProcess.on('error', (error) => state.set('output', String(error)));

    await result.catch(() => undefined);
  });

  return {
    command,
    state,
    result,
  };
}
