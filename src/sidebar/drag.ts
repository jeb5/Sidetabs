// /**
//  * Handles drag and drop for an element inside a container.
//  *
//  * @returns A promise that rejects if the drag is canceled, and moves the element, resolving with the element's new index if the element is dropped.
//  */
// export default function drag(dragstartEvent: DragEvent, element: HTMLElement, container: HTMLElement) {
// 	let finishDrag: (index: number) => void, cancelDrag: () => void;

// 	const siblingElements = Array.from(container.children) as HTMLElement[];
// 	const dBR = container.getBoundingClientRect();
// 	const tBR = element.getBoundingClientRect();
// 	const elementRelativeY = tBR.top - dBR.top;
// 	const index = siblingElements.indexOf(element);
// 	const dragHoldOffset = dragstartEvent.pageY - tBR.top;
// 	const elementStyle = window.getComputedStyle(element);
// 	const minY = parseInt(elementStyle.marginTop);
// 	const maxY = dBR.height - tBR.height - parseInt(elementStyle.marginBottom);
// 	const siblingHeight = dBR.height / siblingElements.length;

// 	siblingElements.forEach(el => el.classList.add("dragSibling"));
// 	element.classList.add("dragging");

// 	let lastWantedIndex = index;
// 	let dragOverListener = (e: MouseEvent) => {
// 		e.preventDefault();
// 		const y = e.pageY - dBR.top - dragHoldOffset;
// 		const clampedY = Math.max(Math.min(y, maxY), minY);
// 		const translation = clampedY - elementRelativeY;
// 		element.style.transform = `translate(0,${translation}px)`;

// 		const wantedIndex = Math.round(clampedY / siblingHeight);
// 		if (wantedIndex === lastWantedIndex) return;
// 		lastWantedIndex = wantedIndex;
// 		// Shift other elements out of the way
// 		if (wantedIndex > index) {
// 			const [minT, maxT] = [index, wantedIndex];
// 			siblingElements.forEach((el, i) => {
// 				if (i == index) return;
// 				if (i > minT && i <= maxT) el.style.transform = `translate(0,${-siblingHeight}px)`;
// 				else el.style.transform = "";
// 			});
// 		} else {
// 			const [minT, maxT] = [wantedIndex, index];
// 			siblingElements.forEach((el, i) => {
// 				if (i === index) return;
// 				if (i >= minT && i < maxT) el.style.transform = `translate(0,${siblingHeight}px)`;
// 				else el.style.transform = "";
// 			});
// 		}
// 	};
// 	document.addEventListener("dragover", dragOverListener);

// 	let dragEndedListener = (e: DragEvent) => {
// 		e.preventDefault();
// 		document.removeEventListener("dragover", dragOverListener);
// 		document.removeEventListener("dragend", dragEndedListener);
// 		document.removeEventListener("drop", dragEndedListener);

// 		element.classList.remove("dragging");
// 		siblingElements.forEach(el => el.classList.remove("dragSibling"));
// 		siblingElements.forEach(el => (el.style.transform = ""));

// 		if (lastWantedIndex != index) {
// 			if (lastWantedIndex < index) {
// 				container.insertBefore(element, siblingElements[lastWantedIndex]);
// 			} else {
// 				container.insertBefore(element, siblingElements[lastWantedIndex].nextSibling);
// 			}
// 			return finishDrag(lastWantedIndex);
// 		}

// 		return cancelDrag();
// 	};
// 	document.addEventListener("dragend", dragEndedListener);
// 	document.addEventListener("drop", dragEndedListener);

// 	return new Promise((rs: (index: number) => void, rj) => {
// 		finishDrag = rs;
// 		cancelDrag = rj;
// 	});
// }
