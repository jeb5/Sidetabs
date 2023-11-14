import React, { useEffect, useRef, useState } from "react";
import DragAndDrop, { RearrangeableItem } from "react-vertical-dnd";
import TabElement from "./TabElement";
import { Tab } from "./Tab";
import { usePrevious } from "../utils/utils";

export default function TabsList(props: { tabs: Tab[]; onReorder: (fromIndex: number, toIndex: number) => void; className: string }) {
	const [dragging, setDragging] = useState(false);

	//When a new tab is added, set the newestTabId to the id of the new tab, so that it can be scrolled into view.
	const [newestTabId, setNewestTabId] = useState<string | null>(null);
	const previousTabs = usePrevious(props.tabs);
	useEffect(() => {
		const previousTabsIds = (previousTabs || []).map((tab) => tab.id!);
		const newTabs = props.tabs.filter((tab) => !previousTabsIds.includes(tab.id!));
		if (newTabs.length == 1) setNewestTabId(String(newTabs[0].id!));
	}, [props.tabs]);

	const newestTabRef = (el: HTMLDivElement | null) => {
		if (el != null) {
			el.scrollIntoView({ behavior: "smooth", block: "nearest" });
			setNewestTabId(null);
		}
	};

	const handleDragStart = (item: RearrangeableItem, dragEvent: React.DragEvent<HTMLElement>) => {
		const tab = props.tabs.find((tab) => tab.id === Number(item.id))!;
		const { url, title } = tab;
		// console.log(url, title, "started dragging");
		dragEvent.dataTransfer.dropEffect = "copy";
		dragEvent.dataTransfer.effectAllowed = "copy";
		dragEvent.dataTransfer.setData("text/uri-list", url!);
		dragEvent.dataTransfer.setData("text/plain", url!);
		dragEvent.dataTransfer.setData("text/x-moz-url", url! + "\n" + title!);
		setDragging(true);
	};

	function handleDragEnd(fromIndex: number, toIndex: number) {
		props.onReorder(fromIndex, toIndex);
		setTimeout(() => setDragging(false), 300);
	}

	return (
		<div className={`tabsDiv${dragging ? " reordering" : ""}${" " + props.className}`}>
			<DragAndDrop
				items={props.tabs.map(({ id }, index) => ({ index, id: String(id) }))}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				render={(items) => (
					<>
						{items.map(([item, dragprops, isDragging]) => (
							<div
								className={`sortableTab${isDragging ? " dragging" : ""}`}
								{...dragprops}
								key={item.id}
								ref={(el) => {
									dragprops.ref(el); // Because dragprops specifies a ref, and we'd otherwise overwrite it
									if (newestTabId == item.id) newestTabRef(el);
								}}
							>
								<TabElement tab={props.tabs[item.index]} beingDragged={isDragging} />
							</div>
						))}
					</>
				)}
			/>
		</div>
	);
}
