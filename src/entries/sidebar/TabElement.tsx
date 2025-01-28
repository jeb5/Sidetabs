import React, { ReactNode, useContext, useEffect, useState } from "react";
import * as TabMethods from "./Tab";
import { Tab, TabManagerContext } from "./TabManager";
import CLOSE_ICON from "../../assets/context_menu_icons/Close.svg?react";
import AUDIO_PLAYING_ICON from "../../assets/icons/music_note.svg?react";
import AUDIO_MUTE_ICON from "../../assets/icons/music_note_off.svg?react";
import VIDEO_RECORDER_ICON from "../../assets/icons/Video Recorder.svg?react";
import MICROPHONE_ICON from "../../assets/icons/Microphone.svg?react";
import PIN_ICON from "../../assets/icons/Pin Flipped.svg?react";
import DEFAULT_TAB_ICON from "../../assets/icons/Firefox Default.svg?react";
import { useContextMenu } from "../ctxmenu/contextMenu";
import { OptionsContext } from "../options";
import { CollapsedContext } from "./CollapsedContext";
import { WindowInfoContext } from "./Root";

export default function TabElement({ tab }: { tab: Tab }) {
	const extensionOptions = useContext(OptionsContext);
	const isCollapsed = useContext(CollapsedContext);
	const windowInfo = useContext(WindowInfoContext);
	const { tabManager, selectedTabs } = useContext(TabManagerContext)!;

	const showContextMenu = useContextMenu(selectedTabs.length > 1 ? selectedTabs : [tab]);

	const [loading, setLoading] = React.useState(TabMethods.getLoading(tab));
	const [justLoaded, setJustLoaded] = React.useState(false); //Means the tab was loaded in the last 500 ms.
	const [useDefaultIcon, setUseDefaultIcon] = React.useState(false);

	const tabIsDraggingOverRef = React.useRef(false);
	const tabDragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		setLoading(TabMethods.getLoading(tab));
		if (!TabMethods.getLoading(tab) && loading) {
			setJustLoaded(true);
			setLoading(false);
			setTimeout(() => setJustLoaded(false), 500);
		}
	}, [tab.status]);

	useEffect(() => {
		setUseDefaultIcon(tab.favIconUrl === undefined || tab.favIconUrl === "" || tab.url === "about:newtab" || tab.url === "about:blank");
	}, [tab.favIconUrl, tab.status]);

	const [preventActivate, setPreventActivate] = useState(false);

	const tabClasses = ["tab"];
	if (tab.active) tabClasses.push("activeTab");
	if (tab.highlighted) tabClasses.push("highlighted");
	if (tab.discarded) tabClasses.push("discarded");
	if (TabMethods.getLoading(tab)) tabClasses.push("loading");
	if (justLoaded) tabClasses.push("justLoaded");
	if (tab.attention) tabClasses.push("drawingAttention");

	const tabContainer = TabMethods.getContainer(tab);
	const containerColorStyle = tabContainer?.color ? { backgroundColor: tabContainer.color } : {};

	let badges: ReactNode[] = [];
	if (tab.pinned && extensionOptions["appearance/pinnedBadge"]) badges.push(<PIN_ICON className="icon wide-icon" />);
	if (tab.sharingState?.camera) badges.push(<VIDEO_RECORDER_ICON className="icon recording-icon wide-icon" />);
	else if (tab.sharingState?.microphone) badges.push(<MICROPHONE_ICON className="icon recording-icon" />);
	if (TabMethods.getMuted(tab)) badges.push(<AUDIO_MUTE_ICON className="icon" onClick={() => TabMethods.unmute([tab])} />);
	else if (tab.audible) badges.push(<AUDIO_PLAYING_ICON className="icon" onClick={() => TabMethods.mute([tab])} />);

	const showBadgesOnFavicon = extensionOptions["appearance/showBadgesOnFavicon"] || isCollapsed;
	const indicator = badges[0];
	if (showBadgesOnFavicon && badges.length >= 1) badges.splice(0, 1);
	const showIndicator = indicator && !TabMethods.getLoading(tab) && showBadgesOnFavicon;
	const showBadges = indicator && !isCollapsed;

	return (
		<div
			onContextMenu={showContextMenu}
			className={tabClasses.join(" ")}
			onClick={(e) => {
				if (e.button === 0 && !preventActivate) TabMethods.activate(tab); //Left click (open tab)
				setPreventActivate(false);
			}}
			onMouseUp={
				extensionOptions["behavior/middleClickClose"]
					? (e) => {
							if (e.button === 1) TabMethods.close([tab]); //Middle mouse up (close)
					  }
					: undefined
			}
			onMouseDown={(e) => {
				if (e.button !== 0) return true; //Handle only left click
				const mac = windowInfo!.platform === "mac";
				if (e.shiftKey) {
					tabManager.toggleSelection(tab.id!, true);
					setPreventActivate(true);
				} else if ((e.ctrlKey && !mac) || (e.metaKey && mac)) {
					tabManager.toggleSelection(tab.id!);
					setPreventActivate(true);
				}
			}}
			title={extensionOptions["behavior/tabtooltip"] ? tab.title : undefined}
			onMouseEnter={() => {
				TabMethods.warmup(tab);
			}}
			onDragExit={() => {
				tabIsDraggingOverRef.current = false;
			}}
			onDragEnter={() => {
				return;
				// if (beingDragged) return;
				//
				// tabIsDraggingOverRef.current = true;
				// if (tabDragTimeoutRef.current) clearTimeout(tabDragTimeoutRef.current);
				// tabDragTimeoutRef.current = setTimeout(() => {
				// 	if (tabIsDraggingOverRef.current) TabMethods.activate(tab);
				// }, 500);
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
				{showIndicator && <div className="indicator">{indicator}</div>}
			</div>
			<div className="badges">{showBadges && badges.map((badge) => <div className="badge">{badge}</div>)}</div>
			<div className="tabText">{tab.title}</div>
			<div
				className="tabCloseBtn"
				onClick={(event) => {
					event.stopPropagation();
					TabMethods.close([tab]);
				}}
			>
				<CLOSE_ICON className="icon" />
			</div>
		</div>
	);
}
