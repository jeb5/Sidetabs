import { svgB64Colored } from "../utils/svgutil";

const rawIconsImport = import.meta.glob("../../assets/context_menu_icons/*.svg", { as: "raw", eager: true });
const iconsImport = Object.fromEntries(
	Object.entries(rawIconsImport).map(([key, value]) => [key.slice("../../assets/context_menu_icons/".length, -".svg".length), value])
);

const iconsMapping = {
	newTab: "Tab New",
	reopenTab: "Restore Session",
	reopenInContainer: "Open In Container",
	newContainer: "Multi Account Container",
	reloadTab: "Refresh",
	muteTab: "Audio Mute",
	unmuteTab: "Audio",
	pinTab: "Pin",
	unpinTab: "Pin Remove",
	duplicateTab: "Screen Share",
	bookmarkTab: "Bookmark Outline",
	closeTab: "Close",
	unloadTab: "Store Data",
	clearCookies: "Delete Cookies",
	clearStorage: "Delete Storage",
	clearData: "Delete Data",
	options: "Preferences",
} as const;

const icons = Object.fromEntries(
	(["black", "white"] as const).map((color) => [
		color,
		Object.fromEntries(
			Object.entries(iconsMapping).map(([iconName, iconFileName]) => [
				iconName,
				{
					16: svgB64Colored(iconsImport[iconFileName], color, true),
				},
			])
		),
	])
) as { [color in "black" | "white"]: {
	[iconName in keyof typeof iconsMapping]: { 16: string }
} };

export default icons;
