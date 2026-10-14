import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  build: { rollupOptions: { input: {
    home: fileURLToPath(new URL('./index.html', import.meta.url)),
    swap: fileURLToPath(new URL('./src/problem2/index.html', import.meta.url)),
  } } },
});
