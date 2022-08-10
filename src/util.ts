import { readFile, stat } from 'fs/promises';

export function renderOutput(cmd: string, lines: string, outputLength = Infinity) {
  const cols = process.stdout.columns - 8;

  const last = lines
    .split('\n')
    .slice(-outputLength)
    .flatMap((line) => {
      const chunks: string[] = [];

      while (line.length > cols) {
        chunks.push(line.slice(0, cols));
        line = `  ${line.slice(cols)}`;
      }

      chunks.push(line);

      return chunks;
    });

  return `> ${cmd}\n\n${last.slice(-outputLength).join('\n')}`.trim();
}

export function abbrev(s: string) {
  const cols = process.stdout.columns - 20;

  if (s.length > cols) {
    return s.slice(0, cols - 3).concat('...');
  }

  return s;
}

export function formatTime(ms: number) {
  return `${(ms / 1000).toFixed(3)}s`;
}

export async function loadScripts(): Promise<string[]> {
  let json;
  try {
    json = await readFile('package.json', 'utf-8');
  } catch {
    return [];
  }

  try {
    const pkg = JSON.parse(json);
    return Object.keys(pkg.scripts ?? {});
  } catch (e) {
    console.error('Failed to read package.json:', e);
    return [];
  }
}

export async function whichNpmRunner() {
  try {
    await stat('yarn.lock');
    return 'yarn';
  } catch {
    // ignore
  }

  try {
    await stat('pnpm-lock.yaml');
    return 'pnpm';
  } catch {
    // ignore
  }

  return 'npm';
}
