import { defineConfig, LibraryFormats } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
	return {
		plugins: [
			react(),
		],
		build: {
			lib: {
				entry: resolve(__dirname, 'src/main.ts'),
				formats: ['es' as LibraryFormats]
			}
		}
	}
});
