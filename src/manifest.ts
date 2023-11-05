import pkg from "../package.json";

export function getManifest(): chrome.runtime.ManifestV2 {
	const manifest: chrome.runtime.ManifestV2 = {
		name: pkg.displayName ?? pkg.name,
		version: pkg.version,
		manifest_version: 2,
		author: pkg.author,
		description: pkg.description,
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
		web_accessible_resources: ["src/entries/welcome/welcome.html"],
		commands: {
			_execute_sidebar_action: {
				suggested_key: {
					default: "MacCtrl+Alt+R",
				},
			},
		},
	};

	return manifest;
}
