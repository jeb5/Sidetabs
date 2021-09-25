import Tab from "./Tab.mjs";

let currentTabs = {}; //All tabs in the current window, indexed by id
export let WIN_ID = null;

function tabCreated(rawTab) {
	currentTabs[rawTab.id] = new Tab(rawTab);
}
function tabRemoved(tabId) {
	currentTabs[tabId].removeTab();
	delete currentTabs[tabId];
}
function tabChanged(tabId, changeInfo) {
	currentTabs[tabId].updated(changeInfo);
}
function tabMoved(tabId, toIndex) {
	currentTabs[tabId].moved(toIndex);
}

setup();
async function setup() {
	WIN_ID = (await browser.windows.getCurrent()).id; //WINDOW_ID_CURRENT returns wrong value for some reason
	browser.tabs.onActivated.addListener(async ({ tabId, previousTabId, windowId }) => {
		if (windowId == WIN_ID) {
			currentTabs[tabId].updated({ active: true });
			currentTabs[previousTabId].updated({ active: false });
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
