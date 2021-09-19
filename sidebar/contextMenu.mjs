import { newTab } from "./Tab.mjs";
export function showTabMenu(tab) {
	setMenu([
		{ title: "New Tab", onclick: () => newTab({ openerTabId: tab.id }) },
		{ type: "separator" },
		{ title: "Reload Tab", onclick: () => tab.reload() },
		tab.muted ? { title: "Unmute Tab", onclick: () => tab.unmute() } : { title: "Mute Tab", onclick: () => tab.mute() },
		tab.pinned ? { title: "Unpin Tab", onclick: () => tab.unpin() } : { title: "Pin Tab", onclick: () => tab.pin() },
		{ title: "Duplicate Tab", onclick: () => tab.duplicate() },
	]);
}
document.addEventListener("contextmenu", event => {
	if (event.target.closest(".tab")) return;
	setMenu([
		{
			title: "New Tab",
			onclick: () => newTab(),
		},
		{
			type: "separator",
		},
	]);
});
function setMenu(structure) {
	browser.menus.overrideContext({ showDefaults: false });
	browser.menus.removeAll();
	for (const contextObj of structure) createContext(contextObj);
}
function createContext(contextObj, parentId = null) {
	const { children, ...createProps } = contextObj;
	if (parentId != null) createProps.parentId = parentId;
	const id = browser.menus.create({
		contexts: ["all"],
		viewTypes: ["sidebar"],
		...createProps,
	});
	for (const childContextObj of contextObj.children || []) createContext(childContextObj, id);
}
