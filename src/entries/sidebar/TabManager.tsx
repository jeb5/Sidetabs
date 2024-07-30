import useTabSync from "./TabSync";
import browser from "webextension-polyfill";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { WindowIDContext } from "./Root";
import { set } from "react-hook-form";
import { arrWithReposition } from "../utils/utils";

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

	const tabOrderRef = useRef(tabOrder); // Crime?
	tabOrderRef.current = tabOrder;
	const tabsRef = useRef(tabs);
	tabsRef.current = tabs;
	const groupsRef = useRef(groups);
	groupsRef.current = groups;

	useEffect(() => {
		function setupTabListeners() {
			//
			// TODO: In these functions, deal with tabs that are created, with group membership but are in the wrong place. their membership should be removed. (Restoring old tabs when group has moved)
			// This mght be a challenge, as getting information about the group index would require us to create a groupsRef too.
			// I feel like creating refs that mirror the values of state is an anti-pattern, but how else am I supposed to do this? Registering and unregistering the listeners every time surely isn't the solution.
			//
			const onTabAddedAtIndex = (index: number, tab: Tab) => {
				console.log("Tab added at index", index);
				const pinnedTabsLength = tabOrderRef.current.filter((tabId) => tabsRef.current[tabId].pinned).length;
				const regularIndex = index - pinnedTabsLength;
				console.log("Tab added at regular index", index);
				setGroups((groups) => {
					if (regularIndex < 0) return groups;
					console.log("RegularIndex", regularIndex);
					return groups.map((group) => {
						if (regularIndex < group.index || (regularIndex === group.index && tab.groupId !== group.id)) {
							console.log("decrementing group index");
							return { ...group, index: group.index + 1 };
						}
						return group;
					});
				});
			};
			function onTabRemovedAtIndex(index: number, tab: Tab) {
				setGroups((groups) => {
					const pinnedTabsLength = tabOrderRef.current.filter((tabId) => tabsRef.current[tabId].pinned).length;
					const regularIndex = index - pinnedTabsLength;
					if (regularIndex < 0) return groups;
					return groups.map((group) => {
						if (regularIndex < group.index) {
							return { ...group, index: group.index - 1 };
						}
						return group;
					});
				});
			}
			function onTabMoved(fromIndex: number, toIndex: number, tab: Tab) {
				setGroups((groups) => {
					const pinnedTabsLength = tabOrderRef.current.filter((tabId) => tabsRef.current[tabId].pinned).length;
					const regularFromIndex = fromIndex - pinnedTabsLength;
					const regularToIndex = toIndex - pinnedTabsLength;
					return groups.map((group) => {
						let groupIndex = group.index;
						if (regularFromIndex >= 0 && regularFromIndex < group.index) groupIndex--;
						if (regularToIndex < group.index || (regularToIndex === group.index && tab.groupId !== group.id)) groupIndex++;
						return { ...group, index: groupIndex };
					});
				});
			}

			browser.tabs.onActivated.addListener(({ previousTabId, tabId, windowId }) => {
				if (windowId !== WIN_ID) return;
				setTabs((tabs) => ({
					...tabs,
					...(previousTabId ? { [previousTabId]: { ...tabs[previousTabId], active: false } } : {}),
					[tabId]: { ...tabs[tabId], active: true },
				}));
			});

			browser.tabs.onAttached.addListener(async (tabId, { newWindowId }) => {
				if (newWindowId !== WIN_ID) return;
				const [newTab, newTabGroupId] = await Promise.all([browser.tabs.get(tabId), browser.sessions.getTabValue(tabId, "groupId")]);
				const tab = { ...newTab, groupId: newTabGroupId };
				onTabAddedAtIndex(tab.index, tab);
				setTabs((tabs) => ({ ...tabs, [tabId]: tab }));
				setTabOrder((tabOrder) => [...tabOrder.slice(0, newTab.index), tabId, ...tabOrder.slice(newTab.index)]);
			});

			browser.tabs.onCreated.addListener(async (newTab) => {
				if (newTab.windowId !== WIN_ID) return;
				const newTabGroupId = await browser.sessions.getTabValue(newTab.id!, "groupId");
				const tab = { ...newTab, groupId: newTabGroupId };
				onTabAddedAtIndex(tab.index, tab);
				setTabs((tabs) => ({ ...tabs, [newTab.id!]: tab }));
				setTabOrder((tabOrder) => [...tabOrder.slice(0, newTab.index), newTab.id!, ...tabOrder.slice(newTab.index)]);
			});

			browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
				if (oldWindowId !== WIN_ID) return;
				const tab = tabsRef.current[tabId];
				onTabRemovedAtIndex(tab.index, tab);
				setTabs((tabs) => {
					const { [tabId]: removedTab, ...newTabs } = tabs;
					return newTabs;
				});
				setTabOrder((tabOrder) => tabOrder.filter((id) => id !== tabId));
			});
			browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
				if (windowId !== WIN_ID) return;
				const tab = tabsRef.current[tabId];
				onTabRemovedAtIndex(tab.index, tab);
				setTabs((tabs) => {
					const { [tabId]: removedTab, ...newTabs } = tabs;
					return newTabs;
				});
				setTabOrder((tabOrder) => tabOrder.filter((id) => id !== tabId));
			});
			browser.tabs.onHighlighted.addListener(({ tabIds, windowId }) => {
				if (windowId !== WIN_ID) return;
				setTabs((tabs) => {
					const newTabs = { ...tabs };
					for (const tabId of tabIds) newTabs[tabId] = { ...tabs[tabId], highlighted: true };
					return newTabs;
				});
			});
			browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
				if (windowId !== WIN_ID) return;
				const newTabOrder = arrWithReposition(tabOrderRef.current, fromIndex, toIndex);
				setTabOrder(newTabOrder);
				setTabs((tabs) => {
					const newTabs = { ...tabs };
					for (const [index, tabId] of newTabOrder.entries()) newTabs[tabId] = { ...tabs[tabId], index };
					return newTabs;
				});
				const tab = tabsRef.current[tabId];
				onTabMoved(fromIndex, toIndex, tab);
			});
			browser.tabs.onUpdated.addListener(
				async (tabId, changeInfo, newTabState) => {
					// const newTabGroupId = await browser.sessions.getTabValue(tabId, "groupId");
					setTabs((tabs) => ({ ...tabs, [tabId]: { ...tabs[tabId], ...newTabState } }));
				},
				{ windowId: WIN_ID }
			);
		}
		async function setupTabs() {
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

			setupTabListeners();
		}
		setupTabs();
	}, []);

	async function setTabGroupIds(tabIds: number[], groupId: string) {
		await Promise.all(tabIds.map(async (tabId) => await browser.sessions.setTabValue(tabId, "groupId", groupId)));
		setTabs((tabs) => {
			const newTabs = { ...tabs };
			for (const tabId of tabIds) newTabs[tabId] = { ...tabs[tabId], groupId };
			return newTabs;
		});
	}

	const tabs2: Tab[] = tabOrder.map((tabId) => ({ ...tabs[tabId], dragging: false }));
	const pinnedTabs = tabs2.filter((tab) => tab.pinned);
	const regularTabs = tabs2.filter((tab) => !tab.pinned);

	async function persistGroups() {
		await browser.sessions.setWindowValue(WIN_ID, "tabGroups", groups);
	}

	const tabManagerMethods: TabManagerMethods = {
		addNewGroup: async function (firstTabs: Tab[]): Promise<void> {
			console.log("Adding new group");
			// Filter out pinned tabs
			firstTabs = firstTabs.filter((tab) => !tab.pinned);
			// Sort Tabs by index
			firstTabs.sort((a, b) => a.index - b.index);
			console.log("First tabs", firstTabs);
			// Get index of lowest-index tab in group
			const groupIndex = (firstTabs.length > 0 ? firstTabs[0].index : regularTabs.length) - pinnedTabs.length;
			console.log("Group index", groupIndex);
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
			//Persist groups
			await persistGroups();
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
