import { defineConfig } from "vite";
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  root: ".",
  assetsInclude: [
    "src/assets/**/*"
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022"
  },
  server: {
    port: 5173,
    open: true,
    https: true
  },
  plugins: [mkcert()]
});
