import { useContext, useEffect, useState } from "react";
import { Tab } from "./TabManager";
import browser from "webextension-polyfill";
import { arrWithReposition } from "../utils/utils";
import { WindowIDContext } from "./Root";


export type TabsState = { tabs: { [id: string]: Tab }; tabOrder: number[] };

//Decoupling the extension from the tabs API would be ideal. On every tab change, sidetabs would receive the updated complete tabs state, and update the UI accordingly.
//However, browser.tabs.query(...) doesn't consistently return the up-to-date state of the tabs. After a tab update, even after 100ms, the tabs state returned by query is sometimes stale.

export default function useTabSync(onTabAddedAtIndex: (index: number, tab: Tab) => void, onTabRemovedAtIndex: (index: number, tab: Tab) => void, onTabMoved: (fromIndex: number, toIndex: number, tab: Tab) => void) {
	const [tabsState, setTabsState] = useState<TabsState>({ tabs: {}, tabOrder: [] }); //State is combined to prevent unnecessary re-renders when both pieces of state change in succession. // wait is that necessary...?
	const WIN_ID = useContext(WindowIDContext);

	useEffect(() => {
		async function setupTabs() {
			const browserTabs = await browser.tabs.query({ currentWindow: true });

			const tabPlusGroupIds: Tab[] = await Promise.all(browserTabs.map(async (tab) => {
				return {
					...tab,
					groupId: await browser.sessions.getTabValue(tab.id!, "groupId"),
				}
			}));

			const newTabs = tabPlusGroupIds.reduce((acc, tab) => ({ ...acc, [tab.id!]: tab }), {});
			const tempTabOrder = new Array(browserTabs.length);
			tabPlusGroupIds.forEach((tab) => (tempTabOrder[tab.index] = tab.id));

			setTabsState({ tabs: newTabs, tabOrder: tempTabOrder });
			setupTabListeners(WIN_ID);
		}
		setupTabs();
	}, []);

	//to prevent state from being stale, these callback functions use the callback version of setState().
	function setupTabListeners(WIN_ID: number) {
		browser.tabs.onActivated.addListener(({ previousTabId, tabId, windowId }) => {
			if (windowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: {
					...tabs,
					[tabId]: { ...tabs[tabId], active: true },
					...(previousTabId ? { [previousTabId]: { ...tabs[previousTabId], active: false } } : {}),
				},
				tabOrder,
			}));
		});

		browser.tabs.onAttached.addListener(async (tabId, { newWindowId }) => {
			if (newWindowId !== WIN_ID) return;
			const [newTab, newTabGroupId] = await Promise.all([browser.tabs.get(tabId), browser.sessions.getTabValue(tabId, "groupId")])
			const tab = { ...newTab, groupId: newTabGroupId };
			onTabAddedAtIndex(tab.index, tab);
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: { ...tabs, [tabId]: tab },
				tabOrder: [...tabOrder.slice(0, newTab.index), tabId, ...tabOrder.slice(newTab.index)],
			}));
		});

		browser.tabs.onCreated.addListener(async (newTab) => {
			if (newTab.windowId !== WIN_ID) return;
			const newTabGroupId = await browser.sessions.getTabValue(newTab.id!, "groupId");
			const tab = { ...newTab, groupId: newTabGroupId };
			onTabAddedAtIndex(tab.index, tab);
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: { ...tabs, [tab.id!]: tab },
				tabOrder: [...tabOrder.slice(0, tab.index), tab.id!, ...tabOrder.slice(tab.index)],
			}));
		});

		browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
			if (oldWindowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => {
				const tabIndex = tabOrder.indexOf(tabId);
				const tab = tabs[tabId];
				onTabRemovedAtIndex(tabIndex, tab);
				return {
					tabs: Object.fromEntries(Object.entries(tabs).filter(([id, tab]) => Number(id) !== tabId)),
					tabOrder: [...tabOrder.slice(0, tabIndex), ...tabOrder.slice(tabOrder.indexOf(tabId) + 1)],
				}
			});
		});
		browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
			if (windowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => {
				const tabIndex = tabOrder.indexOf(tabId);
				const tab = tabs[tabId];
				onTabRemovedAtIndex(tabIndex, tab);
				return {
					tabs: Object.fromEntries(Object.entries(tabs).filter(([id, tab]) => Number(id) !== tabId)),
					tabOrder: [...tabOrder.slice(0, tabIndex), ...tabOrder.slice(tabOrder.indexOf(tabId) + 1)],
				}
			});
		});
		browser.tabs.onHighlighted.addListener(({ tabIds, windowId }) => {
			if (windowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: tabIds.reduce(
					(acc, tabId) => ({
						...acc,
						[tabId]: { ...tabs[tabId], highlighted: true },
					}),
					{ ...tabs }
				),
				tabOrder,
			}));
		});
		browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
			if (windowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => {
				if (tabs[tabId].index === toIndex) return { tabs, tabOrder };
				const newTabOrder = arrWithReposition(tabOrder, fromIndex, toIndex);
				const tab = tabs[tabId];
				onTabMoved(fromIndex, toIndex, tab)
				return {
					tabs: Object.fromEntries(
						Object.entries(tabs).map(([id, tab]) => [id, { ...tab, index: newTabOrder.indexOf(Number(id)) } as Tab])
					),
					tabOrder: newTabOrder,
				};
			});
		});
		browser.tabs.onUpdated.addListener(
			async (tabId, changeInfo, newTabState) => {
				const newTabGroupId = await browser.sessions.getTabValue(tabId, "groupId");
				setTabsState(({ tabs, tabOrder }) => {
					return {
						tabs: { ...tabs, [tabId]: { ...newTabState, groupId: newTabGroupId } },
						tabOrder,
					};
				});
			},
			{ windowId: WIN_ID }
		);
	}

	// function preemptTabReorder(fromIndex: number, toIndex: number) {
	// 	setTabsState(({ tabs, tabOrder }) => {
	// 		const newTabOrder = arrWithReposition(tabOrder, fromIndex, toIndex);
	// 		const newTabs = Object.fromEntries(
	// 			Object.entries(tabs).map(([id, tab]) => [id, { ...tab, index: newTabOrder.indexOf(Number(id)) } as Tab])
	// 		);
	// 		return {
	// 			tabs: newTabs,
	// 			tabOrder: newTabOrder,
	// 		};
	// 	});
	// }

	// return { tabsState, preemptTabReorder };
	return tabsState;
}
