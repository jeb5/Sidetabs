import { containers } from "../sidebar/containers";
import tabMethods, { Tab, newTab, restoreClosedTab } from "../sidebar/Tab";
import browser from "webextension-polyfill";
import ctxIcons from "./ctxmenuIcons";
export function showTabMenu(tab: Tab) {
	setMenu([
		{
			title: "New Tab",
			onclick: () => newTab({ openerTabId: tab.id }),
			icons: ctxIcons.newTab,
		},
		{ title: "Reopen Closed Tab", onclick: () => restoreClosedTab(), icons: ctxIcons.reopenTab },
		{ type: "separator" },
		{ title: "Reload Tab", onclick: () => tabMethods.reload(tab), icons: ctxIcons.reloadTab },
		tab.mutedInfo?.muted
			? { title: "Unmute Tab", onclick: () => tabMethods.unmute(tab), icons: ctxIcons.unmuteTab }
			: { title: "Mute Tab", onclick: () => tabMethods.mute(tab), icons: ctxIcons.muteTab },
		tab.pinned
			? { title: "Unpin Tab", onclick: () => tabMethods.unpin(tab), icons: ctxIcons.unpinTab }
			: { title: "Pin Tab", onclick: () => tabMethods.pin(tab), icons: ctxIcons.pinTab },
		{ title: "Duplicate Tab", onclick: () => tabMethods.duplicate(tab), icons: ctxIcons.duplicateTab },
		{
			title: "Reopen in Container",
			enabled: !!containers.length && tabMethods.getReopenable(tab),
			children: [
				{
					title: "Default",
					enabled: !(!tab.cookieStoreId || tab.cookieStoreId === "firefox-default"),
					onclick: () => tabMethods.reopenWithCookieStoreId(tab),
				},
				...containers.map(container => ({
					title: container.name,
					icons: { 16: container.iconUrl },
					enabled: container.cookieStoreId != tab.cookieStoreId,
					onclick: () => tabMethods.reopenWithCookieStoreId(tab, container.cookieStoreId),
				})),
			],
		},
		{
			title: "Unload Tab",
			onclick: () => tabMethods.discard(tab),
			enabled: tabMethods.getDiscardable(tab),
			icons: ctxIcons.unloadTab,
		},
		{ title: "Bookmark Tab", onclick: () => tabMethods.bookmark(tab), icons: ctxIcons.bookmarkTab },
		{ type: "separator" },
		{ title: "Close Tab", onclick: () => tabMethods.close(tab), icons: ctxIcons.closeTab },
	]);
}
document.addEventListener("contextmenu", event => {
	if ((event.target as HTMLElement).closest(".tab")) return;
	setMenu([
		{ title: "New Tab", onclick: () => newTab(), icons: ctxIcons.newTab },
		{ title: "Reopen Closed Tab", onclick: () => restoreClosedTab(), icons: ctxIcons.reopenTab },
	]);
});

interface MenuStructure extends browser.Menus.CreateCreatePropertiesType {
	children?: MenuStructure[];
}
function setMenu(structure: MenuStructure[]) {
	browser.menus.overrideContext({ showDefaults: false });
	browser.menus.removeAll();
	for (const contextObj of structure) createContext(contextObj);
}
function createContext(menu: MenuStructure, parentId?: string | number) {
	const { children, ...createProps } = menu;
	if (parentId != undefined) createProps.parentId = parentId;
	const id = browser.menus.create({
		contexts: ["all"],
		viewTypes: ["sidebar"],
		...createProps,
	});
	for (const childContextObj of children || []) createContext(childContextObj, id);
}
