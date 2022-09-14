import { readFile, stat } from 'fs/promises';

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

export function indent(s: string, margin: number) {
  return s
    .split('\n')
    .map((line) => (line.length > 0 ? ''.padEnd(margin * 4, ' ') + line : line))
    .join('\n');
}
