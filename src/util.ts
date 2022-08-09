import { readFile } from 'fs/promises';

export function renderOutput(cmd: string, lines: string[], maxLines = Infinity) {
  const cols = process.stdout.columns - 4;

  const last = lines.slice(-maxLines).flatMap((line) => {
    const chunks: string[] = [];

    while (line.length > cols) {
      chunks.push(line.slice(0, cols));
      line = `  ${line.slice(cols)}`;
    }

    chunks.push(line);

    return chunks;
  });

  return `${cmd}\n${last.slice(-maxLines).join('\n')}`.trim().concat('\n');
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

export async function loadScripts(): Promise<Record<string, string>> {
  try {
    const json = await readFile('package.json', 'utf-8');
    const pkg = JSON.parse(json);
    return pkg.scripts ?? {};
  } catch (e) {
    console.error('Failed to read package.json:', e);
    return {};
  }
}
