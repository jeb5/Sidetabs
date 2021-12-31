import browser from "webextension-polyfill";
import { containers } from "./containers";

function Wrapper<T extends object>(): new (init: T) => T {
	return class {
		constructor(init: T) {
			Object.assign(this, init);
		}
	} as any;
}
export default class Tab extends Wrapper<browser.Tabs.Tab>() {
	constructor(tabData: browser.Tabs.Tab) {
		super(tabData);
		this.activate = this.activate;
		this.close = this.close;
		this.reload = this.reload;
		this.mute = this.mute;
		this.unmute = this.unmute;
		this.duplicate = this.duplicate;
		this.pin = this.pin;
		this.unpin = this.unpin;
		this.bookmark = this.bookmark;
		this.discard = this.discard;
		this.reopenWithCookieStoreId = this.reopenWithCookieStoreId;
		this.getDiscardable = this.getDiscardable;
		this.getReopenable = this.getReopenable;
		this.getContainer = this.getContainer;
		this.getLoading = this.getLoading;
		this.getMuted = this.getMuted;
	}
	getDiscardable() {
		return !this.active && !this.discarded;
	}
	getMuted() {
		return this.mutedInfo?.muted;
	}
	getReopenable() {
		const { protocol } = new URL(this.url || "");
		return protocol === "http:" || protocol === "https:" || this.url === "about:newtab";
	}
	getContainer() {
		return containers.find(({ cookieStoreId }) => cookieStoreId === this.cookieStoreId);
	}
	getLoading() {
		return this.status === "loading";
	}
	async activate() {
		await browser.tabs.update(this.id!, { active: true });
	}
	async close() {
		await browser.tabs.remove(this.id!);
	}
	async reload() {
		await browser.tabs.reload(this.id!);
	}
	async discard() {
		await browser.tabs.discard(this.id!);
	}
	async reopenWithCookieStoreId(cookieStoreId?: string) {
		await browser.tabs.create({
			active: this.active,
			...(cookieStoreId ? { cookieStoreId } : {}),
			discarded: this.discarded,
			...(this.discarded ? { title: this.title } : {}),
			index: this.index,
			openerTabId: this.openerTabId,
			openInReaderMode: this.isInReaderMode,
			pinned: this.pinned,
			...(this.url !== "about:newtab" ? { url: this.url } : {}),
		});
		await this.close();
	}
	async mute() {
		await browser.tabs.update(this.id!, { muted: true });
	}
	async unmute() {
		await browser.tabs.update(this.id!, { muted: false });
	}
	async pin() {
		await browser.tabs.update(this.id!, { pinned: true });
	}
	async unpin() {
		await browser.tabs.update(this.id!, { pinned: false });
	}
	async duplicate() {
		await browser.tabs.duplicate(this.id!);
	}
	async bookmark() {
		await browser.bookmarks.create({
			title: this.title,
			url: this.url,
		});
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

export async function newTab(createOptions = {}) {
	return await browser.tabs.create(createOptions);
}
