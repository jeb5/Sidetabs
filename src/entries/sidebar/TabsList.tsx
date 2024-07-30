import React, { useContext, useEffect, useRef, useState } from "react";
import TabElement from "./TabElement";
import { TabListItem } from "./TabManager";
import Group from "./Group";

// export default function TabsList(props: { tabs: Tab[]; onReorder: (fromIndex: number, toIndex: number) => void; className: string }) {
export default function TabsList(props: { items: TabListItem[]; className?: string }) {
	// const [dragging, setDragging] = useState(false);

	// const tabsScrollDiv = useRef<HTMLDivElement>(null);
	// const extensionOptions = useContext(OptionsContext);

	//When a new tab is added, set the newestTabId to the id of the new tab, so that it can be scrolled into view.
	// const [newlyActiveTabId, setNewlyActiveTabId] = useState<string | null>(null);
	// const [activeTabId, lastActiveTabId] = useState<number | null>();

	// useEffect(() => {
	// 	if (!extensionOptions["behavior/scrollToActiveTab"]) return;
	// 	const newActiveTab = props.tabs.findLast((tab) => tab.active);
	// 	if (newActiveTab === undefined || newActiveTab.id == activeTabId) return;
	// 	setNewlyActiveTabId(String(newActiveTab.id));
	// 	lastActiveTabId(newActiveTab.id);
	// }, [props.tabs]);

	// const scrollToNewlyActiveTab = (tabId: string, el: HTMLDivElement | null) => {
	// 	if (el != null) {
	// 		const tabIndex = props.tabs.findLastIndex((tab) => tab.id === Number(tabId))!;
	// 		if (tabIndex === 0) {
	// 			tabsScrollDiv.current!.scrollTo({ top: 0, behavior: "smooth" });
	// 		} else if (tabIndex === props.tabs.length - 1) {
	// 			tabsScrollDiv.current!.scrollTo({ top: tabsScrollDiv.current!.scrollHeight, behavior: "smooth" });
	// 		} else {
	// 			el.scrollIntoView({ behavior: "smooth", block: "nearest" });
	// 		}
	// 		setNewlyActiveTabId(null);
	// 	}
	// };

	// const handleDragStart = (item: RearrangeableItem, dragEvent: React.DragEvent<HTMLElement>) => {
	// 	const tab = props.tabs.find((tab) => tab.id === Number(item.id))!;
	// 	const { url, title } = tab;
	// 	dragEvent.dataTransfer.dropEffect = "copy";
	// 	dragEvent.dataTransfer.effectAllowed = "copy";
	// 	dragEvent.dataTransfer.setData("text/uri-list", url!);
	// 	dragEvent.dataTransfer.setData("text/plain", url!);
	// 	dragEvent.dataTransfer.setData("text/x-moz-url", url! + "\n" + title!);
	// 	setDragging(true);
	// };

	// function handleDragEnd(reorderInfo?: { fromIndex: number; toIndex: number }) {
	// 	if (reorderInfo) {
	// 		const { fromIndex, toIndex } = reorderInfo;
	// 		props.onReorder(fromIndex, toIndex);
	// 	}
	// 	setTimeout(() => setDragging(false), 300);
	// }

	return (
		<div className={`tabsDiv${props.className ? " " + props.className : ""}`}>
			{props.items.map((item) => {
				switch (item.type) {
					case "tab":
						return (
							<div className="tab-holder" key={item.tab.id}>
								<TabElement tab={item.tab} />
							</div>
						);
					case "landingSpot":
						return <div className="landingSpot" key={`${item.landingSpot.index}.${item.landingSpot.subIndex}`} />;
					case "group":
						return <Group items={item.group.groupItems} groupInfo={item.group.groupInfo} key={item.group.groupInfo.id} />;
				}
			})}
		</div>
	);
}
