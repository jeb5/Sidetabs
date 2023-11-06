import React, { useContext } from "react";
import tabMethods, { Tab } from "./Tab";
import CLOSE_ICON from "../../assets/icons/Close.svg?react";
import AUDIO_PLAYING_ICON from "../../assets/icons/music_note.svg?react";
import AUDIO_MUTE_ICON from "../../assets/icons/music_note_off.svg?react";
import DEFAULT_TAB_ICON from "../../assets/icons/Firefox Default.svg?react";
import { useContextMenu } from "../ctxmenu/contextMenu";
import { OptionsContext } from "../options";

export default function TabElement({ tab, beingDragged }: { tab: Tab; beingDragged: boolean }) {
	const showContextMenu = useContextMenu(tab);
	const extensionOptions = useContext(OptionsContext);

	const [loading, setLoading] = React.useState(tabMethods.getLoading(tab));
	const [justLoaded, setJustLoaded] = React.useState(false); //Means the tab was loaded in the last 500 ms.
	const [useDefaultIcon, setUseDefaultIcon] = React.useState(false);

	const tabIsDraggingOverRef = React.useRef(false);
	const tabDragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	React.useEffect(() => {
		setLoading(tabMethods.getLoading(tab));
		if (!tabMethods.getLoading(tab) && loading) {
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
	if (tabMethods.getLoading(tab)) tabClasses.push("loading");
	if (justLoaded) tabClasses.push("justLoaded");
	if (tab.attention) tabClasses.push("drawingAttention");

	const tabContainer = tabMethods.getContainer(tab);
	const containerColorStyle = tabContainer?.color ? { backgroundColor: tabContainer.color } : {};

	return (
		<div
			onContextMenu={showContextMenu}
			className={tabClasses.join(" ")}
			onClick={(e) => {
				if (e.button === 0) tabMethods.activate(tab); //Left click (open tab)
			}}
			onMouseUp={
				extensionOptions["behavior/middleClickClose"]
					? (e) => {
							if (e.button === 1) tabMethods.close(tab); //Middle mouse up (close)
					  }
					: undefined
			}
			onMouseEnter={() => {
				tabMethods.warmup(tab);
			}}
			onDragExit={() => {
				tabIsDraggingOverRef.current = false;
			}}
			onDragEnter={() => {
				if (beingDragged) return;
				tabIsDraggingOverRef.current = true;
				if (tabDragTimeoutRef.current) clearTimeout(tabDragTimeoutRef.current);
				tabDragTimeoutRef.current = setTimeout(() => {
					if (tabIsDraggingOverRef.current) tabMethods.activate(tab);
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
				{tabMethods.getLoading(tab) && <div className="loadingIndicator" />}
			</div>
			<div className="badges">
				{tabMethods.getMuted(tab) ? (
					<AUDIO_MUTE_ICON className="icon" onClick={() => tabMethods.unmute(tab)} />
				) : tab.audible ? (
					<AUDIO_PLAYING_ICON className="icon" onClick={() => tabMethods.mute(tab)} />
				) : null}
			</div>
			<div className="tabText">{tab.title}</div>
			<div
				className="tabCloseBtn"
				onClick={(event) => {
					event.stopPropagation();
					tabMethods.close(tab);
				}}
			>
				<CLOSE_ICON className="icon" />
			</div>
		</div>
	);
}
