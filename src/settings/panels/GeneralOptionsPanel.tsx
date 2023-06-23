import React from "react";
import THEMES_ICON from "parcel-svg:../../assets/icons/Themes.svg";
import TOOLBAR_ICON from "parcel-svg:../../assets/icons/Toolbar.svg";
import HIGHLIGHTS_ICON from "parcel-svg:../../assets/icons/Highlights.svg";
import { Control, UseFormRegister } from "react-hook-form";
import { OptionForm, ctxMenuItems } from "../../options";
import { RadioOption } from "../RadioOption";
import { MultiOrderOption } from "../MultiOrderOption";
import { CheckBoxOption } from "../CheckBoxOption";
import "./panels.css"

export default function GeneralOptionsPanel({ registerForm, controlForm }: { registerForm: UseFormRegister<OptionForm>, controlForm: Control<OptionForm> }) {
	return (
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
	)
};