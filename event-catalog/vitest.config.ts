import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['generator/tests/**/*.test.ts'],
    sequence: { concurrent: false },
  },
});
