class Tab {
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
		this.faviconEl.src = this.favIconUrl;
	}
	setActive(active) {
		this.active = active;
		if (this.active) return this.tabEl.classList.add("activeTab");
		this.tabEl.classList.remove("activeTab");
	}
	createTabEl() {
		const tabEl = document.createElement("div");
		const titleEl = document.createElement("div");
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

		tabEl.classList.add("tab");
		titleEl.classList.add("tabText");
		tabCloseBtn.classList.add("tabCloseBtn");
		tabCloseBtn.src = browser.runtime.getURL("assets/close.svg");
		tabCloseBtn.addEventListener("click", async e => {
			e.stopPropagation();
			await browser.tabs.remove(this.id);
		});

		faviconEl.classList.add("tabIcon");

		return { tabEl, titleEl, faviconEl };
	}
}
const tabsDiv = document.getElementById("tabsDiv");
let currentTabs = {}; //All tabs in the current window, indexed by id
let tabOrder = []; //All tabs ids in the current window, sorted by index
let WIN_ID = null;

function tabCreated(rawTab) {
	currentTabs[rawTab.id] = new Tab(rawTab);
}
function tabRemoved(tabId) {
	currentTabs[tabId].removeTab();
	delete currentTabs[tabId];
}
function tabChanged(tabId, changeInfo) {
	currentTabs[tabId].updated(changeInfo);
	currentTabs[tabId].updateDetails();
}
function tabMoved(tabId, toIndex) {
	currentTabs[tabId].moved(toIndex);
}

setup();
async function setup() {
	WIN_ID = (await browser.windows.getCurrent()).id; //WINDOW_ID_CURRENT returns wrong value for some reason
	browser.tabs.onActivated.addListener(async ({ tabId, previousTabId, windowId }) => {
		if (windowId == WIN_ID) {
			currentTabs[tabId].setActive(true);
			currentTabs[previousTabId]?.setActive(false);
		}
	});
	browser.tabs.onAttached.addListener(async (tabId, { newWindowId }) => {
		if (newWindowId === WIN_ID) tabCreated(await browser.tabs.get(tabId));
	});
	browser.tabs.onCreated.addListener(tab => {
		if (tab.windowId === WIN_ID) tabCreated(tab);
	});
	browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
		if (oldWindowId === WIN_ID) tabRemoved(tabId);
	});
	// browser.tabs.onHighlighted.addListener(tabChange);
	browser.tabs.onMoved.addListener((tabId, { windowId, toIndex }) => {
		if (windowId === WIN_ID) tabMoved(tabId, toIndex);
	});
	browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
		if (windowId === WIN_ID) tabRemoved(tabId);
	});
	browser.tabs.onUpdated.addListener(tabChanged, { windowId: WIN_ID });

	const tabs = await browser.tabs.query({ windowId: WIN_ID });
	for (const tab of tabs) tabCreated(tab);
}
