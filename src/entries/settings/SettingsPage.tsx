import React, { useEffect, useMemo, useState } from "react";
import browser from "webextension-polyfill";
import { useForm } from "react-hook-form";
import {
  OptionForm,
  SettingsDefault,
  getAllOptions,
  setAllOptions,
} from "../options";
import "./SettingsPage.css";
import SIDETABS_ICON from "../../assets/app_icons/sidetabs.svg?react";
import INFORMATION_ICON from "../../assets/icons/Information.svg?react";
import usePopupManager from "react-popup-manager";
import LinkButton from "./components/LinkButton";
import GeneralSettingsPanel from "./panels/GeneralSettingsPanel";
import AdvancedSettingsPanel from "./panels/AdvancedSettingsPanel";
//TODO: Remove react popup manager in favour of dialog component

export default function SettingsPage() {
	const [optionsLoaded, setOptionsLoaded] = useState(false);
	const {
		register: registerForm,
		watch: watchForm,
		reset: resetForm,
		control: controlForm,
		setValue: setFormValue,
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
					<h1>Settings</h1>
				</header>
				<p>
					<i>Sidetabs Version {sidetabsVersion}</i>
				</p>
				<p>Settings saved to sync storage</p>
				<LinkButton
					onClick={() => {
						popupsInfo.confirmReset.trigger(() => {
							resetForm(SettingsDefault);
							popupsInfo.confirmReset.setOpen(false);
						});
					}}
				>
					Reset all to defaults
				</LinkButton>
				<div className="big-gap"></div>
				<LinkButton href={browser.runtime.getURL("src/entries/welcome/welcome.html")} icon={<INFORMATION_ICON />}>
					Extension instructions
				</LinkButton>
			</div>
			<div className="options-scroll-box">
				<main className="options">
					<GeneralSettingsPanel controlForm={controlForm} registerForm={registerForm} />
					<AdvancedSettingsPanel controlForm={controlForm} registerForm={registerForm} watchForm={watchForm} setFormValue={setFormValue} />
				</main>
			</div>
		</>
	) : null;
}
