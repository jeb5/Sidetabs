import React from "react";
import browser from "webextension-polyfill";

export const ctxMenuItems = {
	reload: "Reload Tab",
	mute: "Mute Tab",
	pin: "Pin Tab",
	duplicate: "Duplicate Tab",
	reopen: "Reopen in Container",
	unload: "Unload Tab",
	bookmark: "Bookmark Tab",
	clearCookies: "Clear Site Cookies",
	clearLocalStorage: "Clear Site Storage",
	clearData: "Clear all Site Data",
};
export type ctxMenuOption = keyof typeof ctxMenuItems;

export interface OptionForm {
	"appearance/pinnedTabsAsIcons": boolean;
	"appearance/newTabButton": boolean;
	"behavior/middleClickClose": boolean;
	"behavior/scrollToActiveTab": boolean;
	"behavior/tabtooltip": boolean;
	"theme/mode": "light" | "dark" | "custom";
	"theme/showPrimaryImage": boolean;
	"theme/showAdditionalImages": boolean;
	"ctxMenu/showIcons": boolean;
	"ctxMenu/menuItems": ctxMenuOption[];
	"ctxMenu/showCloseOption": boolean;
	"ctxMenu/showSidetabsOptions": boolean;
	"ctxMenu/showNewTabInContainer": boolean;
	"autohiding/autohide": boolean;
	"autohiding/expanding": boolean;
	"autohiding/sidebarwidth": number;
	"autohiding/debounceDelay": number;
	"hiddenElements/tabs": boolean;
	"hiddenElements/sidebarHeader": boolean;
	"hiddenElements/titleBar": boolean;
}

export const SettingsDefault: OptionForm = {
	"appearance/pinnedTabsAsIcons": false,
	"appearance/newTabButton": true,
	"behavior/middleClickClose": true,
	"behavior/scrollToActiveTab": true,
	"behavior/tabtooltip": false,
	"theme/mode": "custom",
	"theme/showPrimaryImage": true,
	"theme/showAdditionalImages": false,
	"ctxMenu/showIcons": true,
	"ctxMenu/menuItems": ["reload", "mute", "pin", "duplicate", "reopen", "bookmark", "clearData"],
	"ctxMenu/showCloseOption": true,
	"ctxMenu/showSidetabsOptions": true,
	"ctxMenu/showNewTabInContainer": false,
	"autohiding/autohide": false,
	"autohiding/expanding": true,
	"autohiding/sidebarwidth": 190,
	"autohiding/debounceDelay": 150,
	"hiddenElements/tabs": false,
	"hiddenElements/sidebarHeader": false,
	"hiddenElements/titleBar": false,
};

/*
TODO: Implement New Pinned Tabs Option
*/

export async function getOption(key: keyof OptionForm): Promise<string | boolean | number | string[]> {
	return ((await browser.storage.local.get(key)) as string | boolean | number | string[]) || SettingsDefault[key];
}
export async function setOption(key: string, value: any) {
	return await browser.storage.local.set({ [key]: value });
}
export async function getAllOptions() {
	return (await browser.storage.sync.get(SettingsDefault)) as OptionForm;
}
export async function setAllOptions(options: OptionForm) {
	await browser.storage.sync.set(options);
}

//Options Provider

export const OptionsContext = React.createContext(SettingsDefault);

export function OptionsProvider(props: { children: React.ReactNode }) {
	const [options, setOptions] = React.useState(SettingsDefault);

	React.useEffect(() => {
		async function updateOptions() {
			setOptions(await getAllOptions());
		}
		const storageChangeListener = async (changes: any, areaName: string) => {
			if (areaName === "sync") updateOptions();
		};
		browser.storage.onChanged.addListener(storageChangeListener);
		updateOptions();
		return () => browser.storage.onChanged.removeListener(storageChangeListener);
	}, [setOptions]);

	return <OptionsContext.Provider value={options}>{props.children}</OptionsContext.Provider>;
}
