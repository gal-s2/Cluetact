import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    let allowedHosts = [];
    try {
        allowedHosts = env.VITE_ALLOWED_HOSTS ? JSON.parse(env.VITE_ALLOWED_HOSTS) : [];
    } catch (e) {
        console.error("Invalid JSON in VITE_ALLOWED_HOSTS:", e);
    }

    return {
        plugins: [react()],
        server: {
            allowedHosts, // pulled from .env
        },
        resolve: {
            alias: {
                "@shared": path.resolve(__dirname, "src/shared"),
                "@components": path.resolve(__dirname, "src/components"),
                "@common": path.resolve(__dirname, "src/components/common"),
                "@config": path.resolve(__dirname, "src/config"),
                "@contexts": path.resolve(__dirname, "src/contexts"),
                "@hooks": path.resolve(__dirname, "src/hooks"),
                "@utils": path.resolve(__dirname, "src/utils"),
                "@assets": path.resolve(__dirname, "src/assets"),
                "@services": path.resolve(__dirname, "src/services"),
            },
        },
    };
});
