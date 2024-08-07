import browser from "webextension-polyfill";
import { arrWithReposition } from "../utils/utils";
import { WindowInfoContext } from "./Root";
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
type TabManagerInfo = {
	multiselectInProgress: boolean;
};
type TabManagerContextType = {
	structure: TabStructure;
	info: TabManagerInfo;
	tabManager: TabManager;
};

export class TabManager {
	private windowId: number;
	private tabs: { [tabId: number]: Tab } = {};
	private tabOrder: number[] = [];
	private groups: GroupInfo[] = [];
	private observers: (() => void)[] = [];
	private selectionAnchor: number = -1;
	private selectionFocus: number = -1;

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
	private get highlightedTabs() {
		return this.tabOrder.map((tabId) => this.tabs[tabId]).filter((tab) => tab.highlighted);
	}

	public getInfo(): TabManagerInfo {
		return { multiselectInProgress: this.highlightedTabs.length > 1 };
	}

	public async toggleSelection(tabId: number, shiftKeyMode: boolean = false) {
		//macOS selection rules, from gh:ibash/better-multiselect
		const tabIndex = this.tabOrder.indexOf(tabId);
		const selectedTabIndices = new Set(this.highlightedTabs.map((tab) => tab.index));
		if (this.selectionAnchor == -1 || !this.tabs[this.selectionAnchor]?.highlighted)
			this.selectionAnchor = this.tabOrder.find((tabId) => this.tabs[tabId].active)!;
		if (!this.tabs[this.selectionFocus]?.highlighted) this.selectionFocus = -1;
		if (shiftKeyMode) {
			// Clear everything between anchor and focus
			if (this.selectionFocus !== -1) {
				const [start, end] = [this.tabs[this.selectionAnchor].index, this.tabs[this.selectionFocus].index].sort((a, b) => a - b);
				for (let i = start; i <= end; i++) selectedTabIndices.delete(i);
			}
			this.selectionFocus = tabId;
			const [start, end] = [this.tabs[this.selectionAnchor].index, this.tabs[this.selectionFocus].index].sort((a, b) => a - b);
			for (let i = start; i <= end; i++) selectedTabIndices.add(i);
		} else {
			//controlKeyMode
			this.selectionFocus = -1;
			if (selectedTabIndices.has(tabIndex)) {
				//If selected
				if (selectedTabIndices.size <= 1) return; //Can't unselect the active tab and leave nothing!
				selectedTabIndices.delete(tabIndex);
				let successorAnchor = this.tabOrder.slice(tabIndex + 1).find((_, index) => selectedTabIndices.has(index)) || -1;
				if (successorAnchor === -1)
					successorAnchor = this.tabOrder.slice(0, tabIndex).findLast((_, index) => selectedTabIndices.has(index)) || -1;
				this.selectionAnchor = successorAnchor;
			} else {
				//If not selected
				selectedTabIndices.add(tabIndex);
				this.selectionAnchor = tabId;
			}
		}
		const activeTabIndex = this.tabOrder.findIndex((tabId) => this.tabs[tabId].active);
		// Move the tab with the index CLOSEST to the active tab to the front
		const closestToActive = [...selectedTabIndices].reduce(
			(closest, index) => {
				const distance = Math.abs(index - activeTabIndex);
				if (distance < closest.distance) return { index, distance };
				else return closest;
			},
			{ index: -1, distance: Infinity }
		);
		let selectedIndiciesList: number[] = [];
		if (closestToActive) {
			selectedTabIndices.delete(closestToActive.index);
			selectedIndiciesList = [closestToActive.index, ...selectedTabIndices];
		}
		await browser.tabs.highlight({ windowId: this.windowId, tabs: selectedIndiciesList });
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
		browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
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
		this.tabOrder.forEach((tabId, index) => (this.tabs[tabId].index = index));
		this.notifyObservers();
	}

	private onDetachedOrRemoved(tabId: number) {
		const regularIndex = this.tabs[tabId].index - this.pinnedTabs.length;
		if (regularIndex >= 0)
			this.groups = this.groups.map((group) => (regularIndex < group.index ? { ...group, index: group.index - 1 } : group));
		const { [tabId]: removedTab, ...newTabs } = this.tabs;
		this.tabOrder = this.tabOrder.filter((id) => id !== tabId);
		this.tabOrder.forEach((tabId, index) => (newTabs[tabId].index = index));
		this.tabs = newTabs;
		this.notifyObservers();
	}
	private onHighlighted(tabIds: number[]) {
		for (const tabId of this.tabOrder) this.tabs[tabId].highlighted = tabIds.includes(tabId);
		this.notifyObservers();
	}
	private onActivated(tabId: number, previousTabId?: number) {
		if (previousTabId && this.tabs[previousTabId]) this.tabs[previousTabId].active = false;
		if (this.tabs[tabId]) this.tabs[tabId].active = true;
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
		this.tabOrder.forEach((tabId, index) => (this.tabs[tabId].index = index));

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
	const windowInfo = useContext(WindowInfoContext);
	const [tabManager, setTabManager] = useState<TabManager | null>(null);
	const [tabStructure, setTabStructure] = useState<TabStructure | null>(null);
	const [tabManagerInfo, setTabManagerInfo] = useState<TabManagerInfo | null>(null);

	useEffect(() => {
		const tabManager = new TabManager(windowInfo!.windowId);
		setTabManager(tabManager);
		const tabUpdateListener = () => {
			setTabStructure(tabManager.renderTabStructure());
			setTabManagerInfo(tabManager.getInfo());
		};
		tabManager.subscribeToTabUpdates(tabUpdateListener);
		return () => tabManager.unsubscribeFromTabUpdates(tabUpdateListener);
	}, []);

	if (!tabStructure || !tabManager || !tabManagerInfo) return null;
	const tabManagerContext = { structure: tabStructure, tabManager, info: tabManagerInfo };
	return <TabManagerContext.Provider value={tabManagerContext}>{props.children}</TabManagerContext.Provider>;
}
