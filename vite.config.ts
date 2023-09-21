// vite.config.js
import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const config = {
    plugins: [
      react(),
      NodeGlobalsPolyfillPlugin({
        buffer: true,
      }),
    ],
    base: "/",
    define: {
      "process.env": {},
      global: {},
    },
  };

  return config;
});
