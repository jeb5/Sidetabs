import browser from "webextension-polyfill";
import { containers } from "./containers";
import { Tab } from "./TabManager";


export function getDiscardable(tab: Tab) {
		return !tab.active && !tab.discarded;
	}
export function getMuted(tab: Tab) {
		return tab.mutedInfo?.muted;
	}
export function getReopenable(tab: Tab) {
		const { protocol } = new URL(tab.url || "");
		return protocol === "http:" || protocol === "https:" || tab.url === "about:newtab";
	}
export function getContainer(tab: Tab) {
		return containers.find(({ cookieStoreId }) => cookieStoreId === tab.cookieStoreId);
	}
export function getLoading(tab: Tab) {
		return tab.status === "loading";
	}
export async function activate(tab: Tab) {
		await browser.tabs.update(tab.id!, { active: true });
	}
export function warmup(tab: Tab) {
		browser.tabs.warmup(tab.id!);
	}
export async function close(tab: Tab) {
		await browser.tabs.remove(tab.id!);
	}
export async function reload(tab: Tab) {
		await browser.tabs.reload(tab.id!);
	}
export async function discard(tab: Tab) {
		await browser.tabs.discard(tab.id!);
	}
export async function reopenWithCookieStoreId(tab: Tab, cookieStoreId?: string) {
		await browser.tabs.create({
			active: tab.active,
			...(cookieStoreId && { cookieStoreId }),
			discarded: tab.discarded,
			...(tab.discarded && { title: tab.title }),
			index: tab.index,
			openerTabId: tab.openerTabId,
			openInReaderMode: tab.isInReaderMode,
			pinned: tab.pinned,
			...(tab.url !== "about:newtab" && { url: tab.url }),
		});
		await browser.tabs.remove(tab.id!);
	}
export async function mute(tab: Tab) {
		await browser.tabs.update(tab.id!, { muted: true });
	}
export async function unmute(tab: Tab) {
		await browser.tabs.update(tab.id!, { muted: false });
	}
export async function pin(tab: Tab) {
		await browser.tabs.update(tab.id!, { pinned: true });
	}
export async function unpin(tab: Tab) {
		await browser.tabs.update(tab.id!, { pinned: false });
	}
export async function duplicate(tab: Tab) {
		await browser.tabs.duplicate(tab.id!);
	}
export async function bookmark(tab: Tab) {
		await browser.bookmarks.create({
			title: tab.title,
			url: tab.url,
		});
	}

export function getHostname(tab: Tab) {
		return new URL(tab.url || "").hostname;
	}

export async function clearCookies(tab: Tab) {
		if (!(await browser.permissions.request({ origins: ["<all_urls>"] }))) return;
		const cookies = await browser.cookies.getAll({ url: tab.url });
		await Promise.all(cookies.map(({ name }) => browser.cookies.remove({ url: tab.url!, name })));
	}
export async function clearStorage(tab: Tab) {
	const hostname = getHostname(tab);
		if (hostname !== "") await browser.browsingData.removeLocalStorage({ hostnames: [hostname] });
	}
export async function clearCache(tab: Tab) {
	const hostname = getHostname(tab);
	if (hostname !== "") await browser.browsingData.removeCache({ hostnames: [getHostname(tab)] });
	}
export async function clearAllData(tab: Tab) {
	await Promise.all([clearCookies(tab), clearStorage(tab), clearCache(tab)]);
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

export async function moveTab(tabId: number, toIndex: number) {
	await browser.tabs.move(tabId, { index: toIndex });
}