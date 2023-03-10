import { RenderOptions } from '@schummar/react-terminal';
import multimatch from 'multimatch';
import { resolve } from 'path';
import { splitSpacesExcludeQuotes } from 'quoted-string-space-split';
import { renderTaskList } from './components/renderTaskList';
import { loadNpmWorkspaceScripts } from './npmUtils';
import { statusIcons } from './statusIcons';
import { Task, task } from './task';
import { formatTime, indent } from './util';

export interface RunpCommonOptions {
  /** Maximum number of lines for each command output
   * @default 10
   */
  outputLength?: number;
  /** Keep output of successful commands visible
   * @default false
   */
  keepOutput?: boolean;
  /** Task will run forever. It won't display a spinner but a different symbol instead */
  forever?: boolean;
}

export interface RunpCommand extends RunpCommonOptions {
  /** Used to indentify dependencies */
  id?: string | number;
  /** Command name. Only for display purposes. */
  name?: string;
  /** Program to execute */
  cmd: string | ((feedback: RunpFeedback) => Promise<void>);
  /** Args to pass into program */
  args?: string[];
  /** Environment variables to set
   * @default process.env
   */
  env?: Record<string, string>;
  /** Wait with execution until job at that index is done
   * @default false
   */
  dependsOn?: string | number | Array<string | number>;
  /** Set cwd for command */
  cwd?: string;
}

export interface RunpFeedback {
  updateStatus(status: string): void;
  updateTitle(title: string): void;
  updateOutput(output: string): void;
}

export type RunpCommandRaw = Omit<RunpCommand, 'args'> & { args?: (string | false | undefined | null)[] };

export interface RunpOptions extends RunpCommonOptions {
  /** A list of command to execute in parallel */
  commands: (string | [cmd: string, ...args: string[]] | RunpCommandRaw | false | undefined | null)[];
  target?: RenderOptions['target'];
}

export const DEFAULT_OUTPUT_LENGTH = 10;
export const RUNP_TASK_V = 'N1BLAX3xSn-WvsKuLatw0';
export const RUNP_TASK_DELEGATE = `__runp_task__${RUNP_TASK_V}__`;

const switchRegexp = /s|p|f(=(true|false))?|k(=(true|false))?|n=\d+/g;

export async function runp(options: RunpOptions) {
  const resolvedCommands = await resolveCommands(options);

  if (process.env.RUNP === RUNP_TASK_V) {
    console.log(
      [
        RUNP_TASK_DELEGATE,
        JSON.stringify(
          resolvedCommands.map((cmd) => ({
            ...cmd,
            env: cmd.env ?? process.env,
          })),
        ),
        RUNP_TASK_DELEGATE,
      ].join(''),
    );
    process.exit();
  }

  const tasks: Task[] = resolvedCommands.map((cmd) => task(cmd, () => tasks));

  let stop;
  if (process.stdout.isTTY || options.target) {
    stop = renderTTY(tasks, options.target);
  } else {
    await renderNonTTY(tasks);
  }

  const results = await Promise.all(
    tasks.map((task) =>
      task.result
        .then(
          (output) =>
            ({
              result: 'success',
              output,
            } as const),
        )
        .catch(
          (output: string) =>
            ({
              result: 'error',
              output,
            } as const),
        ),
    ),
  );

  stop?.();

  return results;
}

export async function resolveCommands(options: RunpOptions) {
  let serial = false,
    forever = undefined as boolean | undefined,
    keepOutput = undefined as boolean | undefined,
    outputLength = undefined as number | undefined,
    index = 0,
    deps = new Array<string | number>();

  const resolvedCommandsPromise = options.commands.map(async (command): Promise<RunpCommand[]> => {
    if (!command) {
      return [];
    }

    if (typeof command === 'string' && command.match(`^:(${switchRegexp.source})+$`)) {
      for (const [sw] of command.matchAll(switchRegexp)) {
        if (sw === 's') {
          serial = true;
          deps = Array.from(Array(index).keys());
        } else if (sw === 'p') {
          serial = false;
          deps = Array.from(Array(index).keys());
        } else if (sw?.startsWith('f')) {
          forever = !sw.endsWith('false');
        } else if (sw?.startsWith('k')) {
          keepOutput = !sw.endsWith('false');
        } else if (sw?.startsWith('n')) {
          outputLength = Number(sw.slice(2));
        }
      }

      return [];
    }

    if (typeof command === 'string') {
      const [cmd = '', ...args] = splitSpacesExcludeQuotes(command);
      command = { cmd, args };
    }

    if (Array.isArray(command)) {
      command = { cmd: command[0], args: command.slice(1) };
    }

    const cleanCommand = {
      ...command,
      args: command.args?.filter((x): x is string => typeof x === 'string'),
      cwd: resolve(command.cwd ?? '.'),
      id: command.id ?? index,
      dependsOn: command.dependsOn ?? [...deps],
      outputLength: command.outputLength ?? outputLength ?? options.outputLength ?? DEFAULT_OUTPUT_LENGTH,
      keepOutput: command.keepOutput ?? keepOutput ?? options.keepOutput,
      forever: command.forever ?? forever ?? options.forever,
    };

    index++;

    if (serial) {
      deps.push(cleanCommand.id);
    }

    const cmd = cleanCommand.cmd;
    const npmScripts = await loadNpmWorkspaceScripts(cleanCommand.cwd ?? '.');

    const matchingNpmScripts =
      typeof cmd !== 'string'
        ? []
        : npmScripts.flatMap(({ scriptName, scriptCommand }) => {
            if (multimatch(scriptName, cmd).length === 0) {
              return [];
            }

            const [scriptCmd = '', ...args] = scriptCommand(cleanCommand.args ?? []);

            return {
              ...cleanCommand,
              name: scriptName,
              cmd: scriptCmd,
              args,
            };
          });

    if (matchingNpmScripts.length > 0) {
      return matchingNpmScripts;
    }

    return [cleanCommand];
  });

  return (await Promise.all(resolvedCommandsPromise)).flat();
}

function renderTTY(tasks: ReturnType<typeof task>[], target?: RenderOptions['target']) {
  const stop = renderTaskList(tasks, { target });

  [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, () => {
      stop();
      // process.exit();
    });
  });

  process.on('uncaughtException', (e) => {
    stop();
    throw e;
  });

  return stop;
}

async function renderNonTTY(tasks: ReturnType<typeof task>[], margin = 0) {
  for (const {
    command: { keepOutput },
    result,
    state,
  } of tasks) {
    await result.catch(() => undefined);
    const { status, statusString = statusIcons[status], title, subTasks } = state.getState();
    const output = state.getState().output.trim();
    const showOutput = (status === 'error' || keepOutput) && output.length > 0;

    console.log(indent(`${statusString} ${title} [${formatTime(state.getState().time ?? 0)}]`, margin));

    if (showOutput) {
      console.log(indent(`\n${output}\n`, margin + 1));
    }

    if (subTasks) {
      renderNonTTY(subTasks, margin + 1);
    }
  }
}
