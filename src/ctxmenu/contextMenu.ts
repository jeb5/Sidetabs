import { containers } from "../sidebar/containers";
import Tab, { newTab, restoreClosedTab } from "../sidebar/Tab";
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
		{ title: "Reload Tab", onclick: () => tab.reload(), icons: ctxIcons.reloadTab },
		tab.mutedInfo?.muted
			? { title: "Unmute Tab", onclick: () => tab.unmute(), icons: ctxIcons.unmuteTab }
			: { title: "Mute Tab", onclick: () => tab.mute(), icons: ctxIcons.muteTab },
		tab.pinned
			? { title: "Unpin Tab", onclick: () => tab.unpin(), icons: ctxIcons.unpinTab }
			: { title: "Pin Tab", onclick: () => tab.pin(), icons: ctxIcons.pinTab },
		{ title: "Duplicate Tab", onclick: () => tab.duplicate(), icons: ctxIcons.duplicateTab },
		{
			title: "Reopen in Container",
			enabled: !!containers.length && tab.getReopenable(),
			children: [
				{
					title: "Default",
					enabled: !(!tab.cookieStoreId || tab.cookieStoreId === "firefox-default"),
					onclick: () => tab.reopenWithCookieStoreId(),
				},
				...containers.map(container => ({
					title: container.name,
					icons: { 16: container.iconUrl },
					enabled: container.cookieStoreId != tab.cookieStoreId,
					onclick: () => tab.reopenWithCookieStoreId(container.cookieStoreId),
				})),
			],
		},
		{ title: "Unload Tab", onclick: () => tab.discard(), enabled: tab.getDiscardable(), icons: ctxIcons.unloadTab },
		{ title: "Bookmark Tab", onclick: () => tab.bookmark(), icons: ctxIcons.bookmarkTab },
		{ type: "separator" },
		{ title: "Close Tab", onclick: () => tab.close(), icons: ctxIcons.closeTab },
	]);
}
document.addEventListener("contextmenu", event => {
	if ((event.target as HTMLElement).closest(".tab")) return;
	setMenu([
		{ title: "New Tab", onclick: () => newTab() },
		{ title: "Reopen Closed Tab", onclick: () => restoreClosedTab() },
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
