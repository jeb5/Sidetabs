import Tab, { newTab } from "./Tab";
import TabElement from "./TabElement";
import "./sidebarStyles.css";
import browser from "webextension-polyfill";
import React, { ReactElement } from "react";
import { SortableContainer, SortableElement, SortEndHandler } from "react-sortable-hoc";

import NewTabIcon from "../assets/icons/new_tab.svg";

const arrWithReposition = (arr: any[], from: number, to: number) => {
	const result = [...arr];
	const [removed] = result.splice(from, 1);
	result.splice(to, 0, removed);
	return result;
};

const SortableEl = SortableElement(({ element }: { element: ReactElement }) => element);
const SortableList = SortableContainer(({ parentDiv }: { parentDiv: ReactElement }) => parentDiv);

export default function Sidebar() {
	type stateType = { tabs: { [id: string]: Tab }; tabOrder: number[] };

	const [state, setState] = React.useState<stateType>({ tabs: {}, tabOrder: [] }); //State is combined to prevent unnecessary re-renders when both peices of state change in succession.

	React.useEffect(() => {
		async function getTabs() {
			const WIN_ID = (await browser.windows.getCurrent()).id!;
			const browserTabs = await browser.tabs.query({ windowId: browser.windows.WINDOW_ID_CURRENT });
			let newTabs = browserTabs.reduce((acc, tab) => ({ ...acc, [tab.id!]: new Tab(tab) }), {});
			let tempTabOrder = new Array(browserTabs.length);
			browserTabs.forEach(tab => (tempTabOrder[tab.index] = tab.id));
			setState({ tabs: newTabs, tabOrder: tempTabOrder });
			setupTabListeners(WIN_ID);
		}
		getTabs();
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

	const handleDragEnd: SortEndHandler = ({ oldIndex, newIndex, collection }) => {
		if (oldIndex === newIndex) return;
		const movedTabId = state.tabOrder[oldIndex];
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
		browser.tabs.move(movedTabId, { index: newIndex });
	};

	const sortableListProps = {
		onSortEnd: handleDragEnd,
		lockToContainerEdges: true,
		lockOffset: "0px",
		transitionDuration: 150,
		helperClass: "dragging",
		distance: 1,
	};
	const pinnedTabs = state.tabOrder.filter(tabId => state.tabs[tabId].pinned).map(tabId => state.tabs[tabId]);
	const regularTabs = state.tabOrder.filter(tabId => !state.tabs[tabId].pinned).map(tabId => state.tabs[tabId]);
	return (
		<>
			<SortableList
				{...sortableListProps}
				lockAxis={"y"}
				parentDiv={
					<div className="tabsDiv pinnedTabs">
						{pinnedTabs.map(tab => (
							<SortableEl
								collection="pinned"
								index={tab.index}
								key={"tab-" + tab.id}
								element={<TabElement tab={tab} />}
							/>
						))}
					</div>
				}
			/>
			{pinnedTabs.length ? <hr /> : null}
			<SortableList
				{...sortableListProps}
				lockAxis={"y"}
				parentDiv={
					<div className="tabsDiv regularTabs">
						{regularTabs.map(tab => (
							<SortableEl
								collection="regular"
								index={tab.index}
								key={"tab-" + tab.id}
								element={<TabElement tab={tab} />}
							/>
						))}
					</div>
				}
			/>
			<hr />
			<div className="newTabBar" onClick={() => newTab()}>
				<div className="addBtn">
					<NewTabIcon className="icon" />
				</div>
				<div className="newTabLabel">New Tab</div>
			</div>
		</>
	);
}
