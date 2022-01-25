import React from "react";
import Tab from "./Tab";
import { showTabMenu } from "./contextMenu";
import CLOSE_ICON from "parcel-svg:../assets/icons/close.svg";
import AUDIO_PLAYING_ICON from "parcel-svg:../assets/icons/music_note.svg";
import AUDIO_MUTE_ICON from "parcel-svg:../assets/icons/music_note_off.svg";
import DEFAULT_TAB_ICON from "parcel-svg:../assets/icons/firefox_default_icon.svg";

export default function TabElement({ tab }: { tab: Tab }) {
	const showContextMenu = () => {
		console.log(tab.cookieStoreId);
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
		setUseDefaultIcon(
			tab.favIconUrl === undefined || tab.favIconUrl === "" || tab.url === "about:newtab" || tab.url === "about:blank"
		);
	}, [tab.favIconUrl, tab.status]);

	const tabClasses = ["tab"];
	if (tab.active) tabClasses.push("activeTab");
	if (tab.discarded) tabClasses.push("discarded");
	if (tab.getLoading()) tabClasses.push("loading");
	if (justLoaded) tabClasses.push("justLoaded");
	if (tab.attention) tabClasses.push("drawingAttention");

	const tabContainer = tab.getContainer();
	const containerColorStyle = tabContainer?.color ? { backgroundColor: tabContainer.color } : {};

	return (
		<div
			onContextMenu={showContextMenu}
			className={tabClasses.join(" ")}
			onClick={() => {
				tab.activate();
			}}>
			<div style={containerColorStyle} className="containerIndicator"></div>
			<div className="iconPlusIndicator">
				{useDefaultIcon ? (
					<DEFAULT_TAB_ICON className="icon tabIcon defaultTabIcon" />
				) : (
					<img className="tabIcon" src={tab.favIconUrl} onError={() => setUseDefaultIcon(true)} />
				)}
				{tab.getLoading() && <div className="loadingIndicator" />}
			</div>
			<div className="badges">
				{tab.getMuted() ? (
					<AUDIO_MUTE_ICON className="icon" onClick={() => tab.unmute()} />
				) : tab.audible ? (
					<AUDIO_PLAYING_ICON className="icon" onClick={() => tab.mute()} />
				) : null}
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
