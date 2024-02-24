import React from "react";
import ReactDOM from "react-dom/client";
import { OptionsProvider } from "../options";
import { ThemeContextProvider } from "../theme/themesHandler";
import Sidebar from "./Sidebar";
import { CollapsedContextProvider } from "./CollapsedContext";

const reactRoot = ReactDOM.createRoot(document.getElementById("reactRoot")!);

reactRoot.render(
	<OptionsProvider>
		<ThemeContextProvider>
			<CollapsedContextProvider>
				<Sidebar />
			</CollapsedContextProvider>
		</ThemeContextProvider>
	</OptionsProvider>
);
