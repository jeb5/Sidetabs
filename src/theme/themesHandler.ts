import browser from "webextension-polyfill";
import Color from "color";
import md5 from "md5";
import * as DEFAULT_THEMES from "./defaultThemes";
import React, { useContext, useEffect, useState } from "react";
import { OptionForm, OptionsContext } from "../options";

type Theme = {
	// Theme type because for some reason @types/webextension-polyfill doesn't have this type
	images?: {
		headerURL?: string;
		theme_frame?: string;
		additional_backgrounds?: string[];
	};
	colors: {
		[key: string]: string;
	};
	properties?: {
		additional_backgrounds_alignment?: string[];
		additional_backgrounds_tiling?: string[];
	};
};
export type ThemeImages = { image: string; alignment: string; tiling: string }[];
export type ThemeColors = {
	[cssVar: string]: Color;
};
export type SidebarTheme = {
	colors: ThemeColors;
	images?: ThemeImages;
};

// let schemeUpdateListeners: ((newScheme: SidebarTheme) => any)[] = [];

const themeStyleColorMappings: { [cssVar: string]: string[] } = {
	"--theme-tab-text-color": ["tab_text", "bookmark_text", "toolbar_text", "tab_background_text"],
	"--theme-tab-background-text-color": ["tab_background_text", "toolbar_text"],
	"--theme-bg-color": ["frame", "frame_inactive", "accentcolor"],
	"--theme-line-separator-color": ["sidebar_border", "toolbar_vertical_separator"],
	"--theme-tab-border-color": ["tab_line"],
	"--theme-tab-load-color": ["tab_loading"],
	"--theme-tab-selected-color": ["tab_selected", "toolbar", "frame"],
	"--theme-button-hover-background": ["button_background_hover"],
	"--theme-icons-color": ["icons", "tab_background_text"],
};

async function updateThemeStyle(
	theme: Theme,
	includePrimaryImage: boolean = true,
	includeAdditionalImages: boolean = true
) {
	const newTheme = { colors: theme.colors || {}, images: theme.images || {}, properties: theme.properties || {} };
	// console.log("Theme has updated:", theme, "hash: ", md5(JSON.stringify(theme)));

	// --- Deciding dark/light mode ---
	const windowInDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
	let darkMode: boolean;
	{
		const tabTextColorString =
			newTheme.colors[
				themeStyleColorMappings["--theme-tab-text-color"].find(key => newTheme.colors[key]) || "tab_text"
			];
		darkMode = tabTextColorString ? Color(tabTextColorString).isLight() : windowInDarkMode; //If tab text is light, theme must be dark. If tab text is dark, theme must be light. If tab text is undefined, use window dark mode.
	}
	const defaultScheme = darkMode
		? DEFAULT_THEMES.DEFAULT_DARK_SIDEBAR_THEME
		: DEFAULT_THEMES.DEFAULT_LIGHT_SIDEBAR_THEME;
	// --------------------------------

	const images = includeAdditionalImages
		? newTheme.images.additional_backgrounds?.map((image, index) => {
				return {
					image,
					alignment: newTheme.properties.additional_backgrounds_alignment?.[index] || "center",
					tiling: newTheme.properties.additional_backgrounds_tiling?.[index] || "no-repeat",
				};
		  }) || []
		: [];
	if (newTheme.images.theme_frame && includePrimaryImage) {
		images.unshift({
			image: newTheme.images.theme_frame,
			alignment: "right top",
			tiling: "no-repeat",
		});
	}

	let newSidebarTheme: SidebarTheme | null = detectExceptionThemes(theme, windowInDarkMode);
	if (newSidebarTheme) {
		//darkMode must be recalculated if an exception theme is used
		//darkMode is important later to add an overlay
		darkMode = (newSidebarTheme.colors["--theme-tab-text-color"] as Color).isLight();
	} else {
		newSidebarTheme = {
			colors: Object.fromEntries(
				Object.entries(themeStyleColorMappings).map(([cssVar, colorKeys]) => {
					const availableKey = colorKeys.find(key => newTheme.colors[key]);
					const color = availableKey ? Color(newTheme.colors[availableKey]) : defaultScheme.colors[cssVar];
					return [cssVar, color];
				})
			),
			images,
		};
	}

	// ---- Extra colors ---
	const tabTextColor = newSidebarTheme.colors["--theme-tab-text-color"] as Color;
	//If there's a background image, darken/lighten the background slightly to increase text legibility
	const extraColors = {
		"--theme-tab-hover-color": tabTextColor
			? Color("transparent").mix(tabTextColor, 0.11)
			: Color("rgba(255,255,255,0.11)"),
		"--theme-bg-overlay": newSidebarTheme.images?.length
			? Color(darkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)")
			: Color("transparent"),
	};
	newSidebarTheme.colors = { ...newSidebarTheme.colors, ...extraColors };
	// ---------------------

	// schemeUpdateListeners.forEach(listener => listener(newSidebarTheme!));
	return newSidebarTheme;
	// console.log("New sidebar theme:", newSidebarTheme);
}

// browser.theme.onUpdated.addListener(({ theme }) => {
// 	const newTheme = theme as Theme;
// 	if (newTheme) updateThemeStyle(newTheme);
// });

// export default function observeSchemeUpdate(callback: (newScheme: SidebarTheme) => any) {
// 	schemeUpdateListeners.push(callback);
// }

function getThemeFingerprint(theme: Theme) {
	//extension urls are not consistent accross different firefox profiles.
	const cleanedJSON = JSON.stringify(theme).replace(/moz-extension:\/\/[\w-]*\//gm, "EXTENSION:");
	return md5(cleanedJSON);
}

function detectExceptionThemes(theme: Theme, windowInDarkMode: boolean): SidebarTheme | null {
	// --- Exception themes ---

	console.log("Theme fingerprint is", getThemeFingerprint(theme));

	switch (getThemeFingerprint(theme)) {
		case "267e0e07e5cd597938953b5a4d7e6717": //Alpenglow
			// Alpenglow is the only dynamic (light/dark) theme that I know of, but theme.getCurrent() only returns the light version.
			return windowInDarkMode ? DEFAULT_THEMES.ALPENGLOW_DARK : DEFAULT_THEMES.ALPENGLOW_LIGHT;
		case "518c16a72b2a6dfa94711a719b100317": //Alpenglow (forced dark), a popular theme
			return DEFAULT_THEMES.ALPENGLOW_DARK;
		default:
			return null;
	}
}

export async function stylesFromSidebarTheme(theme: SidebarTheme) {
	const imageSizes: { width: number; height: number }[] = theme.images
		? ((await Promise.all(
				theme.images!.map(({ image }) => {
					return new Promise(resolve => {
						const img = new Image();
						img.onload = () => {
							resolve({
								width: img.width,
								height: img.height,
							});
						};
						img.src = image;
					});
				})
		  )) as { width: number; height: number }[])
		: [];

	const cssColorVars = Object.entries(theme.colors)
		.map(([cssVar, color]) => {
			const strValue = color instanceof Color ? color.rgb().array().join(", ") : color;
			return `${cssVar}: ${strValue};`;
		})
		.join("\n");

	const cssImageVar = theme.images
		? "--theme-bg-image: " +
		  theme.images
				.map(({ image, alignment, tiling }, index) => {
					// Images should be scaled up to fit the sidebar, never down, so max(imageHeight, 100%) must be used to determine height (width).
					// People don't correctly label their non y-repeating themes as non-y-repeating, so I'll also consider image ratio. If width:height > 6, the image probably isn't meant to repeat in the y direction.
					const imgRatio = imageSizes[index].width / imageSizes[index].height;
					const imgShouldTile = tiling === "repeat" && imgRatio < 6;
					const imgIsFull = (imageSizes[index].width > 500 && imageSizes[index].height > 50) || tiling !== "no-repeat"; //Is the image intended to fill the whole frame?
					if (imgIsFull) {
						return !imgShouldTile
							? `url("${image}") ${alignment}/auto max(${imageSizes[index].height}px, 100%) ${tiling}`
							: `url("${image}") ${alignment}/auto ${tiling}`;
					} else {
						return `url("${image}") ${alignment} no-repeat`;
					}
				})
				.join(", ") +
		  ";"
		: "";

	return `:root {
		${cssColorVars}
		${cssImageVar}
	}`;
}

const useTheme = (extensionOptions: OptionForm) => {
	const [theme, setTheme] = useState<SidebarTheme | null>(null);
	useEffect(() => {
		if (extensionOptions["theme/mode"] === "dark") return setTheme(DEFAULT_THEMES.DEFAULT_DARK_SIDEBAR_THEME);
		if (extensionOptions["theme/mode"] === "light") return setTheme(DEFAULT_THEMES.DEFAULT_LIGHT_SIDEBAR_THEME);

		const showImages = extensionOptions["theme/showPrimaryImage"];
		const showAdditionalImages = extensionOptions["theme/showAdditionalImages"];

		const setNewTheme = async (newTheme: Theme) => {
			if (newTheme) setTheme(await updateThemeStyle(newTheme, showImages, showAdditionalImages));
		};

		const themeListener = async ({ theme }: { theme: browser.Theme.ThemeUpdateInfoThemeType }) => {
			const newTheme = theme as Theme;
			if (newTheme) await setNewTheme(newTheme);
		};

		browser.theme.getCurrent().then(newTheme => setNewTheme(newTheme));

		browser.theme.onUpdated.addListener(themeListener);
		return () => browser.theme.onUpdated.removeListener(themeListener);
	}, [extensionOptions]);
	return theme;
};

export const ThemeSetter = () => {
	const extensionOptions = useContext(OptionsContext);
	const theme = useTheme(extensionOptions);
	useEffect(() => {
		if (theme) {
			stylesFromSidebarTheme(theme).then(css => {
				document.getElementById("themeStyles")!.innerHTML = css;
			});
		}
	}, [theme]);
	return null;
};
