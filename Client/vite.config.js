import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ["cluetact.onrender.com", "localhost:5173"], //#client-url
    },
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "src/shared"),
        },
    },
});
