import React from "react";
import { Control, UseFormRegister, UseFormWatch } from "react-hook-form";
import { OptionForm } from "../../options";
import "./panels.css";
import LinkButton from "../LinkButton";
import INFORMATION_ICON from "parcel-svg:../../assets/icons/Information.svg";
import SIDE_DOCK_ICON from "parcel-svg:../../assets/icons/SideDock.svg";
import { CheckBoxOption } from "../CheckBoxOption";
import { SelectOption } from "../SelectOption";

export default function AdvancedOptionsPanel({
	registerForm,
	controlForm,
	watchForm
}: {
	registerForm: UseFormRegister<OptionForm>;
	controlForm: Control<OptionForm>;
	watchForm: UseFormWatch<OptionForm>;
}) {
	const autohiding = watchForm("autohiding/autohide");
	return (
		<section>
			<div className="section-header">
				<h1>Advanced Browser Configuration</h1>
				<p>
					These options require modification to your browser profile's
					UserChrome.css file. After updating any of these options, please paste
					the generated CSS into your userChrome.css file, and restart your
					browser to apply the change.
				</p>
				<LinkButton onClick={() => alert("mhm")} icon={<INFORMATION_ICON />}>
					How to modify your userChrome.css file
				</LinkButton>
			</div>
			<div className="subsection">
				<h2>
					<SIDE_DOCK_ICON />
					<div>Autohiding</div>
				</h2>
				<CheckBoxOption formRegister={registerForm("autohiding/autohide")}>
					Automatically hide the sidebar when not being interacted with
				</CheckBoxOption>
				<SelectOption disabled={!autohiding} formRegister={registerForm("autohiding/sidebarwidth")} items={
					[170, 180, 190, 200, 210, 220, 230].map((v) => ({ value: v, label: `${v}px` }))
				}>
					Sidebar width
				</SelectOption>
				<SelectOption disabled={!autohiding} formRegister={registerForm("autohiding/debounceDelay")} items={
					[0, 50, 100, 150, 200, 250].map((v) => ({ value: v, label: `${v}ms` }))
				}>
					Hide/show delay
				</SelectOption>
				{/*TODO: Implement pinnedTabsAsIcons*/}
				{/* <CheckBoxOption formRegister={registerForm("appearance/pinnedTabsAsIcons")}>
							Display pinned tabs as favicon-only
						</CheckBoxOption> */}
			</div>
		</section>
	);
}
