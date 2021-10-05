// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function(modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function(id, exports) {
    modules[id] = [
      function(require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function() {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"l3yU4":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "containers", ()=>containers
);
parcelHelpers.export(exports, "WIN_ID", ()=>WIN_ID
);
var _contextMenu = require("./contextMenu");
var _tab = require("./Tab");
var _tabDefault = parcelHelpers.interopDefault(_tab);
var _sidebarStylesCss = require("./sidebarStyles.css");
var _webextensionPolyfill = require("webextension-polyfill");
var _webextensionPolyfillDefault = parcelHelpers.interopDefault(_webextensionPolyfill);
let currentTabs = {
}; //All tabs in the current window, indexed by id
let containers = [];
let WIN_ID;
function tabCreated(rawTab) {
    if (rawTab.id != undefined) currentTabs[rawTab.id] = new _tabDefault.default(rawTab);
}
function tabRemoved(tabId) {
    currentTabs[tabId].removeTab();
    delete currentTabs[tabId];
}
function tabChanged(tabId, changeInfo) {
    currentTabs[tabId]?.updated(changeInfo);
}
function tabMoved(tabId, toIndex) {
    currentTabs[tabId].moved(toIndex);
}
setup();
async function setup() {
    WIN_ID = (await _webextensionPolyfillDefault.default.windows.getCurrent()).id; //WINDOW_ID_CURRENT returns wrong value for some reason
    _webextensionPolyfillDefault.default.tabs.onActivated.addListener(async ({ tabId , previousTabId , windowId  })=>{
        if (windowId == WIN_ID) {
            currentTabs[tabId].updated({
                active: true
            });
            if (previousTabId != undefined) currentTabs[previousTabId]?.updated({
                active: false
            });
        }
    });
    _webextensionPolyfillDefault.default.tabs.onAttached.addListener(async (tabId, { newWindowId  })=>{
        if (newWindowId === WIN_ID) tabCreated(await _webextensionPolyfillDefault.default.tabs.get(tabId));
    });
    _webextensionPolyfillDefault.default.tabs.onCreated.addListener((tab)=>{
        if (tab.windowId === WIN_ID) tabCreated(tab);
    });
    _webextensionPolyfillDefault.default.tabs.onDetached.addListener((tabId, { oldWindowId  })=>{
        if (oldWindowId === WIN_ID) tabRemoved(tabId);
    });
    // browser.tabs.onHighlighted.addListener(tabChange);
    _webextensionPolyfillDefault.default.tabs.onMoved.addListener((tabId, { windowId , toIndex  })=>{
        if (windowId === WIN_ID) tabMoved(tabId, toIndex);
    });
    _webextensionPolyfillDefault.default.tabs.onRemoved.addListener((tabId, { windowId  })=>{
        if (windowId === WIN_ID) tabRemoved(tabId);
    });
    _webextensionPolyfillDefault.default.tabs.onUpdated.addListener(tabChanged, {
        windowId: WIN_ID
    });
    const tabs = await _webextensionPolyfillDefault.default.tabs.query({
        windowId: WIN_ID
    });
    for (const tab of tabs)tabCreated(tab);
}
async function rebuildContainers() {
    containers = await _webextensionPolyfillDefault.default.contextualIdentities.query({
    });
}
_webextensionPolyfillDefault.default.contextualIdentities.onRemoved.addListener(rebuildContainers);
_webextensionPolyfillDefault.default.contextualIdentities.onUpdated.addListener(rebuildContainers);
_webextensionPolyfillDefault.default.contextualIdentities.onCreated.addListener(rebuildContainers);
rebuildContainers();

},{"./contextMenu":"5gUSp","./Tab":"4Zz2M","./sidebarStyles.css":"3gmz3","webextension-polyfill":"5Qfkh","@parcel/transformer-js/src/esmodule-helpers.js":"lBfFQ"}],"5gUSp":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "showTabMenu", ()=>showTabMenu
);
var _tab = require("./Tab");
var _sidebar = require("./sidebar");
var _webextensionPolyfill = require("webextension-polyfill");
var _webextensionPolyfillDefault = parcelHelpers.interopDefault(_webextensionPolyfill);
function showTabMenu(tab) {
    setMenu([
        {
            title: "New Tab",
            onclick: ()=>_tab.newTab({
                    openerTabId: tab.id
                })
        },
        {
            title: "Reopen Closed Tab",
            onclick: ()=>_tab.restoreClosedTab()
        },
        {
            type: "separator"
        },
        {
            title: "Reload Tab",
            onclick: ()=>tab.reload()
        },
        tab.muted ? {
            title: "Unmute Tab",
            onclick: ()=>tab.unmute()
        } : {
            title: "Mute Tab",
            onclick: ()=>tab.mute()
        },
        tab.pinned ? {
            title: "Unpin Tab",
            onclick: ()=>tab.unpin()
        } : {
            title: "Pin Tab",
            onclick: ()=>tab.pin()
        },
        {
            title: "Duplicate Tab",
            onclick: ()=>tab.duplicate()
        },
        {
            title: "Reopen in Container",
            enabled: !!_sidebar.containers.length && tab.isReopenable,
            children: [
                {
                    title: "Default",
                    enabled: !!tab.container,
                    onclick: ()=>tab.reopenWithCookieStoreId()
                },
                ..._sidebar.containers.map((container)=>({
                        title: container.name,
                        icons: {
                            16: container.iconUrl
                        },
                        enabled: container.cookieStoreId != tab.cookieStoreId,
                        onclick: ()=>tab.reopenWithCookieStoreId(container.cookieStoreId)
                    })
                ), 
            ]
        },
        {
            title: "Unload Tab",
            onclick: ()=>tab.discard()
            ,
            enabled: tab.discardable
        },
        {
            title: "Bookmark Tab",
            onclick: ()=>tab.bookmark()
        },
        {
            type: "separator"
        },
        {
            title: "Close Tab",
            onclick: ()=>tab.close()
        }, 
    ]);
}
document.addEventListener("contextmenu", (event)=>{
    if (event.target.closest(".tab")) return;
    setMenu([
        {
            title: "New Tab",
            onclick: ()=>_tab.newTab()
        },
        {
            title: "Reopen Closed Tab",
            onclick: ()=>_tab.restoreClosedTab()
        },
        {
            type: "separator"
        }, 
    ]);
});
function setMenu(structure) {
    _webextensionPolyfillDefault.default.menus.overrideContext({
        showDefaults: false
    });
    _webextensionPolyfillDefault.default.menus.removeAll();
    for (const contextObj of structure)createContext(contextObj);
}
function createContext(menu, parentId) {
    const { children , ...createProps } = menu;
    if (parentId != undefined) createProps.parentId = parentId;
    const id = _webextensionPolyfillDefault.default.menus.create({
        contexts: [
            "all"
        ],
        viewTypes: [
            "sidebar"
        ],
        ...createProps
    });
    for (const childContextObj of children || [])createContext(childContextObj, id);
}

},{"./Tab":"4Zz2M","./sidebar":"l3yU4","webextension-polyfill":"5Qfkh","@parcel/transformer-js/src/esmodule-helpers.js":"lBfFQ"}],"4Zz2M":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>Tab
);
parcelHelpers.export(exports, "newTab", ()=>newTab
);
parcelHelpers.export(exports, "restoreClosedTab", ()=>restoreClosedTab
);
var _sidebar = require("./sidebar");
var _contextMenu = require("./contextMenu");
var _webextensionPolyfill = require("webextension-polyfill");
var _webextensionPolyfillDefault = parcelHelpers.interopDefault(_webextensionPolyfill);
const tabsDiv = document.getElementById("tabsDiv");
const pinnedTabsDiv = document.getElementById("pinnedTabsDiv");
let tabOrder = []; //All unpinned tab ids in the current window, sorted by index
let pinnedTabOrder = []; //All pinned tab ids in the current window, sorted by index
class Tab {
    get index() {
        return this.belongingOrder.indexOf(this.id);
    }
    get browserIndex() {
        return this.pinned ? this.index : this.index + pinnedTabOrder.length;
    }
    get container() {
        const container = _sidebar.containers.find((e)=>e.cookieStoreId === this.cookieStoreId
        );
        return container || null;
    }
    updated(changeInfo) {
        const handlers = {
            title: (newValue)=>{
                this.title = newValue;
                this.titleEl.innerText = this.title;
            },
            favIconUrl: (newValue)=>{
                this.favIconUrl = newValue;
                this.faviconEl.src = this.favIconUrl || "";
            },
            active: (newValue)=>{
                this.active = newValue;
                this.tabEl.classList.toggle("activeTab", this.active);
            },
            cookieStoreId: (newValue)=>{
                this.cookieStoreId = newValue;
                if (this.container) this.containerIndicatorEl.style.backgroundColor = this.container.colorCode;
            },
            status: (newValue)=>{
                const loading = newValue == "loading"; //Status is either "loading" or "complete"
                this.tabEl.classList.toggle("loading", loading);
                if (this.status == "loading" && !loading) {
                    this.tabEl.classList.add("finishLoad");
                    if (this.loadTimeout) clearTimeout(this.loadTimeout);
                    this.loadTimeout = setTimeout(()=>this.tabEl.classList.remove("finishLoad")
                    , 500);
                }
                this.status = newValue;
            },
            mutedInfo: (newValue)=>this.muted = newValue.muted
            ,
            pinned: (newValue)=>{
                if (this.pinned === newValue) return;
                this.pinned = newValue;
                this.movePinned(newValue);
            },
            url: (newValue)=>this.url = newValue
            ,
            discarded: (newValue)=>{
                this.discarded = newValue;
                this.tabEl.classList.toggle("discarded", this.discarded);
            }
        };
        for (const [keyChanged, newValue] of Object.entries(changeInfo))if (keyChanged in handlers) handlers[keyChanged](newValue);
    }
    async movePinned(pinning) {
        const newIndex = (await _webextensionPolyfillDefault.default.tabs.get(this.id)).index;
        if (pinning) {
            //unpinned -> pinned
            this.belongingDiv = pinnedTabsDiv;
            this.belongingOrder.splice(this.index, 1); //removes
            this.belongingOrder = pinnedTabOrder;
            this.belongingOrder.splice(newIndex, 0, this.id); //adds
        } else {
            //pinned -> unpinned
            this.belongingDiv = tabsDiv;
            this.belongingOrder.splice(this.index, 1); //removes
            this.belongingOrder = tabOrder;
            this.belongingOrder.splice(newIndex - pinnedTabOrder.length, 0, this.id); //adds
        }
        this.belongingDiv.insertBefore(this.tabEl, this.belongingDiv.children[this.index]);
    }
    moved(toIndex) {
        //When move event is fired, this.pinned may be outdated, as move events are fired before onUpdated events. Therefore, the index that the tab is moving to may not be a possible index to move to.
        //When pinned or unpinned, movedPinned() will handle move
        const newIndex = this.pinned ? toIndex : toIndex - pinnedTabOrder.length;
        if (newIndex < 0 || newIndex >= this.belongingOrder.length) return; //Tab has probably been pinned or unpinned
        if (this.index === newIndex) return;
        if (newIndex < this.index) this.belongingDiv.insertBefore(this.tabEl, this.belongingDiv.children[newIndex]);
        else this.belongingDiv.insertBefore(this.tabEl, this.belongingDiv.children[newIndex].nextSibling);
        this.belongingOrder.splice(this.index, 1); //removes
        this.belongingOrder.splice(newIndex, 0, this.id);
    }
    removeTab() {
        this.belongingDiv.removeChild(this.tabEl);
        this.belongingOrder.splice(this.index, 1); //removes
    }
    async reload() {
        return await _webextensionPolyfillDefault.default.tabs.reload(this.id);
    }
    async mute() {
        return await _webextensionPolyfillDefault.default.tabs.update(this.id, {
            muted: true
        });
    }
    async unmute() {
        return await _webextensionPolyfillDefault.default.tabs.update(this.id, {
            muted: false
        });
    }
    async duplicate() {
        return await _webextensionPolyfillDefault.default.tabs.duplicate(this.id);
    }
    async pin() {
        return await _webextensionPolyfillDefault.default.tabs.update(this.id, {
            pinned: true
        });
    }
    async unpin() {
        return await _webextensionPolyfillDefault.default.tabs.update(this.id, {
            pinned: false
        });
    }
    async bookmark() {
        return await _webextensionPolyfillDefault.default.bookmarks.create({
            title: this.title,
            url: this.url
        });
    }
    async close() {
        return await _webextensionPolyfillDefault.default.tabs.remove(this.id);
    }
    async discard() {
        await _webextensionPolyfillDefault.default.tabs.discard(this.id);
    }
    async reopenWithCookieStoreId(cookieStoreId) {
        await _webextensionPolyfillDefault.default.tabs.create({
            active: this.active,
            ...cookieStoreId ? {
                cookieStoreId
            } : {
            },
            discarded: this.discarded,
            ...this.discarded ? {
                title: this.title
            } : {
            },
            index: this.browserIndex,
            pinned: this.pinned,
            ...this.url !== "about:newtab" ? {
                url: this.url
            } : {
            }
        });
        await this.close();
    }
    get discardable() {
        return !this.discarded && !this.active;
    }
    get isReopenable() {
        const { protocol  } = new URL(this.url);
        return [
            "http:",
            "https:"
        ].indexOf(protocol) != -1 || this.url === "about:newtab";
    }
    createTabEl() {
        const tabEl = document.createElement("div");
        const containerIndicatorEl = document.createElement("div");
        tabEl.appendChild(containerIndicatorEl);
        const faviconEl = document.createElement("img");
        tabEl.appendChild(faviconEl);
        const titleEl = document.createElement("div");
        tabEl.appendChild(titleEl);
        const tabCloseBtn = document.createElement("img");
        tabEl.appendChild(tabCloseBtn);
        tabEl.addEventListener("click", async ()=>{
            await _webextensionPolyfillDefault.default.tabs.update(this.id, {
                active: true
            });
        });
        tabEl.addEventListener("contextmenu", ()=>_contextMenu.showTabMenu(this)
        );
        tabEl.draggable = true;
        tabEl.addEventListener("dragstart", (e)=>{
            if (!e.dataTransfer) return;
            e.dataTransfer.setData("text/x-moz-url", `${this.url}\n${this.title}`);
            e.dataTransfer.setData("text/uri-list", this.url);
            e.dataTransfer.setData("text/plain", this.url);
            e.dataTransfer.effectAllowed = "copyMove";
            e.dataTransfer.setDragImage(document.getElementById("invisibleDragImage"), 0, 0);
        });
        tabEl.classList.add("tab");
        titleEl.classList.add("tabText");
        tabCloseBtn.classList.add("tabCloseBtn");
        tabCloseBtn.src = _webextensionPolyfillDefault.default.runtime.getURL("assets/close.svg");
        tabCloseBtn.addEventListener("click", async (e)=>{
            e.stopPropagation();
            this.close();
        });
        containerIndicatorEl.classList.add("containerIndicator");
        faviconEl.classList.add("tabIcon");
        faviconEl.src = "";
        return {
            tabEl,
            titleEl,
            faviconEl,
            containerIndicatorEl
        };
    }
    constructor(rawTab){
        this.id = rawTab.id || -1;
        const { tabEl , titleEl , faviconEl , containerIndicatorEl  } = this.createTabEl();
        [this.tabEl, this.titleEl, this.faviconEl, this.containerIndicatorEl] = [
            tabEl,
            titleEl,
            faviconEl,
            containerIndicatorEl, 
        ];
        const pinned = rawTab.pinned;
        const index = pinned ? rawTab.index : rawTab.index - pinnedTabOrder.length;
        this.belongingDiv = pinned ? pinnedTabsDiv : tabsDiv;
        this.belongingOrder = pinned ? pinnedTabOrder : tabOrder;
        this.belongingOrder.splice(index, 0, this.id);
        this.belongingDiv.insertBefore(tabEl, tabsDiv.children[index]);
        this.updated(rawTab);
    }
}
async function newTab(createOptions = {
}) {
    return await _webextensionPolyfillDefault.default.tabs.create(createOptions);
}
async function restoreClosedTab() {
    const lastClosed = await _webextensionPolyfillDefault.default.sessions.getRecentlyClosed();
    if (!lastClosed.length) return;
    const lastTab = lastClosed.find((e)=>e.tab && e.tab.windowId === _sidebar.WIN_ID
    )?.tab;
    if (!lastTab) return;
    return await _webextensionPolyfillDefault.default.sessions.restore(lastTab.sessionId);
}

},{"./sidebar":"l3yU4","./contextMenu":"5gUSp","webextension-polyfill":"5Qfkh","@parcel/transformer-js/src/esmodule-helpers.js":"lBfFQ"}],"5Qfkh":[function(require,module,exports) {
(function(global, factory) {
    if (typeof define === "function" && define.amd) define("webextension-polyfill", [
        "module"
    ], factory);
    else if (typeof exports !== "undefined") factory(module);
    else {
        var mod = {
            exports: {
            }
        };
        factory(mod);
        global.browser = mod.exports;
    }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function(module) {
    /* webextension-polyfill - v0.8.0 - Tue Apr 20 2021 11:27:38 */ /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */ /* vim: set sts=2 sw=2 et tw=80: */ /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */ "use strict";
    if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
        const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
        const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
        // optimization for Firefox. Since Spidermonkey does not fully parse the
        // contents of a function until the first time it's called, and since it will
        // never actually need to be called, this allows the polyfill to be included
        // in Firefox nearly for free.
        const wrapAPIs = (extensionAPIs)=>{
            // NOTE: apiMetadata is associated to the content of the api-metadata.json file
            // at build time by replacing the following "include" with the content of the
            // JSON file.
            const apiMetadata = {
                "alarms": {
                    "clear": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "clearAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "get": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "getAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    }
                },
                "bookmarks": {
                    "create": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "get": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getChildren": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getRecent": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getSubTree": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getTree": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "move": {
                        "minArgs": 2,
                        "maxArgs": 2
                    },
                    "remove": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeTree": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "search": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "update": {
                        "minArgs": 2,
                        "maxArgs": 2
                    }
                },
                "browserAction": {
                    "disable": {
                        "minArgs": 0,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "enable": {
                        "minArgs": 0,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "getBadgeBackgroundColor": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getBadgeText": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getPopup": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getTitle": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "openPopup": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "setBadgeBackgroundColor": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "setBadgeText": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "setIcon": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "setPopup": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "setTitle": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    }
                },
                "browsingData": {
                    "remove": {
                        "minArgs": 2,
                        "maxArgs": 2
                    },
                    "removeCache": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeCookies": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeDownloads": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeFormData": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeHistory": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeLocalStorage": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removePasswords": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removePluginData": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "settings": {
                        "minArgs": 0,
                        "maxArgs": 0
                    }
                },
                "commands": {
                    "getAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    }
                },
                "contextMenus": {
                    "remove": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "update": {
                        "minArgs": 2,
                        "maxArgs": 2
                    }
                },
                "cookies": {
                    "get": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getAll": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getAllCookieStores": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "remove": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "set": {
                        "minArgs": 1,
                        "maxArgs": 1
                    }
                },
                "devtools": {
                    "inspectedWindow": {
                        "eval": {
                            "minArgs": 1,
                            "maxArgs": 2,
                            "singleCallbackArg": false
                        }
                    },
                    "panels": {
                        "create": {
                            "minArgs": 3,
                            "maxArgs": 3,
                            "singleCallbackArg": true
                        },
                        "elements": {
                            "createSidebarPane": {
                                "minArgs": 1,
                                "maxArgs": 1
                            }
                        }
                    }
                },
                "downloads": {
                    "cancel": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "download": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "erase": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getFileIcon": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "open": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "pause": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeFile": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "resume": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "search": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "show": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    }
                },
                "extension": {
                    "isAllowedFileSchemeAccess": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "isAllowedIncognitoAccess": {
                        "minArgs": 0,
                        "maxArgs": 0
                    }
                },
                "history": {
                    "addUrl": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "deleteAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "deleteRange": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "deleteUrl": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getVisits": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "search": {
                        "minArgs": 1,
                        "maxArgs": 1
                    }
                },
                "i18n": {
                    "detectLanguage": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getAcceptLanguages": {
                        "minArgs": 0,
                        "maxArgs": 0
                    }
                },
                "identity": {
                    "launchWebAuthFlow": {
                        "minArgs": 1,
                        "maxArgs": 1
                    }
                },
                "idle": {
                    "queryState": {
                        "minArgs": 1,
                        "maxArgs": 1
                    }
                },
                "management": {
                    "get": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "getSelf": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "setEnabled": {
                        "minArgs": 2,
                        "maxArgs": 2
                    },
                    "uninstallSelf": {
                        "minArgs": 0,
                        "maxArgs": 1
                    }
                },
                "notifications": {
                    "clear": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "create": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "getAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "getPermissionLevel": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "update": {
                        "minArgs": 2,
                        "maxArgs": 2
                    }
                },
                "pageAction": {
                    "getPopup": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getTitle": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "hide": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "setIcon": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "setPopup": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "setTitle": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    },
                    "show": {
                        "minArgs": 1,
                        "maxArgs": 1,
                        "fallbackToNoCallback": true
                    }
                },
                "permissions": {
                    "contains": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getAll": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "remove": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "request": {
                        "minArgs": 1,
                        "maxArgs": 1
                    }
                },
                "runtime": {
                    "getBackgroundPage": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "getPlatformInfo": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "openOptionsPage": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "requestUpdateCheck": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "sendMessage": {
                        "minArgs": 1,
                        "maxArgs": 3
                    },
                    "sendNativeMessage": {
                        "minArgs": 2,
                        "maxArgs": 2
                    },
                    "setUninstallURL": {
                        "minArgs": 1,
                        "maxArgs": 1
                    }
                },
                "sessions": {
                    "getDevices": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "getRecentlyClosed": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "restore": {
                        "minArgs": 0,
                        "maxArgs": 1
                    }
                },
                "storage": {
                    "local": {
                        "clear": {
                            "minArgs": 0,
                            "maxArgs": 0
                        },
                        "get": {
                            "minArgs": 0,
                            "maxArgs": 1
                        },
                        "getBytesInUse": {
                            "minArgs": 0,
                            "maxArgs": 1
                        },
                        "remove": {
                            "minArgs": 1,
                            "maxArgs": 1
                        },
                        "set": {
                            "minArgs": 1,
                            "maxArgs": 1
                        }
                    },
                    "managed": {
                        "get": {
                            "minArgs": 0,
                            "maxArgs": 1
                        },
                        "getBytesInUse": {
                            "minArgs": 0,
                            "maxArgs": 1
                        }
                    },
                    "sync": {
                        "clear": {
                            "minArgs": 0,
                            "maxArgs": 0
                        },
                        "get": {
                            "minArgs": 0,
                            "maxArgs": 1
                        },
                        "getBytesInUse": {
                            "minArgs": 0,
                            "maxArgs": 1
                        },
                        "remove": {
                            "minArgs": 1,
                            "maxArgs": 1
                        },
                        "set": {
                            "minArgs": 1,
                            "maxArgs": 1
                        }
                    }
                },
                "tabs": {
                    "captureVisibleTab": {
                        "minArgs": 0,
                        "maxArgs": 2
                    },
                    "create": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "detectLanguage": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "discard": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "duplicate": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "executeScript": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "get": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getCurrent": {
                        "minArgs": 0,
                        "maxArgs": 0
                    },
                    "getZoom": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "getZoomSettings": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "goBack": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "goForward": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "highlight": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "insertCSS": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "move": {
                        "minArgs": 2,
                        "maxArgs": 2
                    },
                    "query": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "reload": {
                        "minArgs": 0,
                        "maxArgs": 2
                    },
                    "remove": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "removeCSS": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "sendMessage": {
                        "minArgs": 2,
                        "maxArgs": 3
                    },
                    "setZoom": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "setZoomSettings": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "update": {
                        "minArgs": 1,
                        "maxArgs": 2
                    }
                },
                "topSites": {
                    "get": {
                        "minArgs": 0,
                        "maxArgs": 0
                    }
                },
                "webNavigation": {
                    "getAllFrames": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "getFrame": {
                        "minArgs": 1,
                        "maxArgs": 1
                    }
                },
                "webRequest": {
                    "handlerBehaviorChanged": {
                        "minArgs": 0,
                        "maxArgs": 0
                    }
                },
                "windows": {
                    "create": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "get": {
                        "minArgs": 1,
                        "maxArgs": 2
                    },
                    "getAll": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "getCurrent": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "getLastFocused": {
                        "minArgs": 0,
                        "maxArgs": 1
                    },
                    "remove": {
                        "minArgs": 1,
                        "maxArgs": 1
                    },
                    "update": {
                        "minArgs": 2,
                        "maxArgs": 2
                    }
                }
            };
            if (Object.keys(apiMetadata).length === 0) throw new Error("api-metadata.json has not been included in browser-polyfill");
            /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */ class DefaultWeakMap extends WeakMap {
                constructor(createItem, items){
                    super(items);
                    this.createItem = createItem;
                }
                get(key) {
                    if (!this.has(key)) this.set(key, this.createItem(key));
                    return super.get(key);
                }
            }
            /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */ const isThenable = (value)=>{
                return value && typeof value === "object" && typeof value.then === "function";
            };
            /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */ const makeCallback = (promise, metadata)=>{
                return (...callbackArgs)=>{
                    if (extensionAPIs.runtime.lastError) promise.reject(new Error(extensionAPIs.runtime.lastError.message));
                    else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) promise.resolve(callbackArgs[0]);
                    else promise.resolve(callbackArgs);
                };
            };
            const pluralizeArguments = (numArgs)=>numArgs == 1 ? "argument" : "arguments"
            ;
            /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */ const wrapAsyncFunction = (name, metadata)=>{
                return function asyncFunctionWrapper(target, ...args) {
                    if (args.length < metadata.minArgs) throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
                    if (args.length > metadata.maxArgs) throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
                    return new Promise((resolve, reject)=>{
                        if (metadata.fallbackToNoCallback) // This API method has currently no callback on Chrome, but it return a promise on Firefox,
                        // and so the polyfill will try to call it with a callback first, and it will fallback
                        // to not passing the callback if the first call fails.
                        try {
                            target[name](...args, makeCallback({
                                resolve,
                                reject
                            }, metadata));
                        } catch (cbError) {
                            console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                            target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                            // use the unsupported callback anymore.
                            metadata.fallbackToNoCallback = false;
                            metadata.noCallback = true;
                            resolve();
                        }
                        else if (metadata.noCallback) {
                            target[name](...args);
                            resolve();
                        } else target[name](...args, makeCallback({
                            resolve,
                            reject
                        }, metadata));
                    });
                };
            };
            /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */ const wrapMethod = (target, method, wrapper)=>{
                return new Proxy(method, {
                    apply (targetMethod, thisObj, args) {
                        return wrapper.call(thisObj, target, ...args);
                    }
                });
            };
            let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
            /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */ const wrapObject = (target, wrappers = {
            }, metadata = {
            })=>{
                let cache = Object.create(null);
                let handlers = {
                    has (proxyTarget, prop) {
                        return prop in target || prop in cache;
                    },
                    get (proxyTarget, prop, receiver) {
                        if (prop in cache) return cache[prop];
                        if (!(prop in target)) return undefined;
                        let value1 = target[prop];
                        if (typeof value1 === "function") {
                            // This is a method on the underlying object. Check if we need to do
                            // any wrapping.
                            if (typeof wrappers[prop] === "function") // We have a special-case wrapper for this method.
                            value1 = wrapMethod(target, target[prop], wrappers[prop]);
                            else if (hasOwnProperty(metadata, prop)) {
                                // This is an async method that we have metadata for. Create a
                                // Promise wrapper for it.
                                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                                value1 = wrapMethod(target, target[prop], wrapper);
                            } else // This is a method that we don't know or care about. Return the
                            // original method, bound to the underlying object.
                            value1 = value1.bind(target);
                        } else if (typeof value1 === "object" && value1 !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) // This is an object that we need to do some wrapping for the children
                        // of. Create a sub-object wrapper for it with the appropriate child
                        // metadata.
                        value1 = wrapObject(value1, wrappers[prop], metadata[prop]);
                        else if (hasOwnProperty(metadata, "*")) // Wrap all properties in * namespace.
                        value1 = wrapObject(value1, wrappers[prop], metadata["*"]);
                        else {
                            // We don't need to do any wrapping for this property,
                            // so just forward all access to the underlying object.
                            Object.defineProperty(cache, prop, {
                                configurable: true,
                                enumerable: true,
                                get () {
                                    return target[prop];
                                },
                                set (value) {
                                    target[prop] = value;
                                }
                            });
                            return value1;
                        }
                        cache[prop] = value1;
                        return value1;
                    },
                    set (proxyTarget, prop, value, receiver) {
                        if (prop in cache) cache[prop] = value;
                        else target[prop] = value;
                        return true;
                    },
                    defineProperty (proxyTarget, prop, desc) {
                        return Reflect.defineProperty(cache, prop, desc);
                    },
                    deleteProperty (proxyTarget, prop) {
                        return Reflect.deleteProperty(cache, prop);
                    }
                }; // Per contract of the Proxy API, the "get" proxy handler must return the
                // original value of the target if that value is declared read-only and
                // non-configurable. For this reason, we create an object with the
                // prototype set to `target` instead of using `target` directly.
                // Otherwise we cannot return a custom object for APIs that
                // are declared read-only and non-configurable, such as `chrome.devtools`.
                //
                // The proxy handlers themselves will still use the original `target`
                // instead of the `proxyTarget`, so that the methods and properties are
                // dereferenced via the original targets.
                let proxyTarget = Object.create(target);
                return new Proxy(proxyTarget, handlers);
            };
            /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */ const wrapEvent = (wrapperMap)=>({
                    addListener (target, listener, ...args) {
                        target.addListener(wrapperMap.get(listener), ...args);
                    },
                    hasListener (target, listener) {
                        return target.hasListener(wrapperMap.get(listener));
                    },
                    removeListener (target, listener) {
                        target.removeListener(wrapperMap.get(listener));
                    }
                })
            ;
            const onRequestFinishedWrappers = new DefaultWeakMap((listener)=>{
                if (typeof listener !== "function") return listener;
                /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */ return function onRequestFinished(req) {
                    const wrappedReq = wrapObject(req, {
                    }, {
                        getContent: {
                            minArgs: 0,
                            maxArgs: 0
                        }
                    });
                    listener(wrappedReq);
                };
            }); // Keep track if the deprecation warning has been logged at least once.
            let loggedSendResponseDeprecationWarning = false;
            const onMessageWrappers = new DefaultWeakMap((listener)=>{
                if (typeof listener !== "function") return listener;
                /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */ return function onMessage(message, sender, sendResponse) {
                    let didCallSendResponse = false;
                    let wrappedSendResponse;
                    let sendResponsePromise = new Promise((resolve)=>{
                        wrappedSendResponse = function(response) {
                            if (!loggedSendResponseDeprecationWarning) {
                                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                                loggedSendResponseDeprecationWarning = true;
                            }
                            didCallSendResponse = true;
                            resolve(response);
                        };
                    });
                    let result;
                    try {
                        result = listener(message, sender, wrappedSendResponse);
                    } catch (err) {
                        result = Promise.reject(err);
                    }
                    const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
                    // wrappedSendResponse synchronously, we can exit earlier
                    // because there will be no response sent from this listener.
                    if (result !== true && !isResultThenable && !didCallSendResponse) return false;
                     // A small helper to send the message if the promise resolves
                    // and an error if the promise rejects (a wrapped sendMessage has
                    // to translate the message into a resolved promise or a rejected
                    // promise).
                    const sendPromisedResult = (promise)=>{
                        promise.then((msg)=>{
                            // send the message value.
                            sendResponse(msg);
                        }, (error)=>{
                            // Send a JSON representation of the error if the rejected value
                            // is an instance of error, or the object itself otherwise.
                            let message1;
                            if (error && (error instanceof Error || typeof error.message === "string")) message1 = error.message;
                            else message1 = "An unexpected error occurred";
                            sendResponse({
                                __mozWebExtensionPolyfillReject__: true,
                                message: message1
                            });
                        }).catch((err)=>{
                            // Print an error on the console if unable to send the response.
                            console.error("Failed to send onMessage rejected reply", err);
                        });
                    }; // If the listener returned a Promise, send the resolved value as a
                    // result, otherwise wait the promise related to the wrappedSendResponse
                    // callback to resolve and send it as a response.
                    if (isResultThenable) sendPromisedResult(result);
                    else sendPromisedResult(sendResponsePromise);
                     // Let Chrome know that the listener is replying.
                    return true;
                };
            });
            const wrappedSendMessageCallback = ({ reject , resolve  }, reply)=>{
                if (extensionAPIs.runtime.lastError) {
                    // Detect when none of the listeners replied to the sendMessage call and resolve
                    // the promise to undefined as in Firefox.
                    // See https://github.com/mozilla/webextension-polyfill/issues/130
                    if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) resolve();
                    else reject(new Error(extensionAPIs.runtime.lastError.message));
                } else if (reply && reply.__mozWebExtensionPolyfillReject__) // Convert back the JSON representation of the error into
                // an Error instance.
                reject(new Error(reply.message));
                else resolve(reply);
            };
            const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args)=>{
                if (args.length < metadata.minArgs) throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
                if (args.length > metadata.maxArgs) throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
                return new Promise((resolve, reject)=>{
                    const wrappedCb = wrappedSendMessageCallback.bind(null, {
                        resolve,
                        reject
                    });
                    args.push(wrappedCb);
                    apiNamespaceObj.sendMessage(...args);
                });
            };
            const staticWrappers = {
                devtools: {
                    network: {
                        onRequestFinished: wrapEvent(onRequestFinishedWrappers)
                    }
                },
                runtime: {
                    onMessage: wrapEvent(onMessageWrappers),
                    onMessageExternal: wrapEvent(onMessageWrappers),
                    sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                        minArgs: 1,
                        maxArgs: 3
                    })
                },
                tabs: {
                    sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                        minArgs: 2,
                        maxArgs: 3
                    })
                }
            };
            const settingMetadata = {
                clear: {
                    minArgs: 1,
                    maxArgs: 1
                },
                get: {
                    minArgs: 1,
                    maxArgs: 1
                },
                set: {
                    minArgs: 1,
                    maxArgs: 1
                }
            };
            apiMetadata.privacy = {
                network: {
                    "*": settingMetadata
                },
                services: {
                    "*": settingMetadata
                },
                websites: {
                    "*": settingMetadata
                }
            };
            return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
        };
        if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) throw new Error("This script should only be loaded in a browser extension.");
         // The build process adds a UMD wrapper around this file, which makes the
        // `module` variable available.
        module.exports = wrapAPIs(chrome);
    } else module.exports = browser;
});

},{}],"lBfFQ":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule') return;
        // Skip duplicate re-exports when they have the same value.
        if (key in dest && dest[key] === source[key]) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"3gmz3":[function() {},{}]},["l3yU4"], "l3yU4", "parcelRequire527d")

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDO0FBRUQsT0FBTyxDQUFDLFNBQVMsWUFBWSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLEVBQUUsRUFBRSxHQUFHLE1BQUssT0FBUyxLQUFJLEdBQUcsTUFBSyxVQUFZO1FBSTdDLEVBQTJELEFBQTNELHlEQUEyRDtRQUMzRCxFQUFFLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxHQUFHO1FBSTNDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUc7WUFDN0IsVUFBVSxFQUFFLElBQUk7WUFDaEIsR0FBRyxhQUFhLENBQUM7dUJBQ1IsTUFBTSxDQUFDLEdBQUc7WUFDbkIsQ0FBQzs7SUFFTCxDQUFDO1dBRU0sSUFBSTtBQUNiLENBQUM7QUFFRCxPQUFPLENBQUMsTUFBTSxZQUFZLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUTtRQUNsQyxVQUFVLEVBQUUsSUFBSTtRQUNoQixHQUFHLEVBQUUsR0FBRzs7QUFFWixDQUFDIiwic291cmNlcyI6WyJzcmMvc2lkZWJhci9zaWRlYmFyLnRzIiwic3JjL3NpZGViYXIvY29udGV4dE1lbnUudHMiLCJzcmMvc2lkZWJhci9UYWIudHMiLCJub2RlX21vZHVsZXMvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsL2Rpc3QvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9AcGFyY2VsL3RyYW5zZm9ybWVyLWpzL3NyYy9lc21vZHVsZS1oZWxwZXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcIi4vY29udGV4dE1lbnVcIjtcbmltcG9ydCBUYWIgZnJvbSBcIi4vVGFiXCI7XG5pbXBvcnQgXCIuL3NpZGViYXJTdHlsZXMuY3NzXCI7XG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5cbmxldCBjdXJyZW50VGFiczogeyBbaWQ6IHN0cmluZ106IFRhYiB9ID0ge307IC8vQWxsIHRhYnMgaW4gdGhlIGN1cnJlbnQgd2luZG93LCBpbmRleGVkIGJ5IGlkXG5leHBvcnQgbGV0IGNvbnRhaW5lcnM6IGJyb3dzZXIuQ29udGV4dHVhbElkZW50aXRpZXMuQ29udGV4dHVhbElkZW50aXR5W10gPSBbXTtcbmV4cG9ydCBsZXQgV0lOX0lEOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHRhYkNyZWF0ZWQocmF3VGFiOiBicm93c2VyLlRhYnMuVGFiKSB7XG5cdGlmIChyYXdUYWIuaWQgIT0gdW5kZWZpbmVkKSBjdXJyZW50VGFic1tyYXdUYWIuaWRdID0gbmV3IFRhYihyYXdUYWIpO1xufVxuZnVuY3Rpb24gdGFiUmVtb3ZlZCh0YWJJZDogbnVtYmVyKSB7XG5cdGN1cnJlbnRUYWJzW3RhYklkXS5yZW1vdmVUYWIoKTtcblx0ZGVsZXRlIGN1cnJlbnRUYWJzW3RhYklkXTtcbn1cbmZ1bmN0aW9uIHRhYkNoYW5nZWQodGFiSWQ6IG51bWJlciwgY2hhbmdlSW5mbzogb2JqZWN0KSB7XG5cdGN1cnJlbnRUYWJzW3RhYklkXT8udXBkYXRlZChjaGFuZ2VJbmZvKTtcbn1cbmZ1bmN0aW9uIHRhYk1vdmVkKHRhYklkOiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcikge1xuXHRjdXJyZW50VGFic1t0YWJJZF0ubW92ZWQodG9JbmRleCk7XG59XG5cbnNldHVwKCk7XG5hc3luYyBmdW5jdGlvbiBzZXR1cCgpIHtcblx0V0lOX0lEID0gKGF3YWl0IGJyb3dzZXIud2luZG93cy5nZXRDdXJyZW50KCkpLmlkOyAvL1dJTkRPV19JRF9DVVJSRU5UIHJldHVybnMgd3JvbmcgdmFsdWUgZm9yIHNvbWUgcmVhc29uXG5cdGJyb3dzZXIudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihhc3luYyAoeyB0YWJJZCwgcHJldmlvdXNUYWJJZCwgd2luZG93SWQgfSkgPT4ge1xuXHRcdGlmICh3aW5kb3dJZCA9PSBXSU5fSUQpIHtcblx0XHRcdGN1cnJlbnRUYWJzW3RhYklkXS51cGRhdGVkKHsgYWN0aXZlOiB0cnVlIH0pO1xuXHRcdFx0aWYgKHByZXZpb3VzVGFiSWQgIT0gdW5kZWZpbmVkKSBjdXJyZW50VGFic1twcmV2aW91c1RhYklkXT8udXBkYXRlZCh7IGFjdGl2ZTogZmFsc2UgfSk7XG5cdFx0fVxuXHR9KTtcblx0YnJvd3Nlci50YWJzLm9uQXR0YWNoZWQuYWRkTGlzdGVuZXIoYXN5bmMgKHRhYklkLCB7IG5ld1dpbmRvd0lkIH0pID0+IHtcblx0XHRpZiAobmV3V2luZG93SWQgPT09IFdJTl9JRCkgdGFiQ3JlYXRlZChhd2FpdCBicm93c2VyLnRhYnMuZ2V0KHRhYklkKSk7XG5cdH0pO1xuXHRicm93c2VyLnRhYnMub25DcmVhdGVkLmFkZExpc3RlbmVyKHRhYiA9PiB7XG5cdFx0aWYgKHRhYi53aW5kb3dJZCA9PT0gV0lOX0lEKSB0YWJDcmVhdGVkKHRhYik7XG5cdH0pO1xuXHRicm93c2VyLnRhYnMub25EZXRhY2hlZC5hZGRMaXN0ZW5lcigodGFiSWQsIHsgb2xkV2luZG93SWQgfSkgPT4ge1xuXHRcdGlmIChvbGRXaW5kb3dJZCA9PT0gV0lOX0lEKSB0YWJSZW1vdmVkKHRhYklkKTtcblx0fSk7XG5cdC8vIGJyb3dzZXIudGFicy5vbkhpZ2hsaWdodGVkLmFkZExpc3RlbmVyKHRhYkNoYW5nZSk7XG5cdGJyb3dzZXIudGFicy5vbk1vdmVkLmFkZExpc3RlbmVyKCh0YWJJZCwgeyB3aW5kb3dJZCwgdG9JbmRleCB9KSA9PiB7XG5cdFx0aWYgKHdpbmRvd0lkID09PSBXSU5fSUQpIHRhYk1vdmVkKHRhYklkLCB0b0luZGV4KTtcblx0fSk7XG5cdGJyb3dzZXIudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCB7IHdpbmRvd0lkIH0pID0+IHtcblx0XHRpZiAod2luZG93SWQgPT09IFdJTl9JRCkgdGFiUmVtb3ZlZCh0YWJJZCk7XG5cdH0pO1xuXHRicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKHRhYkNoYW5nZWQsIHsgd2luZG93SWQ6IFdJTl9JRCB9KTtcblxuXHRjb25zdCB0YWJzID0gYXdhaXQgYnJvd3Nlci50YWJzLnF1ZXJ5KHsgd2luZG93SWQ6IFdJTl9JRCB9KTtcblx0Zm9yIChjb25zdCB0YWIgb2YgdGFicykgdGFiQ3JlYXRlZCh0YWIpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWJ1aWxkQ29udGFpbmVycygpIHtcblx0Y29udGFpbmVycyA9IGF3YWl0IGJyb3dzZXIuY29udGV4dHVhbElkZW50aXRpZXMucXVlcnkoe30pO1xufVxuYnJvd3Nlci5jb250ZXh0dWFsSWRlbnRpdGllcy5vblJlbW92ZWQuYWRkTGlzdGVuZXIocmVidWlsZENvbnRhaW5lcnMpO1xuYnJvd3Nlci5jb250ZXh0dWFsSWRlbnRpdGllcy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIocmVidWlsZENvbnRhaW5lcnMpO1xuYnJvd3Nlci5jb250ZXh0dWFsSWRlbnRpdGllcy5vbkNyZWF0ZWQuYWRkTGlzdGVuZXIocmVidWlsZENvbnRhaW5lcnMpO1xucmVidWlsZENvbnRhaW5lcnMoKTtcbiIsImltcG9ydCBUYWIsIHsgbmV3VGFiLCByZXN0b3JlQ2xvc2VkVGFiIH0gZnJvbSBcIi4vVGFiXCI7XG5pbXBvcnQgeyBjb250YWluZXJzIH0gZnJvbSBcIi4vc2lkZWJhclwiO1xuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1RhYk1lbnUodGFiOiBUYWIpIHtcblx0c2V0TWVudShbXG5cdFx0eyB0aXRsZTogXCJOZXcgVGFiXCIsIG9uY2xpY2s6ICgpID0+IG5ld1RhYih7IG9wZW5lclRhYklkOiB0YWIuaWQgfSkgfSxcblx0XHR7IHRpdGxlOiBcIlJlb3BlbiBDbG9zZWQgVGFiXCIsIG9uY2xpY2s6ICgpID0+IHJlc3RvcmVDbG9zZWRUYWIoKSB9LFxuXHRcdHsgdHlwZTogXCJzZXBhcmF0b3JcIiB9LFxuXHRcdHsgdGl0bGU6IFwiUmVsb2FkIFRhYlwiLCBvbmNsaWNrOiAoKSA9PiB0YWIucmVsb2FkKCkgfSxcblx0XHR0YWIubXV0ZWQgPyB7IHRpdGxlOiBcIlVubXV0ZSBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLnVubXV0ZSgpIH0gOiB7IHRpdGxlOiBcIk11dGUgVGFiXCIsIG9uY2xpY2s6ICgpID0+IHRhYi5tdXRlKCkgfSxcblx0XHR0YWIucGlubmVkID8geyB0aXRsZTogXCJVbnBpbiBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLnVucGluKCkgfSA6IHsgdGl0bGU6IFwiUGluIFRhYlwiLCBvbmNsaWNrOiAoKSA9PiB0YWIucGluKCkgfSxcblx0XHR7IHRpdGxlOiBcIkR1cGxpY2F0ZSBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLmR1cGxpY2F0ZSgpIH0sXG5cdFx0e1xuXHRcdFx0dGl0bGU6IFwiUmVvcGVuIGluIENvbnRhaW5lclwiLFxuXHRcdFx0ZW5hYmxlZDogISFjb250YWluZXJzLmxlbmd0aCAmJiB0YWIuaXNSZW9wZW5hYmxlLFxuXHRcdFx0Y2hpbGRyZW46IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRpdGxlOiBcIkRlZmF1bHRcIixcblx0XHRcdFx0XHRlbmFibGVkOiAhIXRhYi5jb250YWluZXIsXG5cdFx0XHRcdFx0b25jbGljazogKCkgPT4gdGFiLnJlb3BlbldpdGhDb29raWVTdG9yZUlkKCksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdC4uLmNvbnRhaW5lcnMubWFwKGNvbnRhaW5lciA9PiAoe1xuXHRcdFx0XHRcdHRpdGxlOiBjb250YWluZXIubmFtZSxcblx0XHRcdFx0XHRpY29uczogeyAxNjogY29udGFpbmVyLmljb25VcmwgfSxcblx0XHRcdFx0XHRlbmFibGVkOiBjb250YWluZXIuY29va2llU3RvcmVJZCAhPSB0YWIuY29va2llU3RvcmVJZCxcblx0XHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB0YWIucmVvcGVuV2l0aENvb2tpZVN0b3JlSWQoY29udGFpbmVyLmNvb2tpZVN0b3JlSWQpLFxuXHRcdFx0XHR9KSksXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0eyB0aXRsZTogXCJVbmxvYWQgVGFiXCIsIG9uY2xpY2s6ICgpID0+IHRhYi5kaXNjYXJkKCksIGVuYWJsZWQ6IHRhYi5kaXNjYXJkYWJsZSB9LFxuXHRcdHsgdGl0bGU6IFwiQm9va21hcmsgVGFiXCIsIG9uY2xpY2s6ICgpID0+IHRhYi5ib29rbWFyaygpIH0sXG5cdFx0eyB0eXBlOiBcInNlcGFyYXRvclwiIH0sXG5cdFx0eyB0aXRsZTogXCJDbG9zZSBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLmNsb3NlKCkgfSxcblx0XSk7XG59XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgZXZlbnQgPT4ge1xuXHRpZiAoKGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdChcIi50YWJcIikpIHJldHVybjtcblx0c2V0TWVudShbXG5cdFx0eyB0aXRsZTogXCJOZXcgVGFiXCIsIG9uY2xpY2s6ICgpID0+IG5ld1RhYigpIH0sXG5cdFx0eyB0aXRsZTogXCJSZW9wZW4gQ2xvc2VkIFRhYlwiLCBvbmNsaWNrOiAoKSA9PiByZXN0b3JlQ2xvc2VkVGFiKCkgfSxcblx0XHR7IHR5cGU6IFwic2VwYXJhdG9yXCIgfSxcblx0XSk7XG59KTtcblxuaW50ZXJmYWNlIE1lbnVTdHJ1Y3R1cmUgZXh0ZW5kcyBicm93c2VyLk1lbnVzLkNyZWF0ZUNyZWF0ZVByb3BlcnRpZXNUeXBlIHtcblx0Y2hpbGRyZW4/OiBNZW51U3RydWN0dXJlW107XG59XG5mdW5jdGlvbiBzZXRNZW51KHN0cnVjdHVyZTogTWVudVN0cnVjdHVyZVtdKSB7XG5cdGJyb3dzZXIubWVudXMub3ZlcnJpZGVDb250ZXh0KHsgc2hvd0RlZmF1bHRzOiBmYWxzZSB9KTtcblx0YnJvd3Nlci5tZW51cy5yZW1vdmVBbGwoKTtcblx0Zm9yIChjb25zdCBjb250ZXh0T2JqIG9mIHN0cnVjdHVyZSkgY3JlYXRlQ29udGV4dChjb250ZXh0T2JqKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRleHQobWVudTogTWVudVN0cnVjdHVyZSwgcGFyZW50SWQ/OiBzdHJpbmcgfCBudW1iZXIpIHtcblx0Y29uc3QgeyBjaGlsZHJlbiwgLi4uY3JlYXRlUHJvcHMgfSA9IG1lbnU7XG5cdGlmIChwYXJlbnRJZCAhPSB1bmRlZmluZWQpIGNyZWF0ZVByb3BzLnBhcmVudElkID0gcGFyZW50SWQ7XG5cdGNvbnN0IGlkID0gYnJvd3Nlci5tZW51cy5jcmVhdGUoe1xuXHRcdGNvbnRleHRzOiBbXCJhbGxcIl0sXG5cdFx0dmlld1R5cGVzOiBbXCJzaWRlYmFyXCJdLFxuXHRcdC4uLmNyZWF0ZVByb3BzLFxuXHR9KTtcblx0Zm9yIChjb25zdCBjaGlsZENvbnRleHRPYmogb2YgY2hpbGRyZW4gfHwgW10pIGNyZWF0ZUNvbnRleHQoY2hpbGRDb250ZXh0T2JqLCBpZCk7XG59XG4iLCJpbXBvcnQgeyBXSU5fSUQsIGNvbnRhaW5lcnMgfSBmcm9tIFwiLi9zaWRlYmFyXCI7XG5pbXBvcnQgeyBzaG93VGFiTWVudSB9IGZyb20gXCIuL2NvbnRleHRNZW51XCI7XG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5cbmNvbnN0IHRhYnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYnNEaXZcIikgYXMgSFRNTEVsZW1lbnQ7XG5jb25zdCBwaW5uZWRUYWJzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwaW5uZWRUYWJzRGl2XCIpIGFzIEhUTUxFbGVtZW50O1xubGV0IHRhYk9yZGVyOiBudW1iZXJbXSA9IFtdOyAvL0FsbCB1bnBpbm5lZCB0YWIgaWRzIGluIHRoZSBjdXJyZW50IHdpbmRvdywgc29ydGVkIGJ5IGluZGV4XG5sZXQgcGlubmVkVGFiT3JkZXI6IG51bWJlcltdID0gW107IC8vQWxsIHBpbm5lZCB0YWIgaWRzIGluIHRoZSBjdXJyZW50IHdpbmRvdywgc29ydGVkIGJ5IGluZGV4XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYiB7XG5cdGlkOiBudW1iZXI7XG5cdHRhYkVsOiBIVE1MRWxlbWVudDtcblx0dGl0bGVFbDogSFRNTEVsZW1lbnQ7XG5cdGZhdmljb25FbDogSFRNTEltYWdlRWxlbWVudDtcblx0Y29udGFpbmVySW5kaWNhdG9yRWw6IEhUTUxFbGVtZW50O1xuXHRiZWxvbmdpbmdEaXY6IEhUTUxFbGVtZW50O1xuXHRiZWxvbmdpbmdPcmRlcjogbnVtYmVyW107XG5cblx0cGlubmVkITogYm9vbGVhbjtcblx0dGl0bGUhOiBzdHJpbmc7XG5cdGZhdkljb25VcmwhOiBzdHJpbmc7XG5cdGFjdGl2ZSE6IGJvb2xlYW47XG5cdGNvb2tpZVN0b3JlSWQhOiBzdHJpbmc7XG5cdHN0YXR1cyE6IFwibG9hZGluZ1wiIHwgXCJjb21wbGV0ZVwiO1xuXHRsb2FkVGltZW91dCE6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+O1xuXHRtdXRlZCE6IGJvb2xlYW47XG5cdHVybCE6IHN0cmluZztcblx0ZGlzY2FyZGVkITogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihyYXdUYWI6IGJyb3dzZXIuVGFicy5UYWIpIHtcblx0XHR0aGlzLmlkID0gcmF3VGFiLmlkIHx8IC0xO1xuXHRcdGNvbnN0IHsgdGFiRWwsIHRpdGxlRWwsIGZhdmljb25FbCwgY29udGFpbmVySW5kaWNhdG9yRWwgfSA9IHRoaXMuY3JlYXRlVGFiRWwoKTtcblx0XHRbdGhpcy50YWJFbCwgdGhpcy50aXRsZUVsLCB0aGlzLmZhdmljb25FbCwgdGhpcy5jb250YWluZXJJbmRpY2F0b3JFbF0gPSBbXG5cdFx0XHR0YWJFbCxcblx0XHRcdHRpdGxlRWwsXG5cdFx0XHRmYXZpY29uRWwsXG5cdFx0XHRjb250YWluZXJJbmRpY2F0b3JFbCxcblx0XHRdO1xuXG5cdFx0Y29uc3QgcGlubmVkID0gcmF3VGFiLnBpbm5lZDtcblx0XHRjb25zdCBpbmRleCA9IHBpbm5lZCA/IHJhd1RhYi5pbmRleCA6IHJhd1RhYi5pbmRleCAtIHBpbm5lZFRhYk9yZGVyLmxlbmd0aDtcblx0XHR0aGlzLmJlbG9uZ2luZ0RpdiA9IHBpbm5lZCA/IHBpbm5lZFRhYnNEaXYgOiB0YWJzRGl2O1xuXHRcdHRoaXMuYmVsb25naW5nT3JkZXIgPSBwaW5uZWQgPyBwaW5uZWRUYWJPcmRlciA6IHRhYk9yZGVyO1xuXHRcdHRoaXMuYmVsb25naW5nT3JkZXIuc3BsaWNlKGluZGV4LCAwLCB0aGlzLmlkKTtcblx0XHR0aGlzLmJlbG9uZ2luZ0Rpdi5pbnNlcnRCZWZvcmUodGFiRWwsIHRhYnNEaXYuY2hpbGRyZW5baW5kZXhdKTtcblx0XHR0aGlzLnVwZGF0ZWQocmF3VGFiKTtcblx0fVxuXHRnZXQgaW5kZXgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5iZWxvbmdpbmdPcmRlci5pbmRleE9mKHRoaXMuaWQpO1xuXHR9XG5cdGdldCBicm93c2VySW5kZXgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5waW5uZWQgPyB0aGlzLmluZGV4IDogdGhpcy5pbmRleCArIHBpbm5lZFRhYk9yZGVyLmxlbmd0aDtcblx0fVxuXHRnZXQgY29udGFpbmVyKCkge1xuXHRcdGNvbnN0IGNvbnRhaW5lciA9IGNvbnRhaW5lcnMuZmluZChlID0+IGUuY29va2llU3RvcmVJZCA9PT0gdGhpcy5jb29raWVTdG9yZUlkKTtcblx0XHRyZXR1cm4gY29udGFpbmVyIHx8IG51bGw7XG5cdH1cblx0dXBkYXRlZChjaGFuZ2VJbmZvOiBvYmplY3QpIHtcblx0XHRjb25zdCBoYW5kbGVyczogeyBbY2hhbmdlOiBzdHJpbmddOiAobmV3VmFsdWU6IGFueSkgPT4gdm9pZCB9ID0ge1xuXHRcdFx0dGl0bGU6IG5ld1ZhbHVlID0+IHtcblx0XHRcdFx0dGhpcy50aXRsZSA9IG5ld1ZhbHVlO1xuXHRcdFx0XHR0aGlzLnRpdGxlRWwuaW5uZXJUZXh0ID0gdGhpcy50aXRsZTtcblx0XHRcdH0sXG5cdFx0XHRmYXZJY29uVXJsOiBuZXdWYWx1ZSA9PiB7XG5cdFx0XHRcdHRoaXMuZmF2SWNvblVybCA9IG5ld1ZhbHVlO1xuXHRcdFx0XHR0aGlzLmZhdmljb25FbC5zcmMgPSB0aGlzLmZhdkljb25VcmwgfHwgXCJcIjtcblx0XHRcdH0sXG5cdFx0XHRhY3RpdmU6IG5ld1ZhbHVlID0+IHtcblx0XHRcdFx0dGhpcy5hY3RpdmUgPSBuZXdWYWx1ZTtcblx0XHRcdFx0dGhpcy50YWJFbC5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlVGFiXCIsIHRoaXMuYWN0aXZlKTtcblx0XHRcdH0sXG5cdFx0XHRjb29raWVTdG9yZUlkOiBuZXdWYWx1ZSA9PiB7XG5cdFx0XHRcdHRoaXMuY29va2llU3RvcmVJZCA9IG5ld1ZhbHVlO1xuXHRcdFx0XHRpZiAodGhpcy5jb250YWluZXIpIHRoaXMuY29udGFpbmVySW5kaWNhdG9yRWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb250YWluZXIuY29sb3JDb2RlO1xuXHRcdFx0fSxcblx0XHRcdHN0YXR1czogbmV3VmFsdWUgPT4ge1xuXHRcdFx0XHRjb25zdCBsb2FkaW5nID0gbmV3VmFsdWUgPT0gXCJsb2FkaW5nXCI7IC8vU3RhdHVzIGlzIGVpdGhlciBcImxvYWRpbmdcIiBvciBcImNvbXBsZXRlXCJcblx0XHRcdFx0dGhpcy50YWJFbC5jbGFzc0xpc3QudG9nZ2xlKFwibG9hZGluZ1wiLCBsb2FkaW5nKTtcblx0XHRcdFx0aWYgKHRoaXMuc3RhdHVzID09IFwibG9hZGluZ1wiICYmICFsb2FkaW5nKSB7XG5cdFx0XHRcdFx0dGhpcy50YWJFbC5jbGFzc0xpc3QuYWRkKFwiZmluaXNoTG9hZFwiKTtcblx0XHRcdFx0XHRpZiAodGhpcy5sb2FkVGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMubG9hZFRpbWVvdXQpO1xuXHRcdFx0XHRcdHRoaXMubG9hZFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMudGFiRWwuY2xhc3NMaXN0LnJlbW92ZShcImZpbmlzaExvYWRcIiksIDUwMCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zdGF0dXMgPSBuZXdWYWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRtdXRlZEluZm86IG5ld1ZhbHVlID0+ICh0aGlzLm11dGVkID0gbmV3VmFsdWUubXV0ZWQpLFxuXHRcdFx0cGlubmVkOiBuZXdWYWx1ZSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLnBpbm5lZCA9PT0gbmV3VmFsdWUpIHJldHVybjtcblx0XHRcdFx0dGhpcy5waW5uZWQgPSBuZXdWYWx1ZTtcblx0XHRcdFx0dGhpcy5tb3ZlUGlubmVkKG5ld1ZhbHVlKTtcblx0XHRcdH0sXG5cdFx0XHR1cmw6IG5ld1ZhbHVlID0+ICh0aGlzLnVybCA9IG5ld1ZhbHVlKSxcblx0XHRcdGRpc2NhcmRlZDogbmV3VmFsdWUgPT4ge1xuXHRcdFx0XHR0aGlzLmRpc2NhcmRlZCA9IG5ld1ZhbHVlO1xuXHRcdFx0XHR0aGlzLnRhYkVsLmNsYXNzTGlzdC50b2dnbGUoXCJkaXNjYXJkZWRcIiwgdGhpcy5kaXNjYXJkZWQpO1xuXHRcdFx0fSxcblx0XHR9O1xuXHRcdGZvciAoY29uc3QgW2tleUNoYW5nZWQsIG5ld1ZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjaGFuZ2VJbmZvKSkge1xuXHRcdFx0aWYgKGtleUNoYW5nZWQgaW4gaGFuZGxlcnMpIGhhbmRsZXJzW2tleUNoYW5nZWRdKG5ld1ZhbHVlKTtcblx0XHR9XG5cdH1cblx0YXN5bmMgbW92ZVBpbm5lZChwaW5uaW5nOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgbmV3SW5kZXggPSAoYXdhaXQgYnJvd3Nlci50YWJzLmdldCh0aGlzLmlkKSkuaW5kZXg7XG5cdFx0aWYgKHBpbm5pbmcpIHtcblx0XHRcdC8vdW5waW5uZWQgLT4gcGlubmVkXG5cdFx0XHR0aGlzLmJlbG9uZ2luZ0RpdiA9IHBpbm5lZFRhYnNEaXY7XG5cdFx0XHR0aGlzLmJlbG9uZ2luZ09yZGVyLnNwbGljZSh0aGlzLmluZGV4LCAxKTsgLy9yZW1vdmVzXG5cdFx0XHR0aGlzLmJlbG9uZ2luZ09yZGVyID0gcGlubmVkVGFiT3JkZXI7XG5cdFx0XHR0aGlzLmJlbG9uZ2luZ09yZGVyLnNwbGljZShuZXdJbmRleCwgMCwgdGhpcy5pZCk7IC8vYWRkc1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL3Bpbm5lZCAtPiB1bnBpbm5lZFxuXHRcdFx0dGhpcy5iZWxvbmdpbmdEaXYgPSB0YWJzRGl2O1xuXHRcdFx0dGhpcy5iZWxvbmdpbmdPcmRlci5zcGxpY2UodGhpcy5pbmRleCwgMSk7IC8vcmVtb3Zlc1xuXHRcdFx0dGhpcy5iZWxvbmdpbmdPcmRlciA9IHRhYk9yZGVyO1xuXHRcdFx0dGhpcy5iZWxvbmdpbmdPcmRlci5zcGxpY2UobmV3SW5kZXggLSBwaW5uZWRUYWJPcmRlci5sZW5ndGgsIDAsIHRoaXMuaWQpOyAvL2FkZHNcblx0XHR9XG5cdFx0dGhpcy5iZWxvbmdpbmdEaXYuaW5zZXJ0QmVmb3JlKHRoaXMudGFiRWwsIHRoaXMuYmVsb25naW5nRGl2LmNoaWxkcmVuW3RoaXMuaW5kZXhdKTtcblx0fVxuXHRtb3ZlZCh0b0luZGV4OiBudW1iZXIpIHtcblx0XHQvL1doZW4gbW92ZSBldmVudCBpcyBmaXJlZCwgdGhpcy5waW5uZWQgbWF5IGJlIG91dGRhdGVkLCBhcyBtb3ZlIGV2ZW50cyBhcmUgZmlyZWQgYmVmb3JlIG9uVXBkYXRlZCBldmVudHMuIFRoZXJlZm9yZSwgdGhlIGluZGV4IHRoYXQgdGhlIHRhYiBpcyBtb3ZpbmcgdG8gbWF5IG5vdCBiZSBhIHBvc3NpYmxlIGluZGV4IHRvIG1vdmUgdG8uXG5cdFx0Ly9XaGVuIHBpbm5lZCBvciB1bnBpbm5lZCwgbW92ZWRQaW5uZWQoKSB3aWxsIGhhbmRsZSBtb3ZlXG5cblx0XHRjb25zdCBuZXdJbmRleCA9IHRoaXMucGlubmVkID8gdG9JbmRleCA6IHRvSW5kZXggLSBwaW5uZWRUYWJPcmRlci5sZW5ndGg7XG5cdFx0aWYgKG5ld0luZGV4IDwgMCB8fCBuZXdJbmRleCA+PSB0aGlzLmJlbG9uZ2luZ09yZGVyLmxlbmd0aCkgcmV0dXJuOyAvL1RhYiBoYXMgcHJvYmFibHkgYmVlbiBwaW5uZWQgb3IgdW5waW5uZWRcblx0XHRpZiAodGhpcy5pbmRleCA9PT0gbmV3SW5kZXgpIHJldHVybjtcblxuXHRcdGlmIChuZXdJbmRleCA8IHRoaXMuaW5kZXgpIHtcblx0XHRcdHRoaXMuYmVsb25naW5nRGl2Lmluc2VydEJlZm9yZSh0aGlzLnRhYkVsLCB0aGlzLmJlbG9uZ2luZ0Rpdi5jaGlsZHJlbltuZXdJbmRleF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmJlbG9uZ2luZ0Rpdi5pbnNlcnRCZWZvcmUodGhpcy50YWJFbCwgdGhpcy5iZWxvbmdpbmdEaXYuY2hpbGRyZW5bbmV3SW5kZXhdLm5leHRTaWJsaW5nKTtcblx0XHRcdC8vYWN0cyBsaWtlIGluc2VydEFmdGVyLiBJZiAubmV4dFNpYmxpbmcgaXMgbnVsbCAoZW5kIG9mIGxpc3QpLCAuaW5zZXJ0QmVmb3JlICp3aWxsKiBwbGFjZSBhdCBlbmRcblx0XHR9XG5cdFx0dGhpcy5iZWxvbmdpbmdPcmRlci5zcGxpY2UodGhpcy5pbmRleCwgMSk7IC8vcmVtb3Zlc1xuXHRcdHRoaXMuYmVsb25naW5nT3JkZXIuc3BsaWNlKG5ld0luZGV4LCAwLCB0aGlzLmlkKTtcblx0fVxuXHRyZW1vdmVUYWIoKSB7XG5cdFx0dGhpcy5iZWxvbmdpbmdEaXYucmVtb3ZlQ2hpbGQodGhpcy50YWJFbCk7XG5cdFx0dGhpcy5iZWxvbmdpbmdPcmRlci5zcGxpY2UodGhpcy5pbmRleCwgMSk7IC8vcmVtb3Zlc1xuXHR9XG5cdGFzeW5jIHJlbG9hZCgpIHtcblx0XHRyZXR1cm4gYXdhaXQgYnJvd3Nlci50YWJzLnJlbG9hZCh0aGlzLmlkKTtcblx0fVxuXHRhc3luYyBtdXRlKCkge1xuXHRcdHJldHVybiBhd2FpdCBicm93c2VyLnRhYnMudXBkYXRlKHRoaXMuaWQsIHsgbXV0ZWQ6IHRydWUgfSk7XG5cdH1cblx0YXN5bmMgdW5tdXRlKCkge1xuXHRcdHJldHVybiBhd2FpdCBicm93c2VyLnRhYnMudXBkYXRlKHRoaXMuaWQsIHsgbXV0ZWQ6IGZhbHNlIH0pO1xuXHR9XG5cdGFzeW5jIGR1cGxpY2F0ZSgpIHtcblx0XHRyZXR1cm4gYXdhaXQgYnJvd3Nlci50YWJzLmR1cGxpY2F0ZSh0aGlzLmlkKTtcblx0fVxuXHRhc3luYyBwaW4oKSB7XG5cdFx0cmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy51cGRhdGUodGhpcy5pZCwgeyBwaW5uZWQ6IHRydWUgfSk7XG5cdH1cblx0YXN5bmMgdW5waW4oKSB7XG5cdFx0cmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy51cGRhdGUodGhpcy5pZCwgeyBwaW5uZWQ6IGZhbHNlIH0pO1xuXHR9XG5cdGFzeW5jIGJvb2ttYXJrKCkge1xuXHRcdHJldHVybiBhd2FpdCBicm93c2VyLmJvb2ttYXJrcy5jcmVhdGUoeyB0aXRsZTogdGhpcy50aXRsZSwgdXJsOiB0aGlzLnVybCB9KTtcblx0fVxuXHRhc3luYyBjbG9zZSgpIHtcblx0XHRyZXR1cm4gYXdhaXQgYnJvd3Nlci50YWJzLnJlbW92ZSh0aGlzLmlkKTtcblx0fVxuXHRhc3luYyBkaXNjYXJkKCkge1xuXHRcdGF3YWl0IGJyb3dzZXIudGFicy5kaXNjYXJkKHRoaXMuaWQpO1xuXHR9XG5cdGFzeW5jIHJlb3BlbldpdGhDb29raWVTdG9yZUlkKGNvb2tpZVN0b3JlSWQ/OiBzdHJpbmcpIHtcblx0XHRhd2FpdCBicm93c2VyLnRhYnMuY3JlYXRlKHtcblx0XHRcdGFjdGl2ZTogdGhpcy5hY3RpdmUsXG5cdFx0XHQuLi4oY29va2llU3RvcmVJZCA/IHsgY29va2llU3RvcmVJZCB9IDoge30pLFxuXHRcdFx0ZGlzY2FyZGVkOiB0aGlzLmRpc2NhcmRlZCxcblx0XHRcdC4uLih0aGlzLmRpc2NhcmRlZCA/IHsgdGl0bGU6IHRoaXMudGl0bGUgfSA6IHt9KSxcblx0XHRcdGluZGV4OiB0aGlzLmJyb3dzZXJJbmRleCxcblx0XHRcdHBpbm5lZDogdGhpcy5waW5uZWQsXG5cdFx0XHQuLi4odGhpcy51cmwgIT09IFwiYWJvdXQ6bmV3dGFiXCIgPyB7IHVybDogdGhpcy51cmwgfSA6IHt9KSxcblx0XHR9KTtcblx0XHRhd2FpdCB0aGlzLmNsb3NlKCk7XG5cdH1cblxuXHRnZXQgZGlzY2FyZGFibGUoKSB7XG5cdFx0cmV0dXJuICF0aGlzLmRpc2NhcmRlZCAmJiAhdGhpcy5hY3RpdmU7XG5cdH1cblx0Z2V0IGlzUmVvcGVuYWJsZSgpIHtcblx0XHRjb25zdCB7IHByb3RvY29sIH0gPSBuZXcgVVJMKHRoaXMudXJsKTtcblx0XHRyZXR1cm4gW1wiaHR0cDpcIiwgXCJodHRwczpcIl0uaW5kZXhPZihwcm90b2NvbCkgIT0gLTEgfHwgdGhpcy51cmwgPT09IFwiYWJvdXQ6bmV3dGFiXCI7XG5cdH1cblx0Y3JlYXRlVGFiRWwoKSB7XG5cdFx0Y29uc3QgdGFiRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdGNvbnN0IGNvbnRhaW5lckluZGljYXRvckVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHR0YWJFbC5hcHBlbmRDaGlsZChjb250YWluZXJJbmRpY2F0b3JFbCk7XG5cdFx0Y29uc3QgZmF2aWNvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcblx0XHR0YWJFbC5hcHBlbmRDaGlsZChmYXZpY29uRWwpO1xuXHRcdGNvbnN0IHRpdGxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdHRhYkVsLmFwcGVuZENoaWxkKHRpdGxlRWwpO1xuXHRcdGNvbnN0IHRhYkNsb3NlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcblx0XHR0YWJFbC5hcHBlbmRDaGlsZCh0YWJDbG9zZUJ0bik7XG5cblx0XHR0YWJFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuXHRcdFx0YXdhaXQgYnJvd3Nlci50YWJzLnVwZGF0ZSh0aGlzLmlkLCB7IGFjdGl2ZTogdHJ1ZSB9KTtcblx0XHR9KTtcblx0XHR0YWJFbC5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgKCkgPT4gc2hvd1RhYk1lbnUodGhpcykpO1xuXHRcdHRhYkVsLmRyYWdnYWJsZSA9IHRydWU7XG5cdFx0dGFiRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCAoZTogRHJhZ0V2ZW50KSA9PiB7XG5cdFx0XHRpZiAoIWUuZGF0YVRyYW5zZmVyKSByZXR1cm47XG5cdFx0XHRlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC94LW1vei11cmxcIiwgYCR7dGhpcy51cmx9XFxuJHt0aGlzLnRpdGxlfWApO1xuXHRcdFx0ZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvdXJpLWxpc3RcIiwgdGhpcy51cmwpO1xuXHRcdFx0ZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgdGhpcy51cmwpO1xuXHRcdFx0ZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwiY29weU1vdmVcIjtcblx0XHRcdGUuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImludmlzaWJsZURyYWdJbWFnZVwiKSBhcyBIVE1MRWxlbWVudCwgMCwgMCk7XG5cdFx0fSk7XG5cdFx0dGFiRWwuY2xhc3NMaXN0LmFkZChcInRhYlwiKTtcblxuXHRcdHRpdGxlRWwuY2xhc3NMaXN0LmFkZChcInRhYlRleHRcIik7XG5cblx0XHR0YWJDbG9zZUJ0bi5jbGFzc0xpc3QuYWRkKFwidGFiQ2xvc2VCdG5cIik7XG5cdFx0dGFiQ2xvc2VCdG4uc3JjID0gYnJvd3Nlci5ydW50aW1lLmdldFVSTChcImFzc2V0cy9jbG9zZS5zdmdcIik7XG5cdFx0dGFiQ2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIGUgPT4ge1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9KTtcblx0XHRjb250YWluZXJJbmRpY2F0b3JFbC5jbGFzc0xpc3QuYWRkKFwiY29udGFpbmVySW5kaWNhdG9yXCIpO1xuXG5cdFx0ZmF2aWNvbkVsLmNsYXNzTGlzdC5hZGQoXCJ0YWJJY29uXCIpO1xuXHRcdGZhdmljb25FbC5zcmMgPSBcIlwiO1xuXG5cdFx0cmV0dXJuIHsgdGFiRWwsIHRpdGxlRWwsIGZhdmljb25FbCwgY29udGFpbmVySW5kaWNhdG9yRWwgfTtcblx0fVxufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld1RhYihjcmVhdGVPcHRpb25zID0ge30pIHtcblx0cmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy5jcmVhdGUoY3JlYXRlT3B0aW9ucyk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdG9yZUNsb3NlZFRhYigpIHtcblx0Y29uc3QgbGFzdENsb3NlZCA9IGF3YWl0IGJyb3dzZXIuc2Vzc2lvbnMuZ2V0UmVjZW50bHlDbG9zZWQoKTtcblx0aWYgKCFsYXN0Q2xvc2VkLmxlbmd0aCkgcmV0dXJuO1xuXHRjb25zdCBsYXN0VGFiID0gbGFzdENsb3NlZC5maW5kKGUgPT4gZS50YWIgJiYgZS50YWIud2luZG93SWQgPT09IFdJTl9JRCk/LnRhYjtcblx0aWYgKCFsYXN0VGFiKSByZXR1cm47XG5cdHJldHVybiBhd2FpdCBicm93c2VyLnNlc3Npb25zLnJlc3RvcmUobGFzdFRhYi5zZXNzaW9uSWQpO1xufVxuIiwiLyogd2ViZXh0ZW5zaW9uLXBvbHlmaWxsIC0gdjAuOC4wIC0gVHVlIEFwciAyMCAyMDIxIDExOjI3OjM4ICovXG4vKiAtKi0gTW9kZTogaW5kZW50LXRhYnMtbW9kZTogbmlsOyBqcy1pbmRlbnQtbGV2ZWw6IDIgLSotICovXG4vKiB2aW06IHNldCBzdHM9MiBzdz0yIGV0IHR3PTgwOiAqL1xuLyogVGhpcyBTb3VyY2UgQ29kZSBGb3JtIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBNb3ppbGxhIFB1YmxpY1xuICogTGljZW5zZSwgdi4gMi4wLiBJZiBhIGNvcHkgb2YgdGhlIE1QTCB3YXMgbm90IGRpc3RyaWJ1dGVkIHdpdGggdGhpc1xuICogZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5pZiAodHlwZW9mIGJyb3dzZXIgPT09IFwidW5kZWZpbmVkXCIgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKGJyb3dzZXIpICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG4gIGNvbnN0IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSA9IFwiVGhlIG1lc3NhZ2UgcG9ydCBjbG9zZWQgYmVmb3JlIGEgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkLlwiO1xuICBjb25zdCBTRU5EX1JFU1BPTlNFX0RFUFJFQ0FUSU9OX1dBUk5JTkcgPSBcIlJldHVybmluZyBhIFByb21pc2UgaXMgdGhlIHByZWZlcnJlZCB3YXkgdG8gc2VuZCBhIHJlcGx5IGZyb20gYW4gb25NZXNzYWdlL29uTWVzc2FnZUV4dGVybmFsIGxpc3RlbmVyLCBhcyB0aGUgc2VuZFJlc3BvbnNlIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBzcGVjcyAoU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvTW96aWxsYS9BZGQtb25zL1dlYkV4dGVuc2lvbnMvQVBJL3J1bnRpbWUvb25NZXNzYWdlKVwiO1xuXG4gIC8vIFdyYXBwaW5nIHRoZSBidWxrIG9mIHRoaXMgcG9seWZpbGwgaW4gYSBvbmUtdGltZS11c2UgZnVuY3Rpb24gaXMgYSBtaW5vclxuICAvLyBvcHRpbWl6YXRpb24gZm9yIEZpcmVmb3guIFNpbmNlIFNwaWRlcm1vbmtleSBkb2VzIG5vdCBmdWxseSBwYXJzZSB0aGVcbiAgLy8gY29udGVudHMgb2YgYSBmdW5jdGlvbiB1bnRpbCB0aGUgZmlyc3QgdGltZSBpdCdzIGNhbGxlZCwgYW5kIHNpbmNlIGl0IHdpbGxcbiAgLy8gbmV2ZXIgYWN0dWFsbHkgbmVlZCB0byBiZSBjYWxsZWQsIHRoaXMgYWxsb3dzIHRoZSBwb2x5ZmlsbCB0byBiZSBpbmNsdWRlZFxuICAvLyBpbiBGaXJlZm94IG5lYXJseSBmb3IgZnJlZS5cbiAgY29uc3Qgd3JhcEFQSXMgPSBleHRlbnNpb25BUElzID0+IHtcbiAgICAvLyBOT1RFOiBhcGlNZXRhZGF0YSBpcyBhc3NvY2lhdGVkIHRvIHRoZSBjb250ZW50IG9mIHRoZSBhcGktbWV0YWRhdGEuanNvbiBmaWxlXG4gICAgLy8gYXQgYnVpbGQgdGltZSBieSByZXBsYWNpbmcgdGhlIGZvbGxvd2luZyBcImluY2x1ZGVcIiB3aXRoIHRoZSBjb250ZW50IG9mIHRoZVxuICAgIC8vIEpTT04gZmlsZS5cbiAgICBjb25zdCBhcGlNZXRhZGF0YSA9IHtcbiAgICAgIFwiYWxhcm1zXCI6IHtcbiAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJjbGVhckFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJib29rbWFya3NcIjoge1xuICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0Q2hpbGRyZW5cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0UmVjZW50XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFN1YlRyZWVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VHJlZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVUcmVlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJyb3dzZXJBY3Rpb25cIjoge1xuICAgICAgICBcImRpc2FibGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcImVuYWJsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3JcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFBvcHVwXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFRpdGxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm9wZW5Qb3B1cFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRCYWRnZUJhY2tncm91bmRDb2xvclwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRJY29uXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNldFBvcHVwXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRUaXRsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJyb3dzaW5nRGF0YVwiOiB7XG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUNhY2hlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUNvb2tpZXNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlRG93bmxvYWRzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUZvcm1EYXRhXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUhpc3RvcnlcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlTG9jYWxTdG9yYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVBhc3N3b3Jkc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVQbHVnaW5EYXRhXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJjb21tYW5kc1wiOiB7XG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJjb250ZXh0TWVudXNcIjoge1xuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJjb29raWVzXCI6IHtcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbENvb2tpZVN0b3Jlc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJkZXZ0b29sc1wiOiB7XG4gICAgICAgIFwiaW5zcGVjdGVkV2luZG93XCI6IHtcbiAgICAgICAgICBcImV2YWxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMixcbiAgICAgICAgICAgIFwic2luZ2xlQ2FsbGJhY2tBcmdcIjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwicGFuZWxzXCI6IHtcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMyxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAzLFxuICAgICAgICAgICAgXCJzaW5nbGVDYWxsYmFja0FyZ1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImVsZW1lbnRzXCI6IHtcbiAgICAgICAgICAgIFwiY3JlYXRlU2lkZWJhclBhbmVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImRvd25sb2Fkc1wiOiB7XG4gICAgICAgIFwiY2FuY2VsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImRvd25sb2FkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImVyYXNlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEZpbGVJY29uXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcIm9wZW5cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInBhdXNlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUZpbGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVzdW1lXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzaG93XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiZXh0ZW5zaW9uXCI6IHtcbiAgICAgICAgXCJpc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImlzQWxsb3dlZEluY29nbml0b0FjY2Vzc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiaGlzdG9yeVwiOiB7XG4gICAgICAgIFwiYWRkVXJsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZUFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWxldGVSYW5nZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWxldGVVcmxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VmlzaXRzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiaTE4blwiOiB7XG4gICAgICAgIFwiZGV0ZWN0TGFuZ3VhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWNjZXB0TGFuZ3VhZ2VzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJpZGVudGl0eVwiOiB7XG4gICAgICAgIFwibGF1bmNoV2ViQXV0aEZsb3dcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImlkbGVcIjoge1xuICAgICAgICBcInF1ZXJ5U3RhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIm1hbmFnZW1lbnRcIjoge1xuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0U2VsZlwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRFbmFibGVkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInVuaW5zdGFsbFNlbGZcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIm5vdGlmaWNhdGlvbnNcIjoge1xuICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0UGVybWlzc2lvbkxldmVsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwicGFnZUFjdGlvblwiOiB7XG4gICAgICAgIFwiZ2V0UG9wdXBcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VGl0bGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiaGlkZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0SWNvblwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRQb3B1cFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0VGl0bGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInNob3dcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJwZXJtaXNzaW9uc1wiOiB7XG4gICAgICAgIFwiY29udGFpbnNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZXF1ZXN0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJydW50aW1lXCI6IHtcbiAgICAgICAgXCJnZXRCYWNrZ3JvdW5kUGFnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRQbGF0Zm9ybUluZm9cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwib3Blbk9wdGlvbnNQYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInJlcXVlc3RVcGRhdGVDaGVja1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZW5kTWVzc2FnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDNcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZW5kTmF0aXZlTWVzc2FnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRVbmluc3RhbGxVUkxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInNlc3Npb25zXCI6IHtcbiAgICAgICAgXCJnZXREZXZpY2VzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFJlY2VudGx5Q2xvc2VkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlc3RvcmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInN0b3JhZ2VcIjoge1xuICAgICAgICBcImxvY2FsXCI6IHtcbiAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIm1hbmFnZWRcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInN5bmNcIjoge1xuICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInRhYnNcIjoge1xuICAgICAgICBcImNhcHR1cmVWaXNpYmxlVGFiXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZXRlY3RMYW5ndWFnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkaXNjYXJkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImR1cGxpY2F0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJleGVjdXRlU2NyaXB0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRDdXJyZW50XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImdldFpvb21cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdvQmFja1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnb0ZvcndhcmRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiaGlnaGxpZ2h0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImluc2VydENTU1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbG9hZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlQ1NTXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInNlbmRNZXNzYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogM1xuICAgICAgICB9LFxuICAgICAgICBcInNldFpvb21cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwidG9wU2l0ZXNcIjoge1xuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwid2ViTmF2aWdhdGlvblwiOiB7XG4gICAgICAgIFwiZ2V0QWxsRnJhbWVzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEZyYW1lXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJ3ZWJSZXF1ZXN0XCI6IHtcbiAgICAgICAgXCJoYW5kbGVyQmVoYXZpb3JDaGFuZ2VkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJ3aW5kb3dzXCI6IHtcbiAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRDdXJyZW50XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldExhc3RGb2N1c2VkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKE9iamVjdC5rZXlzKGFwaU1ldGFkYXRhKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImFwaS1tZXRhZGF0YS5qc29uIGhhcyBub3QgYmVlbiBpbmNsdWRlZCBpbiBicm93c2VyLXBvbHlmaWxsXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgV2Vha01hcCBzdWJjbGFzcyB3aGljaCBjcmVhdGVzIGFuZCBzdG9yZXMgYSB2YWx1ZSBmb3IgYW55IGtleSB3aGljaCBkb2VzXG4gICAgICogbm90IGV4aXN0IHdoZW4gYWNjZXNzZWQsIGJ1dCBiZWhhdmVzIGV4YWN0bHkgYXMgYW4gb3JkaW5hcnkgV2Vha01hcFxuICAgICAqIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNyZWF0ZUl0ZW1cbiAgICAgKiAgICAgICAgQSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGNhbGxlZCBpbiBvcmRlciB0byBjcmVhdGUgdGhlIHZhbHVlIGZvciBhbnlcbiAgICAgKiAgICAgICAga2V5IHdoaWNoIGRvZXMgbm90IGV4aXN0LCB0aGUgZmlyc3QgdGltZSBpdCBpcyBhY2Nlc3NlZC4gVGhlXG4gICAgICogICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVzLCBhcyBpdHMgb25seSBhcmd1bWVudCwgdGhlIGtleSBiZWluZyBjcmVhdGVkLlxuICAgICAqL1xuICAgIGNsYXNzIERlZmF1bHRXZWFrTWFwIGV4dGVuZHMgV2Vha01hcCB7XG4gICAgICBjb25zdHJ1Y3RvcihjcmVhdGVJdGVtLCBpdGVtcyA9IHVuZGVmaW5lZCkge1xuICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgIHRoaXMuY3JlYXRlSXRlbSA9IGNyZWF0ZUl0ZW07XG4gICAgICB9XG5cbiAgICAgIGdldChrZXkpIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgdGhpcy5zZXQoa2V5LCB0aGlzLmNyZWF0ZUl0ZW0oa2V5KSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0KGtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gb2JqZWN0IHdpdGggYSBgdGhlbmAgbWV0aG9kLCBhbmQgY2FuXG4gICAgICogdGhlcmVmb3JlIGJlIGFzc3VtZWQgdG8gYmVoYXZlIGFzIGEgUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3QuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHRoZW5hYmxlLlxuICAgICAqL1xuICAgIGNvbnN0IGlzVGhlbmFibGUgPSB2YWx1ZSA9PiB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSBcImZ1bmN0aW9uXCI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBmdW5jdGlvbiB3aGljaCwgd2hlbiBjYWxsZWQsIHdpbGwgcmVzb2x2ZSBvciByZWplY3RcbiAgICAgKiB0aGUgZ2l2ZW4gcHJvbWlzZSBiYXNlZCBvbiBob3cgaXQgaXMgY2FsbGVkOlxuICAgICAqXG4gICAgICogLSBJZiwgd2hlbiBjYWxsZWQsIGBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JgIGNvbnRhaW5zIGEgbm9uLW51bGwgb2JqZWN0LFxuICAgICAqICAgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQgd2l0aCB0aGF0IHZhbHVlLlxuICAgICAqIC0gSWYgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGV4YWN0bHkgb25lIGFyZ3VtZW50LCB0aGUgcHJvbWlzZSBpc1xuICAgICAqICAgcmVzb2x2ZWQgdG8gdGhhdCB2YWx1ZS5cbiAgICAgKiAtIE90aGVyd2lzZSwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgdG8gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlXG4gICAgICogICBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9taXNlXG4gICAgICogICAgICAgIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIGFuZCByZWplY3Rpb24gZnVuY3Rpb25zIG9mIGFcbiAgICAgKiAgICAgICAgcHJvbWlzZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9taXNlLnJlc29sdmVcbiAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZXNvbHV0aW9uIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVqZWN0XG4gICAgICogICAgICAgIFRoZSBwcm9taXNlJ3MgcmVqZWN0aW9uIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgd3JhcHBlZCBtZXRob2Qgd2hpY2ggaGFzIGNyZWF0ZWQgdGhlIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufVxuICAgICAqICAgICAgICBUaGUgZ2VuZXJhdGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0IG1ha2VDYWxsYmFjayA9IChwcm9taXNlLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuICguLi5jYWxsYmFja0FyZ3MpID0+IHtcbiAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmcgfHxcbiAgICAgICAgICAgICAgICAgICAoY2FsbGJhY2tBcmdzLmxlbmd0aCA8PSAxICYmIG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnICE9PSBmYWxzZSkpIHtcbiAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgY29uc3QgcGx1cmFsaXplQXJndW1lbnRzID0gKG51bUFyZ3MpID0+IG51bUFyZ3MgPT0gMSA/IFwiYXJndW1lbnRcIiA6IFwiYXJndW1lbnRzXCI7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgd3JhcHBlciBmdW5jdGlvbiBmb3IgYSBtZXRob2Qgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWV0YWRhdGEuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqICAgICAgICBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHdoaWNoIGlzIGJlaW5nIHdyYXBwZWQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC5cbiAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1pbkFyZ3NcbiAgICAgKiAgICAgICAgVGhlIG1pbmltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyB3aGljaCBtdXN0IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIGZld2VyIHRoYW4gdGhpcyBudW1iZXIgb2YgYXJndW1lbnRzLCB0aGVcbiAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1heEFyZ3NcbiAgICAgKiAgICAgICAgVGhlIG1heGltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyB3aGljaCBtYXkgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggbW9yZSB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICogICAgICAgIHdyYXBwZXIgd2lsbCByYWlzZSBhbiBleGNlcHRpb24uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb24ob2JqZWN0LCAuLi4qKX1cbiAgICAgKiAgICAgICBUaGUgZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgY29uc3Qgd3JhcEFzeW5jRnVuY3Rpb24gPSAobmFtZSwgbWV0YWRhdGEpID0+IHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBhc3luY0Z1bmN0aW9uV3JhcHBlcih0YXJnZXQsIC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWF4QXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBpZiAobWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIFRoaXMgQVBJIG1ldGhvZCBoYXMgY3VycmVudGx5IG5vIGNhbGxiYWNrIG9uIENocm9tZSwgYnV0IGl0IHJldHVybiBhIHByb21pc2Ugb24gRmlyZWZveCxcbiAgICAgICAgICAgIC8vIGFuZCBzbyB0aGUgcG9seWZpbGwgd2lsbCB0cnkgdG8gY2FsbCBpdCB3aXRoIGEgY2FsbGJhY2sgZmlyc3QsIGFuZCBpdCB3aWxsIGZhbGxiYWNrXG4gICAgICAgICAgICAvLyB0byBub3QgcGFzc2luZyB0aGUgY2FsbGJhY2sgaWYgdGhlIGZpcnN0IGNhbGwgZmFpbHMuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncywgbWFrZUNhbGxiYWNrKHtyZXNvbHZlLCByZWplY3R9LCBtZXRhZGF0YSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoY2JFcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bmFtZX0gQVBJIG1ldGhvZCBkb2Vzbid0IHNlZW0gdG8gc3VwcG9ydCB0aGUgY2FsbGJhY2sgcGFyYW1ldGVyLCBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZmFsbGluZyBiYWNrIHRvIGNhbGwgaXQgd2l0aG91dCBhIGNhbGxiYWNrOiBcIiwgY2JFcnJvcik7XG5cbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpO1xuXG4gICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgQVBJIG1ldGhvZCBtZXRhZGF0YSwgc28gdGhhdCB0aGUgbmV4dCBBUEkgY2FsbHMgd2lsbCBub3QgdHJ5IHRvXG4gICAgICAgICAgICAgIC8vIHVzZSB0aGUgdW5zdXBwb3J0ZWQgY2FsbGJhY2sgYW55bW9yZS5cbiAgICAgICAgICAgICAgbWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgbWV0YWRhdGEubm9DYWxsYmFjayA9IHRydWU7XG5cbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEubm9DYWxsYmFjaykge1xuICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncywgbWFrZUNhbGxiYWNrKHtyZXNvbHZlLCByZWplY3R9LCBtZXRhZGF0YSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBhbiBleGlzdGluZyBtZXRob2Qgb2YgdGhlIHRhcmdldCBvYmplY3QsIHNvIHRoYXQgY2FsbHMgdG8gaXQgYXJlXG4gICAgICogaW50ZXJjZXB0ZWQgYnkgdGhlIGdpdmVuIHdyYXBwZXIgZnVuY3Rpb24uIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHJlY2VpdmVzLFxuICAgICAqIGFzIGl0cyBmaXJzdCBhcmd1bWVudCwgdGhlIG9yaWdpbmFsIGB0YXJnZXRgIG9iamVjdCwgZm9sbG93ZWQgYnkgZWFjaCBvZlxuICAgICAqIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBvcmlnaW5hbCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICogICAgICAgIFRoZSBvcmlnaW5hbCB0YXJnZXQgb2JqZWN0IHRoYXQgdGhlIHdyYXBwZWQgbWV0aG9kIGJlbG9uZ3MgdG8uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWV0aG9kXG4gICAgICogICAgICAgIFRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC4gVGhpcyBpcyB1c2VkIGFzIHRoZSB0YXJnZXQgb2YgdGhlIFByb3h5XG4gICAgICogICAgICAgIG9iamVjdCB3aGljaCBpcyBjcmVhdGVkIHRvIHdyYXAgdGhlIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB3cmFwcGVyXG4gICAgICogICAgICAgIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiBhIGRpcmVjdCBpbnZvY2F0aW9uXG4gICAgICogICAgICAgIG9mIHRoZSB3cmFwcGVkIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm94eTxmdW5jdGlvbj59XG4gICAgICogICAgICAgIEEgUHJveHkgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gbWV0aG9kLCB3aGljaCBpbnZva2VzIHRoZSBnaXZlbiB3cmFwcGVyXG4gICAgICogICAgICAgIG1ldGhvZCBpbiBpdHMgcGxhY2UuXG4gICAgICovXG4gICAgY29uc3Qgd3JhcE1ldGhvZCA9ICh0YXJnZXQsIG1ldGhvZCwgd3JhcHBlcikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm94eShtZXRob2QsIHtcbiAgICAgICAgYXBwbHkodGFyZ2V0TWV0aG9kLCB0aGlzT2JqLCBhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIHdyYXBwZXIuY2FsbCh0aGlzT2JqLCB0YXJnZXQsIC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBoYXNPd25Qcm9wZXJ0eSA9IEZ1bmN0aW9uLmNhbGwuYmluZChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxuICAgIC8qKlxuICAgICAqIFdyYXBzIGFuIG9iamVjdCBpbiBhIFByb3h5IHdoaWNoIGludGVyY2VwdHMgYW5kIHdyYXBzIGNlcnRhaW4gbWV0aG9kc1xuICAgICAqIGJhc2VkIG9uIHRoZSBnaXZlbiBgd3JhcHBlcnNgIGFuZCBgbWV0YWRhdGFgIG9iamVjdHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICogICAgICAgIFRoZSB0YXJnZXQgb2JqZWN0IHRvIHdyYXAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3dyYXBwZXJzID0ge31dXG4gICAgICogICAgICAgIEFuIG9iamVjdCB0cmVlIGNvbnRhaW5pbmcgd3JhcHBlciBmdW5jdGlvbnMgZm9yIHNwZWNpYWwgY2FzZXMuIEFueVxuICAgICAqICAgICAgICBmdW5jdGlvbiBwcmVzZW50IGluIHRoaXMgb2JqZWN0IHRyZWUgaXMgY2FsbGVkIGluIHBsYWNlIG9mIHRoZVxuICAgICAqICAgICAgICBtZXRob2QgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlLiBUaGVzZVxuICAgICAqICAgICAgICB3cmFwcGVyIG1ldGhvZHMgYXJlIGludm9rZWQgYXMgZGVzY3JpYmVkIGluIHtAc2VlIHdyYXBNZXRob2R9LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFttZXRhZGF0YSA9IHt9XVxuICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIG1ldGFkYXRhIHVzZWQgdG8gYXV0b21hdGljYWxseSBnZW5lcmF0ZVxuICAgICAqICAgICAgICBQcm9taXNlLWJhc2VkIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhc3luY2hyb25vdXMuIEFueSBmdW5jdGlvbiBpblxuICAgICAqICAgICAgICB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUgd2hpY2ggaGFzIGEgY29ycmVzcG9uZGluZyBtZXRhZGF0YSBvYmplY3RcbiAgICAgKiAgICAgICAgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGBtZXRhZGF0YWAgdHJlZSBpcyByZXBsYWNlZCB3aXRoIGFuXG4gICAgICogICAgICAgIGF1dG9tYXRpY2FsbHktZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24sIGFzIGRlc2NyaWJlZCBpblxuICAgICAqICAgICAgICB7QHNlZSB3cmFwQXN5bmNGdW5jdGlvbn1cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm94eTxvYmplY3Q+fVxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBPYmplY3QgPSAodGFyZ2V0LCB3cmFwcGVycyA9IHt9LCBtZXRhZGF0YSA9IHt9KSA9PiB7XG4gICAgICBsZXQgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgbGV0IGhhbmRsZXJzID0ge1xuICAgICAgICBoYXMocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQgfHwgcHJvcCBpbiBjYWNoZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQocHJveHlUYXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZVtwcm9wXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIShwcm9wIGluIHRhcmdldCkpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHZhbHVlID0gdGFyZ2V0W3Byb3BdO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIG9uIHRoZSB1bmRlcmx5aW5nIG9iamVjdC4gQ2hlY2sgaWYgd2UgbmVlZCB0byBkb1xuICAgICAgICAgICAgLy8gYW55IHdyYXBwaW5nLlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHdyYXBwZXJzW3Byb3BdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHNwZWNpYWwtY2FzZSB3cmFwcGVyIGZvciB0aGlzIG1ldGhvZC5cbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyc1twcm9wXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIGFzeW5jIG1ldGhvZCB0aGF0IHdlIGhhdmUgbWV0YWRhdGEgZm9yLiBDcmVhdGUgYVxuICAgICAgICAgICAgICAvLyBQcm9taXNlIHdyYXBwZXIgZm9yIGl0LlxuICAgICAgICAgICAgICBsZXQgd3JhcHBlciA9IHdyYXBBc3luY0Z1bmN0aW9uKHByb3AsIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBtZXRob2QgdGhhdCB3ZSBkb24ndCBrbm93IG9yIGNhcmUgYWJvdXQuIFJldHVybiB0aGVcbiAgICAgICAgICAgICAgLy8gb3JpZ2luYWwgbWV0aG9kLCBib3VuZCB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuYmluZCh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAoaGFzT3duUHJvcGVydHkod3JhcHBlcnMsIHByb3ApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSkge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBvYmplY3QgdGhhdCB3ZSBuZWVkIHRvIGRvIHNvbWUgd3JhcHBpbmcgZm9yIHRoZSBjaGlsZHJlblxuICAgICAgICAgICAgLy8gb2YuIENyZWF0ZSBhIHN1Yi1vYmplY3Qgd3JhcHBlciBmb3IgaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgY2hpbGRcbiAgICAgICAgICAgIC8vIG1ldGFkYXRhLlxuICAgICAgICAgICAgdmFsdWUgPSB3cmFwT2JqZWN0KHZhbHVlLCB3cmFwcGVyc1twcm9wXSwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIFwiKlwiKSkge1xuICAgICAgICAgICAgLy8gV3JhcCBhbGwgcHJvcGVydGllcyBpbiAqIG5hbWVzcGFjZS5cbiAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW1wiKlwiXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55IHdyYXBwaW5nIGZvciB0aGlzIHByb3BlcnR5LFxuICAgICAgICAgICAgLy8gc28ganVzdCBmb3J3YXJkIGFsbCBhY2Nlc3MgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNhY2hlLCBwcm9wLCB7XG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQocHJveHlUYXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChwcm9wIGluIGNhY2hlKSB7XG4gICAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmaW5lUHJvcGVydHkocHJveHlUYXJnZXQsIHByb3AsIGRlc2MpIHtcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwgZGVzYyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVsZXRlUHJvcGVydHkocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShjYWNoZSwgcHJvcCk7XG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICAvLyBQZXIgY29udHJhY3Qgb2YgdGhlIFByb3h5IEFQSSwgdGhlIFwiZ2V0XCIgcHJveHkgaGFuZGxlciBtdXN0IHJldHVybiB0aGVcbiAgICAgIC8vIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSB0YXJnZXQgaWYgdGhhdCB2YWx1ZSBpcyBkZWNsYXJlZCByZWFkLW9ubHkgYW5kXG4gICAgICAvLyBub24tY29uZmlndXJhYmxlLiBGb3IgdGhpcyByZWFzb24sIHdlIGNyZWF0ZSBhbiBvYmplY3Qgd2l0aCB0aGVcbiAgICAgIC8vIHByb3RvdHlwZSBzZXQgdG8gYHRhcmdldGAgaW5zdGVhZCBvZiB1c2luZyBgdGFyZ2V0YCBkaXJlY3RseS5cbiAgICAgIC8vIE90aGVyd2lzZSB3ZSBjYW5ub3QgcmV0dXJuIGEgY3VzdG9tIG9iamVjdCBmb3IgQVBJcyB0aGF0XG4gICAgICAvLyBhcmUgZGVjbGFyZWQgcmVhZC1vbmx5IGFuZCBub24tY29uZmlndXJhYmxlLCBzdWNoIGFzIGBjaHJvbWUuZGV2dG9vbHNgLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBwcm94eSBoYW5kbGVycyB0aGVtc2VsdmVzIHdpbGwgc3RpbGwgdXNlIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YFxuICAgICAgLy8gaW5zdGVhZCBvZiB0aGUgYHByb3h5VGFyZ2V0YCwgc28gdGhhdCB0aGUgbWV0aG9kcyBhbmQgcHJvcGVydGllcyBhcmVcbiAgICAgIC8vIGRlcmVmZXJlbmNlZCB2aWEgdGhlIG9yaWdpbmFsIHRhcmdldHMuXG4gICAgICBsZXQgcHJveHlUYXJnZXQgPSBPYmplY3QuY3JlYXRlKHRhcmdldCk7XG4gICAgICByZXR1cm4gbmV3IFByb3h5KHByb3h5VGFyZ2V0LCBoYW5kbGVycyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzZXQgb2Ygd3JhcHBlciBmdW5jdGlvbnMgZm9yIGFuIGV2ZW50IG9iamVjdCwgd2hpY2ggaGFuZGxlc1xuICAgICAqIHdyYXBwaW5nIG9mIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IHRob3NlIG1lc3NhZ2VzIGFyZSBwYXNzZWQuXG4gICAgICpcbiAgICAgKiBBIHNpbmdsZSB3cmFwcGVyIGlzIGNyZWF0ZWQgZm9yIGVhY2ggbGlzdGVuZXIgZnVuY3Rpb24sIGFuZCBzdG9yZWQgaW4gYVxuICAgICAqIG1hcC4gU3Vic2VxdWVudCBjYWxscyB0byBgYWRkTGlzdGVuZXJgLCBgaGFzTGlzdGVuZXJgLCBvciBgcmVtb3ZlTGlzdGVuZXJgXG4gICAgICogcmV0cmlldmUgdGhlIG9yaWdpbmFsIHdyYXBwZXIsIHNvIHRoYXQgIGF0dGVtcHRzIHRvIHJlbW92ZSBhXG4gICAgICogcHJldmlvdXNseS1hZGRlZCBsaXN0ZW5lciB3b3JrIGFzIGV4cGVjdGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtEZWZhdWx0V2Vha01hcDxmdW5jdGlvbiwgZnVuY3Rpb24+fSB3cmFwcGVyTWFwXG4gICAgICogICAgICAgIEEgRGVmYXVsdFdlYWtNYXAgb2JqZWN0IHdoaWNoIHdpbGwgY3JlYXRlIHRoZSBhcHByb3ByaWF0ZSB3cmFwcGVyXG4gICAgICogICAgICAgIGZvciBhIGdpdmVuIGxpc3RlbmVyIGZ1bmN0aW9uIHdoZW4gb25lIGRvZXMgbm90IGV4aXN0LCBhbmQgcmV0cmlldmVcbiAgICAgKiAgICAgICAgYW4gZXhpc3Rpbmcgb25lIHdoZW4gaXQgZG9lcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICovXG4gICAgY29uc3Qgd3JhcEV2ZW50ID0gd3JhcHBlck1hcCA9PiAoe1xuICAgICAgYWRkTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lciwgLi4uYXJncykge1xuICAgICAgICB0YXJnZXQuYWRkTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpLCAuLi5hcmdzKTtcbiAgICAgIH0sXG5cbiAgICAgIGhhc0xpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5oYXNMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lcikpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICB0YXJnZXQucmVtb3ZlTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzID0gbmV3IERlZmF1bHRXZWFrTWFwKGxpc3RlbmVyID0+IHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYW4gb25SZXF1ZXN0RmluaXNoZWQgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCB3aWxsIHJldHVybiBhXG4gICAgICAgKiBgZ2V0Q29udGVudCgpYCBwcm9wZXJ0eSB3aGljaCByZXR1cm5zIGEgYFByb21pc2VgIHJhdGhlciB0aGFuIHVzaW5nIGFcbiAgICAgICAqIGNhbGxiYWNrIEFQSS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gICAgICAgKiAgICAgICAgVGhlIEhBUiBlbnRyeSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBuZXR3b3JrIHJlcXVlc3QuXG4gICAgICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBvblJlcXVlc3RGaW5pc2hlZChyZXEpIHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZFJlcSA9IHdyYXBPYmplY3QocmVxLCB7fSAvKiB3cmFwcGVycyAqLywge1xuICAgICAgICAgIGdldENvbnRlbnQ6IHtcbiAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0ZW5lcih3cmFwcGVkUmVxKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBLZWVwIHRyYWNrIGlmIHRoZSBkZXByZWNhdGlvbiB3YXJuaW5nIGhhcyBiZWVuIGxvZ2dlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGxldCBsb2dnZWRTZW5kUmVzcG9uc2VEZXByZWNhdGlvbldhcm5pbmcgPSBmYWxzZTtcblxuICAgIGNvbnN0IG9uTWVzc2FnZVdyYXBwZXJzID0gbmV3IERlZmF1bHRXZWFrTWFwKGxpc3RlbmVyID0+IHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYSBtZXNzYWdlIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgbWF5IHNlbmQgcmVzcG9uc2VzIGJhc2VkIG9uXG4gICAgICAgKiBpdHMgcmV0dXJuIHZhbHVlLCByYXRoZXIgdGhhbiBieSByZXR1cm5pbmcgYSBzZW50aW5lbCB2YWx1ZSBhbmQgY2FsbGluZyBhXG4gICAgICAgKiBjYWxsYmFjay4gSWYgdGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHJldHVybnMgYSBQcm9taXNlLCB0aGUgcmVzcG9uc2UgaXNcbiAgICAgICAqIHNlbnQgd2hlbiB0aGUgcHJvbWlzZSBlaXRoZXIgcmVzb2x2ZXMgb3IgcmVqZWN0cy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0geyp9IG1lc3NhZ2VcbiAgICAgICAqICAgICAgICBUaGUgbWVzc2FnZSBzZW50IGJ5IHRoZSBvdGhlciBlbmQgb2YgdGhlIGNoYW5uZWwuXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gc2VuZGVyXG4gICAgICAgKiAgICAgICAgRGV0YWlscyBhYm91dCB0aGUgc2VuZGVyIG9mIHRoZSBtZXNzYWdlLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbigqKX0gc2VuZFJlc3BvbnNlXG4gICAgICAgKiAgICAgICAgQSBjYWxsYmFjayB3aGljaCwgd2hlbiBjYWxsZWQgd2l0aCBhbiBhcmJpdHJhcnkgYXJndW1lbnQsIHNlbmRzXG4gICAgICAgKiAgICAgICAgdGhhdCB2YWx1ZSBhcyBhIHJlc3BvbnNlLlxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgKiAgICAgICAgVHJ1ZSBpZiB0aGUgd3JhcHBlZCBsaXN0ZW5lciByZXR1cm5lZCBhIFByb21pc2UsIHdoaWNoIHdpbGwgbGF0ZXJcbiAgICAgICAqICAgICAgICB5aWVsZCBhIHJlc3BvbnNlLiBGYWxzZSBvdGhlcndpc2UuXG4gICAgICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBvbk1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgbGV0IGRpZENhbGxTZW5kUmVzcG9uc2UgPSBmYWxzZTtcblxuICAgICAgICBsZXQgd3JhcHBlZFNlbmRSZXNwb25zZTtcbiAgICAgICAgbGV0IHNlbmRSZXNwb25zZVByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICB3cmFwcGVkU2VuZFJlc3BvbnNlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmICghbG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihTRU5EX1JFU1BPTlNFX0RFUFJFQ0FUSU9OX1dBUk5JTkcsIG5ldyBFcnJvcigpLnN0YWNrKTtcbiAgICAgICAgICAgICAgbG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpZENhbGxTZW5kUmVzcG9uc2UgPSB0cnVlO1xuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBsaXN0ZW5lcihtZXNzYWdlLCBzZW5kZXIsIHdyYXBwZWRTZW5kUmVzcG9uc2UpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICByZXN1bHQgPSBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNSZXN1bHRUaGVuYWJsZSA9IHJlc3VsdCAhPT0gdHJ1ZSAmJiBpc1RoZW5hYmxlKHJlc3VsdCk7XG5cbiAgICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIGRpZG4ndCByZXR1cm5lZCB0cnVlIG9yIGEgUHJvbWlzZSwgb3IgY2FsbGVkXG4gICAgICAgIC8vIHdyYXBwZWRTZW5kUmVzcG9uc2Ugc3luY2hyb25vdXNseSwgd2UgY2FuIGV4aXQgZWFybGllclxuICAgICAgICAvLyBiZWNhdXNlIHRoZXJlIHdpbGwgYmUgbm8gcmVzcG9uc2Ugc2VudCBmcm9tIHRoaXMgbGlzdGVuZXIuXG4gICAgICAgIGlmIChyZXN1bHQgIT09IHRydWUgJiYgIWlzUmVzdWx0VGhlbmFibGUgJiYgIWRpZENhbGxTZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBIHNtYWxsIGhlbHBlciB0byBzZW5kIHRoZSBtZXNzYWdlIGlmIHRoZSBwcm9taXNlIHJlc29sdmVzXG4gICAgICAgIC8vIGFuZCBhbiBlcnJvciBpZiB0aGUgcHJvbWlzZSByZWplY3RzIChhIHdyYXBwZWQgc2VuZE1lc3NhZ2UgaGFzXG4gICAgICAgIC8vIHRvIHRyYW5zbGF0ZSB0aGUgbWVzc2FnZSBpbnRvIGEgcmVzb2x2ZWQgcHJvbWlzZSBvciBhIHJlamVjdGVkXG4gICAgICAgIC8vIHByb21pc2UpLlxuICAgICAgICBjb25zdCBzZW5kUHJvbWlzZWRSZXN1bHQgPSAocHJvbWlzZSkgPT4ge1xuICAgICAgICAgIHByb21pc2UudGhlbihtc2cgPT4ge1xuICAgICAgICAgICAgLy8gc2VuZCB0aGUgbWVzc2FnZSB2YWx1ZS5cbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShtc2cpO1xuICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgIC8vIFNlbmQgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpZiB0aGUgcmVqZWN0ZWQgdmFsdWVcbiAgICAgICAgICAgIC8vIGlzIGFuIGluc3RhbmNlIG9mIGVycm9yLCBvciB0aGUgb2JqZWN0IGl0c2VsZiBvdGhlcndpc2UuXG4gICAgICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgICAgIGlmIChlcnJvciAmJiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWRcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fOiB0cnVlLFxuICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIC8vIFByaW50IGFuIGVycm9yIG9uIHRoZSBjb25zb2xlIGlmIHVuYWJsZSB0byBzZW5kIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2VuZCBvbk1lc3NhZ2UgcmVqZWN0ZWQgcmVwbHlcIiwgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgcmV0dXJuZWQgYSBQcm9taXNlLCBzZW5kIHRoZSByZXNvbHZlZCB2YWx1ZSBhcyBhXG4gICAgICAgIC8vIHJlc3VsdCwgb3RoZXJ3aXNlIHdhaXQgdGhlIHByb21pc2UgcmVsYXRlZCB0byB0aGUgd3JhcHBlZFNlbmRSZXNwb25zZVxuICAgICAgICAvLyBjYWxsYmFjayB0byByZXNvbHZlIGFuZCBzZW5kIGl0IGFzIGEgcmVzcG9uc2UuXG4gICAgICAgIGlmIChpc1Jlc3VsdFRoZW5hYmxlKSB7XG4gICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHNlbmRSZXNwb25zZVByb21pc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0IENocm9tZSBrbm93IHRoYXQgdGhlIGxpc3RlbmVyIGlzIHJlcGx5aW5nLlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjayA9ICh7cmVqZWN0LCByZXNvbHZlfSwgcmVwbHkpID0+IHtcbiAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgIC8vIERldGVjdCB3aGVuIG5vbmUgb2YgdGhlIGxpc3RlbmVycyByZXBsaWVkIHRvIHRoZSBzZW5kTWVzc2FnZSBjYWxsIGFuZCByZXNvbHZlXG4gICAgICAgIC8vIHRoZSBwcm9taXNlIHRvIHVuZGVmaW5lZCBhcyBpbiBGaXJlZm94LlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsL2lzc3Vlcy8xMzBcbiAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSA9PT0gQ0hST01FX1NFTkRfTUVTU0FHRV9DQUxMQkFDS19OT19SRVNQT05TRV9NRVNTQUdFKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmVwbHkgJiYgcmVwbHkuX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYmFjayB0aGUgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXJyb3IgaW50b1xuICAgICAgICAvLyBhbiBFcnJvciBpbnN0YW5jZS5cbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXBseS5tZXNzYWdlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKHJlcGx5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlID0gKG5hbWUsIG1ldGFkYXRhLCBhcGlOYW1lc3BhY2VPYmosIC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBsZWFzdCAke21ldGFkYXRhLm1pbkFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1pbkFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IG1vc3QgJHttZXRhZGF0YS5tYXhBcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5tYXhBcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRDYiA9IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrLmJpbmQobnVsbCwge3Jlc29sdmUsIHJlamVjdH0pO1xuICAgICAgICBhcmdzLnB1c2god3JhcHBlZENiKTtcbiAgICAgICAgYXBpTmFtZXNwYWNlT2JqLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHN0YXRpY1dyYXBwZXJzID0ge1xuICAgICAgZGV2dG9vbHM6IHtcbiAgICAgICAgbmV0d29yazoge1xuICAgICAgICAgIG9uUmVxdWVzdEZpbmlzaGVkOiB3cmFwRXZlbnQob25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcnVudGltZToge1xuICAgICAgICBvbk1lc3NhZ2U6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgIG9uTWVzc2FnZUV4dGVybmFsOiB3cmFwRXZlbnQob25NZXNzYWdlV3JhcHBlcnMpLFxuICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7bWluQXJnczogMSwgbWF4QXJnczogM30pLFxuICAgICAgfSxcbiAgICAgIHRhYnM6IHtcbiAgICAgICAgc2VuZE1lc3NhZ2U6IHdyYXBwZWRTZW5kTWVzc2FnZS5iaW5kKG51bGwsIFwic2VuZE1lc3NhZ2VcIiwge21pbkFyZ3M6IDIsIG1heEFyZ3M6IDN9KSxcbiAgICAgIH0sXG4gICAgfTtcbiAgICBjb25zdCBzZXR0aW5nTWV0YWRhdGEgPSB7XG4gICAgICBjbGVhcjoge21pbkFyZ3M6IDEsIG1heEFyZ3M6IDF9LFxuICAgICAgZ2V0OiB7bWluQXJnczogMSwgbWF4QXJnczogMX0sXG4gICAgICBzZXQ6IHttaW5BcmdzOiAxLCBtYXhBcmdzOiAxfSxcbiAgICB9O1xuICAgIGFwaU1ldGFkYXRhLnByaXZhY3kgPSB7XG4gICAgICBuZXR3b3JrOiB7XCIqXCI6IHNldHRpbmdNZXRhZGF0YX0sXG4gICAgICBzZXJ2aWNlczoge1wiKlwiOiBzZXR0aW5nTWV0YWRhdGF9LFxuICAgICAgd2Vic2l0ZXM6IHtcIipcIjogc2V0dGluZ01ldGFkYXRhfSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHdyYXBPYmplY3QoZXh0ZW5zaW9uQVBJcywgc3RhdGljV3JhcHBlcnMsIGFwaU1ldGFkYXRhKTtcbiAgfTtcblxuICBpZiAodHlwZW9mIGNocm9tZSAhPSBcIm9iamVjdFwiIHx8ICFjaHJvbWUgfHwgIWNocm9tZS5ydW50aW1lIHx8ICFjaHJvbWUucnVudGltZS5pZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgc2NyaXB0IHNob3VsZCBvbmx5IGJlIGxvYWRlZCBpbiBhIGJyb3dzZXIgZXh0ZW5zaW9uLlwiKTtcbiAgfVxuXG4gIC8vIFRoZSBidWlsZCBwcm9jZXNzIGFkZHMgYSBVTUQgd3JhcHBlciBhcm91bmQgdGhpcyBmaWxlLCB3aGljaCBtYWtlcyB0aGVcbiAgLy8gYG1vZHVsZWAgdmFyaWFibGUgYXZhaWxhYmxlLlxuICBtb2R1bGUuZXhwb3J0cyA9IHdyYXBBUElzKGNocm9tZSk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGJyb3dzZXI7XG59XG4iLCJleHBvcnRzLmludGVyb3BEZWZhdWx0ID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gYSAmJiBhLl9fZXNNb2R1bGUgPyBhIDoge2RlZmF1bHQ6IGF9O1xufTtcblxuZXhwb3J0cy5kZWZpbmVJbnRlcm9wRmxhZyA9IGZ1bmN0aW9uKGEpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGEsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG59O1xuXG5leHBvcnRzLmV4cG9ydEFsbCA9IGZ1bmN0aW9uKHNvdXJjZSwgZGVzdCkge1xuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKGtleSA9PT0gJ2RlZmF1bHQnIHx8IGtleSA9PT0gJ19fZXNNb2R1bGUnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2tpcCBkdXBsaWNhdGUgcmUtZXhwb3J0cyB3aGVuIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cbiAgICBpZiAoa2V5IGluIGRlc3QgJiYgZGVzdFtrZXldID09PSBzb3VyY2Vba2V5XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZXN0LCBrZXksIHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc291cmNlW2tleV07XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gZGVzdDtcbn07XG5cbmV4cG9ydHMuZXhwb3J0ID0gZnVuY3Rpb24oZGVzdCwgZGVzdE5hbWUsIGdldCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwgZGVzdE5hbWUsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZ2V0LFxuICB9KTtcbn07XG4iXSwibmFtZXMiOlsiYnJvd3NlciIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwiQ0hST01FX1NFTkRfTUVTU0FHRV9DQUxMQkFDS19OT19SRVNQT05TRV9NRVNTQUdFIiwiU0VORF9SRVNQT05TRV9ERVBSRUNBVElPTl9XQVJOSU5HIiwid3JhcEFQSXMiLCJleHRlbnNpb25BUElzIiwiYXBpTWV0YWRhdGEiLCJrZXlzIiwibGVuZ3RoIiwiRXJyb3IiLCJEZWZhdWx0V2Vha01hcCIsIldlYWtNYXAiLCJjb25zdHJ1Y3RvciIsImNyZWF0ZUl0ZW0iLCJpdGVtcyIsInVuZGVmaW5lZCIsImdldCIsImtleSIsImhhcyIsInNldCIsImlzVGhlbmFibGUiLCJ2YWx1ZSIsInRoZW4iLCJtYWtlQ2FsbGJhY2siLCJwcm9taXNlIiwibWV0YWRhdGEiLCJjYWxsYmFja0FyZ3MiLCJydW50aW1lIiwibGFzdEVycm9yIiwicmVqZWN0IiwibWVzc2FnZSIsInNpbmdsZUNhbGxiYWNrQXJnIiwicmVzb2x2ZSIsInBsdXJhbGl6ZUFyZ3VtZW50cyIsIm51bUFyZ3MiLCJ3cmFwQXN5bmNGdW5jdGlvbiIsIm5hbWUiLCJhc3luY0Z1bmN0aW9uV3JhcHBlciIsInRhcmdldCIsImFyZ3MiLCJtaW5BcmdzIiwibWF4QXJncyIsIlByb21pc2UiLCJmYWxsYmFja1RvTm9DYWxsYmFjayIsImNiRXJyb3IiLCJjb25zb2xlIiwid2FybiIsIm5vQ2FsbGJhY2siLCJ3cmFwTWV0aG9kIiwibWV0aG9kIiwid3JhcHBlciIsIlByb3h5IiwiYXBwbHkiLCJ0YXJnZXRNZXRob2QiLCJ0aGlzT2JqIiwiY2FsbCIsImhhc093blByb3BlcnR5IiwiRnVuY3Rpb24iLCJiaW5kIiwid3JhcE9iamVjdCIsIndyYXBwZXJzIiwiY2FjaGUiLCJjcmVhdGUiLCJoYW5kbGVycyIsInByb3h5VGFyZ2V0IiwicHJvcCIsInJlY2VpdmVyIiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwiZGVzYyIsIlJlZmxlY3QiLCJkZWxldGVQcm9wZXJ0eSIsIndyYXBFdmVudCIsIndyYXBwZXJNYXAiLCJhZGRMaXN0ZW5lciIsImxpc3RlbmVyIiwiaGFzTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsIm9uUmVxdWVzdEZpbmlzaGVkV3JhcHBlcnMiLCJvblJlcXVlc3RGaW5pc2hlZCIsInJlcSIsIndyYXBwZWRSZXEiLCJnZXRDb250ZW50IiwibG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nIiwib25NZXNzYWdlV3JhcHBlcnMiLCJvbk1lc3NhZ2UiLCJzZW5kZXIiLCJzZW5kUmVzcG9uc2UiLCJkaWRDYWxsU2VuZFJlc3BvbnNlIiwid3JhcHBlZFNlbmRSZXNwb25zZSIsInNlbmRSZXNwb25zZVByb21pc2UiLCJyZXNwb25zZSIsInN0YWNrIiwicmVzdWx0IiwiZXJyIiwiaXNSZXN1bHRUaGVuYWJsZSIsInNlbmRQcm9taXNlZFJlc3VsdCIsIm1zZyIsImVycm9yIiwiX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fIiwiY2F0Y2giLCJ3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjayIsInJlcGx5Iiwid3JhcHBlZFNlbmRNZXNzYWdlIiwiYXBpTmFtZXNwYWNlT2JqIiwid3JhcHBlZENiIiwicHVzaCIsInNlbmRNZXNzYWdlIiwic3RhdGljV3JhcHBlcnMiLCJkZXZ0b29scyIsIm5ldHdvcmsiLCJvbk1lc3NhZ2VFeHRlcm5hbCIsInRhYnMiLCJzZXR0aW5nTWV0YWRhdGEiLCJjbGVhciIsInByaXZhY3kiLCJzZXJ2aWNlcyIsIndlYnNpdGVzIiwiY2hyb21lIiwiaWQiLCJtb2R1bGUiLCJleHBvcnRzIl0sInZlcnNpb24iOjMsImZpbGUiOiJzaWRlYmFyLkhBU0hfUkVGX2JiNzU3MDA2NmQ1Zjg4MjMuanMubWFwIn0=
