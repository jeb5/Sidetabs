import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";
import { useForm } from "react-hook-form";
import { OptionForm, SettingsDefault, getAllOptions, setAllOptions } from "../options";
import "./SettingsPage.css";
import "../extensionPages.css";
import INFORMATION_ICON from "parcel-svg:../assets/icons/Information.svg";
import SIDETABS_ICON from "parcel-svg:../assets/app_icons/sidetabs.svg";
import usePopupManager from "react-popup-manager";
import LinkButton from "./LinkButton";
import GeneralOptionsPanel from "./panels/GeneralOptionsPanel";
import AdvancedOptionsPanel from "./panels/AdvancedOptionsPanel";

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
				<div className="reset-popup">
					<div>Are you sure you want to reset?</div>
					<div className="reset-popup-buttons">
						<LinkButton onClick={close}>Cancel</LinkButton>
						<LinkButton onClick={confirmResetYes}>Reset</LinkButton>
					</div>
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
							popupsInfo.confirmReset.setOpen(false);
						});
					}}>
					Reset all to defaults
				</LinkButton>
				<div className="big-gap"></div>
				<LinkButton href={browser.runtime.getURL("../welcome/welcome.html")} icon={<INFORMATION_ICON />}>Extension instructions</LinkButton>
			</div >
			<div className="options-scroll-box">
				<main className="options">
					<GeneralOptionsPanel controlForm={controlForm} registerForm={registerForm} />
					<AdvancedOptionsPanel controlForm={controlForm} registerForm={registerForm} watchForm={watchForm} />
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
