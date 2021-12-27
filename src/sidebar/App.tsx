import React from "react";
import ReactDOM from "react-dom";
import Sidebar from "./Sidebar";
import observeSchemeUpdate, { stylesFromSidebarTheme } from "../theme/themesHandler";

observeSchemeUpdate(async newSidebarTheme => {
	const styleEl = document.getElementById("themeStyles")!;
	styleEl.innerHTML = await stylesFromSidebarTheme(newSidebarTheme);
});

ReactDOM.render(<Sidebar />, document.getElementById("sidebar"));