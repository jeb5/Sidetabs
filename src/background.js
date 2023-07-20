import browser from "webextension-polyfill";
import welcomePage from "./welcome/welcome.html";
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.tabs.create({
      url: welcomePage,
    });
  }
});
browser.browserAction.onClicked.addListener(async () => {
	await browser.sidebarAction.toggle();
});
