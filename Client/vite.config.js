import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ["c934-95-35-191-50.ngrok-free.app"], //#client-url
    },
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "./common"),
        },
    },
    optimizeDeps: {
        include: ["@shared/socketEvents"],
    },
});
