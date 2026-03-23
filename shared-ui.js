window.TestConsoleState = {
  latestGoogleToken: "",
  omiseCdnMode: "STAGING",
  omiseCdnUrl: ""
};

const OMISE_CDN_URLS = {
  STAGING: "https://cdn.staging-omise.co/omise.js",
  PRODUCTION: "https://cdn.omise.co/omise.js"
};

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupOmiseModeTabs();
  setupCopyHandlers();
  setupOmiseCdnMode();
  syncMerchantIdToOmiseTab();
});

function setupTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tab);
    });
  });
}

function switchTab(tabName) {
  const isGoogleTab = tabName === "google";

  const tabGoogle = document.getElementById("tabGoogle");
  const tabOmise = document.getElementById("tabOmise");
  const panelGoogle = document.getElementById("panelGoogle");
  const panelOmise = document.getElementById("panelOmise");

  tabGoogle.classList.toggle("active", isGoogleTab);
  tabGoogle.setAttribute("aria-selected", String(isGoogleTab));
  tabOmise.classList.toggle("active", !isGoogleTab);
  tabOmise.setAttribute("aria-selected", String(!isGoogleTab));

  panelGoogle.classList.toggle("active", isGoogleTab);
  panelGoogle.hidden = !isGoogleTab;
  panelOmise.classList.toggle("active", !isGoogleTab);
  panelOmise.hidden = isGoogleTab;
}

function setupCopyHandlers() {
  const copyGooglePayloadBtn = document.getElementById("copyGooglePayloadBtn");
  const copyOmiseResponseBtn = document.getElementById("copyOmiseResponseBtn");

  copyGooglePayloadBtn.addEventListener("click", () => {
    const payload = document.getElementById("googlePayloadOutput").textContent;
    copyText(payload);
  });

  copyOmiseResponseBtn.addEventListener("click", () => {
    const response = document.getElementById("omiseResponseOutput").textContent;
    copyText(response);
  });
}

function setupOmiseModeTabs() {
  document.querySelectorAll(".subtab-button").forEach((button) => {
    button.addEventListener("click", () => {
      switchOmiseMode(button.dataset.omiseMode);
    });
  });
}

function setupOmiseCdnMode() {
  const modeSelect = document.getElementById("omiseCdnMode");
  if (!modeSelect) return;

  modeSelect.addEventListener("change", () => {
    loadOmiseScriptByMode(modeSelect.value);
  });

  loadOmiseScriptByMode(modeSelect.value);
}

function loadOmiseScriptByMode(mode) {
  const normalizedMode = mode === "PRODUCTION" ? "PRODUCTION" : "STAGING";
  const scriptUrl = OMISE_CDN_URLS[normalizedMode];
  const statusElem = document.getElementById("omiseScriptStatus");

  window.TestConsoleState.omiseCdnMode = normalizedMode;
  window.TestConsoleState.omiseCdnUrl = scriptUrl;

  if (statusElem) {
    statusElem.classList.remove("status-ok", "status-error");
    statusElem.textContent = "Loading Omise.js from " + normalizedMode + "...";
  }

  const existingScript = document.getElementById("omiseRuntimeScript");
  if (existingScript) existingScript.remove();

  // Ensure subsequent calls use the newly selected CDN build.
  window.Omise = undefined;
  window.OmiseCard = undefined;

  const script = document.createElement("script");
  script.id = "omiseRuntimeScript";
  script.src = scriptUrl;
  script.async = true;
  script.onload = () => {
    if (!statusElem) return;
    statusElem.classList.remove("status-error");
    statusElem.classList.add("status-ok");
    statusElem.textContent = "Loaded " + normalizedMode + " Omise.js";
  };
  script.onerror = () => {
    if (!statusElem) return;
    statusElem.classList.remove("status-ok");
    statusElem.classList.add("status-error");
    statusElem.textContent = "Failed to load Omise.js from " + scriptUrl;
  };

  document.body.appendChild(script);
}

function switchOmiseMode(mode) {
  const isPrebuilt = mode === "prebuilt";
  const prebuiltTab = document.getElementById("modePrebuiltTab");
  const customTab = document.getElementById("modeCustomTab");
  const prebuiltPanel = document.getElementById("modePrebuiltPanel");
  const customPanel = document.getElementById("modeCustomPanel");

  prebuiltTab.classList.toggle("active", isPrebuilt);
  prebuiltTab.setAttribute("aria-selected", String(isPrebuilt));
  customTab.classList.toggle("active", !isPrebuilt);
  customTab.setAttribute("aria-selected", String(!isPrebuilt));

  prebuiltPanel.classList.toggle("active", isPrebuilt);
  prebuiltPanel.hidden = !isPrebuilt;
  customPanel.classList.toggle("active", !isPrebuilt);
  customPanel.hidden = isPrebuilt;
}

function syncMerchantIdToOmiseTab() {
  const source = document.getElementById("merchantId");
  const target = document.getElementById("omiseGooglePayMerchantId");
  if (!source || !target) return;
  target.value = source.value.trim();
}

function copyText(text) {
  if (!text || !text.trim()) {
    alert("Nothing to copy yet.");
    return;
  }

  if (!navigator.clipboard) {
    alert("Clipboard API is not available in this browser.");
    return;
  }

  navigator.clipboard.writeText(text).catch((error) => {
    alert("Copy failed: " + error);
  });
}
