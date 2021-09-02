const tabsDiv = document.getElementById("tabsDiv");

browser.tabs.onActivated.addListener(tabChange);
browser.tabs.onAttached.addListener(tabChange);
browser.tabs.onCreated.addListener(tabChange);
browser.tabs.onDetached.addListener(tabChange);
browser.tabs.onHighlighted.addListener(tabChange);
browser.tabs.onMoved.addListener(tabChange);
browser.tabs.onRemoved.addListener(tabChange);
browser.tabs.onReplaced.addListener(tabChange);
browser.tabs.onUpdated.addListener(tabChange);

tabChange();
async function tabChange(...stuff) {
	console.log("TABS CHANGED");
	const tabs = await browser.tabs.query({ windowId: browser.windows.WINDOW_ID_CURRENT });
	console.log(tabs);
	while (tabsDiv.hasChildNodes()) {
		tabsDiv.removeChild(tabsDiv.lastChild);
	}
	for (const tab of tabs) {
		tabsDiv.appendChild(createTabEl(tab));
	}
}

function createTabEl(tabInfo) {
	let tabEl = document.createElement("div");
	let tabText = document.createElement("div");
	let tabIcon = document.createElement("img");
	let tabCloseBtn = document.createElement("img");
	tabEl.appendChild(tabIcon);
	tabEl.appendChild(tabText);
	tabEl.appendChild(tabCloseBtn);

	tabEl.classList.add("tab");
	if (tabInfo.active) {
		tabEl.classList.add("activeTab");
	}
	tabEl.addEventListener("click", async () => {
		await browser.tabs.highlight({ populate: false, tabs: [tabInfo.index] });
	});

	tabText.innerText = tabInfo.title;
	tabText.classList.add("tabText");

	tabCloseBtn.classList.add("tabCloseBtn");
	tabCloseBtn.src = browser.runtime.getURL("assets/close.svg");
	tabCloseBtn.addEventListener("click", async () => {
		await browser.tabs.remove(tabInfo.id);
	});

	tabIcon.classList.add("tabIcon");
	if (tabInfo.favIconUrl) {
		tabIcon.src = tabInfo.favIconUrl;
	} else {
		tabIcon.classList.add("noIcon");
	}

	return tabEl;
}
