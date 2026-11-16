import path from "path";
import process from "node:process";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Emits a manifest of every built chunk/asset so the service worker can
// precache the complete app shell (including lazily-loaded chunks) offline.
const offlineShellManifest = () => ({
      name: "offline-shell-manifest",
      apply: "build",
      generateBundle(_options, bundle) {
            const files = Object.values(bundle)
                  .map((file) => file.fileName)
                  .filter((name) => name.startsWith("assets/"));
            this.emitFile({
                  type: "asset",
                  fileName: "sw-manifest.json",
                  source: JSON.stringify(files),
            });
      },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
      const shouldAnalyze = mode === "analyze" || process.env.ANALYZE === "true";

      return {
            plugins: [
                  react(),
                  tailwindcss(),
                  offlineShellManifest(),
                  shouldAnalyze && visualizer({
                        filename: "dist/stats.html",
                        gzipSize: true,
                        brotliSize: true,
                        template: "treemap",
                        open: false,
                  }),
            ].filter(Boolean),
            resolve: {
                  alias: {
                        "@": path.resolve(__dirname, "./src"),
                  },
            },
            build: {
                  sourcemap: false,
                  chunkSizeWarningLimit: 750,
                  modulePreload: {
                        resolveDependencies: (filename, deps) =>
                              deps.filter((dep) => !/(three-core|r3f-vendor|drei-vendor|motion-vendor)/.test(dep)),
                  },
                  rollupOptions: {
                        output: {
                              manualChunks: {
                                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                                    'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
                                    'ui-vendor': ['lucide-react', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-dialog'],
                                    'utils-vendor': ['axios', 'sonner', 'clsx', 'tailwind-merge', 'class-variance-authority'],
                                    'motion-vendor': ['framer-motion'],
                                    'three-core': ['three'],
                              },
                        },
                  },
            },
            test: {
                  environment: 'jsdom',
                  globals: true,
                  setupFiles: './src/test/setup.js',
                  css: false,
                  restoreMocks: true,
            },
      };
});
