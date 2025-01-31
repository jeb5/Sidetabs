import { useEffect, useRef } from "react";
/**
 * Creates an updated copy of an array with the element at the specified index relocated to the new index.
 * @param arr The array to be used
 * @param from The index of the element to be moved
 * @param to The index of the new position of the element
 * @returns A new array with the element at the specified index relocated to the new index
 */
export function arrWithReposition(arr: any[], from: number, to: number) {
	const result = [...arr];
	const [removed] = result.splice(from, 1);
	result.splice(to, 0, removed);
	return result;
}

export function debounce<T extends (...args: any[]) => any>(callback: T, wait: number) {
	let timeoutId: number | null = null;
	return (...args: Parameters<T>) => {
		if (timeoutId !== null) clearTimeout(timeoutId)
		timeoutId = window.setTimeout(() => {
			callback(...args);
		}, wait);
	};
}
