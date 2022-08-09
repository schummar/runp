import multimatch from 'multimatch';
import quotedStringSpaceSplit from 'quoted-string-space-split';
import task from 'tasuku';
import { job } from './job';
import { formatTime, loadScripts } from './util';

export interface RunpCommonOptions {
  maxLines?: number;
  npm?: boolean;
  keepOutput?: boolean;
}

export interface RunpCommand extends RunpCommonOptions {
  name?: string;
  cmd: string;
  args?: string[];
}

export interface RunpOptions extends RunpCommonOptions {
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
  // Some libs color output when this env var is set
  process.env.FORCE_COLOR = '1';

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
