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
let currentTabs = {
}; //All tabs in the current window, indexed by id
let containers = [];
let WIN_ID = null;
function tabCreated(rawTab) {
    currentTabs[rawTab.id] = new _tabDefault.default(rawTab);
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
    WIN_ID = (await browser.windows.getCurrent()).id; //WINDOW_ID_CURRENT returns wrong value for some reason
    browser.tabs.onActivated.addListener(async ({ tabId , previousTabId , windowId  })=>{
        if (windowId == WIN_ID) {
            currentTabs[tabId].updated({
                active: true
            });
            currentTabs[previousTabId]?.updated({
                active: false
            });
        }
    });
    browser.tabs.onAttached.addListener(async (tabId, { newWindowId  })=>{
        if (newWindowId === WIN_ID) tabCreated(await browser.tabs.get(tabId));
    });
    browser.tabs.onCreated.addListener((tab)=>{
        if (tab.windowId === WIN_ID) tabCreated(tab);
    });
    browser.tabs.onDetached.addListener((tabId, { oldWindowId  })=>{
        if (oldWindowId === WIN_ID) tabRemoved(tabId);
    });
    // browser.tabs.onHighlighted.addListener(tabChange);
    browser.tabs.onMoved.addListener((tabId, { windowId , toIndex  })=>{
        if (windowId === WIN_ID) tabMoved(tabId, toIndex);
    });
    browser.tabs.onRemoved.addListener((tabId, { windowId  })=>{
        if (windowId === WIN_ID) tabRemoved(tabId);
    });
    browser.tabs.onUpdated.addListener(tabChanged, {
        windowId: WIN_ID
    });
    const tabs = await browser.tabs.query({
        windowId: WIN_ID
    });
    for (const tab of tabs)tabCreated(tab);
}
async function rebuildContainers() {
    containers = await browser.contextualIdentities.query({
    });
}
browser.contextualIdentities.onRemoved.addListener(rebuildContainers);
browser.contextualIdentities.onUpdated.addListener(rebuildContainers);
browser.contextualIdentities.onCreated.addListener(rebuildContainers);
rebuildContainers();

},{"./contextMenu":"5gUSp","./Tab":"4Zz2M","./sidebarStyles.css":"3gmz3","@parcel/transformer-js/src/esmodule-helpers.js":"lBfFQ"}],"5gUSp":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "showTabMenu", ()=>showTabMenu
);
var _tab = require("./Tab");
var _sidebar = require("./sidebar");
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
                    onclick: ()=>tab.reopenWithCookieStoreId(null)
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
    browser.menus.overrideContext({
        showDefaults: false
    });
    browser.menus.removeAll();
    for (const contextObj of structure)createContext(contextObj);
}
function createContext(contextObj, parentId = null) {
    const { children , ...createProps } = contextObj;
    if (parentId != null) createProps.parentId = parentId;
    const id = browser.menus.create({
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

},{"./Tab":"4Zz2M","./sidebar":"l3yU4","@parcel/transformer-js/src/esmodule-helpers.js":"lBfFQ"}],"4Zz2M":[function(require,module,exports) {
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
        const newIndex = (await browser.tabs.get(this.id)).index;
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
        return await browser.tabs.reload(this.id);
    }
    async mute() {
        return await browser.tabs.update(this.id, {
            muted: true
        });
    }
    async unmute() {
        return await browser.tabs.update(this.id, {
            muted: false
        });
    }
    async duplicate() {
        return await browser.tabs.duplicate(this.id);
    }
    async pin() {
        return await browser.tabs.update(this.id, {
            pinned: true
        });
    }
    async unpin() {
        return await browser.tabs.update(this.id, {
            pinned: false
        });
    }
    async bookmark() {
        return await browser.bookmarks.create({
            title: this.title,
            url: this.url
        });
    }
    async close() {
        return await browser.tabs.remove(this.id);
    }
    async discard() {
        await browser.tabs.discard(this.id);
    }
    async reopenWithCookieStoreId(cookieStoreId) {
        await browser.tabs.create({
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
            await browser.tabs.update(this.id, {
                active: true
            });
        });
        tabEl.addEventListener("contextmenu", ()=>_contextMenu.showTabMenu(this)
        );
        tabEl.draggable = true;
        tabEl.addEventListener("dragstart", (e)=>{
            e.dataTransfer.setData("text/x-moz-url", `${this.url}\n${this.title}`);
            e.dataTransfer.setData("text/uri-list", this.url);
            e.dataTransfer.setData("text/plain", this.url);
            e.dataTransfer.effectAllowed = "copyMove";
            e.dataTransfer.setDragImage(document.getElementById("invisibleDragImage"), 0, 0);
        });
        tabEl.classList.add("tab");
        titleEl.classList.add("tabText");
        tabCloseBtn.classList.add("tabCloseBtn");
        tabCloseBtn.src = browser.runtime.getURL("assets/close.svg");
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
        this.id = rawTab.id;
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
    return await browser.tabs.create(createOptions);
}
async function restoreClosedTab() {
    const lastClosed = await browser.sessions.getRecentlyClosed();
    if (!lastClosed.length) return;
    const lastTab = lastClosed.find((e)=>e.tab && e.tab.windowId === _sidebar.WIN_ID
    )?.tab;
    if (!lastTab) return;
    return await browser.sessions.restore(lastTab.sessionId);
}

},{"./sidebar":"l3yU4","./contextMenu":"5gUSp","@parcel/transformer-js/src/esmodule-helpers.js":"lBfFQ"}],"lBfFQ":[function(require,module,exports) {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUTtRQUNsQyxVQUFVLEVBQUUsSUFBSTtRQUNoQixHQUFHLEVBQUUsR0FBRzs7QUFFWixDQUFDIiwic291cmNlcyI6WyJzcmMvc2lkZWJhci9zaWRlYmFyLnRzIiwic3JjL3NpZGViYXIvY29udGV4dE1lbnUudHMiLCJzcmMvc2lkZWJhci9UYWIudHMiLCJub2RlX21vZHVsZXMvQHBhcmNlbC90cmFuc2Zvcm1lci1qcy9zcmMvZXNtb2R1bGUtaGVscGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgIFwiLi9jb250ZXh0TWVudVwiO1xuaW1wb3J0IFRhYiBmcm9tIFwiLi9UYWJcIjtcbmltcG9ydCBcIi4vc2lkZWJhclN0eWxlcy5jc3NcIlxuXG5cbmxldCBjdXJyZW50VGFicyA9IHt9OyAvL0FsbCB0YWJzIGluIHRoZSBjdXJyZW50IHdpbmRvdywgaW5kZXhlZCBieSBpZFxuZXhwb3J0IGxldCBjb250YWluZXJzID0gW107XG5leHBvcnQgbGV0IFdJTl9JRCA9IG51bGw7XG5cbmZ1bmN0aW9uIHRhYkNyZWF0ZWQocmF3VGFiKSB7XG5cdGN1cnJlbnRUYWJzW3Jhd1RhYi5pZF0gPSBuZXcgVGFiKHJhd1RhYik7XG59XG5mdW5jdGlvbiB0YWJSZW1vdmVkKHRhYklkKSB7XG5cdGN1cnJlbnRUYWJzW3RhYklkXS5yZW1vdmVUYWIoKTtcblx0ZGVsZXRlIGN1cnJlbnRUYWJzW3RhYklkXTtcbn1cbmZ1bmN0aW9uIHRhYkNoYW5nZWQodGFiSWQsIGNoYW5nZUluZm8pIHtcblx0Y3VycmVudFRhYnNbdGFiSWRdPy51cGRhdGVkKGNoYW5nZUluZm8pO1xufVxuZnVuY3Rpb24gdGFiTW92ZWQodGFiSWQsIHRvSW5kZXgpIHtcblx0Y3VycmVudFRhYnNbdGFiSWRdLm1vdmVkKHRvSW5kZXgpO1xufVxuXG5zZXR1cCgpO1xuYXN5bmMgZnVuY3Rpb24gc2V0dXAoKSB7XG5cdFdJTl9JRCA9IChhd2FpdCBicm93c2VyLndpbmRvd3MuZ2V0Q3VycmVudCgpKS5pZDsgLy9XSU5ET1dfSURfQ1VSUkVOVCByZXR1cm5zIHdyb25nIHZhbHVlIGZvciBzb21lIHJlYXNvblxuXHRicm93c2VyLnRhYnMub25BY3RpdmF0ZWQuYWRkTGlzdGVuZXIoYXN5bmMgKHsgdGFiSWQsIHByZXZpb3VzVGFiSWQsIHdpbmRvd0lkIH0pID0+IHtcblx0XHRpZiAod2luZG93SWQgPT0gV0lOX0lEKSB7XG5cdFx0XHRjdXJyZW50VGFic1t0YWJJZF0udXBkYXRlZCh7IGFjdGl2ZTogdHJ1ZSB9KTtcblx0XHRcdGN1cnJlbnRUYWJzW3ByZXZpb3VzVGFiSWRdPy51cGRhdGVkKHsgYWN0aXZlOiBmYWxzZSB9KTtcblx0XHR9XG5cdH0pO1xuXHRicm93c2VyLnRhYnMub25BdHRhY2hlZC5hZGRMaXN0ZW5lcihhc3luYyAodGFiSWQsIHsgbmV3V2luZG93SWQgfSkgPT4ge1xuXHRcdGlmIChuZXdXaW5kb3dJZCA9PT0gV0lOX0lEKSB0YWJDcmVhdGVkKGF3YWl0IGJyb3dzZXIudGFicy5nZXQodGFiSWQpKTtcblx0fSk7XG5cdGJyb3dzZXIudGFicy5vbkNyZWF0ZWQuYWRkTGlzdGVuZXIodGFiID0+IHtcblx0XHRpZiAodGFiLndpbmRvd0lkID09PSBXSU5fSUQpIHRhYkNyZWF0ZWQodGFiKTtcblx0fSk7XG5cdGJyb3dzZXIudGFicy5vbkRldGFjaGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgeyBvbGRXaW5kb3dJZCB9KSA9PiB7XG5cdFx0aWYgKG9sZFdpbmRvd0lkID09PSBXSU5fSUQpIHRhYlJlbW92ZWQodGFiSWQpO1xuXHR9KTtcblx0Ly8gYnJvd3Nlci50YWJzLm9uSGlnaGxpZ2h0ZWQuYWRkTGlzdGVuZXIodGFiQ2hhbmdlKTtcblx0YnJvd3Nlci50YWJzLm9uTW92ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCB7IHdpbmRvd0lkLCB0b0luZGV4IH0pID0+IHtcblx0XHRpZiAod2luZG93SWQgPT09IFdJTl9JRCkgdGFiTW92ZWQodGFiSWQsIHRvSW5kZXgpO1xuXHR9KTtcblx0YnJvd3Nlci50YWJzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcigodGFiSWQsIHsgd2luZG93SWQgfSkgPT4ge1xuXHRcdGlmICh3aW5kb3dJZCA9PT0gV0lOX0lEKSB0YWJSZW1vdmVkKHRhYklkKTtcblx0fSk7XG5cdGJyb3dzZXIudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIodGFiQ2hhbmdlZCwgeyB3aW5kb3dJZDogV0lOX0lEIH0pO1xuXG5cdGNvbnN0IHRhYnMgPSBhd2FpdCBicm93c2VyLnRhYnMucXVlcnkoeyB3aW5kb3dJZDogV0lOX0lEIH0pO1xuXHRmb3IgKGNvbnN0IHRhYiBvZiB0YWJzKSB0YWJDcmVhdGVkKHRhYik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYnVpbGRDb250YWluZXJzKCkge1xuXHRjb250YWluZXJzID0gYXdhaXQgYnJvd3Nlci5jb250ZXh0dWFsSWRlbnRpdGllcy5xdWVyeSh7fSk7XG59XG5icm93c2VyLmNvbnRleHR1YWxJZGVudGl0aWVzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcihyZWJ1aWxkQ29udGFpbmVycyk7XG5icm93c2VyLmNvbnRleHR1YWxJZGVudGl0aWVzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihyZWJ1aWxkQ29udGFpbmVycyk7XG5icm93c2VyLmNvbnRleHR1YWxJZGVudGl0aWVzLm9uQ3JlYXRlZC5hZGRMaXN0ZW5lcihyZWJ1aWxkQ29udGFpbmVycyk7XG5yZWJ1aWxkQ29udGFpbmVycygpO1xuIiwiaW1wb3J0IHsgbmV3VGFiLCByZXN0b3JlQ2xvc2VkVGFiIH0gZnJvbSBcIi4vVGFiXCI7XG5pbXBvcnQgeyBjb250YWluZXJzIH0gZnJvbSBcIi4vc2lkZWJhclwiO1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1RhYk1lbnUodGFiKSB7XG5cdHNldE1lbnUoW1xuXHRcdHsgdGl0bGU6IFwiTmV3IFRhYlwiLCBvbmNsaWNrOiAoKSA9PiBuZXdUYWIoeyBvcGVuZXJUYWJJZDogdGFiLmlkIH0pIH0sXG5cdFx0eyB0aXRsZTogXCJSZW9wZW4gQ2xvc2VkIFRhYlwiLCBvbmNsaWNrOiAoKSA9PiByZXN0b3JlQ2xvc2VkVGFiKCkgfSxcblx0XHR7IHR5cGU6IFwic2VwYXJhdG9yXCIgfSxcblx0XHR7IHRpdGxlOiBcIlJlbG9hZCBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLnJlbG9hZCgpIH0sXG5cdFx0dGFiLm11dGVkID8geyB0aXRsZTogXCJVbm11dGUgVGFiXCIsIG9uY2xpY2s6ICgpID0+IHRhYi51bm11dGUoKSB9IDogeyB0aXRsZTogXCJNdXRlIFRhYlwiLCBvbmNsaWNrOiAoKSA9PiB0YWIubXV0ZSgpIH0sXG5cdFx0dGFiLnBpbm5lZCA/IHsgdGl0bGU6IFwiVW5waW4gVGFiXCIsIG9uY2xpY2s6ICgpID0+IHRhYi51bnBpbigpIH0gOiB7IHRpdGxlOiBcIlBpbiBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLnBpbigpIH0sXG5cdFx0eyB0aXRsZTogXCJEdXBsaWNhdGUgVGFiXCIsIG9uY2xpY2s6ICgpID0+IHRhYi5kdXBsaWNhdGUoKSB9LFxuXHRcdHtcblx0XHRcdHRpdGxlOiBcIlJlb3BlbiBpbiBDb250YWluZXJcIixcblx0XHRcdGVuYWJsZWQ6ICEhY29udGFpbmVycy5sZW5ndGggJiYgdGFiLmlzUmVvcGVuYWJsZSxcblx0XHRcdGNoaWxkcmVuOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aXRsZTogXCJEZWZhdWx0XCIsXG5cdFx0XHRcdFx0ZW5hYmxlZDogISF0YWIuY29udGFpbmVyLFxuXHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHRhYi5yZW9wZW5XaXRoQ29va2llU3RvcmVJZChudWxsKSxcblx0XHRcdFx0fSxcblx0XHRcdFx0Li4uY29udGFpbmVycy5tYXAoY29udGFpbmVyID0+ICh7XG5cdFx0XHRcdFx0dGl0bGU6IGNvbnRhaW5lci5uYW1lLFxuXHRcdFx0XHRcdGljb25zOiB7IDE2OiBjb250YWluZXIuaWNvblVybCB9LFxuXHRcdFx0XHRcdGVuYWJsZWQ6IGNvbnRhaW5lci5jb29raWVTdG9yZUlkICE9IHRhYi5jb29raWVTdG9yZUlkLFxuXHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHRhYi5yZW9wZW5XaXRoQ29va2llU3RvcmVJZChjb250YWluZXIuY29va2llU3RvcmVJZCksXG5cdFx0XHRcdH0pKSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR7IHRpdGxlOiBcIlVubG9hZCBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLmRpc2NhcmQoKSwgZW5hYmxlZDogdGFiLmRpc2NhcmRhYmxlIH0sXG5cdFx0eyB0aXRsZTogXCJCb29rbWFyayBUYWJcIiwgb25jbGljazogKCkgPT4gdGFiLmJvb2ttYXJrKCkgfSxcblx0XHR7IHR5cGU6IFwic2VwYXJhdG9yXCIgfSxcblx0XHR7IHRpdGxlOiBcIkNsb3NlIFRhYlwiLCBvbmNsaWNrOiAoKSA9PiB0YWIuY2xvc2UoKSB9LFxuXHRdKTtcbn1cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCBldmVudCA9PiB7XG5cdGlmIChldmVudC50YXJnZXQuY2xvc2VzdChcIi50YWJcIikpIHJldHVybjtcblx0c2V0TWVudShbXG5cdFx0eyB0aXRsZTogXCJOZXcgVGFiXCIsIG9uY2xpY2s6ICgpID0+IG5ld1RhYigpIH0sXG5cdFx0eyB0aXRsZTogXCJSZW9wZW4gQ2xvc2VkIFRhYlwiLCBvbmNsaWNrOiAoKSA9PiByZXN0b3JlQ2xvc2VkVGFiKCkgfSxcblx0XHR7IHR5cGU6IFwic2VwYXJhdG9yXCIgfSxcblx0XSk7XG59KTtcbmZ1bmN0aW9uIHNldE1lbnUoc3RydWN0dXJlKSB7XG5cdGJyb3dzZXIubWVudXMub3ZlcnJpZGVDb250ZXh0KHsgc2hvd0RlZmF1bHRzOiBmYWxzZSB9KTtcblx0YnJvd3Nlci5tZW51cy5yZW1vdmVBbGwoKTtcblx0Zm9yIChjb25zdCBjb250ZXh0T2JqIG9mIHN0cnVjdHVyZSkgY3JlYXRlQ29udGV4dChjb250ZXh0T2JqKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRleHQoY29udGV4dE9iaiwgcGFyZW50SWQgPSBudWxsKSB7XG5cdGNvbnN0IHsgY2hpbGRyZW4sIC4uLmNyZWF0ZVByb3BzIH0gPSBjb250ZXh0T2JqO1xuXHRpZiAocGFyZW50SWQgIT0gbnVsbCkgY3JlYXRlUHJvcHMucGFyZW50SWQgPSBwYXJlbnRJZDtcblx0Y29uc3QgaWQgPSBicm93c2VyLm1lbnVzLmNyZWF0ZSh7XG5cdFx0Y29udGV4dHM6IFtcImFsbFwiXSxcblx0XHR2aWV3VHlwZXM6IFtcInNpZGViYXJcIl0sXG5cdFx0Li4uY3JlYXRlUHJvcHMsXG5cdH0pO1xuXHRmb3IgKGNvbnN0IGNoaWxkQ29udGV4dE9iaiBvZiBjaGlsZHJlbiB8fCBbXSkgY3JlYXRlQ29udGV4dChjaGlsZENvbnRleHRPYmosIGlkKTtcbn1cbiIsImltcG9ydCB7IFdJTl9JRCwgY29udGFpbmVycyB9IGZyb20gXCIuL3NpZGViYXJcIjtcbmltcG9ydCB7IHNob3dUYWJNZW51IH0gZnJvbSBcIi4vY29udGV4dE1lbnVcIjtcblxuY29uc3QgdGFic0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFic0RpdlwiKTtcbmNvbnN0IHBpbm5lZFRhYnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBpbm5lZFRhYnNEaXZcIik7XG5sZXQgdGFiT3JkZXIgPSBbXTsgLy9BbGwgdW5waW5uZWQgdGFiIGlkcyBpbiB0aGUgY3VycmVudCB3aW5kb3csIHNvcnRlZCBieSBpbmRleFxubGV0IHBpbm5lZFRhYk9yZGVyID0gW107IC8vQWxsIHBpbm5lZCB0YWIgaWRzIGluIHRoZSBjdXJyZW50IHdpbmRvdywgc29ydGVkIGJ5IGluZGV4XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYiB7XG5cdGNvbnN0cnVjdG9yKHJhd1RhYikge1xuXHRcdHRoaXMuaWQgPSByYXdUYWIuaWQ7XG5cdFx0Y29uc3QgeyB0YWJFbCwgdGl0bGVFbCwgZmF2aWNvbkVsLCBjb250YWluZXJJbmRpY2F0b3JFbCB9ID0gdGhpcy5jcmVhdGVUYWJFbCgpO1xuXHRcdFt0aGlzLnRhYkVsLCB0aGlzLnRpdGxlRWwsIHRoaXMuZmF2aWNvbkVsLCB0aGlzLmNvbnRhaW5lckluZGljYXRvckVsXSA9IFtcblx0XHRcdHRhYkVsLFxuXHRcdFx0dGl0bGVFbCxcblx0XHRcdGZhdmljb25FbCxcblx0XHRcdGNvbnRhaW5lckluZGljYXRvckVsLFxuXHRcdF07XG5cblx0XHRjb25zdCBwaW5uZWQgPSByYXdUYWIucGlubmVkO1xuXHRcdGNvbnN0IGluZGV4ID0gcGlubmVkID8gcmF3VGFiLmluZGV4IDogcmF3VGFiLmluZGV4IC0gcGlubmVkVGFiT3JkZXIubGVuZ3RoO1xuXHRcdHRoaXMuYmVsb25naW5nRGl2ID0gcGlubmVkID8gcGlubmVkVGFic0RpdiA6IHRhYnNEaXY7XG5cdFx0dGhpcy5iZWxvbmdpbmdPcmRlciA9IHBpbm5lZCA/IHBpbm5lZFRhYk9yZGVyIDogdGFiT3JkZXI7XG5cdFx0dGhpcy5iZWxvbmdpbmdPcmRlci5zcGxpY2UoaW5kZXgsIDAsIHRoaXMuaWQpO1xuXHRcdHRoaXMuYmVsb25naW5nRGl2Lmluc2VydEJlZm9yZSh0YWJFbCwgdGFic0Rpdi5jaGlsZHJlbltpbmRleF0pO1xuXHRcdHRoaXMudXBkYXRlZChyYXdUYWIpO1xuXHR9XG5cdGdldCBpbmRleCgpIHtcblx0XHRyZXR1cm4gdGhpcy5iZWxvbmdpbmdPcmRlci5pbmRleE9mKHRoaXMuaWQpO1xuXHR9XG5cdGdldCBicm93c2VySW5kZXgoKSB7XG5cdFx0cmV0dXJuIHRoaXMucGlubmVkID8gdGhpcy5pbmRleCA6IHRoaXMuaW5kZXggKyBwaW5uZWRUYWJPcmRlci5sZW5ndGg7XG5cdH1cblx0Z2V0IGNvbnRhaW5lcigpIHtcblx0XHRjb25zdCBjb250YWluZXIgPSBjb250YWluZXJzLmZpbmQoZSA9PiBlLmNvb2tpZVN0b3JlSWQgPT09IHRoaXMuY29va2llU3RvcmVJZCk7XG5cdFx0cmV0dXJuIGNvbnRhaW5lciB8fCBudWxsO1xuXHR9XG5cdHVwZGF0ZWQoY2hhbmdlSW5mbykge1xuXHRcdGNvbnN0IGhhbmRsZXJzID0ge1xuXHRcdFx0dGl0bGU6IG5ld1ZhbHVlID0+IHtcblx0XHRcdFx0dGhpcy50aXRsZSA9IG5ld1ZhbHVlO1xuXHRcdFx0XHR0aGlzLnRpdGxlRWwuaW5uZXJUZXh0ID0gdGhpcy50aXRsZTtcblx0XHRcdH0sXG5cdFx0XHRmYXZJY29uVXJsOiBuZXdWYWx1ZSA9PiB7XG5cdFx0XHRcdHRoaXMuZmF2SWNvblVybCA9IG5ld1ZhbHVlO1xuXHRcdFx0XHR0aGlzLmZhdmljb25FbC5zcmMgPSB0aGlzLmZhdkljb25VcmwgfHwgXCJcIjtcblx0XHRcdH0sXG5cdFx0XHRhY3RpdmU6IG5ld1ZhbHVlID0+IHtcblx0XHRcdFx0dGhpcy5hY3RpdmUgPSBuZXdWYWx1ZTtcblx0XHRcdFx0dGhpcy50YWJFbC5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlVGFiXCIsIHRoaXMuYWN0aXZlKTtcblx0XHRcdH0sXG5cdFx0XHRjb29raWVTdG9yZUlkOiBuZXdWYWx1ZSA9PiB7XG5cdFx0XHRcdHRoaXMuY29va2llU3RvcmVJZCA9IG5ld1ZhbHVlO1xuXHRcdFx0XHRpZiAodGhpcy5jb250YWluZXIpIHRoaXMuY29udGFpbmVySW5kaWNhdG9yRWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb250YWluZXIuY29sb3JDb2RlO1xuXHRcdFx0fSxcblx0XHRcdHN0YXR1czogbmV3VmFsdWUgPT4ge1xuXHRcdFx0XHRjb25zdCBsb2FkaW5nID0gbmV3VmFsdWUgPT0gXCJsb2FkaW5nXCI7IC8vU3RhdHVzIGlzIGVpdGhlciBcImxvYWRpbmdcIiBvciBcImNvbXBsZXRlXCJcblx0XHRcdFx0dGhpcy50YWJFbC5jbGFzc0xpc3QudG9nZ2xlKFwibG9hZGluZ1wiLCBsb2FkaW5nKTtcblx0XHRcdFx0aWYgKHRoaXMuc3RhdHVzID09IFwibG9hZGluZ1wiICYmICFsb2FkaW5nKSB7XG5cdFx0XHRcdFx0dGhpcy50YWJFbC5jbGFzc0xpc3QuYWRkKFwiZmluaXNoTG9hZFwiKTtcblx0XHRcdFx0XHRpZiAodGhpcy5sb2FkVGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMubG9hZFRpbWVvdXQpO1xuXHRcdFx0XHRcdHRoaXMubG9hZFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMudGFiRWwuY2xhc3NMaXN0LnJlbW92ZShcImZpbmlzaExvYWRcIiksIDUwMCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zdGF0dXMgPSBuZXdWYWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRtdXRlZEluZm86IG5ld1ZhbHVlID0+ICh0aGlzLm11dGVkID0gbmV3VmFsdWUubXV0ZWQpLFxuXHRcdFx0cGlubmVkOiBuZXdWYWx1ZSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLnBpbm5lZCA9PT0gbmV3VmFsdWUpIHJldHVybjtcblx0XHRcdFx0dGhpcy5waW5uZWQgPSBuZXdWYWx1ZTtcblx0XHRcdFx0dGhpcy5tb3ZlUGlubmVkKG5ld1ZhbHVlKTtcblx0XHRcdH0sXG5cdFx0XHR1cmw6IG5ld1ZhbHVlID0+ICh0aGlzLnVybCA9IG5ld1ZhbHVlKSxcblx0XHRcdGRpc2NhcmRlZDogbmV3VmFsdWUgPT4ge1xuXHRcdFx0XHR0aGlzLmRpc2NhcmRlZCA9IG5ld1ZhbHVlO1xuXHRcdFx0XHR0aGlzLnRhYkVsLmNsYXNzTGlzdC50b2dnbGUoXCJkaXNjYXJkZWRcIiwgdGhpcy5kaXNjYXJkZWQpO1xuXHRcdFx0fSxcblx0XHR9O1xuXHRcdGZvciAoY29uc3QgW2tleUNoYW5nZWQsIG5ld1ZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjaGFuZ2VJbmZvKSkge1xuXHRcdFx0aWYgKGtleUNoYW5nZWQgaW4gaGFuZGxlcnMpIGhhbmRsZXJzW2tleUNoYW5nZWRdKG5ld1ZhbHVlKTtcblx0XHR9XG5cdH1cblx0YXN5bmMgbW92ZVBpbm5lZChwaW5uaW5nKSB7XG5cdFx0Y29uc3QgbmV3SW5kZXggPSAoYXdhaXQgYnJvd3Nlci50YWJzLmdldCh0aGlzLmlkKSkuaW5kZXg7XG5cdFx0aWYgKHBpbm5pbmcpIHtcblx0XHRcdC8vdW5waW5uZWQgLT4gcGlubmVkXG5cdFx0XHR0aGlzLmJlbG9uZ2luZ0RpdiA9IHBpbm5lZFRhYnNEaXY7XG5cdFx0XHR0aGlzLmJlbG9uZ2luZ09yZGVyLnNwbGljZSh0aGlzLmluZGV4LCAxKTsgLy9yZW1vdmVzXG5cdFx0XHR0aGlzLmJlbG9uZ2luZ09yZGVyID0gcGlubmVkVGFiT3JkZXI7XG5cdFx0XHR0aGlzLmJlbG9uZ2luZ09yZGVyLnNwbGljZShuZXdJbmRleCwgMCwgdGhpcy5pZCk7IC8vYWRkc1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL3Bpbm5lZCAtPiB1bnBpbm5lZFxuXHRcdFx0dGhpcy5iZWxvbmdpbmdEaXYgPSB0YWJzRGl2O1xuXHRcdFx0dGhpcy5iZWxvbmdpbmdPcmRlci5zcGxpY2UodGhpcy5pbmRleCwgMSk7IC8vcmVtb3Zlc1xuXHRcdFx0dGhpcy5iZWxvbmdpbmdPcmRlciA9IHRhYk9yZGVyO1xuXHRcdFx0dGhpcy5iZWxvbmdpbmdPcmRlci5zcGxpY2UobmV3SW5kZXggLSBwaW5uZWRUYWJPcmRlci5sZW5ndGgsIDAsIHRoaXMuaWQpOyAvL2FkZHNcblx0XHR9XG5cdFx0dGhpcy5iZWxvbmdpbmdEaXYuaW5zZXJ0QmVmb3JlKHRoaXMudGFiRWwsIHRoaXMuYmVsb25naW5nRGl2LmNoaWxkcmVuW3RoaXMuaW5kZXhdKTtcblx0fVxuXHRtb3ZlZCh0b0luZGV4KSB7XG5cdFx0Ly9XaGVuIG1vdmUgZXZlbnQgaXMgZmlyZWQsIHRoaXMucGlubmVkIG1heSBiZSBvdXRkYXRlZCwgYXMgbW92ZSBldmVudHMgYXJlIGZpcmVkIGJlZm9yZSBvblVwZGF0ZWQgZXZlbnRzLiBUaGVyZWZvcmUsIHRoZSBpbmRleCB0aGF0IHRoZSB0YWIgaXMgbW92aW5nIHRvIG1heSBub3QgYmUgYSBwb3NzaWJsZSBpbmRleCB0byBtb3ZlIHRvLlxuXHRcdC8vV2hlbiBwaW5uZWQgb3IgdW5waW5uZWQsIG1vdmVkUGlubmVkKCkgd2lsbCBoYW5kbGUgbW92ZVxuXG5cdFx0Y29uc3QgbmV3SW5kZXggPSB0aGlzLnBpbm5lZCA/IHRvSW5kZXggOiB0b0luZGV4IC0gcGlubmVkVGFiT3JkZXIubGVuZ3RoO1xuXHRcdGlmIChuZXdJbmRleCA8IDAgfHwgbmV3SW5kZXggPj0gdGhpcy5iZWxvbmdpbmdPcmRlci5sZW5ndGgpIHJldHVybjsgLy9UYWIgaGFzIHByb2JhYmx5IGJlZW4gcGlubmVkIG9yIHVucGlubmVkXG5cdFx0aWYgKHRoaXMuaW5kZXggPT09IG5ld0luZGV4KSByZXR1cm47XG5cblx0XHRpZiAobmV3SW5kZXggPCB0aGlzLmluZGV4KSB7XG5cdFx0XHR0aGlzLmJlbG9uZ2luZ0Rpdi5pbnNlcnRCZWZvcmUodGhpcy50YWJFbCwgdGhpcy5iZWxvbmdpbmdEaXYuY2hpbGRyZW5bbmV3SW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5iZWxvbmdpbmdEaXYuaW5zZXJ0QmVmb3JlKHRoaXMudGFiRWwsIHRoaXMuYmVsb25naW5nRGl2LmNoaWxkcmVuW25ld0luZGV4XS5uZXh0U2libGluZyk7XG5cdFx0XHQvL2FjdHMgbGlrZSBpbnNlcnRBZnRlci4gSWYgLm5leHRTaWJsaW5nIGlzIG51bGwgKGVuZCBvZiBsaXN0KSwgLmluc2VydEJlZm9yZSAqd2lsbCogcGxhY2UgYXQgZW5kXG5cdFx0fVxuXHRcdHRoaXMuYmVsb25naW5nT3JkZXIuc3BsaWNlKHRoaXMuaW5kZXgsIDEpOyAvL3JlbW92ZXNcblx0XHR0aGlzLmJlbG9uZ2luZ09yZGVyLnNwbGljZShuZXdJbmRleCwgMCwgdGhpcy5pZCk7XG5cdH1cblx0cmVtb3ZlVGFiKCkge1xuXHRcdHRoaXMuYmVsb25naW5nRGl2LnJlbW92ZUNoaWxkKHRoaXMudGFiRWwpO1xuXHRcdHRoaXMuYmVsb25naW5nT3JkZXIuc3BsaWNlKHRoaXMuaW5kZXgsIDEpOyAvL3JlbW92ZXNcblx0fVxuXHRhc3luYyByZWxvYWQoKSB7XG5cdFx0cmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy5yZWxvYWQodGhpcy5pZCk7XG5cdH1cblx0YXN5bmMgbXV0ZSgpIHtcblx0XHRyZXR1cm4gYXdhaXQgYnJvd3Nlci50YWJzLnVwZGF0ZSh0aGlzLmlkLCB7IG11dGVkOiB0cnVlIH0pO1xuXHR9XG5cdGFzeW5jIHVubXV0ZSgpIHtcblx0XHRyZXR1cm4gYXdhaXQgYnJvd3Nlci50YWJzLnVwZGF0ZSh0aGlzLmlkLCB7IG11dGVkOiBmYWxzZSB9KTtcblx0fVxuXHRhc3luYyBkdXBsaWNhdGUoKSB7XG5cdFx0cmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy5kdXBsaWNhdGUodGhpcy5pZCk7XG5cdH1cblx0YXN5bmMgcGluKCkge1xuXHRcdHJldHVybiBhd2FpdCBicm93c2VyLnRhYnMudXBkYXRlKHRoaXMuaWQsIHsgcGlubmVkOiB0cnVlIH0pO1xuXHR9XG5cdGFzeW5jIHVucGluKCkge1xuXHRcdHJldHVybiBhd2FpdCBicm93c2VyLnRhYnMudXBkYXRlKHRoaXMuaWQsIHsgcGlubmVkOiBmYWxzZSB9KTtcblx0fVxuXHRhc3luYyBib29rbWFyaygpIHtcblx0XHRyZXR1cm4gYXdhaXQgYnJvd3Nlci5ib29rbWFya3MuY3JlYXRlKHsgdGl0bGU6IHRoaXMudGl0bGUsIHVybDogdGhpcy51cmwgfSk7XG5cdH1cblx0YXN5bmMgY2xvc2UoKSB7XG5cdFx0cmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy5yZW1vdmUodGhpcy5pZCk7XG5cdH1cblx0YXN5bmMgZGlzY2FyZCgpIHtcblx0XHRhd2FpdCBicm93c2VyLnRhYnMuZGlzY2FyZCh0aGlzLmlkKTtcblx0fVxuXHRhc3luYyByZW9wZW5XaXRoQ29va2llU3RvcmVJZChjb29raWVTdG9yZUlkKSB7XG5cdFx0YXdhaXQgYnJvd3Nlci50YWJzLmNyZWF0ZSh7XG5cdFx0XHRhY3RpdmU6IHRoaXMuYWN0aXZlLFxuXHRcdFx0Li4uKGNvb2tpZVN0b3JlSWQgPyB7IGNvb2tpZVN0b3JlSWQgfSA6IHt9KSxcblx0XHRcdGRpc2NhcmRlZDogdGhpcy5kaXNjYXJkZWQsXG5cdFx0XHQuLi4odGhpcy5kaXNjYXJkZWQgPyB7IHRpdGxlOiB0aGlzLnRpdGxlIH0gOiB7fSksXG5cdFx0XHRpbmRleDogdGhpcy5icm93c2VySW5kZXgsXG5cdFx0XHRwaW5uZWQ6IHRoaXMucGlubmVkLFxuXHRcdFx0Li4uKHRoaXMudXJsICE9PSBcImFib3V0Om5ld3RhYlwiID8geyB1cmw6IHRoaXMudXJsIH0gOiB7fSksXG5cdFx0fSk7XG5cdFx0YXdhaXQgdGhpcy5jbG9zZSgpO1xuXHR9XG5cblx0Z2V0IGRpc2NhcmRhYmxlKCkge1xuXHRcdHJldHVybiAhdGhpcy5kaXNjYXJkZWQgJiYgIXRoaXMuYWN0aXZlO1xuXHR9XG5cdGdldCBpc1Jlb3BlbmFibGUoKSB7XG5cdFx0Y29uc3QgeyBwcm90b2NvbCB9ID0gbmV3IFVSTCh0aGlzLnVybCk7XG5cdFx0cmV0dXJuIFtcImh0dHA6XCIsIFwiaHR0cHM6XCJdLmluZGV4T2YocHJvdG9jb2wpICE9IC0xIHx8IHRoaXMudXJsID09PSBcImFib3V0Om5ld3RhYlwiO1xuXHR9XG5cdGNyZWF0ZVRhYkVsKCkge1xuXHRcdGNvbnN0IHRhYkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRjb25zdCBjb250YWluZXJJbmRpY2F0b3JFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0dGFiRWwuYXBwZW5kQ2hpbGQoY29udGFpbmVySW5kaWNhdG9yRWwpO1xuXHRcdGNvbnN0IGZhdmljb25FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5cdFx0dGFiRWwuYXBwZW5kQ2hpbGQoZmF2aWNvbkVsKTtcblx0XHRjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHR0YWJFbC5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcblx0XHRjb25zdCB0YWJDbG9zZUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5cdFx0dGFiRWwuYXBwZW5kQ2hpbGQodGFiQ2xvc2VCdG4pO1xuXG5cdFx0dGFiRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcblx0XHRcdGF3YWl0IGJyb3dzZXIudGFicy51cGRhdGUodGhpcy5pZCwgeyBhY3RpdmU6IHRydWUgfSk7XG5cdFx0fSk7XG5cdFx0dGFiRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsICgpID0+IHNob3dUYWJNZW51KHRoaXMpKTtcblx0XHR0YWJFbC5kcmFnZ2FibGUgPSB0cnVlO1xuXHRcdHRhYkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgZSA9PiB7XG5cdFx0XHRlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC94LW1vei11cmxcIiwgYCR7dGhpcy51cmx9XFxuJHt0aGlzLnRpdGxlfWApO1xuXHRcdFx0ZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvdXJpLWxpc3RcIiwgdGhpcy51cmwpO1xuXHRcdFx0ZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgdGhpcy51cmwpO1xuXHRcdFx0ZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwiY29weU1vdmVcIjtcblx0XHRcdGUuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImludmlzaWJsZURyYWdJbWFnZVwiKSwgMCwgMCk7XG5cdFx0fSk7XG5cdFx0dGFiRWwuY2xhc3NMaXN0LmFkZChcInRhYlwiKTtcblxuXHRcdHRpdGxlRWwuY2xhc3NMaXN0LmFkZChcInRhYlRleHRcIik7XG5cblx0XHR0YWJDbG9zZUJ0bi5jbGFzc0xpc3QuYWRkKFwidGFiQ2xvc2VCdG5cIik7XG5cdFx0dGFiQ2xvc2VCdG4uc3JjID0gYnJvd3Nlci5ydW50aW1lLmdldFVSTChcImFzc2V0cy9jbG9zZS5zdmdcIik7XG5cdFx0dGFiQ2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIGUgPT4ge1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9KTtcblx0XHRjb250YWluZXJJbmRpY2F0b3JFbC5jbGFzc0xpc3QuYWRkKFwiY29udGFpbmVySW5kaWNhdG9yXCIpO1xuXG5cdFx0ZmF2aWNvbkVsLmNsYXNzTGlzdC5hZGQoXCJ0YWJJY29uXCIpO1xuXHRcdGZhdmljb25FbC5zcmMgPSBcIlwiO1xuXG5cdFx0cmV0dXJuIHsgdGFiRWwsIHRpdGxlRWwsIGZhdmljb25FbCwgY29udGFpbmVySW5kaWNhdG9yRWwgfTtcblx0fVxufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld1RhYihjcmVhdGVPcHRpb25zID0ge30pIHtcblx0cmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy5jcmVhdGUoY3JlYXRlT3B0aW9ucyk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdG9yZUNsb3NlZFRhYigpIHtcblx0Y29uc3QgbGFzdENsb3NlZCA9IGF3YWl0IGJyb3dzZXIuc2Vzc2lvbnMuZ2V0UmVjZW50bHlDbG9zZWQoKTtcblx0aWYgKCFsYXN0Q2xvc2VkLmxlbmd0aCkgcmV0dXJuO1xuXHRjb25zdCBsYXN0VGFiID0gbGFzdENsb3NlZC5maW5kKGUgPT4gZS50YWIgJiYgZS50YWIud2luZG93SWQgPT09IFdJTl9JRCk/LnRhYjtcblx0aWYgKCFsYXN0VGFiKSByZXR1cm47XG5cdHJldHVybiBhd2FpdCBicm93c2VyLnNlc3Npb25zLnJlc3RvcmUobGFzdFRhYi5zZXNzaW9uSWQpO1xufVxuIiwiZXhwb3J0cy5pbnRlcm9wRGVmYXVsdCA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIGEgJiYgYS5fX2VzTW9kdWxlID8gYSA6IHtkZWZhdWx0OiBhfTtcbn07XG5cbmV4cG9ydHMuZGVmaW5lSW50ZXJvcEZsYWcgPSBmdW5jdGlvbihhKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xufTtcblxuZXhwb3J0cy5leHBvcnRBbGwgPSBmdW5jdGlvbihzb3VyY2UsIGRlc3QpIHtcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChrZXkgPT09ICdkZWZhdWx0JyB8fCBrZXkgPT09ICdfX2VzTW9kdWxlJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNraXAgZHVwbGljYXRlIHJlLWV4cG9ydHMgd2hlbiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUuXG4gICAgaWYgKGtleSBpbiBkZXN0ICYmIGRlc3Rba2V5XSA9PT0gc291cmNlW2tleV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwga2V5LCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVtrZXldO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG5leHBvcnRzLmV4cG9ydCA9IGZ1bmN0aW9uKGRlc3QsIGRlc3ROYW1lLCBnZXQpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIGRlc3ROYW1lLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGdldCxcbiAgfSk7XG59O1xuIl0sIm5hbWVzIjpbXSwidmVyc2lvbiI6MywiZmlsZSI6InNpZGViYXIuSEFTSF9SRUZfYmI3NTcwMDY2ZDVmODgyMy5qcy5tYXAifQ==
