import React, { useCallback, useEffect } from "react";
import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { OptionForm } from "../../options";
import "./panels.css";
import LinkButton from "../components/LinkButton";
import INFORMATION_ICON from "../../../assets/icons/Information.svg?react";
import SIDE_DOCK_ICON from "../../../assets/icons/Side Dock.svg?react";
import POPUP_BLOCK_ICON from "../../../assets/icons/Popup Block.svg?react";
import { CheckBoxOption } from "../components/CheckBoxOption";
import { SelectOption } from "../components/SelectOption";
import CodeCopy from "../components/CodeCopy";
import generateUserChrome from "../GenerateUserChrome";
import WarningLabel from "../components/WarningLabel";
import Subsection from "../components/Subsection";
import Dialog from "../components/Dialog";
import "./AdvancedOptionsPanel.css";
import UserchromeExplanationDialog from "../UserchromeExplanationDialog";

const dangerKeys = [
  "autohiding/autohide",
  "hiddenElements/sidebarHeader",
  "hiddenElements/tabs",
] as (keyof OptionForm)[];

export default function AdvancedOptionsPanel({
  registerForm,
  controlForm,
  watchForm,
  setFormValue,
}: {
  registerForm: UseFormRegister<OptionForm>;
  controlForm: Control<OptionForm>;
  watchForm: UseFormWatch<OptionForm>;
  setFormValue: UseFormSetValue<OptionForm>;
}) {
  const autohiding = watchForm("autohiding/autohide");
  const hidingTabs = watchForm("hiddenElements/tabs");
	const userChromeContent = generateUserChrome(watchForm());

	const [warningDialogOpen, setWarningDialogOpen] = React.useState(false);
	const [userchromeExplanationDialogOpen, setUserchromeExplanationDialogOpen] = React.useState(false);

	const [anyEnabledSettings, setAnyEnabledSettings] = React.useState(false);
	const [aesIntitalized, setAesInitialized] = React.useState(false);
	useEffect(() => {
		const formValues = watchForm();
		const newAnyEnabled = dangerKeys.some((key) => formValues[key]);
		if (newAnyEnabled && !anyEnabledSettings && aesIntitalized) {
			//Some settings have become enabled. Popup should trigger
			setWarningDialogOpen(true);
		}
		setAnyEnabledSettings(newAnyEnabled);
		setAesInitialized(true);
	}, [watchForm()]);

	const warningCancelCallback = () => {
		for (const key of dangerKeys) setFormValue(key, false);
		setWarningDialogOpen(false);
	};

	return (
		<section>
			<UserchromeExplanationDialog
				open={userchromeExplanationDialogOpen}
				dismissCallback={() => setUserchromeExplanationDialogOpen(false)}
			/>
			<Dialog open={warningDialogOpen} dismissCallback={() => warningCancelCallback()}>
				<div className="warning-dialog-content">
					<div className="warning-dialog-inner-content">
						<div className="warning-dialog-heading">
							These settings will only affect Sidetabs once you manually update your UserChrome.css file with the generated CSS
						</div>
						<WarningLabel className="warning-dialog-warning-label">
							This is advanced configuration. Please only proceed if you understand how to safely modify your UserChrome.css file.
						</WarningLabel>
					</div>
					<div className="bottom-buttons">
						<LinkButton onClick={() => warningCancelCallback()}>Cancel</LinkButton>
						<LinkButton onClick={() => setWarningDialogOpen(false)}>Continue</LinkButton>
					</div>
				</div>
			</Dialog>
			<div className="section-header">
				<h1>Advanced Browser Configuration</h1>
				<p>
					These options require modification to your browser profile's UserChrome.css file. After updating any of these options, please
					paste the generated CSS into your userChrome.css file, and restart your browser to apply the change.
				</p>
				<LinkButton onClick={() => setUserchromeExplanationDialogOpen(true)} icon={<INFORMATION_ICON />}>
					How to modify your userChrome.css file
				</LinkButton>
				<WarningLabel className="abc-warning">
					This is advanced configuration. Please only proceed if you understand how to safely modify your UserChrome.css file.
				</WarningLabel>
			</div>
			<Subsection title="Autohiding" icon={<SIDE_DOCK_ICON />} experimental>
				<CheckBoxOption formRegister={registerForm("autohiding/autohide")}>
					Automatically hide the sidebar when not being interacted with
				</CheckBoxOption>
				<SelectOption
					disabled={!autohiding}
					formRegister={registerForm("autohiding/sidebarwidth")}
					items={[170, 180, 190, 200, 210, 220, 230].map((v) => ({
						value: v,
						label: `${v}px`,
					}))}
				>
					Sidebar width
				</SelectOption>
				<SelectOption
					disabled={!autohiding}
					formRegister={registerForm("autohiding/debounceDelay")}
					items={[0, 50, 100, 150, 200, 250].map((v) => ({
						value: v,
						label: `${v}ms`,
					}))}
				>
					Hide/show delay
				</SelectOption>
			</Subsection>
			<Subsection title="Hidden Elements" icon={<POPUP_BLOCK_ICON />}>
				<CheckBoxOption formRegister={registerForm("hiddenElements/sidebarHeader")}>Hide the sidebar header</CheckBoxOption>
				<CheckBoxOption formRegister={registerForm("hiddenElements/tabs")}>Hide Firefox's default tabs</CheckBoxOption>
				<CheckBoxOption formRegister={registerForm("hiddenElements/titleBar")} disabled={!hidingTabs} indentLevel={1}>
					Hide the title bar & window controls
				</CheckBoxOption>
			</Subsection>
			<div className="css-code-copy-container">
				<h2 className="css-code-copy-label">Copy into your UserChrome.css file:</h2>
				<CodeCopy className="css-code-copy" text={userChromeContent} />
			</div>
		</section>
	);
}
