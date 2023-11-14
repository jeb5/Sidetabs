export function getElementYPosition(element: HTMLElement): number {
	return element.getBoundingClientRect().top + window.scrollY;
}

export const arrWithReposition = (arr: any[], from: number, to: number) => {
	const result = [...arr];
	const [removed] = result.splice(from, 1);
	result.splice(to, 0, removed);
	return result;
};
