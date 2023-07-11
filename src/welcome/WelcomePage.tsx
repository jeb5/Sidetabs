import React from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";
import "./WelcomePage.css";
import CUSTOM_DIAGRAM from "parcel-svg:../assets/assisting_images/customise_diagram.svg";
import SIDETABS_ICON from "parcel-svg:../assets/app_icons/sidetabs.svg";
import PREFERENCES_ICON from "parcel-svg:../assets/icons/Preferences.svg";

//BUG: Link back to settings page doesn't work- parcel not resolving the correct path (Welcome and settings pages built differently)
//TODO: Add GH/FF links to bottom of page

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
						{/* I SHOULD be able to import LinkButton here, but because welcome.html and settings.html are technically in the same "bundle group", parcel gets all annoyed about the css import in LinkButton FOR SOME REASON and won't let me do it*/}
						<a className="linkButtonDupe" href={browser.runtime.getURL("../settings/settings.html")} ><PREFERENCES_ICON /><span>Sidetabs Preferences</span></a>
					</header>
					<main>
						<section>
							<h2>Getting Started</h2>
							<p>
								Welcome to Sidetabs. Press <span className="kbd">Ctrl</span> +{" "}
								<span className="kbd">Alt</span> +{" "}
								<span className="kbd">R</span> or click the icon in the toolbar
								to hide/show your tabs in the sidebar.
							</p>
							<p>
								You'll probably want to keep the sidebar on the left side of
								your browser window, but if you'd like to switch it to the
								right, click on the sidebar header, and click "Move Sidebar to
								Right".
							</p>
							<p>
								You can customise tabs behaviour in preferences, and your
								preferences will by synced with your Firefox account.
							</p>
						</section>
						<section>
							<h2>Features</h2>
							<p>
								Sidetabs is intended as a replacement for horizontal Firefox
								tabs, so tabs work as expected.
							</p>
							<p>
								Tabs can be rearranged, closed, restored, and new tabs opened.
								Other features like container support and clearing website cache
								are accessible through the context menus of tabs. The context
								menu can also be customised in preferences.
							</p>
							<p>
								Sidetabs will adapt to browser themes, to match the style of
								your regular tabs. Custom themes are supported. To make a custom
								browser theme that looks great with Sidetabs, you could use{" "}
								<a href="https://color.firefox.com">Firefox Color</a>.
							</p>
						</section>
						<section className="customising-section">
							<h2>Customising Firefox</h2>
							<div>
								<div>
									<p>
										If you want to completely switch to using vertical tabs, you'll
										probably want to hide the un-closable “Sidetabs” header at the
										top of the sidebar, and hide the horizontal tabs.
									</p>
									<p>
										You can achieve this by modifying your browser's{" "}
										<strong>UserChome.css</strong> file. Instructions for doing this
										can be found in Preferences.
									</p>
									<a className="linkButtonDupe" href={browser.runtime.getURL("../settings/settings.html")} ><PREFERENCES_ICON /><span>Sidetabs Preferences</span></a>
								</div>
								<div className="custom-diagram">
									<CUSTOM_DIAGRAM />
								</div>
							</div>
						</section>
						<section>
							<h2>Support</h2>
							<p>
								If you have any problems or feature requests, please <a href="https://github.com/jeb5/SideTabs/issues">open an
									issue on Github</a>. I may not have time to implement many new
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
