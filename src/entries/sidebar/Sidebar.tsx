import { moveTab, newTab } from "./Tab";
import React, { useContext } from "react";

import NewTabIcon from "../../assets/context_menu_icons/Tab New.svg?react";
import TabsList from "./TabsList";
import { useContextMenu } from "../ctxmenu/contextMenu";
import { OptionsContext } from "../options";
import useTabSync from "./TabSync";

export default function Sidebar() {
	const showContextMenu = useContextMenu();
	const extensionOptions = useContext(OptionsContext);

	const { tabsState, preemptTabReorder } = useTabSync();

	const pinnedTabs = tabsState.tabOrder.filter((tabId) => tabsState.tabs[tabId].pinned).map((tabId) => tabsState.tabs[tabId]);
	const regularTabs = tabsState.tabOrder.filter((tabId) => !tabsState.tabs[tabId].pinned).map((tabId) => tabsState.tabs[tabId]);

	async function handleReorder(fromIndex: number, toIndex: number, pinned: boolean) {
		const fromIndexAbs = pinned ? fromIndex : fromIndex + pinnedTabs.length;
		const toIndexAbs = pinned ? toIndex : toIndex + pinnedTabs.length;

		preemptTabReorder(fromIndexAbs, toIndexAbs);
		await moveTab(tabsState.tabOrder[fromIndexAbs], toIndexAbs);
	}

	function preventScrollCompass(e: React.MouseEvent) {
		if (e.button == 1) {
			e.preventDefault();
			return false;
		}
	}

	return (
		<div id="sidebar" onContextMenu={showContextMenu} onMouseDown={preventScrollCompass}>
			<TabsList tabs={pinnedTabs} onReorder={(from, to) => handleReorder(from, to, true)} className="pinnedTabs" />
			{pinnedTabs.length ? <hr /> : null}
			<TabsList tabs={regularTabs} onReorder={(from, to) => handleReorder(from, to, false)} className="regularTabs" />
			{extensionOptions["appearance/newTabButton"] && (
				<>
					{regularTabs.length ? <hr /> : null}
					<div className="newTabBar" onClick={() => newTab()}>
						<div className="addBtn">
							<NewTabIcon className="icon" />
						</div>
						<div className="newTabLabel">New Tab</div>
					</div>
				</>
			)}
		</div>
	);
}
