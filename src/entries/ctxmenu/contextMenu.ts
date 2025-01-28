import { containers } from "../sidebar/containers";
import * as TabMethods from "../sidebar/Tab";
import { Tab, TabManagerContext, TabManagerContextType } from "../sidebar/TabManager";
import browser from "webextension-polyfill";
import ctxIcons from "./ctxmenuIcons";
import React, { useContext } from "react";
import { ctxMenuOption, OptionForm, OptionsContext } from "../options";
import { ThemeContext } from "../theme/themesHandler";

//Returns the MenuStructure array for a tab-relevant context menu
function tabMenuItems(iconsColor: "black" | "white", tabs: Tab[], options: OptionForm, tabManagerContext: TabManagerContextType): MenuStructure[] {
	const coloredIcons = ctxIcons[iconsColor];
	if (tabs.length === 0) return [];
	const multiple = tabs.length > 1;
	const ctxMenuItems: {
		[key in ctxMenuOption | "close"]: MenuStructure;
	} = {
		addToGroup: {
			title: "Add to Group",
			children: [
				{
					title: "New Group",
					onclick: () => tabManagerContext.tabManager.addNewGroup(tabs),
				},
				...(
					tabManagerContext.groups.map(group => ({
						title: group.title,
						enabled: tabs.some(tab => tab.groupId != group.id),
						onclick: () => tabManagerContext.tabManager.addTabsToGroup(group.id, tabs)
					}))
				)
			]
		},
		reload: {
			title: multiple ? "Reload Tabs" : "Reload Tab",
			onclick: () => TabMethods.reload(tabs),
			icons: coloredIcons.reloadTab,
		},
		mute: tabs[0].mutedInfo?.muted
			? {
				title: multiple ? "Unmute Tabs" : "Unmute Tab",
				onclick: () => TabMethods.unmute(tabs),
					icons: coloredIcons.unmuteTab,
			  }
			: {
				title: multiple ? "Mute Tabs" : "Mute Tab",
				onclick: () => TabMethods.mute(tabs),
					icons: coloredIcons.muteTab,
			  },
		pin: tabs[tabs.length - 1].pinned
			? {
				title: multiple ? "Unpin Tabs" : "Unpin Tab",
				onclick: () => TabMethods.unpin(tabs),
					icons: coloredIcons.unpinTab,
			  }
			: {
				title: multiple ? "Pin Tabs" : "Pin Tab",
				onclick: () => TabMethods.pin(tabs),
					icons: coloredIcons.pinTab,
			  },
		duplicate: {
			title: multiple ? "Duplicate Tabs" : "Duplicate Tab",
			onclick: () => TabMethods.duplicate(tabs),
			icons: coloredIcons.duplicateTab,
		},
		reopen: {
			title: "Reopen in Container",
			icons: coloredIcons.reopenInContainer,
			enabled: !!containers.length && (multiple || TabMethods.getReopenable(tabs[0])),
			children: [
				{
					title: "Default",
					enabled: tabs.some(tab => tab.cookieStoreId && tab.cookieStoreId !== "firefox-default"),
					onclick: () => TabMethods.reopenWithCookieStoreId(tabs),
				},
				...containers.map((container) => ({
					title: container.name,
					icons: { 16: container.iconB64Colored ?? container.iconUrl },
					enabled: tabs.some(tab => container.cookieStoreId != tab.cookieStoreId),
					onclick: () => TabMethods.reopenWithCookieStoreId(tabs, container.cookieStoreId),
				})),
			],
		},
		unload: {
			title: multiple ? "Unload Tabs" : "Unload Tab",
			onclick: () => TabMethods.discard(tabs),
			enabled: tabs.some(tab => TabMethods.getDiscardable(tab)),
			icons: coloredIcons.unloadTab,
		},
		bookmark: {
			title: multiple ? "Bookmark Tabs" : "Bookmark Tab",
			onclick: () => TabMethods.bookmark(tabs),
			icons: coloredIcons.bookmarkTab,
		},
		clearCookies: {
			title: "Clear Site Cookies",
			onclick: () => {
				TabMethods.clearCookies(tabs);
				TabMethods.reload(tabs);
			},
			icons: coloredIcons.clearCookies,
		},
		clearLocalStorage: {
			title: "Clear Site Storage",
			onclick: () => {
				TabMethods.clearStorage(tabs);
				// TabMethods.reload(tab);
			},
			icons: coloredIcons.clearStorage,
		},
		clearData: {
			title: "Clear all Site Data",
			onclick: () => {
				TabMethods.clearAllData(tabs);
				TabMethods.reload(tabs);
			},
			icons: coloredIcons.clearData,
		},
		close: {
			title: multiple ? "Close Tabs" : "Close Tab",
			onclick: () => TabMethods.close(tabs),
			icons: coloredIcons.closeTab,
		},
	};
	return [
		...options["ctxMenu/menuItems"].map((item) => ctxMenuItems[item]),
		...(options["ctxMenu/showCloseOption"] ? [{ type: "separator" } as MenuStructure, ctxMenuItems.close] : []),
	];
}

//Returns the MenuStructure array for items unrelated to a specific tab
function generalMenuItems(iconsColor: "black" | "white", options: OptionForm, tabs: Tab[]): MenuStructure[] {
	return [
		{
			title: "New Tab",
			onclick: () => TabMethods.newTab(tabs.length > 0 ? { openerTabId: tabs[tabs.length - 1].id } : undefined),
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

export function useContextMenu(tabs?: Tab[]) {
	const options = useContext(OptionsContext);
	const iconsColor = useContext(ThemeContext).dark ? "white" : "black";
	const tabManagerContext = useContext(TabManagerContext)!;
	const showIcons = options["ctxMenu/showIcons"];
	if (tabs) {
		return function showContextMenu(event: React.MouseEvent) {
			event.stopPropagation();
			const menuItems: MenuStructure[] = [
				...generalMenuItems(iconsColor, options, tabs),
				{ type: "separator" },
				...tabMenuItems(iconsColor, tabs, options, tabManagerContext),
			];
			setMenu(menuItems, showIcons);
		};
	} else {
		return function showContextMenu(event: React.MouseEvent) {
			event.stopPropagation();
			const menuItems: MenuStructure[] = [
				...generalMenuItems(iconsColor, options, []),
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
