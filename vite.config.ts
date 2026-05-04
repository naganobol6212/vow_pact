import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"
import react from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [RubyPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/frontend"),
    },
  },
})
