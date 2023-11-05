import React, { useState } from "react";
import DragAndDrop from "react-vertical-dnd";
import TabElement from "./TabElement";

import { Tab } from "./Tab";

export default function TabsList(props: {
	tabs: Tab[];
	onReorder: (tabId: number, tabToSwapWithId: number) => void;
	className: string;
}) {
	function handleDragEnd(fromIndex: number, toIndex: number) {
		props.onReorder(fromIndex, toIndex);
	}
	const [dragging, setDragging] = useState(false);

	return (
		<div className={`tabsDiv${dragging ? " reordering" : ""}${" " + props.className}`}>
			<DragAndDrop
				items={props.tabs.map(({ id }, index) => ({ index, id: String(id) }))}
				onDragEnd={(from, to) => {
					handleDragEnd(from, to);
					setTimeout(() => setDragging(false), 300);
				}}
				onDragStart={(item, dragEvent) => {
					const tab = props.tabs.find((tab) => tab.id === Number(item.id))!;
					const { url, title } = tab;
					// console.log(url, title, "started dragging");
					dragEvent.dataTransfer.dropEffect = "copy";
					dragEvent.dataTransfer.effectAllowed = "copy";
					dragEvent.dataTransfer.setData("text/uri-list", url!);
					dragEvent.dataTransfer.setData("text/plain", url!);
					dragEvent.dataTransfer.setData("text/x-moz-url", url! + "\n" + title!);
					setDragging(true);
				}}
				render={items => (
					<>
						{items.map(([item, dragprops, isDragging]) => (
							<div className={`sortableTab${isDragging ? " dragging" : ""}`} {...dragprops} key={item.id}>
								<TabElement tab={props.tabs[item.index]} beingDragged={isDragging} />
							</div>
						))}
					</>
				)}
			/>
		</div>
	);
}
