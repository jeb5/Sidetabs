import browser from "webextension-polyfill";
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.tabs.create({
      url: browser.runtime.getURL("welcome.html"),
    });
  }
});
browser.browserAction.onClicked.addListener(async () => {
  await browser.sidebarAction.toggle();
});
