import multimatch from 'multimatch';
import quotedStringSpaceSplit from 'quoted-string-space-split';
import task from 'tasuku';
import { job } from './job';
import { formatTime, loadScripts } from './util';

export interface RunpCommonOptions {
  /** Maximum number of lines for each command output
   * @default 10
   */
  maxLines?: number;
  /** Treat commands as npm scripts
   * @default false
   */
  npm?: boolean;
  /** Keep output of successful commands visible
   * @default false
   */
  keepOutput?: boolean;
}

export interface RunpCommand extends RunpCommonOptions {
  /** Command name. Only for display purposes. */
  name?: string;
  /** Program to execute */
  cmd: string;
  /** Args to pass into program */
  args?: string[];
}

export interface RunpOptions extends RunpCommonOptions {
  /** A list of command to execute in parallel */
  commands: (string | [cmd: string, ...args: string[]] | RunpCommand)[];
}

const DEFAULT_MAX_LINES = 10;

export async function runp({ commands, maxLines = DEFAULT_MAX_LINES, npm, keepOutput }: RunpOptions) {
  const normalizedCommands = commands.map((command) => {
    if (typeof command === 'string') {
      const [cmd = '', ...args] = quotedStringSpaceSplit(command);
      return { cmd, args };
    }
    if (Array.isArray(command)) {
      return { cmd: command[0], args: command.slice(1) };
    }
    return command;
  });

  const resolvedCommands: RunpCommand[] = [];
  let scripts;

  for (const cmd of normalizedCommands) {
    if (cmd.cmd === 'npm' && cmd.args?.[0] === 'run' && cmd.args?.[1]) {
      cmd.npm = true;
      cmd.cmd = cmd.args[1];
      cmd.args = cmd.args.slice(2);
    }

    if (cmd.npm ?? npm) {
      scripts ??= await loadScripts();

      resolvedCommands.push(
        ...multimatch(Object.keys(scripts), cmd.cmd).map((script) => ({
          ...cmd,
          cmd: 'npm',
          args: ['run', script, '--', ...(cmd.args ?? [])],
        })),
      );
    } else {
      resolvedCommands.push(cmd);
    }
  }

  const jobs = resolvedCommands.map((cmd) =>
    job({
      ...cmd,
      maxLines: cmd.maxLines ?? maxLines,
      keepOutput: cmd.keepOutput ?? keepOutput,
    }),
  );

  if (process.stdout.isTTY) {
    renderTTY(jobs);
  } else {
    renderNonTTY(jobs);
  }
}

function renderTTY(jobs: ReturnType<typeof job>[]) {
  for (const { name, done, onOutput, time, keepOutput } of jobs) {
    task(name, async ({ setOutput, setStatus, setError }) => {
      try {
        onOutput(setOutput);
        await done;

        if (!keepOutput) {
          setOutput('');
        }
      } catch (e: any) {
        setError(e);
      } finally {
        setStatus(formatTime(time()));
      }
    });
  }
}

async function renderNonTTY(jobs: ReturnType<typeof job>[]) {
  for (const { name, done, time } of jobs) {
    try {
      await done;
      console.log(`✔ ${name} [${formatTime(time())}]\n`);
    } catch (e) {
      console.log(`✖ ${name} [${formatTime(time())}]`);
      console.log(e);
    }
  }
}
