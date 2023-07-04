import { OptionForm } from "../options";

export default function generateUserChrome(settings: OptionForm) {
	let userChrome = `/* ########  Sidetabs Styles  ######### */
`
	if (settings["autohiding/autohide"]) userChrome += `
/* ~~~~~~~~ Autohiding styles ~~~~~~~~~ */
:root {
 --sidebar-hover-width: 36px;
 --sidebar-visible-width: ${settings["autohiding/sidebarwidth"]}px;
 --sidebar-debounce-delay: ${settings["autohiding/debounceDelay"]}ms;
}
#sidebar-box {
 display: grid !important;
 min-width: var(--sidebar-hover-width) !important;
 max-width: var(--sidebar-hover-width) !important;
 overflow: visible !important;
 height: 100% !important;
 min-height: 100% !important;
 max-height: 100% !important;
}
#sidebar {
 height: 100% !important;
 width: var(--sidebar-hover-width) !important;
 z-index: 200 !important;
 position: absolute !important;
 transition: width 150ms var(--sidebar-debounce-delay) ease !important;
 min-width: 0 !important;
}
#sidebar:hover {
 width: var(--sidebar-visible-width) !important;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
`
	if (settings["hiddenElements/tabs"] || settings["hiddenElements/sidebarHeader"]){
		 userChrome += `
/* ~~~~~~~~ Hidden elements styles ~~~~~~~~~ */`
	if (settings["hiddenElements/tabs"]) userChrome += `
#TabsToolbar {
 display: none !important;
}`
	if (settings["hiddenElements/sidebarHeader"]) userChrome += `
#sidebar-header {
 display: none !important;
} `
	userChrome += `
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
`
	}

	userChrome += `
/* #################################### */`
	return userChrome;
}