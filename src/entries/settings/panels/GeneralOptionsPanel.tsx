import React from "react";
import THEMES_ICON from "../../../assets/icons/Themes.svg?react";
import TOOLBAR_ICON from "../../../assets/icons/Toolbar.svg?react";
import HIGHLIGHTS_ICON from "../../../assets/icons/Highlights.svg?react";
import DEVELOPER_ICON from "../../../assets/icons/Developer.svg?react";
import { Control, UseFormRegister } from "react-hook-form";
import { OptionForm, ctxMenuItems } from "../../options";
import { RadioOption } from "../components/RadioOption";
import { MultiOrderOption } from "../components/MultiOrderOption";
import { CheckBoxOption } from "../components/CheckBoxOption";
import "./panels.css";
import Subsection from "../components/Subsection";

export default function GeneralOptionsPanel({
	registerForm,
	controlForm,
}: {
	registerForm: UseFormRegister<OptionForm>;
	controlForm: Control<OptionForm>;
}) {
	return (
		<section>
			<div className="section-header">
				<h1>General Options</h1>
			</div>
			<Subsection title="Appearance & Behavior" icon={<HIGHLIGHTS_ICON />}>
				<CheckBoxOption formRegister={registerForm("appearance/newTabButton")}>
					Show a “New Tab” button below the tabs in the sidebar
				</CheckBoxOption>
				<CheckBoxOption formRegister={registerForm("behavior/middleClickClose")}>Close tabs with a middle click</CheckBoxOption>
				<CheckBoxOption formRegister={registerForm("behavior/tabtooltip")}>Show tab title in tooltip</CheckBoxOption>
				{/*TODO: Implement pinnedTabsAsIcons*/}
				{/* <CheckBoxOption formRegister={registerForm("appearance/pinnedTabsAsIcons")}>
							Display pinned tabs as favicon-only
						</CheckBoxOption> */}
			</Subsection>
			{/* <Subsection title="Behavior" icon={<DEVELOPER_ICON />}>
			</Subsection> */}
			<Subsection title="Themes" icon={<THEMES_ICON />}>
				<RadioOption
					options={[
						{
							value: "custom",
							label: "Automatically generate theme colors from active browser theme",
						},
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
			</Subsection>
			<Subsection title="Context Menu" icon={<TOOLBAR_ICON />}>
				<CheckBoxOption formRegister={registerForm("ctxMenu/showIcons")}>Show icons beside items in the context menu</CheckBoxOption>
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
					Select items from the availiable list and click the arrow to add them to your menu items. Drag the menu items to rearrange them.
				</p>
			</Subsection>
		</section>
	);
}
function watchForm(arg0: string) {
	throw new Error("Function not implemented.");
}

