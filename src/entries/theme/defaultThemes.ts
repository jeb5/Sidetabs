import Color from "color";
import { SidebarTheme } from "./themesHandler";

export const DEFAULT_DARK_SIDEBAR_THEME: SidebarTheme = {
	//Based on Firefox default dark
	colors: {
		"--theme-tab-text-color": Color("rgb(251,251,254)"),
		"--theme-tab-background-text-color": Color("#fbfbfe"),
		"--theme-bg-color": Color("#1c1b22"),
		"--theme-line-separator-color": Color("rgba(255,255,255,0.1)"),
		"--theme-tab-border-color": Color("transparent"),
		"--theme-tab-load-color": Color("rgb(10,132,255)"),
		"--theme-tab-selected-color": Color("rgb(66,65,77)"),
		"--theme-button-hover-background": Color("rgba(255,255,255,0.1)"),
		"--theme-icons-color": Color("rgb(251,251,254)"),
	},
};
export const DEFAULT_LIGHT_SIDEBAR_THEME: SidebarTheme = {
	//Based on Firefox default light
	colors: {
		"--theme-tab-text-color": Color("rgb(21,20,26)"),
		"--theme-tab-background-text-color": Color("rgb(21,20,26)"),
		"--theme-bg-color": Color("#f0f0f4"),
		"--theme-line-separator-color": Color("#999"),
		"--theme-tab-border-color": Color("transparent"),
		"--theme-tab-load-color": Color("rgb(10,132,255)"),
		"--theme-tab-selected-color": Color("#fff"),
		"--theme-button-hover-background": Color("rgba(0,0,0,0.1)"),
		"--theme-icons-color": Color("rgb(91,91,102)"),
	},
};

export const ALPENGLOW_DARK: SidebarTheme = {
	colors: {
		"--theme-tab-text-color": Color("rgb(232, 224, 255)"),
		"--theme-tab-background-text-color": Color("rgba(232,224,255,0.7)"),
		"--theme-bg-color": Color("#291D4F"),
		"--theme-line-separator-color": Color("#999"),
		"--theme-tab-border-color": Color("rgb(172, 112, 255)"),
		"--theme-tab-load-color": Color("rgb(10,132,255)"),
		"--theme-tab-selected-color": Color("rgb(60, 31, 123)"),
		"--theme-button-hover-background": Color("rgba(255,255,255,0.1)"),
		"--theme-icons-color": Color("hsla(271, 100%, 77%, 1)"),
	},
};
export const ALPENGLOW_LIGHT: SidebarTheme = {
	colors: {
		"--theme-tab-text-color": Color("hsla(261, 53%, 15%, 1)"),
		"--theme-tab-background-text-color": Color("hsla(261, 53%, 15%, 1)"),
		"--theme-bg-color": Color("hsla(240, 20%, 98%, 1)"),
		"--theme-line-separator-color": Color("hsla(261, 53%, 15%, .24)"),
		"--theme-tab-border-color": Color("hsla(265, 100%, 72%, 1)"),
		"--theme-tab-load-color": Color("hsla(265, 100%, 72%, 1)"),
		"--theme-tab-selected-color": Color("hsla(0, 0%, 100%, .76)"),
		"--theme-button-hover-background": Color("hsla(240, 26%, 11%, .08)"),
		"--theme-icons-color": Color("hsla(258, 66%, 48%, 1)"),
	},
};
