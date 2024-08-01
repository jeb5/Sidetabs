import browser from "webextension-polyfill";
import { arrWithReposition } from "../utils/utils";

export type Tab = browser.Tabs.Tab & {
	// dragging: boolean
	groupId?: string;
};
export type GroupInfo = {
	title: string;
	id: string;
	color: string;
	index: number;
	subIndex: number;
};
type LandingSpot = {
	index: number;
	subIndex: number;
	group?: string;
	pinned?: boolean;
};
type Group = {
	groupInfo: GroupInfo;
	groupItems: GroupItem[];
};

type GroupItem =
	| {
		type: "tab";
		tab: Tab;
	}
	| {
		type: "landingSpot";
		landingSpot: LandingSpot;
	};

export type TabListItem =
	| {
		type: "tab";
		tab: Tab;
	}
	| {
		type: "landingSpot";
		landingSpot: LandingSpot;
	}
	| {
		type: "group";
		group: Group;
	};

export type TabManagerMethods = {
	addNewGroup: (firstTabs: Tab[]) => void;
	addTabsToGroup: (groupId: string, tabs: Tab[]) => void;
	removeTabsFromGroup: (groupId: string, tabs: Tab[]) => void;
};


export class TabManager {
	windowId: number;
	tabs: { [tabId: number]: Tab } = {};
	tabOrder: number[] = [];
	groups: GroupInfo[] = [];

	constructor(windowId: number) {
		this.windowId = windowId;
		this.resyncTabs().then(() => this.registerListeners());
	}

	async resyncTabs() {
		const rawTabs = await browser.tabs.query({ currentWindow: true });

		const tabList: Tab[] = await Promise.all(
			rawTabs.map(async (tab) => {
				return {
					...tab,
					groupId: await browser.sessions.getTabValue(tab.id!, "groupId"),
				};
			})
		);

		const newTabOrder = new Array(rawTabs.length);
		tabList.forEach((tab) => (newTabOrder[tab.index] = tab.id));
		const newTabs: { [tabId: string]: Tab } = tabList.reduce((acc, tab) => ({ ...acc, [tab.id!]: tab }), {});

		const restoredGroups = await browser.sessions.getWindowValue(this.windowId, "tabGroups");

		this.tabs = newTabs
		this.tabOrder = newTabOrder
		this.groups = restoredGroups || [];
	}

	get pinnedTabs() {
		return this.tabOrder.map((tabId) => this.tabs[tabId]).filter((tab) => tab.pinned);
	}
	get regularTabs() {
		return this.tabOrder.map((tabId) => this.tabs[tabId]).filter((tab) => !tab.pinned);
	}

	async registerListeners() {
		browser.tabs.onAttached.addListener(async (tabId, { newWindowId }) => {
			if (newWindowId !== this.windowId) return;
			const [newTab, newTabGroupId] = await Promise.all([browser.tabs.get(tabId), browser.sessions.getTabValue(tabId, "groupId")]);
			const tab = { ...newTab, groupId: newTabGroupId };
			this.onAttachedOrCreated(tab);
		});
		browser.tabs.onCreated.addListener(async (newTab) => {
			if (newTab.windowId !== this.windowId) return;
			const newTabGroupId = await browser.sessions.getTabValue(newTab.id!, "groupId");
			const tab = { ...newTab, groupId: newTabGroupId };
			this.onAttachedOrCreated(tab);
		});
		browser.tabs.onActivated.addListener(({ previousTabId, tabId, windowId }) => {
			if (windowId === this.windowId) this.onActivated(tabId, previousTabId);
		});
		browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
			if (oldWindowId === this.windowId) this.onDetachedOrRemoved(tabId);
		});
		browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
			if (windowId === this.windowId) this.onDetachedOrRemoved(tabId);
		});
		browser.tabs.onHighlighted.addListener(({ tabIds, windowId }) => {
			if (windowId === this.windowId) this.onHighlighted(tabIds);
		});
		browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
			if (windowId === this.windowId) this.onMoved(tabId, fromIndex, toIndex);
		});
		browser.tabs.onUpdated.addListener((tabId, _, newTabState) => this.onUpdated(tabId, newTabState), { windowId: this.windowId });
	}
	onAttachedOrCreated(tab: Tab) {
		const regularIndex = tab.index - this.pinnedTabs.length;
		if (regularIndex >= 0)
			this.groups = this.groups.map((group) =>
				regularIndex < group.index || (regularIndex === group.index && tab.groupId !== group.id)
					? { ...group, index: group.index + 1 }
					: group
			)
		this.tabs[tab.id!] = tab;
		this.tabOrder = [...this.tabOrder.slice(0, tab.index), tab.id!, ...this.tabOrder.slice(tab.index)];
	}
	onDetachedOrRemoved(tabId: number) {
		const regularIndex = this.tabs[tabId].index - this.pinnedTabs.length;
		if (regularIndex >= 0)
			this.groups = this.groups.map((group) => (regularIndex < group.index ? { ...group, index: group.index - 1 } : group));
		const { [tabId]: removedTab, ...newTabs } = this.tabs;
		this.tabs = newTabs
		this.tabOrder = this.tabOrder.filter((id) => id !== tabId);
	}
	onHighlighted(tabIds: number[]) {
		for (const tabId of tabIds) this.tabs[tabId] = { ...this.tabs[tabId], highlighted: true };
	};
	onActivated(tabId: number, previousTabId?: number) {
		if (previousTabId) this.tabs[previousTabId].active = false;
		this.tabs[tabId].active = true;
	};
	onMoved(tabId: number, fromIndex: number, toIndex: number) {
		this.tabOrder = arrWithReposition(this.tabOrder, fromIndex, toIndex);
		const tabGroupId = this.tabs[tabId].groupId;
		const pinnedTabsLength = this.pinnedTabs.length;
		const regularToIndex = toIndex - pinnedTabsLength;
		const regularFromIndex = fromIndex - this.pinnedTabs.length;

		//If a tab lands in a group, it should join that group. If it lands on either edge of a group, it should join the group only if it already has membership
		let newGroupId = tabGroupId;
		const group = this.groups.find((group) => group.id === tabGroupId);
		if (regularToIndex <= 0) newGroupId = undefined;
		else if (!group || group.index > regularToIndex || (this.tabs[this.tabOrder[toIndex - 1]].groupId !== tabGroupId && group.index !== toIndex)) {
			newGroupId = undefined;
			//If the tabs before and after are in a group, then join that group
			const beforeGroupId = this.tabs[this.tabOrder[toIndex - 1]].groupId;
			const afterGroupId = this.tabs[this.tabOrder[toIndex + 1]].groupId;
			if (beforeGroupId !== undefined && beforeGroupId === afterGroupId) newGroupId = beforeGroupId;
		}
		for (const [index, tabId] of this.tabOrder.entries()) this.tabs[tabId].index = index;

		this.setTabGroupIds([tabId], newGroupId);

		for (const [i, group] of this.groups.entries()) {
			let groupIndex = group.index;
			if (regularFromIndex >= 0 && regularFromIndex < group.index) groupIndex--;
			if ((regularToIndex >= 0 && regularToIndex < group.index) || (regularToIndex === groupIndex && tabGroupId !== group.id)) groupIndex++;
			this.groups[i].index = groupIndex;
		}
	};
	onUpdated(tabId: number, newTabState: browser.Tabs.Tab) {
		this.tabs[tabId] = { ...this.tabs[tabId], ...newTabState };
	};

	async setTabGroupIds(tabIds: number[], groupId: string | undefined) {
		for (const tabId of tabIds) this.tabs[tabId].groupId = groupId;
		await Promise.all(
			tabIds.map(async (tabId) =>
				groupId ? await browser.sessions.setTabValue(tabId, "groupId", groupId) : await browser.sessions.removeTabValue(tabId, "groupId")
			)
		);
	}

}