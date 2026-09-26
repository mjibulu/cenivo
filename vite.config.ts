import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the build works at https://mjibulu.github.io/cenivo-showcase/ and locally.
  // Routing is hash-based (#/dashboard), so no server-side fallback is needed.
  base: "./",
});
