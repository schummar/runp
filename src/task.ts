import { spawn } from 'child_process';
import { createStore, Store } from 'cross-state';
import { createQueue } from 'schummar-queue';
import { RUNP_TASK_DELEGATE, RUNP_TASK_V, RunpCommand, type RunpResult } from '.';
import type { WriteLine } from './trackLinearOutput';

export interface Task {
  command: RunpCommand;
  state: Store<TaskState>;
  result: Promise<RunpResult>;
  run: (writeLine: WriteLine) => Promise<RunpResult>;
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

  const result = new Promise<RunpResult>((resolve) => {
    state
      .map((x) => x.status)
      .subscribe(function (status) {
        if (status === 'done') {
          resolve({
            result: 'success',
            output: state.get().output,
          });
          this.cancel();
        } else if (status === 'error' || status === 'dependencyError') {
          resolve({
            result: 'error',
            output: state.get().output,
          });
          this.cancel();
        }
      });
  });

  return {
    command,
    state,
    result,

    run(writeLine: WriteLine) {
      const thisTask = this;

      q.schedule(async () => {
        await Promise.resolve();

        const dependencies = allTasks().filter(
          (j) =>
            dependsOn !== undefined &&
            j.command.id !== undefined &&
            (Array.isArray(dependsOn) ? dependsOn.includes(j.command.id) : dependsOn === j.command.id),
        );

        const depResults = await Promise.all(dependencies.map((j) => j.result));

        if (depResults.some((x) => x.result === 'error')) {
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
                writeLine(output, thisTask);
              },
            });

            state.set('status', 'done');
          } catch (error) {
            state.set('status', 'error');
            state.set('output', String(error));
            writeLine(String(error), thisTask);
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
          const chunk = data.toString();
          state.set('rawOutput', (rawOutput) => rawOutput + chunk);
          state.set('output', state.get().rawOutput.includes(RUNP_TASK_DELEGATE) ? '' : state.get().rawOutput);
          if (!chunk.includes(RUNP_TASK_DELEGATE)) {
            writeLine?.(data.toString(), thisTask);
          }
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
            const tasks: Task[] = commands.map((command) => task(command, () => tasks, q));

            state.set('output', '');
            state.set('subTasks', tasks);
          }

          const { subTasks } = state.get();
          let hasErrors = !!code;

          if (subTasks) {
            const subResults = await Promise.all(subTasks.map((task) => task.run(writeLine)));
            hasErrors = subResults.some((x) => x.result === 'error');
          }

          state.set('status', hasErrors ? 'error' : 'done');
          state.set('time', performance.now() - start);
        });

        subProcess.on('error', (error) => {
          state.set('output', String(error));
          writeLine(String(error), thisTask);
        });
      });

      return result;
    },
  };
}
