import { WIN_ID } from "./sidebar.mjs";
import { showTabMenu } from "./contextMenu.mjs";

const tabsDiv = document.getElementById("tabsDiv");
let tabOrder = []; //All tabs ids in the current window, sorted by index

export default class Tab {
	constructor(rawTab) {
		this.updated(rawTab);
		this.id = rawTab.id;
		const { tabEl, titleEl, faviconEl } = this.createTabEl();
		[this.tabEl, this.titleEl, this.faviconEl] = [tabEl, titleEl, faviconEl];
		this.updateDetails();
		this.setActive(this.active);
		tabsDiv.insertBefore(tabEl, tabsDiv.children[rawTab.index]);
		tabOrder.splice(rawTab.index, 0, this.id);
	}
	get index() {
		return tabOrder.indexOf(this.id);
	}
	updated(changeInfo) {
		const newInfo = { ...this, ...changeInfo };
		this.title = newInfo.title;
		this.favIconUrl = newInfo.favIconUrl;
		this.active = newInfo.active;
		this.status = newInfo.status;
		this.muted = newInfo.mutedInfo?.muted || this.muted;
		this.pinned = newInfo.pinned;
		this.url = newInfo.url;
		this.discarded = newInfo.discarded;
	}
	moved(toIndex) {
		if (toIndex < this.index) {
			tabsDiv.insertBefore(this.tabEl, tabsDiv.children[toIndex]);
		} else {
			tabsDiv.insertBefore(this.tabEl, tabsDiv.children[toIndex].nextSibling);
			//acts like insertAfter. If .nextSibling is null (end of list), .insertBefore *will* place at end
		}
		tabOrder.splice(this.index, 1);
		tabOrder.splice(toIndex, 0, this.id);
	}
	removeTab() {
		tabsDiv.removeChild(this.tabEl);
		tabOrder.splice(this.index, 1);
	}
	updateDetails() {
		this.titleEl.innerText = this.title;
		this.faviconEl.src = this.favIconUrl || "";
		this.updateClassList();
	}
	updateClassList() {
		this.updateLoadStyle();
		if (this.discarded) {
			this.tabEl.classList.add("discarded");
		} else {
			this.tabEl.classList.remove("discarded");
		}
	}
	updateLoadStyle() {
		if (this.status === "loading") {
			this.tabEl.classList.add("loading");
		} else {
			if (this.tabEl.classList.contains("loading")) {
				if (this.tabEl.classList.contains("finishLoad")) {
					clearTimeout(this.loadTimeout);
					this.tabEl.classList.remove("finishLoad");
				}
				this.tabEl.classList.add("finishLoad");
				this.loadTimeout = setTimeout(() => {
					this.tabEl.classList.remove("finishLoad");
				}, 500);
				this.tabEl.classList.remove("loading");
			}
		}
	}
	setActive(active) {
		this.active = active;
		if (this.active) return this.tabEl.classList.add("activeTab");
		this.tabEl.classList.remove("activeTab");
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
	get discardable() {
		return !this.discarded && !this.active;
	}
	createTabEl() {
		const tabEl = document.createElement("div");
		const titleEl = document.createElement("a");
		const faviconEl = document.createElement("img");
		const tabCloseBtn = document.createElement("img");
		tabEl.appendChild(faviconEl);
		tabEl.appendChild(titleEl);
		tabEl.appendChild(tabCloseBtn);

		tabEl.addEventListener("click", async () => {
			await browser.tabs.highlight({
				windowId: WIN_ID,
				populate: false,
				tabs: [this.index],
			});
		});
		tabEl.addEventListener("contextmenu", () => {
			showTabMenu(this);
		});
		tabEl.draggable = true;
		tabEl.addEventListener("dragstart", e => {
			e.dataTransfer.setData("text/x-moz-url", `${this.url}\n${this.title}`);
			e.dataTransfer.setData("text/uri-list", this.url);
			e.dataTransfer.setData("text/plain", this.url);
			e.dataTransfer.effectAllowed = "copyMove";
			e.dataTransfer.setDragImage(document.getElementById("invisibleDragImage"), 0, 0);
		});

		tabEl.classList.add("tab");
		titleEl.classList.add("tabText");
		tabCloseBtn.classList.add("tabCloseBtn");
		tabCloseBtn.src = browser.runtime.getURL("assets/close.svg");
		tabCloseBtn.addEventListener("click", async () => this.close());

		faviconEl.classList.add("tabIcon");

		return { tabEl, titleEl, faviconEl };
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
