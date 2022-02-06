import Tab, { newTab } from "./Tab";
import browser from "webextension-polyfill";
import React from "react";

import NewTabIcon from "parcel-svg:../assets/icons/Tab New.svg";
import TabsList from "./TabsList";

const arrWithReposition = (arr: any[], from: number, to: number) => {
	const result = [...arr];
	const [removed] = result.splice(from, 1);
	result.splice(to, 0, removed);
	return result;
};

export default function Sidebar() {
	type stateType = { tabs: { [id: string]: Tab }; tabOrder: number[] };

	const [state, setState] = React.useState<stateType>({ tabs: {}, tabOrder: [] }); //State is combined to prevent unnecessary re-renders when both pieces of state change in succession.
	const [tabsHashOnDragStart, setTabsHashOnDragStart] = React.useState<string>("");

	React.useEffect(() => {
		async function updateTabs() {
			const browserTabs = await browser.tabs.query({ currentWindow: true });
			let newTabs = browserTabs.reduce((acc, tab) => ({ ...acc, [tab.id!]: new Tab(tab) }), {});
			let tempTabOrder = new Array(browserTabs.length);
			browserTabs.forEach(tab => (tempTabOrder[tab.index] = tab.id));
			setState({ tabs: newTabs, tabOrder: tempTabOrder });
		}
		async function setupTabs() {
			await updateTabs();
			const WIN_ID = (await browser.windows.getCurrent()).id!;
			setupTabListeners(WIN_ID);
		}
		setupTabs();
	}, []);

	//to prevent state from being stale, these callback functions use the callback version  of setState().
	function setupTabListeners(WIN_ID: number) {
		browser.tabs.onActivated.addListener(({ previousTabId, tabId, windowId }) => {
			if (windowId !== WIN_ID) return;
			setState(({ tabs, tabOrder }) => ({
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
			setState(({ tabs, tabOrder }) => ({
				tabs: { ...tabs, [tabId]: newTab },
				tabOrder: [...tabOrder.slice(0, newTab.index), tabId, ...tabOrder.slice(newTab.index)],
			}));
		});

		browser.tabs.onCreated.addListener(tab => {
			if (tab.windowId !== WIN_ID) return;
			setState(({ tabs, tabOrder }) => ({
				tabs: { ...tabs, [tab.id!]: new Tab(tab) },
				tabOrder: [...tabOrder.slice(0, tab.index), tab.id!, ...tabOrder.slice(tab.index)],
			}));
		});

		browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
			if (oldWindowId !== WIN_ID) return;
			setState(({ tabs, tabOrder }) => ({
				tabs: Object.fromEntries(Object.entries(tabs).filter(([id, tab]) => Number(id) !== tabId)),
				tabOrder: [...tabOrder.slice(0, tabOrder.indexOf(tabId)), ...tabOrder.slice(tabOrder.indexOf(tabId) + 1)],
			}));
		});
		browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
			if (windowId !== WIN_ID) return;
			setState(({ tabs, tabOrder }) => ({
				tabs: Object.fromEntries(Object.entries(tabs).filter(([id, tab]) => Number(id) !== tabId)),
				tabOrder: [...tabOrder.slice(0, tabOrder.indexOf(tabId)), ...tabOrder.slice(tabOrder.indexOf(tabId) + 1)],
			}));
		});
		browser.tabs.onHighlighted.addListener(({ tabIds, windowId }) => {
			if (windowId !== WIN_ID) return;
			setState(({ tabs, tabOrder }) => ({
				tabs: tabIds.reduce((acc, tabId) => ({ ...acc, [tabId]: { ...tabs[tabId], highlighted: true } }), { ...tabs }),
				tabOrder,
			}));
		});
		browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
			if (windowId !== WIN_ID) return;
			setState(({ tabs, tabOrder }) => {
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
			(tabId, changeInfo) => {
				setState(({ tabs, tabOrder }) => ({
					tabs: { ...tabs, [tabId]: { ...tabs[tabId], ...changeInfo } },
					tabOrder,
				}));
			},
			{ windowId: WIN_ID }
		);
	}

	const handleSortStart = () => {
		setTabsHashOnDragStart(JSON.stringify(state.tabOrder));
	};
	const handleTabSwap = (tabId: number, tabToSwapWithId: number) => {
		if (tabsHashOnDragStart !== JSON.stringify(state.tabOrder)) return; //ideally tab changes would cancel the drag, but that doesn't appear to be possible with DnDKit so disregarding drags that have occurred amidst tab changes will suffice for now
		const oldIndex = state.tabOrder.indexOf(tabId);
		const newIndex = state.tabOrder.indexOf(tabToSwapWithId);
		setState(({ tabs, tabOrder }) => {
			const newTabOrder = arrWithReposition(tabOrder, oldIndex, newIndex);
			const newTabs = Object.fromEntries(
				Object.entries(tabs).map(([id, tab]) => [id, { ...tab, index: newTabOrder.indexOf(Number(id)) } as Tab])
			);
			return {
				tabs: newTabs,
				tabOrder: newTabOrder,
			};
		});
		browser.tabs.move(tabId, { index: newIndex });
	};

	const pinnedTabs = state.tabOrder.filter(tabId => state.tabs[tabId].pinned).map(tabId => state.tabs[tabId]);
	const regularTabs = state.tabOrder.filter(tabId => !state.tabs[tabId].pinned).map(tabId => state.tabs[tabId]);
	return (
		<>
			<TabsList tabs={pinnedTabs} onReorder={handleTabSwap} onStart={handleSortStart}></TabsList>
			{pinnedTabs.length ? <hr /> : null}
			<TabsList tabs={regularTabs} onReorder={handleTabSwap} onStart={handleSortStart}></TabsList>
			{regularTabs.length ? <hr /> : null}
			<div className="newTabBar" onClick={() => newTab()}>
				<div className="addBtn">
					<NewTabIcon className="icon" />
				</div>
				<div className="newTabLabel">New Tab</div>
			</div>
		</>
	);
}
