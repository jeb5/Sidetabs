import React from "react";
import ReactDOM from "react-dom";
import { OptionsProvider } from "../options";
import { ThemeSetter } from "../theme/themesHandler";
import Sidebar from "./Sidebar";

ReactDOM.render(
	<OptionsProvider>
		<ThemeSetter />
		<Sidebar />
	</OptionsProvider>,
	document.getElementById("reactRoot")
);
