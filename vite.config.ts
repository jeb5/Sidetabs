import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  function generateManifest() {
    const manifest = readJsonFile("src/manifest.json");
    const pkg = readJsonFile("package.json");
    return {
      description: pkg.description,
      version: pkg.version,
      author: pkg.author,
      ...manifest,
    };
  }


  return {
    root: "src",
    build: {
      outDir: "../dist",
    },
    plugins: [
      svgr(),
      react(),
      webExtension({
        browser: "firefox",
        manifest: generateManifest,
        additionalInputs: ["welcome.html"],
        webExtConfig: {
          startUrl: "about:debugging#/runtime/this-firefox",
          keepProfileChanges: true,
          firefoxProfile: path.resolve(__dirname, ".ff_profile"),
          target: "firefox-desktop",
        },
        skipManifestValidation: true,
      }),
    ],
  }
});
