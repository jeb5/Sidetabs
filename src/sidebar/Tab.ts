import browser from "webextension-polyfill";
import { containers } from "./containers";

export type Tab = browser.Tabs.Tab;

export default class TabMethods {
	static getDiscardable(tab: Tab) {
		return !tab.active && !tab.discarded;
	}
	static getMuted(tab: Tab) {
		return tab.mutedInfo?.muted;
	}
	static getReopenable(tab: Tab) {
		const { protocol } = new URL(tab.url || "");
		return protocol === "http:" || protocol === "https:" || tab.url === "about:newtab";
	}
	static getContainer(tab: Tab) {
		return containers.find(({ cookieStoreId }) => cookieStoreId === tab.cookieStoreId);
	}
	static getLoading(tab: Tab) {
		return tab.status === "loading";
	}
	static async activate(tab: Tab) {
		await browser.tabs.update(tab.id!, { active: true });
	}
	static warmup(tab: Tab) {
		browser.tabs.warmup(tab.id!);
	}
	static async close(tab: Tab) {
		await browser.tabs.remove(tab.id!);
	}
	static async reload(tab: Tab) {
		await browser.tabs.reload(tab.id!);
	}
	static async discard(tab: Tab) {
		await browser.tabs.discard(tab.id!);
	}
	static async reopenWithCookieStoreId(tab: Tab, cookieStoreId?: string) {
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
	}
	static async mute(tab: Tab) {
		await browser.tabs.update(tab.id!, { muted: true });
	}
	static async unmute(tab: Tab) {
		await browser.tabs.update(tab.id!, { muted: false });
	}
	static async pin(tab: Tab) {
		await browser.tabs.update(tab.id!, { pinned: true });
	}
	static async unpin(tab: Tab) {
		await browser.tabs.update(tab.id!, { pinned: false });
	}
	static async duplicate(tab: Tab) {
		await browser.tabs.duplicate(tab.id!);
	}
	static async bookmark(tab: Tab) {
		await browser.bookmarks.create({
			title: tab.title,
			url: tab.url,
		});
	}

	static getHostname(tab: Tab) {
		return new URL(tab.url || "").hostname;
	}

	static async clearCookies(tab: Tab) {
		if (!(await browser.permissions.request({ origins: ["<all_urls>"] }))) return;
		const cookies = await browser.cookies.getAll({ url: tab.url });
		await Promise.all(cookies.map(({ name }) => browser.cookies.remove({ url: tab.url!, name })));
	}
	static async clearStorage(tab: Tab) {
		const hostname = TabMethods.getHostname(tab);
		if (hostname !== "") await browser.browsingData.removeLocalStorage({ hostnames: [hostname] });
	}
	static async clearCache(tab: Tab) {
		const hostname = TabMethods.getHostname(tab);
		if (hostname !== "") await browser.browsingData.removeCache({ hostnames: [TabMethods.getHostname(tab)] });
	}
	static async clearAllData(tab: Tab) {
		await Promise.all([TabMethods.clearCookies(tab), TabMethods.clearStorage(tab), TabMethods.clearCache(tab)]);
	}
}

export async function restoreClosedTab() {
	const lastClosed = await browser.sessions.getRecentlyClosed();
	if (!lastClosed.length) return;
	const WIN_ID = (await browser.windows.getCurrent()).id!;
	const lastTab = lastClosed.find(event => event.tab && event.tab.windowId === WIN_ID)?.tab;
	if (!lastTab) return;
	return await browser.sessions.restore(lastTab.sessionId);
}

export async function newTab(createOptions: browser.Tabs.CreateCreatePropertiesType = {}) {
	return await browser.tabs.create(createOptions);
}
