import React from "react";
import { GroupInfo, TabListItem } from "./TabManager";
import TabsList from "./TabsList";
import ARROWHEAD_DOWN_ICON from "../../assets/context_menu_icons/Arrowhead Down.svg?react";

export default function Group(props: { items: TabListItem[]; groupInfo: GroupInfo }) {
	return (
		<div className="group">
			<div className="group_header">
				<div className="group_title_box" style={{ "--group-color": props.groupInfo.color } as React.CSSProperties}>
					<div className="group_title">{props.groupInfo.title}</div>
					<div className="group_arrowhead_down">
						<ARROWHEAD_DOWN_ICON className="icon" />
					</div>
				</div>
			</div>
			<div className="group_body">
				<div className="group_bar"></div>
				<div className="group_contents">
					<TabsList items={props.items} />
				</div>
			</div>
		</div>
	);
}
