import { newTab } from "./Tab";
import React, { useContext } from "react";

import "./sidebarStyles.css";

import NewTabIcon from "../../assets/context_menu_icons/Tab New.svg?react";
import TabsList from "./TabsList";
import { useContextMenu } from "../ctxmenu/contextMenu";
import { OptionsContext } from "../options";
import { TabManagerContext } from "./TabManager";

export default function Sidebar() {
	const showContextMenu = useContextMenu();
	const extensionOptions = useContext(OptionsContext);
	const { tabStructure } = useContext(TabManagerContext)!;

	function preventScrollCompass(e: React.MouseEvent) {
		if (e.button == 1) {
			e.preventDefault();
			return false;
		}
	}

	const pinnedTabsEmpty = tabStructure.pinned.length <= 1;
	const regularTabsEmpty = tabStructure.regular.length <= 1;

	return (
		<div id="sidebar" onContextMenu={showContextMenu} onMouseDown={preventScrollCompass}>
			<TabsList items={tabStructure.pinned} className={`pinnedTabs${pinnedTabsEmpty ? " empty" : ""}`} />
			{!pinnedTabsEmpty && <hr />}
			<TabsList items={tabStructure.regular} className={`regularTabs${regularTabsEmpty ? " empty" : ""}`} />
			{extensionOptions["appearance/newTabButton"] && (
				<>
					{!regularTabsEmpty ? <hr /> : null}
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
