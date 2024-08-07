import React, { useEffect, useState } from "react";
import { OptionsProvider } from "../options";
import { ThemeContextProvider } from "../theme/themesHandler";
import Sidebar from "./Sidebar";
import { CollapsedContextProvider } from "./CollapsedContext";
import { TabManagerContextProvider } from "./TabManager";
import browser from "webextension-polyfill";

type WindowInfo = {
	windowId: number;
	platform: browser.Runtime.PlatformOs;
};
export const WindowInfoContext = React.createContext<WindowInfo | null>(null);

export default function Root() {
	const [windowInfo, setWindowInfo] = useState<WindowInfo | null>(null);

	useEffect(() => {
		async function getInfo() {
			const [windowId, platform] = await Promise.all([
				browser.windows.getCurrent().then((window) => window.id!),
				browser.runtime.getPlatformInfo().then((platform) => platform.os),
			]);
			setWindowInfo({ windowId, platform });
		}
		getInfo();
	});

	return windowInfo === null ? null : (
		<WindowInfoContext.Provider value={windowInfo}>
			<OptionsProvider>
				<ThemeContextProvider>
					<CollapsedContextProvider>
						<TabManagerContextProvider>
							<Sidebar />
						</TabManagerContextProvider>
					</CollapsedContextProvider>
				</ThemeContextProvider>
			</OptionsProvider>
		</WindowInfoContext.Provider>
	);
}
