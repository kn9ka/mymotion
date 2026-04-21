import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 3000,
    },
    build: {
      minify: 'oxc' as 'oxc' | 'terser' | 'esbuild',
    },
    plugins: [tailwindcss(), reactRouter()],
  };
});
