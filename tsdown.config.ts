import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  sourcemap: true,
  minify: false,
  format: ['cjs', 'esm'],
});
