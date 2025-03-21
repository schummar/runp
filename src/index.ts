import { RenderOptions } from '@schummar/react-terminal';
import { resolve } from 'path';
import { splitSpacesExcludeQuotes } from 'quoted-string-space-split';
import { createQueue } from 'schummar-queue';
import { renderTaskList } from './components/renderTaskList';
import { loadNpmWorkspaceScripts } from './npmUtils';
import { statusIcons } from './statusIcons';
import { Task, task } from './task';
import { trackLinearOutput } from './trackLinearOutput';
import { formatTime, indent } from './util';
import wildcardMatch from './wildcardMatch';

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
  subCommands?: RunpCommand[];
}

export interface RunpFeedback {
  updateStatus(status: string): void;
  updateTitle(title: string): void;
  updateOutput(output: string): void;
}

export interface RunpCommandRaw extends Omit<Partial<RunpCommand>, 'args' | 'dependsOn' | 'subCommands'> {
  cmd?: RunpCommand['cmd'];
  args?: (string | false | undefined | null)[];
  dependsOn?: string | number | Array<string | number>;
  subCommands?: RunpCommandRaw[];
}

type Commands = (string | [cmd: string, ...args: string[]] | RunpCommandRaw | false | undefined | null)[];
export type RunpResult = { result: 'success'; output: string } | { result: 'error'; output: string };

export interface RunpOptions<TCommands extends Commands = Commands> extends RunpCommonOptions {
  /** A list of command to execute in parallel */
  commands: TCommands;
  /** Maximum number of parallel tasks */
  parallelTasks?: number;
  target?: RenderOptions['target'];
}

export const DEFAULT_OUTPUT_LENGTH = 10;
export const RUNP_TASK_V = 'N1BLAX3xSn-WvsKuLatw0';
export const RUNP_TASK_DELEGATE = `__runp_task__${RUNP_TASK_V}__`;

const switchRegexp = /s|p|f(=(true|false))?|k(=(true|false))?|n=\d+/g;

export async function runp<const TCommands extends Commands = Commands>(
  options: RunpOptions<TCommands>,
): Promise<{ [K in keyof TCommands]: RunpResult }> {
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

  const q = createQueue({ parallel: options.parallelTasks ?? 5 });
  const tasks: Task[] = resolvedCommands.map((cmd) => task(cmd, () => tasks, q));

  let stop;
  if (process.stdout.isTTY || options.target) {
    stop = renderTTY(tasks, options.target);
  } else {
    stop = await renderNonTTY(tasks);
  }

  const results = await Promise.all(tasks.map((task) => task.result));
  await new Promise<void>((resolve) => setTimeout(resolve));
  stop?.();
  return results as { [K in keyof TCommands]: RunpResult };
}

export async function resolveCommands(options: RunpOptions) {
  const explicitIds = new Set(
    options.commands.map((cmd) => (typeof cmd === 'object' && cmd !== null && 'id' in cmd ? cmd?.id : undefined)).filter(Boolean),
  );

  let sequential = false,
    forever = undefined as boolean | undefined,
    keepOutput = undefined as boolean | undefined,
    outputLength = undefined as number | undefined,
    freeId = 0,
    currentGroup: (string | number)[] = [],
    previousGroup: (string | number)[] = [];

  function getFreeId() {
    while (explicitIds.has(freeId)) {
      freeId++;
    }
    return freeId++;
  }

  function flushGroup() {
    if (!currentGroup.length) {
      return;
    }

    previousGroup = [...new Set(currentGroup)].sort();
    currentGroup = [];
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
          sequential = true;
          flushGroup();
        } else if (sw === 'p') {
          sequential = false;
          flushGroup();
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

    const cleanCommand: RunpCommand = {
      ...command,
      id: command.id ?? getFreeId(),
      cmd: command.cmd ?? '',
      args: command.args?.filter((x): x is string => typeof x === 'string') ?? [],
      cwd: resolve(command.cwd ?? '.'),
      dependsOn: [],
      outputLength: command.outputLength ?? outputLength ?? options.outputLength ?? DEFAULT_OUTPUT_LENGTH,
      keepOutput: command.keepOutput ?? keepOutput ?? options.keepOutput,
      forever: command.forever ?? forever ?? options.forever,
      displayTimeOver: command.displayTimeOver ?? options.displayTimeOver,
      linearOutput: command.linearOutput ?? options.linearOutput,
      env: command.env ?? process.env,
      subCommands: command.subCommands?.length ? await resolveCommands({ ...options, commands: command.subCommands }) : [],
    };

    const cmd = cleanCommand.cmd;

    let npmScriptCount = 0;
    const matchingNpmScripts =
      typeof cmd !== 'string'
        ? []
        : npmScripts.get(cleanCommand.cwd)?.flatMap(({ scriptName, scriptCommand }) => {
            if (!wildcardMatch(scriptName, cmd)) {
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
    }

    for (const resolvedCommand of result) {
      resolvedCommand.dependsOn = Array.isArray(command.dependsOn)
        ? command.dependsOn
        : command.dependsOn !== undefined
          ? [command.dependsOn]
          : previousGroup;

      currentGroup.push(resolvedCommand.id);
      if (sequential) {
        flushGroup();
      }
    }

    resolvedCommands.push(...result);
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
  trackLinearOutput(tasks, (line: string) => console.log(line));

  for (const { command, result, state } of tasks) {
    const { linearOutput, keepOutput, displayTimeOver = -Infinity } = command;
    await result;
    const { status, statusString = statusIcons[status], title, subTasks, time } = state.get();
    const output = state.get().output.trim();
    const showOutput = !linearOutput && (status === 'error' || keepOutput) && output.length > 0;
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
