import React, { useState } from "react";

import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

import SortableTab from "./SortableTab";
import Tab from "./Tab";

export default function TabsList(props: {
	tabs: Tab[];
	onReorder: (tabId: number, tabToSwapWithId: number) => void;
	onStart: () => void;
}) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (over?.id && active.id !== over.id) {
			props.onReorder(Number(active.id), Number(over.id));
		}
	}

	return (
		<div className="tabsDiv">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				onDragStart={props.onStart}
				modifiers={[restrictToFirstScrollableAncestor, restrictToVerticalAxis]}>
				<SortableContext items={props.tabs.map(({ id }) => String(id!))} strategy={verticalListSortingStrategy}>
					{props.tabs.map(tab => (
						<SortableTab key={String(tab.id)} id={String(tab.id)} tab={tab} />
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
}
