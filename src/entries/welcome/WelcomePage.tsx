import React from "react";
import ReactDOM from "react-dom/client";
import "./WelcomePage.css";
import CUSTOMISE_DIAGRAM from "../../assets/assisting_images/customise_diagram.svg?react";
import SIDETABS_ICON from "../../../public/sidetabs.svg?react";
import PREFERENCES_ICON from "../../assets/context_menu_icons/Preferences.svg?react";
import LinkButton from "../settings/components/LinkButton";

const WelcomePage = () => {
	return (
		<>
			<div className="welcome-container">
				<div className="main-scroll-box">
					<header>
						<div className="sidetabs-hero">
							<SIDETABS_ICON />
							<h1>Sidetabs</h1>
						</div>
						<LinkButton href="../settings/index.html" icon={<PREFERENCES_ICON />}>
							Sidetabs Settings
						</LinkButton>
					</header>
					<main>
						<section>
							<h2>Getting Started</h2>
							<p>
								Welcome to Sidetabs. Press <span className="kbd">Ctrl</span> + <span className="kbd">Alt</span> +{" "}
								<span className="kbd">R</span> or click the icon in the toolbar to hide/show your tabs in the sidebar.
							</p>
							<p>
								You'll probably want to keep the sidebar on the left side of your browser window, but if you'd like to switch it to the
								right, click on the sidebar header, and click "Move Sidebar to Right".
							</p>
							<p>You can customise tabs behaviour in settings, and your settings will by synced with your Firefox account.</p>
						</section>
						<section>
							<h2>Features</h2>
							<p>Sidetabs is intended as a replacement for horizontal Firefox tabs, so tabs work as expected.</p>
							<p>
								Tabs can be rearranged, closed, restored, and new tabs opened. Other features like container support and clearing website
								cache are accessible through the context menus of tabs. The context menu can also be customised in settings.
							</p>
							<p>
								Sidetabs will adapt to browser themes, to match the style of your regular tabs. Custom themes are supported. To make a
								custom browser theme that looks great with Sidetabs, you could use <a href="https://color.firefox.com">Firefox Color</a>.
							</p>
						</section>
						<section className="customising-section">
							<h2>Customising Firefox</h2>
							<div>
								<div>
									<p>
										If you want to completely switch to using vertical tabs, you'll probably want to hide the un-closable “Sidetabs” header
										at the top of the sidebar, and hide the horizontal tabs.
									</p>
									<p>
										You can achieve this by modifying your browser's <strong>UserChome.css</strong> file. Instructions for doing this can be
										found in settings.
									</p>
									<LinkButton href="../settings/index.html" icon={<PREFERENCES_ICON />}>
										Sidetabs Settings
									</LinkButton>
								</div>
								<div className="customise-diagram">
									<CUSTOMISE_DIAGRAM />
								</div>
							</div>
						</section>
						<section>
							<h2>Support</h2>
							<p>
								If you have any problems or feature requests, please{" "}
								<a href="https://github.com/jeb5/SideTabs/issues">open an issue on Github</a>. I may not have time to implement many new
								features, so Pull Requests would also be welcome.
							</p>
						</section>
					</main>
				</div>
			</div>
		</>
	);
};

const root = ReactDOM.createRoot(document.getElementById("reactRoot")!);
root.render(
  <React.StrictMode>
    <WelcomePage />
  </React.StrictMode>
);
