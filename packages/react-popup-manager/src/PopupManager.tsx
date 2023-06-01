import { useEffect, useRef, useState } from "react";
import React = require("react");
import { createPortal } from "react-dom";

export default function usePopupManager<T extends { [popupName: string]: (close: () => void, ...args: any[]) => any }>(
	popupFunctions: T
) {
	const [popupStates, setPopupStates] = useState(
		Object.fromEntries(Object.keys(popupFunctions).map(key => [key, { open: false, args: [] as any[] }]))
	);

	const popupContainer = useRef<HTMLElement | null>(null);
	useEffect(() => {
		const existingContainer = document.getElementById("popup-container");
		if (existingContainer) {
			popupContainer.current = existingContainer;
		} else {
			popupContainer.current = document.createElement("div");
			popupContainer.current.id = "popup-container";
			document.body.appendChild(popupContainer.current);
		}
	}, []);

	const popupsInfo = Object.fromEntries(
		Object.entries(popupFunctions).map(([name, popup]) => {
			return [
				name,
				{
					isOpen: popupStates[name].open,
					setOpen: (open: boolean) => setPopupStates({ ...popupStates, [name]: { open, args: [] } }),
					trigger: (...args) => {
						setPopupStates({
							...popupStates,
							[name]: { open: true, args: args },
						});
						popup(close, ...args);
					},
				},
			];
		})
	) as {
		[K in keyof T]: {
			isOpen: boolean;
			setOpen: (open: boolean) => void;
			trigger: (...args: T[K] extends (close: () => void, ...a: infer R) => any ? R : never) => void;
		};
	};
	const PopupRenderer = () => {
		const openPopup = Object.entries(popupStates).find(([name, state]) => state.open);
		if (!openPopup) return null;
		const [popupName, { args }] = openPopup;
		const popup = popupFunctions[popupName];

		const closeFn = () => {
			setPopupStates({ ...popupStates, [popupName]: { open: false, args: [] } });
		};

		return popupContainer.current
			? createPortal(<div className="popup-dimmer">{popup(closeFn, ...args)}</div>, popupContainer.current)
			: null;
	};
	return { popupsInfo, PopupRenderer };
}
