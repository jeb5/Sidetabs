import React from "react";
import Tab from "./Tab";
import { showTabMenu } from "../ctxmenu/contextMenu";
import CLOSE_ICON from "parcel-svg:../assets/icons/Close.svg";
import AUDIO_PLAYING_ICON from "parcel-svg:../assets/icons/music_note.svg";
import AUDIO_MUTE_ICON from "parcel-svg:../assets/icons/music_note_off.svg";
import DEFAULT_TAB_ICON from "parcel-svg:../assets/icons/Firefox Default.svg";
import Browser from "webextension-polyfill";

export default function TabElement({ tab, beingDragged }: { tab: Tab; beingDragged: boolean }) {
	const showContextMenu = () => {
		showTabMenu(tab);
	};

	const [loading, setLoading] = React.useState(tab.getLoading());
	const [justLoaded, setJustLoaded] = React.useState(false); //Means the tab was loaded in the last 500 ms.
	const [useDefaultIcon, setUseDefaultIcon] = React.useState(false);

	const tabIsDraggingOverRef = React.useRef(false);
	const tabDragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
			}}
			onMouseEnter={() => {
				Browser.tabs.warmup(tab.id!);
			}}
			onDragExit={() => {
				tabIsDraggingOverRef.current = false;
			}}
			onDragEnter={() => {
				if (beingDragged) return;
				tabIsDraggingOverRef.current = true;
				if (tabDragTimeoutRef.current) clearTimeout(tabDragTimeoutRef.current);
				tabDragTimeoutRef.current = setTimeout(() => {
					console.log(tabIsDraggingOverRef.current);
					if (tabIsDraggingOverRef.current) tab.activate();
				}, 500);
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
