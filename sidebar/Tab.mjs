import { WIN_ID } from "./sidebar.mjs";
import { showTabMenu } from "./contextMenu.mjs";

const tabsDiv = document.getElementById("tabsDiv");
const pinnedTabsDiv = document.getElementById("pinnedTabsDiv");
let tabOrder = []; //All unpinned tab ids in the current window, sorted by index
let pinnedTabOrder = []; //All pinned tab ids in the current window, sorted by index

export default class Tab {
	constructor(rawTab) {
		this.id = rawTab.id;
		const { tabEl, titleEl, faviconEl } = this.createTabEl();
		[this.tabEl, this.titleEl, this.faviconEl] = [tabEl, titleEl, faviconEl];

		const pinned = rawTab.pinned;
		const index = pinned ? rawTab.index : rawTab.index - pinnedTabOrder.length;
		this.belongingDiv = pinned ? pinnedTabsDiv : tabsDiv;
		this.belongingOrder = pinned ? pinnedTabOrder : tabOrder;
		this.belongingOrder.splice(index, 0, this.id);
		console.log(this.belongingOrder);
		this.belongingDiv.insertBefore(tabEl, tabsDiv.children[index]);
		this.updated(rawTab);
	}
	get index() {
		return this.belongingOrder.indexOf(this.id);
	}
	updated(changeInfo) {
		// console.log("Updated", changeInfo);
		const handlers = {
			title: newValue => {
				this.title = newValue;
				this.titleEl.innerText = this.title;
			},
			favIconUrl: newValue => {
				this.favIconUrl = newValue;
				this.faviconEl.src = this.favIconUrl || "";
			},
			active: newValue => {
				this.active = newValue;
				this.tabEl.classList.toggle("activeTab", this.active);
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
				console.log(this.id, "Pinned:", newValue);
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
	async movePinned(pinning) {
		const newIndex = (await browser.tabs.get(this.id)).index;
		console.log("#", this.id, "MovePinned:", newIndex);
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
	moved(toIndex) {
		//When move event is fired, this.pinned may be outdated, as move events are fired before onUpdated events. Therefore, the index that the tab is moving to may not be a possible index to move to.
		//When pinned or unpinned, movedPinned() will handle move

		const newIndex = this.pinned ? toIndex : toIndex - pinnedTabOrder.length;
		if (newIndex < 0 || newIndex >= this.belongingOrder.length) return; //Tab has probably been pinned or unpinned
		if (this.index === newIndex) return;
		console.log("#", this.id, "Moved:", newIndex);

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

	get discardable() {
		return !this.discarded && !this.active;
	}
	createTabEl() {
		const tabEl = document.createElement("div");
		const faviconEl = document.createElement("img");
		tabEl.appendChild(faviconEl);
		const titleEl = document.createElement("div");
		tabEl.appendChild(titleEl);
		const tabCloseBtn = document.createElement("img");
		tabEl.appendChild(tabCloseBtn);

		tabEl.addEventListener("click", async () => {
			await browser.tabs.highlight({
				windowId: WIN_ID,
				populate: false,
				tabs: [this.pinned ? this.index : this.index + pinnedTabOrder.length],
			});
		});
		tabEl.addEventListener("contextmenu", () => showTabMenu(this));
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
		tabCloseBtn.addEventListener("click", async e => {
			e.stopPropagation();
			this.close();
		});

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
