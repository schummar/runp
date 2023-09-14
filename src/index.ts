import { RenderOptions } from '@schummar/react-terminal';
import multimatch from 'multimatch';
import { resolve } from 'path';
import { splitSpacesExcludeQuotes } from 'quoted-string-space-split';
import { renderTaskList } from './components/renderTaskList';
import { loadNpmWorkspaceScripts } from './npmUtils';
import { statusIcons } from './statusIcons';
import { Task, task } from './task';
import { formatTime, indent } from './util';
import { Queue } from 'schummar-queue';

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
  /** Display time in status line if the task took more than the given ms */
  displayTimeOver?: number;
  linearOutput?: boolean;
}

export interface RunpCommand extends RunpCommonOptions {
  /** Used to indentify dependencies */
  id: string | number;
  /** Command name. Only for display purposes. */
  name?: string;
  /** Program to execute */
  cmd: string | ((feedback: RunpFeedback) => Promise<void>);
  /** Args to pass into program */
  args: string[];
  /** Environment variables to set
   * @default process.env
   */
  env: NodeJS.ProcessEnv;
  /** Wait with execution until job at that index is done
   * @default false
   */
  dependsOn: Array<string | number>;
  /** Set cwd for command */
  cwd: string;
}

export interface RunpFeedback {
  updateStatus(status: string): void;
  updateTitle(title: string): void;
  updateOutput(output: string): void;
}

export interface RunpCommandRaw extends Omit<Partial<RunpCommand>, 'args' | 'dependsOn'> {
  cmd: RunpCommand['cmd'];
  args?: (string | false | undefined | null)[];
  dependsOn?: string | number | Array<string | number>;
}

export interface RunpOptions extends RunpCommonOptions {
  /** A list of command to execute in parallel */
  commands: (string | [cmd: string, ...args: string[]] | RunpCommandRaw | false | undefined | null)[];
  /** Maximum number of parallel tasks */
  parallelTasks?: number;
  target?: RenderOptions['target'];
}

export const DEFAULT_OUTPUT_LENGTH = 10;
export const RUNP_TASK_V = 'N1BLAX3xSn-WvsKuLatw0';
export const RUNP_TASK_DELEGATE = `__runp_task__${RUNP_TASK_V}__`;

const switchRegexp = /s|p|f(=(true|false))?|k(=(true|false))?|n=\d+/g;

export async function runp(options: RunpOptions) {
  const resolvedCommands = await resolveCommands(options);

  if (process.env.RUNP === RUNP_TASK_V) {
    console.info(
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

  const q = new Queue({ parallel: options.parallelTasks ?? 5 });
  const tasks: Task[] = resolvedCommands.map((cmd) => task(cmd, () => tasks, q));

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
            }) as const,
        )
        .catch(
          (output: string) =>
            ({
              result: 'error',
              output,
            }) as const,
        ),
    ),
  );

  stop?.();

  return results;
}

export async function resolveCommands(options: RunpOptions) {
  const explicitIds = new Set(
    options.commands.map((cmd) => (typeof cmd === 'object' && cmd !== null && 'id' in cmd ? cmd?.id : undefined)).filter(Boolean),
  );
  const previousIds = new Set<string | number>();
  const depToIds = new Map<string | number, Array<string | number>>();

  let serial = false,
    forever = undefined as boolean | undefined,
    keepOutput = undefined as boolean | undefined,
    outputLength = undefined as number | undefined,
    freeId = 0,
    deps = new Array<string | number>();

  function getFreeId() {
    while (explicitIds.has(freeId)) {
      freeId++;
    }
    return freeId++;
  }

  const npmScriptsToResolve = new Set<string>();
  for (const command of options.commands) {
    const commandObject = typeof command === 'object' && command !== null && 'cmd' in command ? command : undefined;
    if (commandObject?.cmd instanceof Function) {
      continue;
    }

    const cwd = resolve(commandObject?.cwd ?? '.');
    npmScriptsToResolve.add(cwd);
  }
  const npmScripts = new Map(
    await Promise.all([...npmScriptsToResolve].map(async (cwd) => [cwd, await loadNpmWorkspaceScripts(cwd)] as const)),
  );

  const resolvedCommands = new Array<RunpCommand>();

  for (let command of options.commands) {
    if (!command) {
      continue;
    }

    if (typeof command === 'string' && command.match(`^:(${switchRegexp.source})+$`)) {
      for (const [sw] of command.matchAll(switchRegexp)) {
        if (sw === 's') {
          serial = true;
          deps = [...previousIds];
        } else if (sw === 'p') {
          serial = false;
          deps = [...previousIds];
        } else if (sw?.startsWith('f')) {
          forever = !sw.endsWith('false');
        } else if (sw?.startsWith('k')) {
          keepOutput = !sw.endsWith('false');
        } else if (sw?.startsWith('n')) {
          outputLength = Number(sw.slice(2));
        }
      }

      continue;
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
      id: command.id ?? getFreeId(),
      args: command.args?.filter((x): x is string => typeof x === 'string') ?? [],
      cwd: resolve(command.cwd ?? '.'),
      dependsOn: Array.isArray(command.dependsOn) ? command.dependsOn : command.dependsOn !== undefined ? [command.dependsOn] : [...deps],
      outputLength: command.outputLength ?? outputLength ?? options.outputLength ?? DEFAULT_OUTPUT_LENGTH,
      keepOutput: command.keepOutput ?? keepOutput ?? options.keepOutput,
      forever: command.forever ?? forever ?? options.forever,
      displayTimeOver: command.displayTimeOver ?? options.displayTimeOver,
      linearOutput: command.linearOutput ?? options.linearOutput,
      env: command.env ?? process.env,
    } satisfies RunpCommand;

    const cmd = cleanCommand.cmd;

    let npmScriptCount = 0;
    const matchingNpmScripts =
      typeof cmd !== 'string'
        ? []
        : npmScripts.get(cleanCommand.cwd)?.flatMap(({ scriptName, scriptCommand }) => {
            if (multimatch(scriptName, cmd).length === 0) {
              return [];
            }

            const [scriptCmd = '', ...args] = scriptCommand(cleanCommand.args ?? []);
            const id = npmScriptCount++ === 0 ? cleanCommand.id : getFreeId();

            return {
              ...cleanCommand,
              id,
              name: scriptName,
              cmd: scriptCmd,
              args,
            };
          });

    let result = [cleanCommand];

    if (matchingNpmScripts?.length) {
      result = matchingNpmScripts;
      depToIds.set(
        cleanCommand.id,
        matchingNpmScripts.map((x) => x.id),
      );
    }

    for (const resolvedCommand of result) {
      previousIds.add(resolvedCommand.id);

      if (serial) {
        deps.push(resolvedCommand.id);
      }
    }

    resolvedCommands.push(...result);
  }

  for (const command of resolvedCommands) {
    command.dependsOn = command.dependsOn.flatMap((depId) => {
      const ids = depToIds.get(depId);
      return ids ?? depId;
    });
  }

  const sortedCommands = topoSort(resolvedCommands);
  return sortedCommands;
}

function topoSort(resolvedCommands: RunpCommand[]) {
  const visited = new Set();
  const sorted = new Array<RunpCommand>();
  const stack = new Set();

  function visit(command: RunpCommand) {
    if (visited.has(command.id)) {
      return;
    }

    visited.add(command.id);
    stack.add(command.id);

    for (const dep of command.dependsOn) {
      const depCommand = resolvedCommands.find((x) => x.id === dep);

      if (!depCommand) {
        throw new Error(`Command ${command.id} depends on command ${dep} which does not exist`);
      }

      if (stack.has(dep)) {
        throw new Error(`Circular dependency detected between command ${command.id} and command ${dep}`);
      }

      visit(depCommand);
    }

    stack.delete(command.id);
    sorted.push(command);
  }

  for (const command of resolvedCommands) {
    visit(command);
  }

  return sorted;
}

function renderTTY(tasks: ReturnType<typeof task>[], target?: RenderOptions['target']) {
  const stop = renderTaskList(tasks, { target });

  [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, () => {
      stop();
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
    command: { keepOutput, displayTimeOver = -Infinity },
    result,
    state,
  } of tasks) {
    await result.catch(() => undefined);
    const { status, statusString = statusIcons[status], title, subTasks, time } = state.get();
    const output = state.get().output.trim();
    const showOutput = (status === 'error' || keepOutput) && output.length > 0;
    const timeString = time !== undefined && time >= displayTimeOver ? ` [${formatTime(time)}]` : '';

    console.info(indent(`${statusString} ${title}${timeString}`, margin));

    if (showOutput) {
      console.info(indent(`\n${output}\n`, margin + 1));
    }

    if (subTasks) {
      renderNonTTY(subTasks, margin + 1);
    }
  }
}
