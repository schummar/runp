export function formatTime(ms: number) {
  return `${(ms / 1000).toFixed(3)}s`;
}

export function indent(s: string, margin: number) {
  return s
    .split('\n')
    .map((line) => (line.length > 0 ? ''.padEnd(margin * 4, ' ') + line : line))
    .join('\n');
}
