import React from "react";
import ReactDOM from "react-dom/client";
import SettingsPage from "./SettingsPage";

ReactDOM.createRoot(document.getElementById("reactRoot") as HTMLElement).render(
	<React.StrictMode>
		<SettingsPage />
	</React.StrictMode>
);
