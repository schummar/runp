import multimatch from 'multimatch';
import quotedStringSpaceSplit from 'quoted-string-space-split';
import { renderTaskList } from './components/taskList';
import { Task, task } from './task';
import { formatTime, loadScripts as loadNpmScripts, whichNpmRunner } from './util';

export interface RunpCommonOptions {
  /** Maximum number of lines for each command output
   * @default 10
   */
  outputLength?: number;
  /** Keep output of successful commands visible
   * @default false
   */
  keepOutput?: boolean;
}

export interface RunpCommand extends RunpCommonOptions {
  /** Used to indentify dependencies */
  id?: string | number;
  /** Command name. Only for display purposes. */
  name?: string;
  /** Program to execute */
  cmd: string;
  /** Args to pass into program */
  args?: string[];
  /** Wait with execution until job at that index is done
   * @default false
   */
  dependsOn?: string | number | Array<string | number>;
  /** Task will run forever. It won't display a spinner but a different symbol instead */
  forever?: boolean;
  /** Set cwd for command */
  cwd?: string;
}

export type RunpCommandRaw = Omit<RunpCommand, 'args'> & { args?: (string | false | undefined | null)[] };

export interface RunpOptions extends RunpCommonOptions {
  /** A list of command to execute in parallel */
  commands: (string | [cmd: string, ...args: string[]] | RunpCommandRaw | false | undefined | null)[];
}

const DEFAULT_MAX_LINES = 10;

export async function runp({ commands, outputLength = DEFAULT_MAX_LINES, keepOutput }: RunpOptions) {
  const npmScripts = await loadNpmScripts();
  const npmRunner = await whichNpmRunner();
  let serial = false,
    forever = false,
    index = 0,
    deps = new Array<string | number>();

  const resolvedCommands = commands.flatMap<RunpCommand>((command) => {
    if (!command) {
      return [];
    }

    if (typeof command === 'string' && command.match(/^:[spf]+$/)) {
      if (command.includes('s')) {
        serial = true;
        deps = Array.from(Array(index).keys());
      }
      if (command.includes('p')) {
        serial = false;
        deps = Array.from(Array(index).keys());
      }
      if (command.includes('f')) {
        forever = true;
      }

      return [];
    }

    if (typeof command === 'string') {
      const [cmd = '', ...args] = quotedStringSpaceSplit(command);
      command = { cmd, args };
    }

    if (Array.isArray(command)) {
      command = { cmd: command[0], args: command.slice(1) };
    }

    const cleanCommand = {
      ...command,
      args: command.args?.filter((x): x is string => typeof x === 'string'),
      id: command.id ?? index,
      dependsOn: command.dependsOn ?? [...deps],
      forever: command.forever ?? forever,
    };

    index++;

    if (serial) {
      deps.push(cleanCommand.id);
    }

    const matchingNpmScripts = multimatch(npmScripts, command.cmd);
    if (matchingNpmScripts.length > 0) {
      return matchingNpmScripts.map((script) => ({
        ...cleanCommand,
        cmd: npmRunner,
        args: ['run', script].concat(cleanCommand.args?.length ? ['--', ...cleanCommand.args] : []),
      }));
    }

    return cleanCommand;
  });

  const tasks: Task[] = resolvedCommands.map((cmd) =>
    task(
      {
        ...cmd,
        outputLength: cmd.outputLength ?? outputLength,
        keepOutput: cmd.keepOutput ?? keepOutput,
      },
      () => tasks,
    ),
  );

  if (process.stdout.isTTY) {
    renderTTY(tasks);
  } else {
    await renderNonTTY(tasks);
  }

  const errors = await Promise.all(tasks.map((task) => task.result.catch(() => true)));
  const hasErrors = errors.some(Boolean);

  setTimeout(() => {
    process.exit(hasErrors ? 1 : 0);
  });
}

function renderTTY(tasks: ReturnType<typeof task>[]) {
  renderTaskList(tasks);
}

async function renderNonTTY(tasks: ReturnType<typeof task>[]) {
  for (const { name, result, state } of tasks) {
    try {
      await result;
      console.log(`✔ ${name} [${formatTime(state.getState().time ?? 0)}]\n`);
    } catch (e: any) {
      console.log(`✖ ${name} [${formatTime(state.getState().time ?? 0)}]`);
      console.log(e);
    }
  }
}
