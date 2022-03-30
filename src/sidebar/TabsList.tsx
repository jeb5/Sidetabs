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
				onDragStart={() => {
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
