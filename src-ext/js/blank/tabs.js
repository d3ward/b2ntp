let _tabs = [];
let _container = null;

export function initTabs({ container, ntoast }) {
  _container = container;
  renderTabs();
  registerEventListeners();
}

export function getTabs() {
  return _tabs;
}

function renderTabs() {
  if (typeof chrome === "undefined" || !chrome.tabs) return;
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    _tabs = tabs;
    if (typeof chrome.tabGroups !== "undefined") {
      const windowId = tabs[0]?.windowId;
      chrome.tabGroups.query({ windowId }, (groups) => {
        render(tabs, groups || []);
      });
    } else {
      render(tabs, []);
    }
  });
}

function render(tabs, groups) {
  const body = _container;
  if (!body) return;

  body.innerHTML = "";
  body.appendChild(createCount(tabs.length));

  const TAB_GROUP_ID_NONE =
    typeof chrome.tabGroups !== "undefined"
      ? chrome.tabGroups.TAB_GROUP_ID_NONE
      : -1;

  const pinned = tabs.filter((t) => t.pinned);

  const groupMap = {};
  groups.forEach((g) => {
    groupMap[g.id] = { group: g, tabs: [] };
  });

  const ungrouped = [];
  tabs.forEach((tab) => {
    if (tab.pinned) return;
    if (tab.groupId && tab.groupId !== TAB_GROUP_ID_NONE && groupMap[tab.groupId]) {
      groupMap[tab.groupId].tabs.push(tab);
    } else {
      ungrouped.push(tab);
    }
  });

  const fragment = document.createDocumentFragment();

  if (pinned.length > 0) {
    fragment.appendChild(createSection("Pinned", pinned));
  }

  groups.forEach((group) => {
    const entry = groupMap[group.id];
    if (entry && entry.tabs.length > 0) {
      fragment.appendChild(createGroupSection(group, entry.tabs));
    }
  });

  if (ungrouped.length > 0) {
    fragment.appendChild(createSection("Tabs", ungrouped));
  }

  body.appendChild(fragment);
}

function createCount(count) {
  const el = document.createElement("div");
  el.className = "tabs-count";
  el.textContent = `${count} tab${count === 1 ? "" : "s"}`;
  return el;
}

function createSection(title, tabs) {
  const section = document.createElement("div");
  section.className = "tab-section";

  const titleEl = document.createElement("div");
  titleEl.className = "tab-section-title";
  titleEl.textContent = title;
  section.appendChild(titleEl);

  tabs.forEach((tab) => section.appendChild(createTabItem(tab)));
  return section;
}

function createGroupSection(group, tabs) {
  const section = document.createElement("div");
  section.className = "tab-section tab-group-section";

  const header = document.createElement("div");
  header.className = "tab-group-header";
  header.style.borderLeftColor = group.color;
  header.textContent = group.title || "Unnamed group";
  section.appendChild(header);

  tabs.forEach((tab) => section.appendChild(createTabItem(tab)));
  return section;
}

function createTabItem(tab) {
  const item = document.createElement("div");
  item.className = "tab-item" + (tab.active ? " active" : "");
  item.dataset.tabId = tab.id;

  const faviconDiv = document.createElement("div");
  faviconDiv.className = "tab-favicon";

  const img = document.createElement("img");
  img.alt = "";

  const avatar = document.createElement("span");
  avatar.className = "tab-avatar";
  avatar.textContent = (tab.title || "?")[0].toUpperCase();
  avatar.style.backgroundColor = getColorFromString(tab.title || "");

  if (tab.favIconUrl) {
    img.src = tab.favIconUrl;
    img.addEventListener("error", () => {
      img.style.display = "none";
      avatar.style.display = "flex";
    });
    avatar.style.display = "none";
  } else {
    img.style.display = "none";
  }

  faviconDiv.appendChild(img);
  faviconDiv.appendChild(avatar);

  const titleEl = document.createElement("span");
  titleEl.className = "tab-title";
  titleEl.textContent = tab.title || "";

  const closeBtn = document.createElement("button");
  closeBtn.className = "tab-close";
  closeBtn.setAttribute("aria-label", "Close tab");
  closeBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    chrome.tabs.remove(tab.id);
  });

  item.addEventListener("click", () => {
    chrome.tabs.update(tab.id, { active: true });
  });

  item.appendChild(faviconDiv);
  item.appendChild(titleEl);
  item.appendChild(closeBtn);
  return item;
}

function getColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = ((hash % 360) + 360) % 360;
  return `hsl(${h}, 50%, 45%)`;
}

function registerEventListeners() {
  if (typeof chrome === "undefined" || !chrome.tabs) return;
  try {
    chrome.tabs.onCreated.addListener(renderTabs);
    chrome.tabs.onRemoved.addListener(renderTabs);
    chrome.tabs.onMoved.addListener(renderTabs);
    chrome.tabs.onActivated.addListener(renderTabs);
    chrome.tabs.onUpdated.addListener(renderTabs);
  } catch (e) {
    console.warn("tabs listeners:", e);
  }
  if (typeof chrome.tabGroups !== "undefined") {
    try {
      chrome.tabGroups.onCreated.addListener(renderTabs);
      chrome.tabGroups.onRemoved.addListener(renderTabs);
      chrome.tabGroups.onUpdated.addListener(renderTabs);
    } catch (e) {
      console.warn("tabGroups listeners:", e);
    }
  }
}
