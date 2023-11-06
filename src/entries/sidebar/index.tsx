import React from "react";
import ReactDOM from "react-dom/client";
import { OptionsProvider } from "../options";
import { ThemeProvider } from "../theme/themesHandler";
import Sidebar from "./Sidebar";

const reactRoot = ReactDOM.createRoot(document.getElementById("reactRoot")!);

reactRoot.render(
	<OptionsProvider>
		<ThemeProvider>
			<Sidebar />
		</ThemeProvider>
	</OptionsProvider>
);
