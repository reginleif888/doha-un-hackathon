import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          "ui-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-separator",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-slot",
            "@radix-ui/react-progress",
            "@radix-ui/react-tooltip",
          ],
          icons: ["lucide-react"],
          utils: [
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
            "zustand",
            "sonner",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
});

