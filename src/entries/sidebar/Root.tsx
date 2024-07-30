import React, { useEffect, useState } from "react";
import { OptionsProvider } from "../options";
import { ThemeContextProvider } from "../theme/themesHandler";
import Sidebar from "./Sidebar";
import { CollapsedContextProvider } from "./CollapsedContext";
import TabManager from "./TabManager";
import browser from "webextension-polyfill";

export const WindowIDContext = React.createContext<number>(-1);

export default function Root() {
	const [windowId, setWindowId] = useState<number>(-1);

	useEffect(() => {
		browser.windows.getCurrent().then((window) => {
			setWindowId(window.id!);
		});
	});

	return windowId === -1 ? null : (
		<WindowIDContext.Provider value={windowId}>
			<OptionsProvider>
				<ThemeContextProvider>
					<CollapsedContextProvider>
						<TabManager>
							<Sidebar />
						</TabManager>
					</CollapsedContextProvider>
				</ThemeContextProvider>
			</OptionsProvider>
		</WindowIDContext.Provider>
	);
}
