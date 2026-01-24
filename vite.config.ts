import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      "/api": {
        target: "https://nbabackend.online:4443",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    drop: ["console", "debugger"], // Remove console.logs and debuggers in production
    treeShaking: true, // Aggressive dead code elimination
    pure: ["console.log", "console.debug", "console.info"], // Mark as pure for removal
  },
  build: {
    // Optimize chunk splitting for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - large dependencies
          "vendor-react": ["preact", "preact/hooks", "preact/compat"],
          "vendor-router": ["react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-form": ["formik", "yup"],
          "vendor-ui": ["@headlessui/react", "@heroicons/react", "react-icons"],
          "vendor-utils": ["lodash", "date-fns", "classnames"],

          // Payment-related components (used frequently)
          payment: [
            "./src/components/flutterwave/flutterwave-api.tsx",
            "./src/api/payment.ts",
          ],

          // Chart components removed - using lazy loading instead for better code splitting
        },
      },
    },
    // Increase chunk size warning limit (we're optimizing chunks)
    chunkSizeWarningLimit: 600,

    // Enable minification and compression
    minify: "esbuild",
    target: "esnext",

    // Optimize CSS code splitting
    cssCodeSplit: true,

    // Generate sourcemaps for production debugging (optional, can disable for smaller build)
    sourcemap: false,
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "preact",
      "preact/hooks",
      "preact/compat",
      "react-router-dom",
      "@tanstack/react-query",
      "formik",
      "yup",
      "lodash",
      "date-fns",
    ],
  },
});
