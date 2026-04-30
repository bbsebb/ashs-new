import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: 'tsconfig.vitest.json'
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@shared-domain': path.resolve(__dirname, './projects/shared-domain/src/public-api.ts'),
      '@shared-api': path.resolve(__dirname, './projects/shared-api/src/public-api.ts'),
      '@shared-ui': path.resolve(__dirname, './projects/shared-ui/src/public-api.ts'),
      '@environment': path.resolve(__dirname, './projects/admin/src/environments/environment.ts'),
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest-setup.ts'],
    include: ['projects/**/*.spec.ts'],
  },
});
