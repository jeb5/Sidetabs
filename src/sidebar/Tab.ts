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
		this.activate = this.activate.bind(this);
		this.close = this.close.bind(this);
		this.reload = this.reload.bind(this);
		this.mute = this.mute.bind(this);
		this.unmute = this.unmute.bind(this);
		this.duplicate = this.duplicate.bind(this);
		this.pin = this.pin.bind(this);
		this.unpin = this.unpin.bind(this);
		this.bookmark = this.bookmark.bind(this);
		this.discard = this.discard.bind(this);
		this.reopenWithCookieStoreId = this.reopenWithCookieStoreId.bind(this);
		this.getDiscardable = this.getDiscardable.bind(this);
		this.getReopenable = this.getReopenable.bind(this);
		this.getContainer = this.getContainer.bind(this);
	}
	getDiscardable() {
		return !this.active && !this.discarded;
	}
	getReopenable() {
		const { protocol } = new URL(this.url || "");
		return ["http:", "https:"].indexOf(protocol) != -1 || this.url === "about:newtab";
	}
	getContainer() {
		return containers.find(({ cookieStoreId }) => cookieStoreId === this.cookieStoreId);
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
