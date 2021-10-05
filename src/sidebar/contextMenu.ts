import Tab, { newTab, restoreClosedTab } from "./Tab";
import { containers } from "./sidebar";
import browser from "webextension-polyfill";

export function showTabMenu(tab: Tab) {
	setMenu([
		{ title: "New Tab", onclick: () => newTab({ openerTabId: tab.id }) },
		{ title: "Reopen Closed Tab", onclick: () => restoreClosedTab() },
		{ type: "separator" },
		{ title: "Reload Tab", onclick: () => tab.reload() },
		tab.muted ? { title: "Unmute Tab", onclick: () => tab.unmute() } : { title: "Mute Tab", onclick: () => tab.mute() },
		tab.pinned ? { title: "Unpin Tab", onclick: () => tab.unpin() } : { title: "Pin Tab", onclick: () => tab.pin() },
		{ title: "Duplicate Tab", onclick: () => tab.duplicate() },
		{
			title: "Reopen in Container",
			enabled: !!containers.length && tab.isReopenable,
			children: [
				{
					title: "Default",
					enabled: !!tab.container,
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
		{ title: "Unload Tab", onclick: () => tab.discard(), enabled: tab.discardable },
		{ title: "Bookmark Tab", onclick: () => tab.bookmark() },
		{ type: "separator" },
		{ title: "Close Tab", onclick: () => tab.close() },
	]);
}
document.addEventListener("contextmenu", event => {
	if ((event.target as HTMLElement).closest(".tab")) return;
	setMenu([
		{ title: "New Tab", onclick: () => newTab() },
		{ title: "Reopen Closed Tab", onclick: () => restoreClosedTab() },
		{ type: "separator" },
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
