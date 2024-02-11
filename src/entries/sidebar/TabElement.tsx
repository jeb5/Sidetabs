import React, { useContext } from "react";
import * as TabMethods from "./Tab";
import { Tab } from "./Tab";
import CLOSE_ICON from "../../assets/context_menu_icons/Close.svg?react";
import AUDIO_PLAYING_ICON from "../../assets/icons/music_note.svg?react";
import AUDIO_MUTE_ICON from "../../assets/icons/music_note_off.svg?react";
import VIDEO_RECORDER_ICON from "../../assets/icons/Video Recorder.svg?react";
import MICROPHONE_ICON from "../../assets/icons/Microphone.svg?react";
import DEFAULT_TAB_ICON from "../../assets/icons/Firefox Default.svg?react";
import { useContextMenu } from "../ctxmenu/contextMenu";
import { OptionsContext } from "../options";

export default function TabElement({ tab, beingDragged }: { tab: Tab; beingDragged: boolean }) {
	const showContextMenu = useContextMenu(tab);
	const extensionOptions = useContext(OptionsContext);

	const [loading, setLoading] = React.useState(TabMethods.getLoading(tab));
	const [justLoaded, setJustLoaded] = React.useState(false); //Means the tab was loaded in the last 500 ms.
	const [useDefaultIcon, setUseDefaultIcon] = React.useState(false);

	const tabIsDraggingOverRef = React.useRef(false);
	const tabDragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	React.useEffect(() => {
		setLoading(TabMethods.getLoading(tab));
		if (!TabMethods.getLoading(tab) && loading) {
			setJustLoaded(true);
			setLoading(false);
			setTimeout(() => setJustLoaded(false), 500);
		}
	}, [tab.status]);

	React.useEffect(() => {
		setUseDefaultIcon(tab.favIconUrl === undefined || tab.favIconUrl === "" || tab.url === "about:newtab" || tab.url === "about:blank");
	}, [tab.favIconUrl, tab.status]);

	const tabClasses = ["tab"];
	if (tab.active) tabClasses.push("activeTab");
	if (tab.discarded) tabClasses.push("discarded");
	if (TabMethods.getLoading(tab)) tabClasses.push("loading");
	if (justLoaded) tabClasses.push("justLoaded");
	if (tab.attention) tabClasses.push("drawingAttention");

	const tabContainer = TabMethods.getContainer(tab);
	const containerColorStyle = tabContainer?.color ? { backgroundColor: tabContainer.color } : {};

	return (
		<div
			onContextMenu={showContextMenu}
			className={tabClasses.join(" ")}
			onClick={(e) => {
				if (e.button === 0) TabMethods.activate(tab); //Left click (open tab)
			}}
			onMouseUp={
				extensionOptions["behavior/middleClickClose"]
					? (e) => {
							if (e.button === 1) TabMethods.close(tab); //Middle mouse up (close)
					  }
					: undefined
			}
			title={extensionOptions["behavior/tabtooltip"] ? tab.title : undefined}
			onMouseEnter={() => {
				TabMethods.warmup(tab);
			}}
			onDragExit={() => {
				tabIsDraggingOverRef.current = false;
			}}
			onDragEnter={() => {
				if (beingDragged) return;
				tabIsDraggingOverRef.current = true;
				if (tabDragTimeoutRef.current) clearTimeout(tabDragTimeoutRef.current);
				tabDragTimeoutRef.current = setTimeout(() => {
					if (tabIsDraggingOverRef.current) TabMethods.activate(tab);
				}, 500);
			}}
		>
			<div style={containerColorStyle} className="containerIndicator"></div>
			<div className="iconPlusIndicator">
				{useDefaultIcon ? (
					<DEFAULT_TAB_ICON className="icon tabIcon defaultTabIcon" />
				) : (
					<img className="tabIcon" src={tab.favIconUrl} onError={() => setUseDefaultIcon(true)} />
				)}
				{TabMethods.getLoading(tab) && <div className="loadingIndicator" />}
			</div>
			<div className="badges">
				{tab.sharingState?.camera ? (
					<div className="badge">
						<VIDEO_RECORDER_ICON className="icon recording-icon video-recorder-icon" />
					</div>
				) : tab.sharingState?.microphone ? (
					<div className="badge">
						<MICROPHONE_ICON className="icon recording-icon" />
					</div>
				) : null}
				{TabMethods.getMuted(tab) ? (
					<div className="badge">
						<AUDIO_MUTE_ICON className="icon" onClick={() => TabMethods.unmute(tab)} />
					</div>
				) : tab.audible ? (
					<div className="badge">
						<AUDIO_PLAYING_ICON className="icon" onClick={() => TabMethods.mute(tab)} />
					</div>
				) : null}
			</div>
			<div className="tabText">{tab.title}</div>
			<div
				className="tabCloseBtn"
				onClick={(event) => {
					event.stopPropagation();
					TabMethods.close(tab);
				}}
			>
				<CLOSE_ICON className="icon" />
			</div>
		</div>
	);
}
