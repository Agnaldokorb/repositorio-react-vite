import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',

      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        reportsDirectory: './coverage',

        include: ['src/**/*.{js,jsx}'],

        exclude: [
          'src/**/*.test.{js,jsx}',
          'src/test/**',
          'src/main.jsx',
          'src/components/ui/**',
          'src/data/**',
        ],
      },
    },
  }),
)