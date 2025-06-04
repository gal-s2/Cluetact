import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ["e97b-95-35-191-50.ngrok-free.app"],
    },
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "../shared"),
        },
    },
    optimizeDeps: {
        include: ["@shared/socketEvents"],
    },
});
