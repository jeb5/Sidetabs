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
	await browser.tabs.highlight({ tabs: tab.index });
}
export function warmup(tab: Tab) {
	browser.tabs.warmup(tab.id!);
}
export async function close(tabs: Tab[]) {
	await browser.tabs.remove(tabs.map(tab => tab.id!));
}
export async function reload(tabs: Tab[]) {
	await Promise.all(tabs.map(tab => browser.tabs.reload(tab.id!)))
}
export async function discard(tabs: Tab[]) {
	await browser.tabs.discard(tabs.map(tab => tab.id!));
}
export async function reopenWithCookieStoreId(tabs: Tab[], cookieStoreId?: string) {
	//TODO: Support for groups??
	for (const tab of tabs) {
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
}
export async function mute(tabs: Tab[]) {
	await Promise.all(tabs.map(tab => browser.tabs.update(tab.id!, { muted: true })))
}
export async function unmute(tabs: Tab[]) {
	await Promise.all(tabs.map(tab => browser.tabs.update(tab.id!, { muted: false })))
}
export async function pin(tabs: Tab[]) {
	await Promise.all(tabs.map(tab => browser.tabs.update(tab.id!, { pinned: true })))
}
export async function unpin(tabs: Tab[]) {
	await Promise.all(tabs.map(tab => browser.tabs.update(tab.id!, { pinned: false })))
}
export async function duplicate(tabs: Tab[]) {
	await Promise.all(tabs.map(tab => browser.tabs.duplicate(tab.id!)));
}
export async function bookmark(tabs: Tab[]) {
	await Promise.all(tabs.map(tab =>
		browser.bookmarks.create({
			title: tab.title,
			url: tab.url,
		})
	))
}

export function getHostname(tab: Tab) {
	return new URL(tab.url || "").hostname;
}

export async function clearCookies(tabs: Tab[]) {
	if (!(await browser.permissions.request({ origins: ["<all_urls>"] }))) return;
	await Promise.all(tabs.map(async (tab) => {
		const cookies = await browser.cookies.getAll({ url: tab.url });
		await Promise.all(cookies.map(({ name }) => browser.cookies.remove({ url: tab.url!, name })));
	}));
}
export async function clearStorage(tabs: Tab[]) {
	const hostnames = tabs.map(tab => getHostname(tab)).filter(hostname => hostname !== "");
	if (hostnames.length > 0) await browser.browsingData.removeLocalStorage({ hostnames });
}
export async function clearCache(tabs: Tab[]) {
	const hostnames = tabs.map(tab => getHostname(tab)).filter(hostname => hostname !== "");
	if (hostnames.length > 0) await browser.browsingData.removeCache({ hostnames });
}
export async function clearAllData(tabs: Tab[]) {
	await Promise.all([clearCookies(tabs), clearStorage(tabs), clearCache(tabs)]);
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