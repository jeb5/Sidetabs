import browser from "webextension-polyfill";
import { arrWithReposition } from "../utils/utils";
import { WindowIDContext } from "./Root";
import { createContext, useContext, useEffect, useState } from "react";

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
type TabStructure = {
	pinned: TabListItem[];
	regular: TabListItem[];
};
type TabManagerContextType = {
	tabStructure: TabStructure;
	tabManager: TabManager;
};

export class TabManager {
	windowId: number;
	tabs: { [tabId: number]: Tab } = {};
	tabOrder: number[] = [];
	groups: GroupInfo[] = [];
	observers: (() => void)[] = [];

	constructor(windowId: number) {
		this.windowId = windowId;
		this.resyncTabs().then(() => this.registerListeners());
	}

	private async resyncTabs() {
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

		this.tabs = newTabs;
		this.tabOrder = newTabOrder;
		this.groups = restoredGroups || [];
		this.notifyObservers();
	}

	private get pinnedTabs() {
		return this.tabOrder.map((tabId) => this.tabs[tabId]).filter((tab) => tab.pinned);
	}
	private get regularTabs() {
		return this.tabOrder.map((tabId) => this.tabs[tabId]).filter((tab) => !tab.pinned);
	}

	private async registerListeners() {
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
		console.log("Adding listeners");
		browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
			console.log("On Moved!");
			if (windowId === this.windowId) this.onMoved(tabId, fromIndex, toIndex);
		});
		browser.tabs.onUpdated.addListener((tabId, _, newTabState) => this.onUpdated(tabId, newTabState), { windowId: this.windowId });
	}

	private onAttachedOrCreated(tab: Tab) {
		const regularIndex = tab.index - this.pinnedTabs.length;
		if (regularIndex >= 0)
			this.groups = this.groups.map((group) =>
				regularIndex < group.index || (regularIndex === group.index && tab.groupId !== group.id)
					? { ...group, index: group.index + 1 }
					: group
			);
		this.tabs[tab.id!] = tab;
		this.tabOrder = [...this.tabOrder.slice(0, tab.index), tab.id!, ...this.tabOrder.slice(tab.index)];
		this.notifyObservers();
	}

	private onDetachedOrRemoved(tabId: number) {
		const regularIndex = this.tabs[tabId].index - this.pinnedTabs.length;
		if (regularIndex >= 0)
			this.groups = this.groups.map((group) => (regularIndex < group.index ? { ...group, index: group.index - 1 } : group));
		const { [tabId]: removedTab, ...newTabs } = this.tabs;
		this.tabs = newTabs;
		this.tabOrder = this.tabOrder.filter((id) => id !== tabId);
		this.notifyObservers();
	}
	private onHighlighted(tabIds: number[]) {
		for (const tabId of tabIds) this.tabs[tabId] = { ...this.tabs[tabId], highlighted: true };
		this.notifyObservers();
	}
	private onActivated(tabId: number, previousTabId?: number) {
		if (previousTabId) this.tabs[previousTabId].active = false;
		this.tabs[tabId].active = true;
		this.notifyObservers();
	}
	private onMoved(tabId: number, fromIndex: number, toIndex: number) {
		this.tabOrder = arrWithReposition(this.tabOrder, fromIndex, toIndex);
		const tabGroupId = this.tabs[tabId].groupId;
		const pinnedTabsLength = this.pinnedTabs.length;
		const regularTabsLength = this.tabOrder.length - pinnedTabsLength;
		const regularToIndex = toIndex - pinnedTabsLength;
		const regularFromIndex = fromIndex - this.pinnedTabs.length;

		//If a tab lands in a group, it should join that group. If it lands on either edge of a group, it should join the group only if it already has membership
		let newGroupId = tabGroupId;
		const group = this.groups.find((group) => group.id === tabGroupId);
		if (regularToIndex <= 0 || regularToIndex >= regularTabsLength - 1) newGroupId = undefined;
		else if (
			!group ||
			group.index > regularToIndex ||
			(this.tabs[this.tabOrder[toIndex - 1]].groupId !== tabGroupId && group.index !== toIndex)
		) {
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
		this.notifyObservers();
	}

	private onUpdated(tabId: number, newTabState: browser.Tabs.Tab) {
		this.tabs[tabId] = { ...this.tabs[tabId], ...newTabState };
		this.notifyObservers();
	}

	private async setTabGroupIds(tabIds: number[], groupId: string | undefined) {
		for (const tabId of tabIds) this.tabs[tabId].groupId = groupId;
		await Promise.all(
			tabIds.map(async (tabId) =>
				groupId ? await browser.sessions.setTabValue(tabId, "groupId", groupId) : await browser.sessions.removeTabValue(tabId, "groupId")
			)
		);
	}

	public subscribeToTabUpdates(observer: () => void) {
		this.observers.push(observer);
	}
	public unsubscribeFromTabUpdates(observer: () => void) {
		this.observers = this.observers.filter((o) => o !== observer);
	}
	private notifyObservers() {
		this.observers.forEach((observer) => observer());
	}

	public renderTabStructure(): TabStructure {
		const pinnedTabs = this.pinnedTabs;
		const regularTabs = this.regularTabs;

		const pinnedTabsRender: TabListItem[] = [{ type: "landingSpot", landingSpot: { index: 0, subIndex: 0, pinned: true } }];
		for (const [rawIndex, tab] of pinnedTabs.entries()) {
			pinnedTabsRender.push({ type: "tab", tab });
			pinnedTabsRender.push({ type: "landingSpot", landingSpot: { index: rawIndex + 1, subIndex: 0, pinned: true } });
		}

		//Groups are sorted by index, then subIndex
		const groupsAscending: GroupInfo[] = [...this.groups].sort((a, b) => a.index - b.index || a.subIndex - b.subIndex);

		const regularTabsRender: TabListItem[] = [{ type: "landingSpot", landingSpot: { index: 0, subIndex: 0 } }];
		for (let i = 0; i < regularTabs.length + 1; i++) {
			let subIndex = 0;
			while (groupsAscending[0]?.index === i) {
				const groupInfo = groupsAscending.shift()!;
				const groupItems: GroupItem[] = [{ type: "landingSpot", landingSpot: { index: i, subIndex: 0 } }];
				while (regularTabs[i]?.groupId === groupInfo.id) {
					groupItems.push({ type: "tab", tab: regularTabs[i] });
					i++;
					groupItems.push({ type: "landingSpot", landingSpot: { index: i, subIndex, group: groupInfo.id } });
				}
				regularTabsRender.push({ type: "group", group: { groupInfo, groupItems } });
				subIndex++;
				regularTabsRender.push({ type: "landingSpot", landingSpot: { index: i, subIndex } });
			}
			if (i >= regularTabs.length) break;

			const tab = regularTabs[i];
			regularTabsRender.push({ type: "tab", tab });
			regularTabsRender.push({ type: "landingSpot", landingSpot: { index: i + 1, subIndex: 0 } });
		}
		return { pinned: pinnedTabsRender, regular: regularTabsRender };
	}
	async addNewGroup(firstTabs: Tab[]) {
		const pinnedTabsLength = this.pinnedTabs.length;
		const regularTabsLength = this.tabOrder.length - pinnedTabsLength;
		// Filter out pinned tabs
		firstTabs = firstTabs.filter((tab) => !tab.pinned);
		// Sort Tabs by index
		firstTabs.sort((a, b) => a.index - b.index);
		// Get index of lowest-index tab in group
		const groupIndex = (firstTabs.length > 0 ? firstTabs[0].index : regularTabsLength) - pinnedTabsLength;
		// Create group
		const newGroup = { title: "New Group", id: Math.random().toString(36).slice(2), index: groupIndex, subIndex: 0, color: "#019407" };
		this.groups.push(newGroup);
		// Assign group membership to tabs
		await this.setTabGroupIds(
			firstTabs.map((tab) => tab.id!),
			newGroup.id
		);
		// Place tabs under group
		await browser.tabs.move(
			firstTabs.map((tab) => tab.id!),
			{ index: groupIndex + pinnedTabsLength }
		);
		this.notifyObservers();
	}
}

export const TabManagerContext = createContext<TabManagerContextType | null>(null);
export function TabManagerContextProvider(props: { children: React.ReactNode }) {
	const windowId = useContext(WindowIDContext);
	const [tabManager, setTabManager] = useState<TabManager | null>(null);
	const [tabStructure, setTabStructure] = useState<TabStructure | null>(null);

	useEffect(() => {
		const tabManager = new TabManager(windowId);
		setTabManager(tabManager);
		const tabUpdateListener = () => {
			setTabStructure(tabManager.renderTabStructure());
		};
		tabManager.subscribeToTabUpdates(tabUpdateListener);
		return () => tabManager.unsubscribeFromTabUpdates(tabUpdateListener);
	}, []);

	if (!tabStructure || !tabManager) return null;
	const tabManagerContext = { tabStructure, tabManager };
	return <TabManagerContext.Provider value={tabManagerContext}>{props.children}</TabManagerContext.Provider>;
}
