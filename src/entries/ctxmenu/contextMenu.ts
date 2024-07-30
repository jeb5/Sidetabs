import { containers } from "../sidebar/containers";
import * as TabMethods from "../sidebar/Tab";
import { Tab, TabManagerContext, TabManagerMethods } from "../sidebar/TabManager";
import browser from "webextension-polyfill";
import ctxIcons from "./ctxmenuIcons";
import React, { useContext } from "react";
import { ctxMenuOption, OptionForm, OptionsContext } from "../options";
import { ThemeContext } from "../theme/themesHandler";

//Returns the MenuStructure array for a tab-relevant context menu
function tabMenuItems(iconsColor: "black" | "white", tab: Tab, options: OptionForm, tabManagerMethods: TabManagerMethods): MenuStructure[] {
	const coloredIcons = ctxIcons[iconsColor];
	const ctxMenuItems: {
		[key in ctxMenuOption | "close"]: MenuStructure;
	} = {
		addToGroup: {
			title: "Add to Group",
			children: [
				{
					title: "New Group",
					onclick: () => tabManagerMethods.addNewGroup([tab]),
				}
			]
		},
		reload: {
			title: "Reload Tab",
			onclick: () => TabMethods.reload(tab),
			icons: coloredIcons.reloadTab,
		},
		mute: tab.mutedInfo?.muted
			? {
					title: "Unmute Tab",
					onclick: () => TabMethods.unmute(tab),
					icons: coloredIcons.unmuteTab,
			  }
			: {
					title: "Mute Tab",
					onclick: () => TabMethods.mute(tab),
					icons: coloredIcons.muteTab,
			  },
		pin: tab.pinned
			? {
					title: "Unpin Tab",
					onclick: () => TabMethods.unpin(tab),
					icons: coloredIcons.unpinTab,
			  }
			: {
					title: "Pin Tab",
					onclick: () => TabMethods.pin(tab),
					icons: coloredIcons.pinTab,
			  },
		duplicate: {
			title: "Duplicate Tab",
			onclick: () => TabMethods.duplicate(tab),
			icons: coloredIcons.duplicateTab,
		},
		reopen: {
			title: "Reopen in Container",
			icons: coloredIcons.reopenInContainer,
			enabled: !!containers.length && TabMethods.getReopenable(tab),
			children: [
				{
					title: "Default",
					enabled: !(!tab.cookieStoreId || tab.cookieStoreId === "firefox-default"),
					onclick: () => TabMethods.reopenWithCookieStoreId(tab),
				},
				...containers.map((container) => ({
					title: container.name,
					icons: { 16: container.iconB64Colored ?? container.iconUrl },
					enabled: container.cookieStoreId != tab.cookieStoreId,
					onclick: () => TabMethods.reopenWithCookieStoreId(tab, container.cookieStoreId),
				})),
			],
		},
		unload: {
			title: "Unload Tab",
			onclick: () => TabMethods.discard(tab),
			enabled: TabMethods.getDiscardable(tab),
			icons: coloredIcons.unloadTab,
		},
		bookmark: {
			title: "Bookmark Tab",
			onclick: () => TabMethods.bookmark(tab),
			icons: coloredIcons.bookmarkTab,
		},
		clearCookies: {
			title: "Clear Site Cookies",
			onclick: () => {
				TabMethods.clearCookies(tab);
				TabMethods.reload(tab);
			},
			icons: coloredIcons.clearCookies,
		},
		clearLocalStorage: {
			title: "Clear Site Storage",
			onclick: () => {
				TabMethods.clearStorage(tab);
				// TabMethods.reload(tab);
			},
			icons: coloredIcons.clearStorage,
		},
		clearData: {
			title: "Clear all Site Data",
			onclick: () => {
				TabMethods.clearAllData(tab);
				TabMethods.reload(tab);
			},
			icons: coloredIcons.clearData,
		},
		close: {
			title: "Close Tab",
			onclick: () => TabMethods.close(tab),
			icons: coloredIcons.closeTab,
		},
	};
	return [
		...options["ctxMenu/menuItems"].map((item) => ctxMenuItems[item]),
		...(options["ctxMenu/showCloseOption"] ? [{ type: "separator" } as MenuStructure, ctxMenuItems.close] : []),
	];
}

//Returns the MenuStructure array for items unrelated to a specific tab
function generalMenuItems(iconsColor: "black" | "white", options: OptionForm, tab?: Tab): MenuStructure[] {
	return [
		{
			title: "New Tab",
			onclick: () => TabMethods.newTab(tab ? { openerTabId: tab.id } : undefined),
			icons: ctxIcons[iconsColor].newTab,
		},
		...(options["ctxMenu/showNewTabInContainer"] ? [{
			title: "New Container Tab",
			enabled: !!containers.length,
			icons: ctxIcons[iconsColor].newContainer,
			children:
				containers.map((container) => ({
					title: container.name,
					icons: { 16: container.iconB64Colored ?? container.iconUrl },
					onclick: () => TabMethods.newTab({ cookieStoreId: container.cookieStoreId }),
				})),
		}] : []),
		{
			title: "Reopen Closed Tab",
			onclick: () => TabMethods.restoreClosedTab(),
			icons: ctxIcons[iconsColor].reopenTab,
		}
	];
}

interface MenuStructure extends browser.Menus.CreateCreatePropertiesType {
	children?: MenuStructure[];
}
function setMenu(structure: MenuStructure[], showIcons: boolean = false) {
	browser.menus.overrideContext({ showDefaults: false });
	browser.menus.removeAll();
	for (const contextObj of structure) createContext(contextObj, showIcons);
}
function createContext(menu: MenuStructure, showIcons: boolean = false, parentId?: string | number) {
	const { children, icons, ...createProps } = menu;
	if (parentId != undefined) createProps.parentId = parentId;
	const id = browser.menus.create({
		contexts: ["all"],
		viewTypes: ["sidebar"],
		...createProps,
		...(showIcons && { icons }),
	});
	for (const childContextObj of children || []) createContext(childContextObj, showIcons, id);
}

export function useContextMenu(tab?: Tab) {
	const options = useContext(OptionsContext);
	const iconsColor = useContext(ThemeContext).dark ? "white" : "black";
	const { tabManagerMethods } = useContext(TabManagerContext)!;
	const showIcons = options["ctxMenu/showIcons"];
	if (tab) {
		return function showContextMenu(event: React.MouseEvent) {
			event.stopPropagation();
			const menuItems: MenuStructure[] = [
				...generalMenuItems(iconsColor, options, tab),
				{ type: "separator" },
				...tabMenuItems(iconsColor, tab, options, tabManagerMethods),
			];
			setMenu(menuItems, showIcons);
		};
	} else {
		return function showContextMenu(event: React.MouseEvent) {
			event.stopPropagation();
			const menuItems: MenuStructure[] = [
				...generalMenuItems(iconsColor, options),
				...(options["ctxMenu/showSidetabsOptions"]
					? [
							{ type: "separator" } as MenuStructure,
							{
								title: "Sidetabs Settings",
								onclick: () => browser.runtime.openOptionsPage(),
								icons: ctxIcons[iconsColor].options,
							},
					  ]
					: []),
			];
			setMenu(menuItems, showIcons);
		};
	}
}
