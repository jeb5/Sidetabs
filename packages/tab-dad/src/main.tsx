import React from "react";
type TabType = { type: "tab"; component: React.ReactElement };
type GroupType = { type: "group"; component: React.ReactElement; tabs: TabType[] };
export type TabsState = {
	name: string;
	mode: "1d" | "2d";
	tabWidth?: number;
	tabHeight: number;
	groupsAllowed: boolean;
	tabs: (TabType | GroupType)[];
}[];
export function TabDad(props: { tabsState: TabsState }) {
	return <></>;
}
