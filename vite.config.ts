import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    testTimeout: 10000,
    pool: 'forks',
    env: {
      RUNP: '',
      RUNP_PACKAGE_MANAGER: 'pnpm',
    },
  },
});
