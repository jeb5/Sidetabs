import browser from "webextension-polyfill";

export let containers: browser.ContextualIdentities.ContextualIdentity[] = [];

async function rebuildContainers() {
	containers = await browser.contextualIdentities.query({});
}
browser.contextualIdentities.onRemoved.addListener(rebuildContainers);
browser.contextualIdentities.onUpdated.addListener(rebuildContainers);
browser.contextualIdentities.onCreated.addListener(rebuildContainers);
rebuildContainers();
