import browser from "webextension-polyfill";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { WindowIDContext } from "./Root";
import { arrWithReposition } from "../utils/utils";
import useEvent from "react-use-event-hook";

/* Thinking
This hook should provide methods for tabs to inform of reordering, and for tabs to inform of selection changes.....
This hook could be a context provider, and tabs could then use the context to send selection updates, and tell manager about a drag event.
This hook could be refactored into the tab management part and the tab sync part.
Regular tab events could continue being handled as they are, going to the browser api first, and then being picked up by the tab sync code.... maybe selections could use the existing tab selection api??


// When a drag is in progress, elements containing tabs will, on drag over, inform the tab manager of the nearest landing spot. Tab lists highlight landing spots based on tab manager landing spot context.

Maybe top down approach- Tab manager provides array of tabs and groups, and also landing spots, which are provided as refs. Rendering components set the refs, thus the tab manager has access to the landing spots directly
Perhaps when a tab rendering component is dragged over, it will report the nearest landing spot to the tab manager, and tab manager publishes the current closest landing spot as a context, so that that landing spot knows to be visible.
*/

/* Group persistence:
Group membership across sessions can be handled with sessions.setTabValue(tabId, "tabGroupId", <groupId>).  
Groups themselves can be handled by sessions.setWindowValue(windowId, "tabGroups", <groups>).
MDN is the best: https://arc.net/l/quote/cjffjqyw
*/

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
type TabManagerContextType = {
	tabStructure: {
		pinned: TabListItem[];
		regular: TabListItem[];
	};
	tabManagerMethods: TabManagerMethods;
};

export const TabManagerContext = createContext<TabManagerContextType | null>(null);

export default function TabManager(props: { children: React.ReactNode }) {
	const WIN_ID = useContext(WindowIDContext);
	const [groups, setGroups] = useState<GroupInfo[]>([]);
	const [tabs, setTabs] = useState<{ [id: string]: Tab }>({});
	const [tabOrder, setTabOrder] = useState<number[]>([]);

	const tabs2: Tab[] = tabOrder.map((tabId) => ({ ...tabs[tabId], dragging: false }));
	const pinnedTabs = tabs2.filter((tab) => tab.pinned);
	const regularTabs = tabs2.filter((tab) => !tab.pinned);

	const onAttachedOrCreated = useEvent((tab: Tab) => {
		const regularIndex = tab.index - pinnedTabs.length;
		if (regularIndex >= 0)
			setGroups((groups) =>
				groups.map((group) =>
					regularIndex < group.index || (regularIndex === group.index && tab.groupId !== group.id)
						? { ...group, index: group.index + 1 }
						: group
				)
			);
		setTabs((tabs) => ({ ...tabs, [tab.id!]: tab }));
		setTabOrder((tabOrder) => [...tabOrder.slice(0, tab.index), tab.id!, ...tabOrder.slice(tab.index)]);
	});
	const onDetachedOrRemoved = useEvent((tabId: number) => {
		const regularIndex = tabs[tabId].index - pinnedTabs.length;
		if (regularIndex >= 0)
			setGroups((groups) => groups.map((group) => (regularIndex < group.index ? { ...group, index: group.index - 1 } : group)));
		setTabs((tabs) => {
			const { [tabId]: removedTab, ...newTabs } = tabs;
			return newTabs;
		});
		setTabOrder(tabOrder.filter((id) => id !== tabId));
	});
	const onHighlighted = useEvent((tabIds: number[]) => {
		setTabs((tabs) => {
			const newTabs = { ...tabs };
			for (const tabId of tabIds) newTabs[tabId] = { ...tabs[tabId], highlighted: true };
			return newTabs;
		});
	});
	const onActivated = useEvent((tabId: number, previousTabId?: number) => {
		setTabs((tabs) => ({
			...tabs,
			...(previousTabId ? { [previousTabId]: { ...tabs[previousTabId], active: false } } : {}),
			[tabId]: { ...tabs[tabId], active: true },
		}));
	});
	const onMoved = useEvent((tabId: number, fromIndex: number, toIndex: number) => {
		if (tabOrder[fromIndex] !== tabId) {
			//Discrepancy, might be due to multiple tabs moving at once (calling onMoved multiple times)
			console.log("Discrepancy in onMoved, resyncing tabs");
			resyncTabs();
			return;
		}
		const newTabOrder = arrWithReposition(tabOrder, fromIndex, toIndex);
		setTabOrder(newTabOrder);
		const tab = tabs[tabId];
		const regularToIndex = toIndex - pinnedTabs.length;
		const regularFromIndex = fromIndex - pinnedTabs.length;

		//If a tab lands in a group, it should join that group. If it lands on either edge of a group, it should join the group only if it already has membership
		let newGroupId = tab.groupId;
		const group = groups.find((group) => group.id === tab.groupId);
		if (regularToIndex <= 0) newGroupId = undefined;
		else if (!group || group.index > regularToIndex || (tabs[tabOrder[toIndex - 1]].groupId !== tab.groupId && group.index !== toIndex)) {
			newGroupId = undefined;
			//If the tabs before and after are in a group, then join that group
			const beforeGroupId = tabs[newTabOrder[toIndex - 1]].groupId;
			const afterGroupId = tabs[newTabOrder[toIndex + 1]].groupId;
			if (beforeGroupId !== undefined && beforeGroupId === afterGroupId) newGroupId = beforeGroupId;
		}
		const newTabs = { ...tabs };
		for (const [index, tabId] of newTabOrder.entries()) newTabs[tabId] = { ...newTabs[tabId], index };
		setTabs(newTabs);
		setTabGroupIds([tabId], newGroupId!);

		setGroups((groups) => {
			return groups.map((group) => {
				let groupIndex = group.index;
				if (regularFromIndex >= 0 && regularFromIndex < group.index) groupIndex--;
				if ((regularToIndex >= 0 && regularToIndex < group.index) || (regularToIndex === groupIndex && tab.groupId !== group.id))
					groupIndex++;
				return { ...group, index: groupIndex };
			});
		});
	});
	const onUpdated = useEvent((tabId: number, newTabState: browser.Tabs.Tab) => {
		setTabs((tabs) => ({ ...tabs, [tabId]: { ...tabs[tabId], ...newTabState } }));
	});

	async function resyncTabs() {
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
		const newTabs = tabList.reduce((acc, tab) => ({ ...acc, [tab.id!]: tab }), {});

		const restoredGroups = await browser.sessions.getWindowValue(WIN_ID, "tabGroups");

		setTabs(newTabs);
		setTabOrder(newTabOrder);
		if (restoredGroups) setGroups(restoredGroups);
	}

	useEffect(() => {
		async function setup() {
			await resyncTabs();
			browser.tabs.onAttached.addListener(async (tabId, { newWindowId }) => {
				if (newWindowId !== WIN_ID) return;
				const [newTab, newTabGroupId] = await Promise.all([browser.tabs.get(tabId), browser.sessions.getTabValue(tabId, "groupId")]);
				const tab = { ...newTab, groupId: newTabGroupId };
				onAttachedOrCreated(tab);
			});
			browser.tabs.onCreated.addListener(async (newTab) => {
				if (newTab.windowId !== WIN_ID) return;
				const newTabGroupId = await browser.sessions.getTabValue(newTab.id!, "groupId");
				const tab = { ...newTab, groupId: newTabGroupId };
				onAttachedOrCreated(tab);
			});
			browser.tabs.onActivated.addListener(({ previousTabId, tabId, windowId }) => {
				if (windowId === WIN_ID) onActivated(tabId, previousTabId);
			});
			browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
				if (oldWindowId === WIN_ID) onDetachedOrRemoved(tabId);
			});
			browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
				if (windowId === WIN_ID) onDetachedOrRemoved(tabId);
			});
			browser.tabs.onHighlighted.addListener(({ tabIds, windowId }) => {
				if (windowId === WIN_ID) onHighlighted(tabIds);
			});
			browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
				if (windowId === WIN_ID) onMoved(tabId, fromIndex, toIndex);
			});
			browser.tabs.onUpdated.addListener((tabId, _, newTabState) => onUpdated(tabId, newTabState), { windowId: WIN_ID });
		}
		setup();
	}, []);

	async function setTabGroupIds(tabIds: number[], groupId: string) {
		await Promise.all(
			tabIds.map(async (tabId) =>
				groupId ? await browser.sessions.setTabValue(tabId, "groupId", groupId) : await browser.sessions.removeTabValue(tabId, "groupId")
			)
		);
		setTabs((tabs) => {
			const newTabs = { ...tabs };
			for (const tabId of tabIds) newTabs[tabId] = { ...tabs[tabId], groupId };
			return newTabs;
		});
	}

	useEffect(() => {
		console.log("Persisting Groups", groups);
		browser.sessions.setWindowValue(WIN_ID, "tabGroups", groups);
	}, [groups]);

	const tabManagerMethods: TabManagerMethods = {
		addNewGroup: async function (firstTabs: Tab[]): Promise<void> {
			// Filter out pinned tabs
			firstTabs = firstTabs.filter((tab) => !tab.pinned);
			// Sort Tabs by index
			firstTabs.sort((a, b) => a.index - b.index);
			// Get index of lowest-index tab in group
			const groupIndex = (firstTabs.length > 0 ? firstTabs[0].index : regularTabs.length) - pinnedTabs.length;
			// Create group
			const newGroup = { title: "New Group", id: Math.random().toString(36).slice(2), index: groupIndex, subIndex: 0, color: "#019407" };
			console.log("Setting Groups", [...groups, newGroup]);
			setGroups([...groups, newGroup]);
			// Assign group membership to tabs
			await setTabGroupIds(
				firstTabs.map((tab) => tab.id!),
				newGroup.id
			);
			// Place tabs under group
			await browser.tabs.move(
				firstTabs.map((tab) => tab.id!),
				{ index: groupIndex + pinnedTabs.length }
			);
		},
		addTabsToGroup: function (groupId: string, tabs: Tab[]): void {
			throw new Error("Function not implemented.");
		},
		removeTabsFromGroup: function (groupId: string, tabs: Tab[]): void {
			throw new Error("Function not implemented.");
		},
	};

	const pinnedTabsRender: TabListItem[] = [{ type: "landingSpot", landingSpot: { index: 0, subIndex: 0, pinned: true } }];
	for (const [rawIndex, tab] of pinnedTabs.entries()) {
		pinnedTabsRender.push({ type: "tab", tab });
		pinnedTabsRender.push({ type: "landingSpot", landingSpot: { index: rawIndex + 1, subIndex: 0, pinned: true } });
	}

	//TODO: Groups can't be inserted by index, recording the index themselves. What if tabs move/are removed/created? those indices will be wrong. Groups should just exist in a position in the tab/group array, deriving their index from that? right?
	// Perhaps every tab update could inform groups

	//Groups are sorted by index, then subIndex
	const groupsAscending: GroupInfo[] = groups.slice().sort((a, b) => a.index - b.index || a.subIndex - b.subIndex);

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
	console.log("Regular Tabs Render", regularTabsRender);
	console.log("Groups", groups);

	const tabManagerContext: TabManagerContextType = {
		tabStructure: {
			pinned: pinnedTabsRender,
			regular: regularTabsRender,
		},
		tabManagerMethods,
	};
	return <TabManagerContext.Provider value={tabManagerContext}> {props.children} </TabManagerContext.Provider>;

	/*
	structure layout: {
		pinned: [
			landingSpot,
			tab,
			landingSpot,
			tab
			landingSpot,
		],
		regular: [
			landingSpot, i = 0
			tab, i = 0
			landingSpot, i = 1
			tab, i = 1
			landingSpot, i = 2
			group = {
				landingSpot, i = 2, g
				tab, i =2
				landingSpot, i = 3, g
				tab, i = 3
				landingSpot, i = 4, g
			}
			landingSpot, i = 4, sub = 1
			tab, i = 4
			landingSpot, i = 5
		]
}
	*/
}
