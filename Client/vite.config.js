import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ["cluetact.onrender.com", "localhost:5173"], //#client-url
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
});
