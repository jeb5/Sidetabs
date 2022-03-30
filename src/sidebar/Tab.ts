import browser from "webextension-polyfill";
import { containers } from "./containers";

export type Tab = browser.Tabs.Tab;

const tabMethods = {
	getDiscardable: (tab: Tab) => !tab.active && !tab.discarded,
	getMuted: (tab: Tab) => tab.mutedInfo?.muted,
	getReopenable: (tab: Tab) => {
		const { protocol } = new URL(tab.url || "");
		return protocol === "http:" || protocol === "https:" || tab.url === "about:newtab";
	},
	getContainer: (tab: Tab) => containers.find(({ cookieStoreId }) => cookieStoreId === tab.cookieStoreId),
	getLoading: (tab: Tab) => tab.status === "loading",
	activate: (tab: Tab) => browser.tabs.update(tab.id!, { active: true }),
	warmup: (tab: Tab) => browser.tabs.warmup(tab.id!),
	close: (tab: Tab) => browser.tabs.remove(tab.id!),
	reload: (tab: Tab) => browser.tabs.reload(tab.id!),
	discard: (tab: Tab) => browser.tabs.discard(tab.id!),
	reopenWithCookieStoreId: async (tab: Tab, cookieStoreId?: string) => {
		await browser.tabs.create({
			active: tab.active,
			...(cookieStoreId ? { cookieStoreId } : {}),
			discarded: tab.discarded,
			...(tab.discarded ? { title: tab.title } : {}),
			index: tab.index,
			openerTabId: tab.openerTabId,
			openInReaderMode: tab.isInReaderMode,
			pinned: tab.pinned,
			...(tab.url !== "about:newtab" ? { url: tab.url } : {}),
		});
		await browser.tabs.remove(tab.id!);
	},
	mute: async (tab: Tab) => browser.tabs.update(tab.id!, { muted: true }),
	unmute: async (tab: Tab) => browser.tabs.update(tab.id!, { muted: false }),
	pin: async (tab: Tab) => browser.tabs.update(tab.id!, { pinned: true }),
	unpin: async (tab: Tab) => browser.tabs.update(tab.id!, { pinned: false }),
	duplicate: async (tab: Tab) => browser.tabs.duplicate(tab.id!),
	bookmark: async (tab: Tab) =>
		browser.bookmarks.create({
			title: tab.title,
			url: tab.url,
		}),
};

export default tabMethods;

export async function restoreClosedTab() {
	const lastClosed = await browser.sessions.getRecentlyClosed();
	if (!lastClosed.length) return;
	const WIN_ID = (await browser.windows.getCurrent()).id!;
	const lastTab = lastClosed.find(event => event.tab && event.tab.windowId === WIN_ID)?.tab;
	if (!lastTab) return;
	return await browser.sessions.restore(lastTab.sessionId);
}

export async function newTab(createOptions = {}) {
	return await browser.tabs.create(createOptions);
}
