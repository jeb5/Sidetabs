import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { CheckBoxOption } from "./CheckBoxOption";
import browser from "webextension-polyfill";
import { useForm } from "react-hook-form";
import { RadioOption } from "./RadioOption";
import { MultiOrderOption } from "./MultiOrderOption";
import { ctxMenuItems, OptionForm, SettingsDefault, getAllOptions, setAllOptions } from "../options";
import "./SettingsPage.css";
import "../extensionPages.css";
import HIGHLIGHTS_ICON from "parcel-svg:../assets/icons/Highlights.svg";
import THEMES_ICON from "parcel-svg:../assets/icons/Themes.svg";
import TOOLBAR_ICON from "parcel-svg:../assets/icons/Toolbar.svg";
import SIDETABS_ICON from "parcel-svg:../assets/app_icons/sidetabs.svg";

const SettingsPage = () => {
	const [optionsLoaded, setOptionsLoaded] = useState(false);
	const {
		register: registerForm,
		watch: watchForm,
		reset: resetForm,
		control: controlForm,
	} = useForm<OptionForm>({ defaultValues: SettingsDefault });

	useEffect(() => {
		async function loadSettings() {
			resetForm(await getAllOptions());
			setOptionsLoaded(true);
		}
		loadSettings();
	}, []);

	useEffect(() => {
		if (optionsLoaded) {
			setAllOptions(watchForm());
		}
	}, [watchForm()]);

	const sidetabsVersion = useMemo(() => browser.runtime.getManifest().version, []);

	return optionsLoaded ? (
		<>
			<div className="options-side-pane">
				<header>
					<SIDETABS_ICON className="sidetabs-icon" />
					<h1>Options</h1>
				</header>
				<p>
					<i>Sidetabs Version {sidetabsVersion}</i>
				</p>
				<p>Options saved to sync storage</p>
				<button
					className="reset-button"
					onClick={() => {
						if (confirm("Are you sure you want to reset all options to their default values?")) {
							resetForm(SettingsDefault);
						}
					}}>
					Reset all to defaults
				</button>
				<div className="big-gap"></div>
				<p className="instructions-signpost">
					<a href={browser.runtime.getURL("../welcome/welcome.html")}>{"<  "}Extension instructions</a>
				</p>
			</div>
			<div className="options-panel-scroll-box">
				<main className="options-panel">
					<section>
						<h2>
							<HIGHLIGHTS_ICON />
							<div>Appearance</div>
						</h2>
						<CheckBoxOption formRegister={registerForm("appearance/newTabButton")}>
							Show a “New Tab” button below the tabs in the sidebar
						</CheckBoxOption>
						{/*TODO: Implement pinnedTabsAsIcons*/}
						{/* <CheckBoxOption formRegister={registerForm("appearance/pinnedTabsAsIcons")}>
							Display pinned tabs as favicon-only
						</CheckBoxOption> */}
					</section>
					<section>
						<h2>
							<THEMES_ICON />
							<div>Theme</div>
						</h2>
						<RadioOption
							options={[
								{ value: "custom", label: "Automatically generate theme colors from active browser theme" },
								{ value: "light", label: "Use a default light theme" },
								{ value: "dark", label: "Use a default dark theme" },
							]}
							formRegister={registerForm("theme/mode")}
						/>
						<CheckBoxOption formRegister={registerForm("theme/showPrimaryImage")}>
							Show the primary custom image from the active browser theme
						</CheckBoxOption>
						<CheckBoxOption formRegister={registerForm("theme/showAdditionalImages")}>
							Show all custom images from the active browser theme
						</CheckBoxOption>
					</section>
					<section>
						<h2>
							<TOOLBAR_ICON />
							<div>Context Menu</div>
						</h2>
						<CheckBoxOption formRegister={registerForm("ctxMenu/showIcons")}>
							Show icons beside items in the context menu
						</CheckBoxOption>
						<CheckBoxOption formRegister={registerForm("ctxMenu/showCloseOption")}>
							Show a “Close Tab” item in the tab context menu
						</CheckBoxOption>
						<CheckBoxOption formRegister={registerForm("ctxMenu/showSidetabsOptions")}>
							Show a “Sidetabs Options” item in the sidebar context menu
						</CheckBoxOption>
						<br />
						<MultiOrderOption
							availableLabel="Available Menu Items"
							currentLabel="Current Menu Items"
							availableOptionLabels={ctxMenuItems}
							controlForm={controlForm as any}
							name="ctxMenu/menuItems"
						/>
					</section>
					<p>
						Select items from the availiable list and click the arrow to add them to your menu items. Drag the menu
						items to rearrange them.
					</p>
				</main>
			</div>
		</>
	) : null;
};

ReactDOM.render(<SettingsPage />, document.getElementById("reactRoot"));
