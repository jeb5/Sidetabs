import React from "react";
import ReactDOM from "react-dom/client";
import { OptionsProvider } from "../options";
import { ThemeSetter } from "../theme/themesHandler";
import Sidebar from "./Sidebar";

const reactRoot = ReactDOM.createRoot(document.getElementById("reactRoot")!);

reactRoot.render(
	<OptionsProvider>
		<ThemeSetter />
		<Sidebar />
	</OptionsProvider>
);
