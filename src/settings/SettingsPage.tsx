import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { CheckBoxOption } from "./CheckBoxOption";
import browser from "webextension-polyfill";
import { useForm } from "react-hook-form";
import { RadioOption } from "./RadioOption";
import { MultiOrderOption } from "./MultiOrderOption";
import { ctxMenuItems, OptionForm, SettingsDefault, getAllOptions, setAllOptions } from "../options";
import "./SettingsPage.css";
import "../extensionPages.css";
import HIGHLIGHTS_ICON from "parcel-svg:../assets/icons/Highlights.svg";
import INFORMATION_ICON from "parcel-svg:../assets/icons/Information.svg";
import THEMES_ICON from "parcel-svg:../assets/icons/Themes.svg";
import TOOLBAR_ICON from "parcel-svg:../assets/icons/Toolbar.svg";
import SIDETABS_ICON from "parcel-svg:../assets/app_icons/sidetabs.svg";
import usePopupManager from "react-popup-manager";
import LinkButton from "./LinkButton";

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

	const { popupsInfo, PopupRenderer } = usePopupManager({
		confirmReset: (close: () => void, confirmResetYes: () => void) => {
			return (
				<div>
					<div>Are you sure you want to reset?</div>
					<button onClick={confirmResetYes}>Yes, reset</button>
				</div>
			);
		},
	});

	const sidetabsVersion = useMemo(() => browser.runtime.getManifest().version, []);

	return optionsLoaded ? (
		<>
			<PopupRenderer />
			<div className="options-side-pane">
				<header>
					<SIDETABS_ICON className="sidetabs-icon" />
					<h1>Options</h1>
				</header>
				<p>
					<i>Sidetabs Version {sidetabsVersion}</i>
				</p>
				<p>Options saved to sync storage</p>
				<LinkButton
					onClick={() => {
						popupsInfo.confirmReset.trigger(() => {
							resetForm(SettingsDefault);
							alert("Reseting...!");
							popupsInfo.confirmReset.setOpen(false);
						});
					}}>
					Reset all to defaults
				</LinkButton>
				<div className="big-gap"></div>
				<LinkButton href={browser.runtime.getURL("../welcome/welcome.html")} icon={<INFORMATION_ICON />}>Extension instructions</LinkButton>
			</div >
			<div className="options-panel-scroll-box">
				<main className="options-panel">
					<section>
						<div className="section-header">
							<h1>General Options</h1>
						</div>
						<div className="subsection">
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
						</div>
						<div className="subsection">
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
						</div>
						<div className="subsection">
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
							<br />
							<p>
								Select items from the availiable list and click the arrow to add them to your menu items. Drag the menu
								items to rearrange them.
							</p>
						</div>
					</section>
					<section>
						<div className="section-header">
							<h1>Advanced Browser Configuration</h1>
							<p>
								These options require modification to your browser profile's UserChrome.css file. After updating any of these options, please paste the generated CSS into your userChrome.css file, and restart your browser to apply the change.
							</p>
							<LinkButton onClick={() => alert("mhm")} icon={<INFORMATION_ICON />}>How to modify your userChrome.css file</LinkButton>
						</div>
					</section>
				</main>
			</div >
		</>
	) : null;
};

const root = ReactDOM.createRoot(document.getElementById("reactRoot")!);
root.render(
	<React.StrictMode>
		<SettingsPage />
	</React.StrictMode>
);
