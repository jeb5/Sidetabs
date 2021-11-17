import React from "react";
import Tab from "./Tab";
import browser from "webextension-polyfill";
import { showTabMenu } from "./contextMenu";

const CLOSE_ICON = browser.runtime.getURL("assets/close.svg");
const DEFAULT_ICON = browser.runtime.getURL("assets/firefox-glyph.svg");

export default function TabElement({ tab }: { tab: Tab }) {
	const showContextMenu = () => {
		showTabMenu(tab);
	};

	const tabContainer = tab.getContainer();
	const containerColorStyle = tabContainer?.color ? { backgroundColor: tabContainer.color } : {};

	const [loading, setLoading] = React.useState(tab.status === "loading");
	const [justLoaded, setJustLoaded] = React.useState(false); //Means the tab was loaded in the last 500 ms.

	React.useEffect(() => {
		setLoading(tab.status === "loading");
		if (tab.status === "complete" && loading) {
			setJustLoaded(true);
			setLoading(false);
			setTimeout(() => setJustLoaded(false), 500);
		}
	}, [tab.status]);

	const tabClasses = ["tab"];
	if (tab.active) tabClasses.push("activeTab");
	if (tab.discarded) tabClasses.push("discarded");
	if (tab.status === "loading") tabClasses.push("loading");
	if (justLoaded) tabClasses.push("justLoaded");

	return (
		<div
			onContextMenu={showContextMenu}
			className={tabClasses.join(" ")}
			onClick={() => {
				tab.activate();
			}}>
			<div style={containerColorStyle} className="containerIndicator"></div>
			<img className="tabIcon" src={tab.favIconUrl || DEFAULT_ICON} />
			<div className="tabText">{tab.title}</div>
			<img
				className="tabCloseBtn"
				src={CLOSE_ICON}
				onClick={event => {
					event.stopPropagation();
					tab.close();
				}}
			/>
		</div>
	);
}
