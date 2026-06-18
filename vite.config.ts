import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  // GitHub Pages 專案站位於 /anime-sedai-tw/ 子路徑；dev 維持根路徑
  base: command === "build" ? "/anime-sedai-tw/" : "/",
  plugins: [tailwindcss(), react()],
}));
