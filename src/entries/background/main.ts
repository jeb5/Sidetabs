import browser from "webextension-polyfill";
// import welcomePage from "../welcome/welcome.html";
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.tabs.create({
			url: browser.runtime.getURL("src/entries/welcome/welcome.html"),
		});
  }
});
browser.browserAction.onClicked.addListener(async () => {
  await browser.sidebarAction.toggle();
});
