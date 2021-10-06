import { WIN_ID, containers } from "./sidebar";
import { showTabMenu } from "./contextMenu";
import browser from "webextension-polyfill";

const CLOSE_ICON = browser.runtime.getURL("assets/close.svg");
const DEFAULT_ICON = browser.runtime.getURL("assets/firefox-glyph.svg");

const tabsDiv = document.getElementById("tabsDiv") as HTMLElement;
const pinnedTabsDiv = document.getElementById("pinnedTabsDiv") as HTMLElement;
let tabOrder: number[] = []; //All unpinned tab ids in the current window, sorted by index
let pinnedTabOrder: number[] = []; //All pinned tab ids in the current window, sorted by index

export default class Tab {
	id: number;
	tabEl: HTMLElement;
	titleEl: HTMLElement;
	faviconEl: HTMLImageElement;
	containerIndicatorEl: HTMLElement;
	belongingDiv: HTMLElement;
	belongingOrder: number[];

	pinned!: boolean;
	title!: string;
	favIconUrl!: string;
	active!: boolean;
	cookieStoreId!: string;
	status!: "loading" | "complete";
	loadTimeout!: ReturnType<typeof setTimeout>;
	muted!: boolean;
	url!: string;
	discarded!: boolean;

	constructor(rawTab: browser.Tabs.Tab) {
		this.id = rawTab.id || -1;
		const { tabEl, titleEl, faviconEl, containerIndicatorEl } = this.createTabEl();
		[this.tabEl, this.titleEl, this.faviconEl, this.containerIndicatorEl] = [
			tabEl,
			titleEl,
			faviconEl,
			containerIndicatorEl,
		];

		const pinned = rawTab.pinned;
		const index = pinned ? rawTab.index : rawTab.index - pinnedTabOrder.length;
		this.belongingDiv = pinned ? pinnedTabsDiv : tabsDiv;
		this.belongingOrder = pinned ? pinnedTabOrder : tabOrder;
		this.belongingOrder.splice(index, 0, this.id);
		this.belongingDiv.insertBefore(tabEl, tabsDiv.children[index]);
		this.updated(rawTab);
	}
	get index(): number {
		return this.belongingOrder.indexOf(this.id);
	}
	get browserIndex(): number {
		return this.pinned ? this.index : this.index + pinnedTabOrder.length;
	}
	get container() {
		const container = containers.find(e => e.cookieStoreId === this.cookieStoreId);
		return container || null;
	}
	updated(changeInfo: object) {
		const handlers: { [change: string]: (newValue: any) => void } = {
			title: newValue => {
				this.title = newValue;
				this.titleEl.innerText = this.title;
			},
			favIconUrl: newValue => {
				if (newValue && !newValue.startsWith("chrome://")) {
					this.favIconUrl = newValue;
				} else {
					this.favIconUrl = DEFAULT_ICON;
				}
				this.faviconEl.src = this.favIconUrl;
			},
			active: newValue => {
				this.active = newValue;
				this.tabEl.classList.toggle("activeTab", this.active);
			},
			cookieStoreId: newValue => {
				this.cookieStoreId = newValue;
				if (this.container) this.containerIndicatorEl.style.backgroundColor = this.container.colorCode;
			},
			status: newValue => {
				const loading = newValue == "loading"; //Status is either "loading" or "complete"
				this.tabEl.classList.toggle("loading", loading);
				if (this.status == "loading" && !loading) {
					this.tabEl.classList.add("finishLoad");
					if (this.loadTimeout) clearTimeout(this.loadTimeout);
					this.loadTimeout = setTimeout(() => this.tabEl.classList.remove("finishLoad"), 500);
				}
				this.status = newValue;
			},
			mutedInfo: newValue => (this.muted = newValue.muted),
			pinned: newValue => {
				if (this.pinned === newValue) return;
				this.pinned = newValue;
				this.movePinned(newValue);
			},
			url: newValue => (this.url = newValue),
			discarded: newValue => {
				this.discarded = newValue;
				this.tabEl.classList.toggle("discarded", this.discarded);
			},
		};
		for (const [keyChanged, newValue] of Object.entries(changeInfo)) {
			if (keyChanged in handlers) handlers[keyChanged](newValue);
		}
	}
	async movePinned(pinning: boolean) {
		const newIndex = (await browser.tabs.get(this.id)).index;
		if (pinning) {
			//unpinned -> pinned
			this.belongingDiv = pinnedTabsDiv;
			this.belongingOrder.splice(this.index, 1); //removes
			this.belongingOrder = pinnedTabOrder;
			this.belongingOrder.splice(newIndex, 0, this.id); //adds
		} else {
			//pinned -> unpinned
			this.belongingDiv = tabsDiv;
			this.belongingOrder.splice(this.index, 1); //removes
			this.belongingOrder = tabOrder;
			this.belongingOrder.splice(newIndex - pinnedTabOrder.length, 0, this.id); //adds
		}
		this.belongingDiv.insertBefore(this.tabEl, this.belongingDiv.children[this.index]);
	}
	moved(toIndex: number) {
		//When move event is fired, this.pinned may be outdated, as move events are fired before onUpdated events. Therefore, the index that the tab is moving to may not be a possible index to move to.
		//When pinned or unpinned, movedPinned() will handle move

		const newIndex = this.pinned ? toIndex : toIndex - pinnedTabOrder.length;
		if (newIndex < 0 || newIndex >= this.belongingOrder.length) return; //Tab has probably been pinned or unpinned
		if (this.index === newIndex) return;

		if (newIndex < this.index) {
			this.belongingDiv.insertBefore(this.tabEl, this.belongingDiv.children[newIndex]);
		} else {
			this.belongingDiv.insertBefore(this.tabEl, this.belongingDiv.children[newIndex].nextSibling);
			//acts like insertAfter. If .nextSibling is null (end of list), .insertBefore *will* place at end
		}
		this.belongingOrder.splice(this.index, 1); //removes
		this.belongingOrder.splice(newIndex, 0, this.id);
	}
	removeTab() {
		this.belongingDiv.removeChild(this.tabEl);
		this.belongingOrder.splice(this.index, 1); //removes
	}
	async reload() {
		return await browser.tabs.reload(this.id);
	}
	async mute() {
		return await browser.tabs.update(this.id, { muted: true });
	}
	async unmute() {
		return await browser.tabs.update(this.id, { muted: false });
	}
	async duplicate() {
		return await browser.tabs.duplicate(this.id);
	}
	async pin() {
		return await browser.tabs.update(this.id, { pinned: true });
	}
	async unpin() {
		return await browser.tabs.update(this.id, { pinned: false });
	}
	async bookmark() {
		return await browser.bookmarks.create({ title: this.title, url: this.url });
	}
	async close() {
		return await browser.tabs.remove(this.id);
	}
	async discard() {
		await browser.tabs.discard(this.id);
	}
	async reopenWithCookieStoreId(cookieStoreId?: string) {
		await browser.tabs.create({
			active: this.active,
			...(cookieStoreId ? { cookieStoreId } : {}),
			discarded: this.discarded,
			...(this.discarded ? { title: this.title } : {}),
			index: this.browserIndex,
			pinned: this.pinned,
			...(this.url !== "about:newtab" ? { url: this.url } : {}),
		});
		await this.close();
	}

	get discardable() {
		return !this.discarded && !this.active;
	}
	get isReopenable() {
		const { protocol } = new URL(this.url);
		return ["http:", "https:"].indexOf(protocol) != -1 || this.url === "about:newtab";
	}
	createTabEl() {
		const tabEl = document.createElement("div");
		const containerIndicatorEl = document.createElement("div");
		tabEl.appendChild(containerIndicatorEl);
		const faviconEl = document.createElement("img");
		tabEl.appendChild(faviconEl);
		const titleEl = document.createElement("div");
		tabEl.appendChild(titleEl);
		const tabCloseBtn = document.createElement("img");
		tabEl.appendChild(tabCloseBtn);

		tabEl.addEventListener("click", async () => {
			await browser.tabs.update(this.id, { active: true });
		});
		tabEl.addEventListener("contextmenu", () => showTabMenu(this));
		tabEl.draggable = true;
		tabEl.addEventListener("dragstart", (e: DragEvent) => {
			if (!e.dataTransfer) return;
			e.dataTransfer.setData("text/x-moz-url", `${this.url}\n${this.title}`);
			e.dataTransfer.setData("text/uri-list", this.url);
			e.dataTransfer.setData("text/plain", this.url);
			e.dataTransfer.effectAllowed = "copyMove";
			e.dataTransfer.setDragImage(document.getElementById("invisibleDragImage") as HTMLElement, 0, 0);
		});
		tabEl.classList.add("tab");

		titleEl.classList.add("tabText");

		tabCloseBtn.classList.add("tabCloseBtn");
		tabCloseBtn.src = CLOSE_ICON;
		tabCloseBtn.addEventListener("click", async e => {
			e.stopPropagation();
			this.close();
		});
		containerIndicatorEl.classList.add("containerIndicator");

		faviconEl.classList.add("tabIcon");
		faviconEl.src = DEFAULT_ICON;

		return { tabEl, titleEl, faviconEl, containerIndicatorEl };
	}
}
export async function newTab(createOptions = {}) {
	return await browser.tabs.create(createOptions);
}
export async function restoreClosedTab() {
	const lastClosed = await browser.sessions.getRecentlyClosed();
	if (!lastClosed.length) return;
	const lastTab = lastClosed.find(e => e.tab && e.tab.windowId === WIN_ID)?.tab;
	if (!lastTab) return;
	return await browser.sessions.restore(lastTab.sessionId);
}
