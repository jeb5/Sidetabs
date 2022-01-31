import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TabElement from "./TabElement";
import Tab from "./Tab";

export default function sortableTab(props: { id: string; tab: Tab }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: props.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			className={`sortableTab${isDragging ? " dragging" : ""}`}
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}>
			<TabElement tab={props.tab} />
		</div>
	);
}
