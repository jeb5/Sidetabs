import { random } from "node-emoji";
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { TabDad, TabsState } from "../src/main";

function getRandomName() {
	const randomEmoji = random();
	return `${randomEmoji.emoji} ${randomEmoji.name}`;
}

const Tab = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="tab">
			<div className="tab-inner">{children}</div>
		</div>
	);
};

const tabsState: TabsState = [
	{
		name: "pinned",
		mode: "2d",
		tabWidth: 36,
		tabHeight: 36,
		groupsAllowed: false,
		tabs: [
			{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
			{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
			{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
		],
	},
	{
		name: "regular",
		mode: "1d",
		tabHeight: 36,
		groupsAllowed: true,
		tabs: [
			{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
			{
				type: "group",
				component: <div>{getRandomName()}</div>,
				tabs: [
					{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
					{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
				],
			},
			{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
			{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
			{ type: "group", component: <Tab>{getRandomName()}</Tab>, tabs: [] },
			{ type: "tab", component: <Tab>{getRandomName()}</Tab> },
		],
	},
];

const App = () => {
	return (
		<div className="app-container">
			<h1>React Tab Drag and Drop</h1>
			<div className="tabs-container">
				<TabDad tabsState={tabsState} />
			</div>
		</div>
	);
};

const reactRoot = createRoot(document.getElementById("reactRoot")!);
reactRoot.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
