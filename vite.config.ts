import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";
import svgr from "vite-plugin-svgr";
import svgtopng from "rollup-svgtopng-plugin";

// https://vitejs.dev/config/
export default defineConfig(() => {
	return {
		plugins: [
			svgtopng(),
			svgr(),
			react(),
			// svgtopng({ outputFolder: "dist/test" }),
			webExtension({
				manifest: getManifest(),
				additionalInputs: {
					html: ["src/entries/welcome/welcome.html"],
				},
			}),
		],
		resolve: {
			alias: {
				"~": path.resolve(__dirname, "./src"),
			},
		},
	};
});
