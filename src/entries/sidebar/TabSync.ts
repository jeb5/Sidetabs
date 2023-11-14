import { useEffect, useState } from "react";
import { Tab } from "./Tab";
import browser from "webextension-polyfill";
import { arrWithReposition } from "../utils/utils";

export type TabsState = { tabs: { [id: string]: Tab }; tabOrder: number[] };

//Decoupling the extension from the tabs API would be ideal. On every tab change, sidetabs would recieve the updated complete tabs state, and update it's UI accordingly.
//However, browser.tabs.query(...) doesn't consistently return the up-to-date state of the tabs. After a tab update, even after 100ms, the tabs state returned by query is sometimes stale.

export default function useTabSync() {
	const [tabsState, setTabsState] = useState<TabsState>({ tabs: {}, tabOrder: [] }); //State is combined to prevent unnecessary re-renders when both pieces of state change in succession.

	useEffect(() => {
		async function setupTabs() {
			const browserTabs = await browser.tabs.query({ currentWindow: true });

			let newTabs = browserTabs.reduce((acc, tab) => ({ ...acc, [tab.id!]: tab }), {});
			let tempTabOrder = new Array(browserTabs.length);
			browserTabs.forEach((tab) => (tempTabOrder[tab.index] = tab.id));

			setTabsState({ tabs: newTabs, tabOrder: tempTabOrder });
			const WIN_ID = (await browser.windows.getCurrent()).id!;
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
			let newTab = await browser.tabs.get(tabId);
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: { ...tabs, [tabId]: newTab },
				tabOrder: [...tabOrder.slice(0, newTab.index), tabId, ...tabOrder.slice(newTab.index)],
			}));
		});

		browser.tabs.onCreated.addListener((tab) => {
			if (tab.windowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: { ...tabs, [tab.id!]: tab },
				tabOrder: [...tabOrder.slice(0, tab.index), tab.id!, ...tabOrder.slice(tab.index)],
			}));
		});

		browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
			if (oldWindowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: Object.fromEntries(Object.entries(tabs).filter(([id, tab]) => Number(id) !== tabId)),
				tabOrder: [...tabOrder.slice(0, tabOrder.indexOf(tabId)), ...tabOrder.slice(tabOrder.indexOf(tabId) + 1)],
			}));
		});
		browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
			if (windowId !== WIN_ID) return;
			setTabsState(({ tabs, tabOrder }) => ({
				tabs: Object.fromEntries(Object.entries(tabs).filter(([id, tab]) => Number(id) !== tabId)),
				tabOrder: [...tabOrder.slice(0, tabOrder.indexOf(tabId)), ...tabOrder.slice(tabOrder.indexOf(tabId) + 1)],
			}));
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
				return {
					tabs: Object.fromEntries(
						Object.entries(tabs).map(([id, tab]) => [id, { ...tab, index: newTabOrder.indexOf(Number(id)) } as Tab])
					),
					tabOrder: newTabOrder,
				};
			});
		});
		browser.tabs.onUpdated.addListener(
			(tabId, changeInfo, newTabState) => {
				setTabsState(({ tabs, tabOrder }) => {
					return {
						tabs: { ...tabs, [tabId]: newTabState },
						tabOrder,
					};
				});
			},
			{ windowId: WIN_ID }
		);
	}

	function preemptTabReorder(fromIndex: number, toIndex: number) {
		setTabsState(({ tabs, tabOrder }) => {
			const newTabOrder = arrWithReposition(tabOrder, fromIndex, toIndex);
			const newTabs = Object.fromEntries(
				Object.entries(tabs).map(([id, tab]) => [id, { ...tab, index: newTabOrder.indexOf(Number(id)) } as Tab])
			);
			return {
				tabs: newTabs,
				tabOrder: newTabOrder,
			};
		});
	}

	return { tabsState, preemptTabReorder };
}
