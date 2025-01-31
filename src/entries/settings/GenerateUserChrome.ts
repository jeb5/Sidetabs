import { OptionForm } from "../options";
import browser from "webextension-polyfill";

/*
 Who knows what's going on here honestly
 With tabs needed for backtick formatting, chaos ensues
*/

const extensionId = browser.runtime.id.substring(1, browser.runtime.id.length - 1);
const sidebarcommandAttrSelector = `sidebarcommand="_${extensionId}_-sidebar-action"`;

export default function generateUserChrome(settings: OptionForm) {
	let userChrome = `/* ########  Sidetabs Styles  ######### */
`;
	if (settings["autohiding/autohide"])
		userChrome += `
/* ~~~~~~~~ Autohiding styles ~~~~~~~~~ */
:root {
 --sidebar-hover-width: 36px;${
		settings["autohiding/expanding"]
			? `
 --sidebar-visible-width: ${settings["autohiding/sidebarwidth"]}px;
 --sidebar-transition-delay: ${settings["autohiding/debounceDelay"]}ms;
 --sidebar-transition-speed: ${settings["autohiding/transitionSpeed"]}ms;
 `
			: ""
 }
}
${(settings["autohiding/expanding"] && settings["autohiding/expandedFloats"]) ? `
#navigator-toolbox {
 z-index: 201 !important;
}
` : ""}
#sidebar-box[${sidebarcommandAttrSelector}] {
 display: grid !important;
 min-width: var(--sidebar-hover-width) !important;
 max-width: var(--sidebar-hover-width) !important;
 width: var(--sidebar-hover-width) !important;
 overflow: visible !important;
 will-change: auto !important;
 height: 100% !important;
 min-height: 100% !important;
 max-height: 100% !important;
${
			(settings["autohiding/expanding"] && !settings["autohiding/expandedFloats"]) ? `
 transition: max-width var(--sidebar-transition-speed) var(--sidebar-transition-delay) ease, width var(--sidebar-transition-speed) var(--sidebar-transition-delay) ease !important;` : ""
}
}
#sidebar-box[${sidebarcommandAttrSelector}] #sidebar {
 height: 100% !important;
 width: 100% !important;
 ${(settings["autohiding/expanding"] && settings["autohiding/expandedFloats"]) ? "z-index: 200 !important;" : ""}
 position: absolute !important;${
		settings["autohiding/expanding"]
			? `
 transition: width var(--sidebar-transition-speed) var(--sidebar-transition-delay) ease !important;`
			: ""
 }
 min-width: 0 !important;
}`;

	if (settings["autohiding/expanding"] && settings["autohiding/autohide"]) {
		if (settings["autohiding/expandedFloats"]) userChrome += `
#sidebar-box[${sidebarcommandAttrSelector}] #sidebar:hover {
 width: var(--sidebar-visible-width) !important;
}`;
		else userChrome += `
#sidebar-box[${sidebarcommandAttrSelector}]:hover {
 width: var(--sidebar-visible-width) !important;
 max-width: var(--sidebar-visible-width) !important;
}
`;
	}

	/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
	if (settings["hiddenElements/tabs"] || settings["hiddenElements/sidebarHeader"] || settings["autohiding/autohide"]) {
		userChrome += `
/* ~~~~~~~~ Hidden elements styles ~~~~~~~~~ */`;

		if (settings["hiddenElements/tabs"]) {
			if (settings["hiddenElements/titleBar"]) {
				userChrome += `
#TabsToolbar {
	display: none !important;
}`;
			} else {
				userChrome += `
#nav-bar {
 border-top-style: none !important;
}
#TabsToolbar>:not(.titlebar-buttonbox-container) {
	display: none !important;
}
#navigator-toolbox {
	/*This rule has no effect on windows*/
	background: var(--toolbar-bgcolor) !important
}
@media not (-moz-platform: macos), (-moz-mac-rtl)  {
	#TabsToolbar>.titlebar-buttonbox-container {
		margin-left: auto !important;
	}
}
@media (-moz-platform: macos) and (not (-moz-mac-rtl))  {
	#TabsToolbar>.titlebar-buttonbox-container {
		margin-right: auto !important;
	}
}
@media (-moz-platform: macos)  {
	#TabsToolbar>.titlebar-buttonbox-container {
		margin-top: 5px;
		margin-bottom: 5px;
	}
	#TabsToolbar {
		:root[inFullscreen] & {
			min-height: 10px !important;
		}
	}
}`;
			}
		}

		if (settings["hiddenElements/sidebarHeader"] || settings["autohiding/autohide"]) {
			userChrome += `
#sidebar-box[${sidebarcommandAttrSelector}] #sidebar-header {
	display: none !important;
}`;
			userChrome += `
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
`;
		}
	}

	userChrome += `
/* #################################### */`;
	return userChrome;
}