import pkg from "../package.json";

//BUG: Sidebar.html not being included by vite.
const manifest = {
  browser_specific_settings: {
    gecko: {
      strict_min_version: "112.0",
      id: "{ccc8cbaa-3c36-46d1-b0ae-d5e122755901}",
    },
  },
  background: {
    scripts: ["src/entries/background/main.ts"],
  },
  icons: {
    "48": "sidetabs.svg",
    "96": "sidetabs.svg",
  },
  sidebar_action: {
    default_icon: "sidetabs.svg",
    default_title: "Sidetabs",
    default_panel: "src/entries/sidebar/sidebar.html",
  },
  browser_action: {
    default_icon: "sidetabs.svg",
    default_title: "Toggle Sidetabs",
  },
  permissions: [
    "tabs",
    "menus",
    "menus.overrideContext",
    "bookmarks",
    "sessions",
    "cookies",
    "contextualIdentities",
    "theme",
    "storage",
    "browsingData",
  ],
  options_ui: {
    page: "src/entries/settings/index.html",
    open_in_tab: true,
  },
  commands: {
    _execute_sidebar_action: {
      suggested_key: {
        default: "MacCtrl+Alt+R",
      },
    },
  },
};

export function getManifest(): chrome.runtime.ManifestV2 {
  return {
    author: pkg.author,
    description: pkg.description,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
    manifest_version: 2,
    ...manifest,
  };
}
