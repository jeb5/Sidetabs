import React from "react";
import Tab from "./Tab";
import browser from "webextension-polyfill";
import { showTabMenu } from "./contextMenu";
import CLOSE_ICON from "../assets/icons/close.svg";
import AUDIO_PLAYING_ICON from "../assets/icons/music_note.svg";
import AUDIO_MUTE_ICON from "../assets/icons/music_note_off.svg";
import DEFAULT_TAB_ICON from "../assets/icons/firefox_default_icon.svg";
function isValidHttpUrl(possibleUrl: string) {
	let url;
	try {
		url = new URL(possibleUrl);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

// const DEFAULT_TAB_ICON_SRC = browser.runtime.getURL("assets/icons/firefox_default_icon.svg");

export default function TabElement({ tab }: { tab: Tab }) {
	const showContextMenu = () => {
		showTabMenu(tab);
	};

	const [loading, setLoading] = React.useState(tab.getLoading());
	const [justLoaded, setJustLoaded] = React.useState(false); //Means the tab was loaded in the last 500 ms.
	const [useDefaultIcon, setUseDefaultIcon] = React.useState(false);

	React.useEffect(() => {
		setLoading(tab.getLoading());
		if (!tab.getLoading() && loading) {
			setJustLoaded(true);
			setLoading(false);
			setTimeout(() => setJustLoaded(false), 500);
		}
	}, [tab.status]);

	React.useEffect(() => {
		setUseDefaultIcon(tab.favIconUrl === undefined || tab.favIconUrl === "" || tab.url === "about:newtab");
	}, [tab.favIconUrl]);

	const tabClasses = ["tab"];
	if (tab.active) tabClasses.push("activeTab");
	if (tab.discarded) tabClasses.push("discarded");
	if (tab.getLoading()) tabClasses.push("loading");
	if (justLoaded) tabClasses.push("justLoaded");
	if (tab.attention) tabClasses.push("drawingAttention");

	const tabContainer = tab.getContainer();
	const containerColorStyle = tabContainer?.color ? { backgroundColor: tabContainer.color } : {};

	let badge = (() => {
		if (tab.getLoading()) {
			return <div className="loadingIndicator" />;
		} else if (tab.getMuted()) {
			return <AUDIO_MUTE_ICON className="icon" onClick={() => tab.unmute()} />;
		} else if (tab.audible) {
			return <AUDIO_PLAYING_ICON className="icon" onClick={() => tab.mute()} />;
		}
		return null;
	})();

	return (
		<div
			onContextMenu={showContextMenu}
			className={tabClasses.join(" ")}
			onClick={() => {
				//BUG: Click events sometimes hit the body instead of the tab. This appears not to be a react-specific issue.
				tab.activate();
			}}>
			<div style={containerColorStyle} className="containerIndicator"></div>
			<div className="iconAndBadge">
				{useDefaultIcon ? (
					<DEFAULT_TAB_ICON className="icon defaultTabIcon" />
				) : (
					<img className="tabIcon" src={tab.favIconUrl} onError={() => setUseDefaultIcon(true)} />
				)}
				<div className="badge">{badge}</div>
			</div>
			<div className="tabText">{tab.title}</div>
			<div
				className="tabCloseBtn"
				onClick={event => {
					event.stopPropagation();
					tab.close();
				}}>
				<CLOSE_ICON className="icon" />
			</div>
		</div>
	);
}
