// Features I want:
// + Basic drag and drop
// + HTML5 dnd
// + A drag finished callback
// - The ability to cancel a drag
// + Axis lock
// + Lock to the parent component
// Ideally:
//	- Drag and drop between components (Seems difficult...)
//  + The ability to handle items of multiple sizes
//  + The ability to handle list mutations (items added, items removed)
import React, { useCallback, useEffect, useRef, useState } from "react";

const DRAG_SPEED = 150; //translation transform time in ms
export type DragProps = {
	style: React.CSSProperties;
	onDragStart: (event: React.DragEvent<HTMLElement>) => void;
	draggable: "true";
	ref: React.RefCallback<HTMLElement>;
};

interface RearrangeableItem {
	id: string;
}

type ActiveDragInfo = {
	id: string;
	startingIndex: number; // The index of the element when the drag started
	mouseElementOffset: number; // The offset between element ypos and mouse
	restingPosition: number; // The planned position of the element when the drag ends
	lastMousePosition: number;
	restingPositionItemId: string; // The id of element currently displaced by dragged element
	initialElementBounds: { [id: string]: [yPosition: number, height: number] }; // The bounds of each element when the drag started. Height includes gap
	bottomPosition: number; // The lowest possible position of the current dragged element
};

type DragAndDropProps<T extends RearrangeableItem> = {
	items: T[];
	render: ([item, dragProps]: [item: T, props: DragProps, itemIsDragging: boolean][]) => React.ReactElement;
	onDragEnd: (fromIndex: number, toIndex: number) => any;
	onDragStart?: () => any;
};

function getElementYPosition(element: HTMLElement): number {
	return element.getBoundingClientRect().top + window.scrollY;
}

export const arrWithReposition = (arr: any[], from: number, to: number) => {
	const result = [...arr];
	const [removed] = result.splice(from, 1);
	result.splice(to, 0, removed);
	return result;
};

const DragAndDrop = <T extends RearrangeableItem>({ render, items, onDragEnd, onDragStart }: DragAndDropProps<T>) => {
	const [draggingInfo, setDraggingInfo] = useState<ActiveDragInfo | null>(null);
	const [dragElements, setDragElements] = useState<{ [id: string]: HTMLElement }>({});
	const [elementTranslations, setElementTranslations] = useState<{ [id: string]: number }>({});
	const [DIFT, setDIFT] = useState<{
		id: string;
		timeout: number;
		element: HTMLElement;
		newTranslateY: number;
	} | null>(null); // set while dragged item transitions to it's final position using CSS.

	const recalculateDraggingInfo = (draggingItemId: string, mouseElementOffset: number) => {
		const getElementInitYFromIndex = (index: number) => {
			const element = dragElements[items[index].id];
			const translation = elementTranslations[items[index].id] || 0;
			return getElementYPosition(element) - translation;
		};
		const getElementHeightFromIndex = (index: number) => {
			const element = dragElements[items[index].id];
			return element.getBoundingClientRect().height;
		};

		const elementIndex = items.findIndex(item => item.id === draggingItemId);
		const startingPosition = getElementInitYFromIndex(elementIndex);
		const startingIndex = items.map(({ id }) => id).indexOf(draggingItemId);

		const gap = getElementInitYFromIndex(1) - (getElementInitYFromIndex(0) + getElementHeightFromIndex(0));

		const initialElementBounds = Object.fromEntries(
			items.map(({ id }, index) => [
				id,
				[getElementInitYFromIndex(index), getElementHeightFromIndex(index) + gap] as [number, number],
			])
		);
		getElementInitYFromIndex(items.length - 1) + getElementHeightFromIndex(items.length - 1) + gap;

		setDraggingInfo({
			id: draggingItemId,
			mouseElementOffset,
			startingIndex,
			restingPositionItemId: draggingItemId,
			lastMousePosition: startingPosition + mouseElementOffset,
			restingPosition: startingPosition,
			initialElementBounds,
			bottomPosition:
				getElementInitYFromIndex(items.length - 1) +
				getElementHeightFromIndex(items.length - 1) -
				getElementHeightFromIndex(elementIndex),
			// gap,
		});
		// handleNewMousePosition(initialMousePosition);
	};
	const dragBeginning = (event: React.DragEvent<HTMLElement>, item: RearrangeableItem) => {
		event.dataTransfer.setDragImage(document.createElement("div"), 0, 0);
		if (items.length < 2) return;
		if (onDragStart) onDragStart();
		if (DIFT) {
			clearTimeout(DIFT.timeout);
			setDIFT(null);
		}
		recalculateDraggingInfo(item.id, event.pageY - getElementYPosition(dragElements[item.id]));
	};

	const handleNewMousePosition = (newMousePostion: number) => {
		if (!draggingInfo) return;
		if (newMousePostion == draggingInfo.lastMousePosition) return;
		let dragInfoToSet = { ...draggingInfo, lastMousePosition: newMousePostion };
		const elementPosition = newMousePostion - draggingInfo.mouseElementOffset;
		const [closestPositionItemId] = Object.entries(draggingInfo.initialElementBounds).reduce(
			(closest, [currentId, [currentPosition]]) => {
				const distance = Math.abs(elementPosition - currentPosition);
				return distance < closest[1] ? [currentId, distance] : closest;
			},
			["", Infinity]
		);
		let newElementTranslations = { ...elementTranslations }; // a new object must be created so as to trigger the rerender
		if (draggingInfo.restingPositionItemId != closestPositionItemId) {
			newElementTranslations = {};
			const [restingPosition] = draggingInfo.initialElementBounds[closestPositionItemId];
			dragInfoToSet = { ...dragInfoToSet, restingPositionItemId: closestPositionItemId, restingPosition };
			const restingPositionIndex = items.findIndex(({ id }) => id === closestPositionItemId);
			const intermediateItems =
				restingPositionIndex > draggingInfo.startingIndex
					? items.slice(draggingInfo.startingIndex + 1, restingPositionIndex + 1)
					: items.slice(restingPositionIndex, draggingInfo.startingIndex);
			const down = restingPositionIndex > draggingInfo.startingIndex;
			intermediateItems.forEach(item => {
				newElementTranslations[item.id] = (down ? -1 : 1) * draggingInfo.initialElementBounds[draggingInfo.id][1];
			});
		}
		//axis lock
		const top = draggingInfo.initialElementBounds[items[0].id][0];
		const bottom = draggingInfo.bottomPosition;

		const newElementPosition = Math.min(Math.max(elementPosition, top), bottom);
		newElementTranslations[draggingInfo.id] =
			newElementPosition - draggingInfo.initialElementBounds[draggingInfo.id][0];
		//
		setElementTranslations(newElementTranslations);
		setDraggingInfo(dragInfoToSet);
	};
	const dragEnding = () => {
		if (!draggingInfo) return;
		const element = dragElements[draggingInfo.id];
		const [previousTenetY, previousTenetHeight] = draggingInfo.initialElementBounds[draggingInfo.restingPositionItemId];
		const newPosition =
			elementTranslations[draggingInfo.id] < 0
				? previousTenetY
				: previousTenetY + previousTenetHeight - draggingInfo.initialElementBounds[draggingInfo.id][1];
		const newTranslateY = getElementYPosition(element) - newPosition;
		setDIFT({
			id: draggingInfo.id,
			timeout: setTimeout(() => {
				setDIFT(null);
				element.style.transition = "";
			}, DRAG_SPEED),
			element,
			newTranslateY,
		});
		setDraggingInfo(null);
		onDragEnd(
			draggingInfo.startingIndex,
			items.findIndex(({ id }) => id === draggingInfo.restingPositionItemId)
		);
		setElementTranslations({});
	};

	const handleNewMousePositionRef = useRef(handleNewMousePosition);
	handleNewMousePositionRef.current = handleNewMousePosition;
	const dragEndingRef = useRef(dragEnding);
	dragEndingRef.current = dragEnding;

	useEffect(() => {
		const handleDragMoving = (event: MouseEvent) => {
			event.preventDefault(); // Allows drop to occur instantly, rather than after a 0.5s delay (for some reason)
			handleNewMousePositionRef.current(event.pageY);
		};
		const handleDragEnd = () => dragEndingRef.current();
		document.addEventListener("dragover", handleDragMoving);
		document.addEventListener("dragend", handleDragEnd);
		return () => {
			document.removeEventListener("dragover", handleDragMoving);
			document.removeEventListener("dragend", handleDragEnd);
		};
	}, []);

	useEffect(() => {
		const itemIds = items.map(item => item.id);
		const newDragElements: { [id: string]: HTMLElement } = {};
		Object.keys(dragElements).forEach(id => {
			if (id in itemIds) newDragElements[id] = dragElements[id];
		});
		setDragElements(newDragElements);
		if (DIFT) {
			const { id, element, newTranslateY } = DIFT;
			requestAnimationFrame(() => {
				element.style.transform = `translateY(${newTranslateY}px)`;
				element.style.transition = "transform 0s";
				requestAnimationFrame(() => {
					element.style.transform = "";
					element.style.transition = `transform ${DRAG_SPEED}ms`;
				});
			});
		}
		if (draggingInfo) recalculateDraggingInfo(draggingInfo?.id, draggingInfo?.mouseElementOffset);
	}, [items]);

	const renderParameter = items.map((item: T): [T, DragProps, boolean] => {
		let itemStyle: { [styleName: string]: string } = {};
		const elementIsDragging = draggingInfo?.id === item.id;
		if (draggingInfo && !elementIsDragging) itemStyle["transition"] = `transform ${DRAG_SPEED}ms`;
		if (item.id in elementTranslations) itemStyle["transform"] = `translateY(${elementTranslations[item.id]}px)`;

		return [
			item,
			{
				style: itemStyle,
				onDragStart: (event: React.DragEvent<HTMLElement>) => dragBeginning(event, item),
				draggable: "true",
				ref: (instance: HTMLElement | null) => {
					dragElements[item.id] = instance!;
				},
			},
			elementIsDragging,
		];
	});
	return render(renderParameter);
};
export default DragAndDrop;
