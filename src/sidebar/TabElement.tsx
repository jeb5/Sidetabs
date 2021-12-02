import React from "react";
import Tab from "./Tab";
import browser from "webextension-polyfill";
import { showTabMenu } from "./contextMenu";

function setTheme(theme: browser.Theme.Static) {}
const ICONS = {
	CLOSE: browser.runtime.getURL("assets/icons/close.svg"),
	DEFAULT: browser.runtime.getURL("assets/icons/firefox-glyph.svg"),
	AUDIO_PLAYING: browser.runtime.getURL("assets/icons/music_note.svg"),
	AUDIO_MUTE: browser.runtime.getURL("assets/icons/music_note_off.svg"),
};

export default function TabElement({ tab }: { tab: Tab }) {
	const showContextMenu = () => {
		showTabMenu(tab);
	};

	const [loading, setLoading] = React.useState(tab.getLoading());
	const [justLoaded, setJustLoaded] = React.useState(false); //Means the tab was loaded in the last 500 ms.
	const [brokenFavicon, setBrokenFavicon] = React.useState(false);

	React.useEffect(() => {
		setLoading(tab.getLoading());
		if (!tab.getLoading() && loading) {
			setJustLoaded(true);
			setLoading(false);
			setTimeout(() => setJustLoaded(false), 500);
		}
	}, [tab.status]);

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
			return <img src={ICONS.AUDIO_MUTE} onClick={() => tab.unmute()} />;
		} else if (tab.audible) {
			return <img src={ICONS.AUDIO_PLAYING} onClick={() => tab.mute()} />;
		}
		return null;
	})();

	return (
		<div
			onContextMenu={showContextMenu}
			className={tabClasses.join(" ")}
			onClick={() => {
				tab.activate();
			}}>
			<div style={containerColorStyle} className="containerIndicator"></div>
			<div className="iconAndBadge">
				<img
					className="tabIcon"
					src={brokenFavicon ? ICONS.DEFAULT : tab.favIconUrl || ICONS.DEFAULT}
					onError={() => setBrokenFavicon(true)}
				/>
				<div className="badge">{badge}</div>
			</div>
			<div className="tabText">{tab.title}</div>
			<img
				className="tabCloseBtn"
				src={ICONS.CLOSE}
				onClick={event => {
					event.stopPropagation();
					tab.close();
				}}
			/>
		</div>
	);
}
