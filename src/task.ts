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
  subTasks: Task[];
}

export function task(command: RunpCommand, allTasks: () => Task[], q = createQueue()): Task {
  const { name, cmd, args = [], env = process.env, cwd, dependsOn } = command;
  const fullCmd = [cmd, ...args].join(' ');
  const cwdDisplay =
    cwd && cwd !== process.cwd() ? (cwd.startsWith(process.cwd()) ? ` (./${cwd.slice(process.cwd().length + 1)})` : ` (${cwd})`) : '';

  const subTasks: Task[] = command.subCommands?.map((subCommand) => task(subCommand, () => subTasks, q)) ?? [];

  const state = createStore<TaskState>({
    status: 'pending',
    title: (name ?? fullCmd) + cwdDisplay,
    rawOutput: '',
    output: '',
    subTasks,
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

        const dependencies = allTasks().filter((j) => dependsOn.includes(j.command.id));
        const depResults = await Promise.all(dependencies.map((j) => j.result));

        if (depResults.some((x) => x.result === 'error')) {
          state.set('status', 'dependencyError');
          return;
        }

        const start = performance.now();
        try {
          state.set('status', 'inProgress');

          if (cmd instanceof Function) {
            function updateStatus(status: string) {
              state.set('statusString', status);
            }

            function updateTitle(title: string) {
              state.set('title', title);
            }

            function updateOutput(output: string) {
              state.set('rawOutput', (rawOutput) => rawOutput + output);
              state.set('output', output);
              writeLine(output, thisTask);
            }

            try {
              await cmd({ updateStatus, updateTitle, updateOutput });
            } catch (error) {
              const message = error instanceof Error ? error.toString() : typeof error === 'object' ? JSON.stringify(error) : String(error);
              updateOutput(message);

              throw error;
            }
          } else if (cmd) {
            const isTTY = process.stdout.isTTY || process.env.RUNP_TTY;

            await new Promise<void>((resolve, reject) => {
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
                if (!state.get().rawOutput.includes(RUNP_TASK_DELEGATE)) {
                  writeLine?.(data.toString(), thisTask);
                }
              };
              subProcess.stdout.on('data', append);
              subProcess.stderr.on('data', append);

              subProcess.on('close', async (code) => {
                if (code) {
                  reject(new Error(`Process exited with code ${code}`));
                  return;
                }

                const { rawOutput } = state.get();

                const delegationStart = rawOutput.indexOf(RUNP_TASK_DELEGATE);
                const delegationEnd = rawOutput.indexOf(RUNP_TASK_DELEGATE, delegationStart + 1);
                if (delegationStart >= 0 && delegationEnd > delegationStart) {
                  const json = rawOutput.slice(delegationStart + RUNP_TASK_DELEGATE.length, delegationEnd);
                  const commands = JSON.parse(json) as RunpCommand[];
                  const newSubTasks: Task[] = commands.map((command) => task(command, () => newSubTasks, q));

                  state.set('output', '');
                  state.set('subTasks', (subTasks) => [...newSubTasks, ...subTasks]);
                }

                resolve();
              });

              subProcess.on('error', reject);
            });
          }

          const { subTasks } = state.get();
          const subResults = await Promise.all(subTasks.map((task) => task.run(writeLine)));

          if (subResults.some((x) => x.result === 'error')) {
            throw new Error('Subtask failed');
          }

          state.set('status', 'done');
        } catch {
          state.set('status', 'error');
        } finally {
          state.set('time', performance.now() - start);
        }
      });

      return result;
    },
  };
}
