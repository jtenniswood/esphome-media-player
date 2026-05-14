(function () {
  "use strict";

  var CSS = __MEDIA_PLAYER_CSS__;

  var viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.name = "viewport";
    document.head.appendChild(viewport);
  }
  viewport.content = "width=device-width, initial-scale=1";

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  var fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(fonts);

  var faviconSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"#5c73e7\" d=\"M12,3L2,12H5V20H19V12H22L12,3M12,8.5C14.34,8.5 16.46,9.43 18,10.94L16.8,12.12C15.58,10.91 13.88,10.17 12,10.17C10.12,10.17 8.42,10.91 7.2,12.12L6,10.94C7.54,9.43 9.66,8.5 12,8.5M12,11.83C13.4,11.83 14.67,12.39 15.6,13.3L14.4,14.47C13.79,13.87 12.94,13.5 12,13.5C11.06,13.5 10.21,13.87 9.6,14.47L8.4,13.3C9.33,12.39 10.6,11.83 12,11.83M12,15.17C12.94,15.17 13.7,15.91 13.7,16.83C13.7,17.75 12.94,18.5 12,18.5C11.06,18.5 10.3,17.75 10.3,16.83C10.3,15.91 11.06,15.17 12,15.17Z\"/></svg>";
  var favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/svg+xml";
  favicon.href = "data:image/svg+xml," + encodeURIComponent(faviconSvg);
  document.head.appendChild(favicon);

  var DEFAULT_SPEAKER_PANEL_TIMEOUT = 10;
  var SPEAKER_PANEL_TIMEOUT_OPTIONS = [5, 10, 20, 30, 60];
  var S3_DEVICE_PROFILE = "guition-esp32-s3-4848s040";
  var WEB_ACTIVITY_HEARTBEAT_MS = 10000;
  var FIRMWARE_INSTALL_REFRESH_MS = 5000;
  var FIRMWARE_INSTALL_REFRESH_TIMEOUT_MS = 300000;
  var FIRMWARE_PUBLIC_MANIFEST_BASE = "https://jtenniswood.github.io/esphome-media-player/firmware/";
  var FIRMWARE_MANIFEST_SLUGS = {
    "esp32-p4-86-panel": "p4-86-panel",
    "guition-esp32-p4-jc1060p470": "jc1060p470",
    "guition-esp32-p4-jc4880p443": "jc4880p443",
    "guition-esp32-p4-jc8012p4a1": "jc8012p4a1",
    "guition-esp32-s3-4848s040": "4848s040"
  };

  var S = {
    media_player: "",
    linked_media_player: "",
    day_night_sensor: "",
    show_remaining_time: true,
    show_progress_bar: true,
    auto_show_track_info: true,
    track_info_duration: 5,
    speaker_panel_timeout: DEFAULT_SPEAKER_PANEL_TIMEOUT,
    day_active_brightness: 100,
    night_active_brightness: 80,
    day_dim_brightness: 35,
    night_dim_brightness: 25,
    paused_dimming_enabled: true,
    dim_timeout: 60,
    screen_saver_enabled: true,
    screen_saver_timeout: 300,
    day_clock_brightness: 35,
    evening_clock_brightness: 35,
    day_idle_action: "Clock",
    night_idle_action: "Clock",
    schedule_enabled: false,
    schedule_on_hour: 6,
    schedule_off_hour: 20,
    schedule_wake_timeout: 60,
    screen_warmth_day: 30,
    screen_warmth_night: 60,
    clock_time_format: "24 Hour",
    clock_time_format_options: ["24 Hour", "12 Hour"],
    clock_timezone: "UTC (GMT+0)",
    clock_timezone_options: ["UTC (GMT+0)"],
    screen_rotation: "0",
    screen_rotation_options: ["0", "90", "180", "270"],
    auto_update: true,
    update_frequency: "Daily",
    update_frequency_options: ["Hourly", "Daily", "Weekly"],
    firmware_state: "",
    installed_version: "",
    latest_version: "",
    firmware_release_url: "",
    firmware_checking: false,
    update_available: false,
    developer_experimental_features: false,
    device_profile: "",
    online: false,
    wifi_strength: null,
    ip_address: ""
  };

  var ENTITIES = {
    media_player: { domain: "text", name: "Media Player" },
    linked_media_player: { domain: "text", name: "Linked Media Player" },
    day_night_sensor: { domain: "text", name: "Day-Night Sensor" },
    show_remaining_time: { domain: "switch", name: "Playback: Show Remaining Time", bool: true },
    show_progress_bar: { domain: "switch", name: "Playback: Show Progress Bar", bool: true },
    auto_show_track_info: { domain: "switch", name: "Playback: Auto-Show Track Info", bool: true },
    track_info_duration: { domain: "number", name: "Playback: Track Info Duration", number: true },
    speaker_panel_timeout: { domain: "number", name: "Speakers: Auto-Close Timeout", number: true },
    day_active_brightness: { domain: "number", name: "Day: Active Brightness", number: true },
    night_active_brightness: { domain: "number", name: "Night: Active Brightness", number: true },
    day_dim_brightness: { domain: "number", name: "Day: Dim Brightness", number: true },
    night_dim_brightness: { domain: "number", name: "Night: Dim Brightness", number: true },
    paused_dimming_enabled: { domain: "switch", name: "Screen Saver: Dim When Paused", bool: true },
    dim_timeout: { domain: "number", name: "Screen Saver: Paused Dimming", number: true },
    screen_saver_enabled: { domain: "switch", name: "Screen Saver: Enabled", bool: true },
    screen_saver_timeout: { domain: "number", name: "Screen Saver: Timer", number: true },
    day_clock_brightness: { domain: "number", name: "Screen Saver: Clock Brightness", number: true },
    evening_clock_brightness: { domain: "number", name: "Screen Saver: Evening Clock Brightness", number: true },
    day_idle_action: { domain: "select", name: "Screen: Day Idle Action", optionsKey: "idle_action_options" },
    night_idle_action: { domain: "select", name: "Screen: Night Idle Action", optionsKey: "idle_action_options" },
    schedule_enabled: { domain: "switch", name: "Screen: Schedule Enabled", bool: true },
    schedule_on_hour: { domain: "number", name: "Screen: Schedule On Hour", number: true },
    schedule_off_hour: { domain: "number", name: "Screen: Schedule Off Hour", number: true },
    schedule_wake_timeout: { domain: "number", name: "Screen: Schedule Wake Timeout", number: true },
    screen_warmth_day: { domain: "number", name: "Day: Screen Warmth", number: true },
    screen_warmth_night: { domain: "number", name: "Night: Screen Warmth", number: true },
    clock_time_format: { domain: "select", name: "Clock: Time Format", optionsKey: "clock_time_format_options" },
    clock_timezone: { domain: "select", name: "Screen: Timezone", optionsKey: "clock_timezone_options" },
    screen_rotation: { domain: "select", name: "Screen Rotation", optionsKey: "screen_rotation_options" },
    auto_update: { domain: "switch", name: "Firmware: Auto Update", bool: true },
    update_frequency: { domain: "select", name: "Firmware: Update Frequency", optionsKey: "update_frequency_options" },
    firmware_version: {
      domain: "text_sensor",
      name: "Firmware: Version",
      firmwareVersion: true,
      fetchNames: ["firmware__version", "firmware_version", "firmware_version_sensor"]
    },
    firmware_update: { domain: "update", name: "Firmware: Update", update: true },
    check_latest: { domain: "button", name: "Firmware: Check for Update", skipFetch: true },
    developer_experimental_features: { domain: "switch", name: "Developer: Experimental Features", bool: true },
    device_profile: { domain: "text_sensor", name: "Device Profile" },
    online: { domain: "binary_sensor", name: "Online", bool: true },
    wifi_strength: { domain: "sensor", name: "Wifi Strength", number: true },
    ip_address: { domain: "text_sensor", name: "IP Address" }
  };

  var NUMBER_LIMITS = {
    track_info_duration: { min: 0, max: 60, step: 1, suffix: "s" },
    speaker_panel_timeout: { min: 0, max: 60, step: 1, suffix: "s" },
    day_active_brightness: { min: 5, max: 100, step: 5, suffix: "%" },
    night_active_brightness: { min: 5, max: 100, step: 5, suffix: "%" },
    day_dim_brightness: { min: 0, max: 100, step: 5, suffix: "%" },
    night_dim_brightness: { min: 0, max: 100, step: 5, suffix: "%" },
    dim_timeout: { min: 1, max: 600, step: 1, suffix: "s" },
    screen_saver_timeout: { min: 1, max: 1800, step: 1, suffix: "s" },
    day_clock_brightness: { min: 1, max: 100, step: 1, suffix: "%" },
    evening_clock_brightness: { min: 1, max: 100, step: 1, suffix: "%" },
    schedule_on_hour: { min: 0, max: 23, step: 1, suffix: "h" },
    schedule_off_hour: { min: 0, max: 23, step: 1, suffix: "h" },
    schedule_wake_timeout: { min: 10, max: 3600, step: 10, suffix: "s" },
    screen_warmth_day: { min: 0, max: 100, step: 5, suffix: "%" },
    screen_warmth_night: { min: 0, max: 100, step: 5, suffix: "%" }
  };

  var els = {};
  var currentTab = "settings";
  var renderTimer = null;
  var evtSource = null;
  var cardCollapsed = {};
  var lastSpeakerPanelTimeout = DEFAULT_SPEAKER_PANEL_TIMEOUT;
  var webActivityTimer = null;
  var webActivityStarted = false;
  var webActivityClosed = false;
  var firmwareInstallRefreshTimer = null;
  var firmwareInstallRefreshStarted = 0;
  var lastPublicFirmwareProfile = "";

  function eid(domain, name) {
    return "/" + domain + "/" + encodeURIComponent(name);
  }

  function endpoint(key) {
    var e = ENTITIES[key];
    return eid(e.domain, e.name);
  }

  function slug(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  var ID_TO_KEY = {};
  Object.keys(ENTITIES).forEach(function (key) {
    var e = ENTITIES[key];
    ID_TO_KEY[e.domain + "/" + e.name] = key;
    ID_TO_KEY[e.domain + "-" + slug(e.name)] = key;
    (e.fetchNames || []).forEach(function (name) {
      ID_TO_KEY[e.domain + "/" + name] = key;
      ID_TO_KEY[e.domain + "-" + slug(name)] = key;
    });
  });

  function eventId(d) {
    return (d && (d.name_id || d.id)) || "";
  }

  function safeGet(url) {
    return fetch(url, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) return null;
        return r.json();
      })
      .catch(function () {
        return null;
      });
  }

  function safeGetFirst(urls) {
    return Promise.all(urls.map(safeGet)).then(function (results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i]) return results[i];
      }
      return null;
    });
  }

  function fetchUrlsForEntity(key) {
    var spec = ENTITIES[key];
    var names = [spec.name].concat(spec.fetchNames || []);
    var seen = {};
    return names.map(function (name) {
      var url = eid(spec.domain, name);
      if (spec.optionsKey) url += "?detail=all";
      return url;
    }).filter(function (url) {
      if (seen[url]) return false;
      seen[url] = true;
      return true;
    });
  }

  function post(url, params) {
    var fullUrl = params ? url + "?" + new URLSearchParams(params).toString() : url;
    return fetch(fullUrl, { method: "POST" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r;
    }).catch(function (err) {
      console.error("POST " + fullUrl + " failed:", err);
      showBanner("Failed to save setting", "error");
      return null;
    });
  }

  function setInstalledVersion(value) {
    value = String(value == null ? "" : value).trim();
    if (!value) return;
    if (isSpecificFirmwareVersion(S.installed_version) && !isSpecificFirmwareVersion(value)) return;
    S.installed_version = value;
    S.update_available = firmwareUpdateAvailable();
  }

  function postQuiet(url) {
    return fetch(url, { method: "POST", keepalive: true }).catch(function () {
      return null;
    });
  }

  function isS3Display() {
    return S.device_profile === S3_DEVICE_PROFILE;
  }

  function isDeveloperExperimentalMode() {
    try {
      return new URLSearchParams(window.location.search).get("developer") === "experimental";
    } catch (_) {
      return false;
    }
  }

  function webActivityEndpoint(name) {
    return eid("button", name) + "/press";
  }

  function sendWebActivityHeartbeat() {
    if (!isS3Display()) return;
    webActivityStarted = true;
    webActivityClosed = false;
    postQuiet(webActivityEndpoint("Web Settings Heartbeat"));
  }

  function startWebActivityHeartbeat() {
    if (!isS3Display() || webActivityTimer) return;
    sendWebActivityHeartbeat();
    webActivityTimer = setInterval(sendWebActivityHeartbeat, WEB_ACTIVITY_HEARTBEAT_MS);
  }

  function stopWebActivityHeartbeat() {
    if (webActivityTimer) {
      clearInterval(webActivityTimer);
      webActivityTimer = null;
    }
    if (webActivityStarted && !webActivityClosed && isS3Display()) {
      webActivityClosed = true;
      postQuiet(webActivityEndpoint("Web Settings Closed"));
    }
  }

  function postText(url, value) {
    var body = new URLSearchParams();
    body.set("value", value == null ? "" : String(value));
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r;
    }).catch(function (err) {
      console.error("POST " + url + " failed:", err);
      showBanner("Failed to save setting", "error");
      return null;
    });
  }

  function applyEntityToState(key, data) {
    var spec = ENTITIES[key];
    if (!spec || !data) return;

    if (spec.firmwareVersion) {
      setInstalledVersion(data.state != null ? data.state : data.value);
      return;
    }

    if (spec.update) {
      S.firmware_state = String(data.state || "").trim().toUpperCase();
      setInstalledVersion(data.current_version || data.current || "");
      S.latest_version = data.latest_version || data.value || "";
      S.firmware_release_url = data.release_url || S.firmware_release_url || "";
      S.update_available = firmwareUpdateAvailable();
      if (S.firmware_state) S.firmware_checking = false;
      return;
    }

    if (spec.optionsKey && Array.isArray(data.option) && data.option.length) {
      S[spec.optionsKey] = data.option.slice();
    }

    var v = data.value != null ? data.value : data.state;
    if (spec.bool) {
      S[key] = v === true || v === "ON";
    } else if (spec.number) {
      var n = Number(v);
      if (!isNaN(n)) {
        S[key] = n;
        if (key === "speaker_panel_timeout" && n > 0) {
          lastSpeakerPanelTimeout = normalizeDurationOption(n, SPEAKER_PANEL_TIMEOUT_OPTIONS, DEFAULT_SPEAKER_PANEL_TIMEOUT);
        }
      }
    } else if (v != null) {
      S[key] = String(v);
    }

    if (key === "device_profile") {
      startWebActivityHeartbeat();
      if (S.device_profile !== lastPublicFirmwareProfile) {
        lastPublicFirmwareProfile = S.device_profile;
        refreshPublicFirmwareState().then(scheduleRender);
      }
    }
  }

  function fetchEntity(key) {
    var spec = ENTITIES[key];
    if (!spec || spec.skipFetch) return Promise.resolve();
    return safeGetFirst(fetchUrlsForEntity(key)).then(function (data) {
      if (data) applyEntityToState(key, data);
      return data;
    });
  }

  function fetchAllState() {
    return Promise.all(Object.keys(ENTITIES).map(fetchEntity));
  }

  function refreshFirmwareState() {
    return Promise.all([fetchEntity("firmware_update"), refreshPublicFirmwareState()]).then(function (results) {
      var data = results[0];
      if (!data && !results[1]) return;
      if (S.firmware_state !== "INSTALLING") stopFirmwareInstallRefresh();
      scheduleRender();
    });
  }

  function startFirmwareInstallRefresh() {
    stopFirmwareInstallRefresh();
    firmwareInstallRefreshStarted = Date.now();
    firmwareInstallRefreshTimer = setInterval(function () {
      if (Date.now() - firmwareInstallRefreshStarted > FIRMWARE_INSTALL_REFRESH_TIMEOUT_MS) {
        stopFirmwareInstallRefresh();
        return;
      }
      refreshFirmwareState();
    }, FIRMWARE_INSTALL_REFRESH_MS);
  }

  function stopFirmwareInstallRefresh() {
    if (!firmwareInstallRefreshTimer) return;
    clearInterval(firmwareInstallRefreshTimer);
    firmwareInstallRefreshTimer = null;
  }

  function buildUI() {
    var root = el("div");
    root.id = "mp-app";

    var banner = el("div", "banner");
    banner.style.display = "none";
    root.appendChild(banner);
    els.banner = banner;

    buildHeader(root);
    buildPage(root, "settings");
    buildPage(root, "device");
    root.appendChild(buildSupportButton());

    var espApp = document.querySelector("esp-app");
    if (espApp) espApp.parentNode.insertBefore(root, espApp);
    else document.body.insertBefore(root, document.body.firstChild);

    els.root = root;
    switchTab("settings");
  }

  function buildSupportButton() {
    var link = document.createElement("a");
    link.className = "sp-support-btn";
    link.href = "https://www.buymeacoffee.com/jtenniswood";
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = '<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" style="border-radius:999px;">';
    return link;
  }

  function buildHeader(parent) {
    var header = el("div", "mp-header");
    var brand = el("div", "mp-brand");
    brand.textContent = "EspMedia";
    header.appendChild(brand);

    var nav = el("nav", "mp-nav");
    nav.setAttribute("aria-label", "Primary");
    [
      { id: "settings", label: "Settings" },
      { id: "device", label: "Device" }
    ].forEach(function (tab) {
      var node = el("div", "mp-tab");
      node.setAttribute("role", "tab");
      node.setAttribute("aria-selected", "false");
      node.textContent = tab.label;
      node.onclick = function () { switchTab(tab.id); };
      nav.appendChild(node);
      els["tab_" + tab.id] = node;
    });
    var docs = document.createElement("a");
    docs.className = "mp-tab mp-tab-docs";
    docs.href = "https://jtenniswood.github.io/esphome-media-player/";
    docs.target = "_blank";
    docs.rel = "noopener";
    docs.innerHTML = 'Docs <span class="mp-docs-icon">&#8599;</span>';
    nav.appendChild(docs);
    header.appendChild(nav);
    parent.appendChild(header);
  }

  function buildPage(parent, id) {
    var page = el("div", "mp-page");
    page.id = "mp-" + id;
    var wrap = el("div", "mp-wrap");
    page.appendChild(wrap);
    parent.appendChild(page);
    els[id + "Page"] = page;
    els[id + "Wrap"] = wrap;
  }

  function switchTab(tab) {
    currentTab = tab;
    ["settings", "device"].forEach(function (id) {
      els["tab_" + id].className = "mp-tab" + (id === tab ? " active" : "");
      els["tab_" + id].setAttribute("aria-selected", id === tab ? "true" : "false");
      els[id + "Page"].className = "mp-page" + (id === tab ? " active" : "");
    });
  }

  function scheduleRender() {
    if (isEditingSetting()) return;
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderAll, 120);
  }

  function renderAll() {
    renderTimer = null;
    renderSettings();
    renderDevice();
    switchTab(currentTab);
  }

  function renderSettings() {
    var wrap = els.settingsWrap;
    wrap.innerHTML = "";
    var content = el("div");

    content.appendChild(setupCard());
    content.appendChild(advancedCard());
    content.appendChild(playbackCard());
    content.appendChild(volumeCard());
    content.appendChild(idleScreenCard());
    content.appendChild(screenSaverCard());
    content.appendChild(nightScheduleCard());
    if (isDeveloperExperimentalMode()) content.appendChild(developerCard());

    wrap.appendChild(content);
  }

  function setupCard() {
    var body = el("div");
    body.appendChild(textField("Media Player", "media_player", "media_player.living_room", validateMediaPlayer));
    return card("Media Player", body, true);
  }

  function advancedCard() {
    var body = el("div");
    var linkedHint = el("div", "field-hint");
    linkedHint.style.fontSize = ".9rem";
    linkedHint.style.lineHeight = "1.45";
    linkedHint.textContent = "Optional secondary media entity, for use when your speaker has line in or hdmi in.";
    body.appendChild(linkedHint);
    body.appendChild(textField("Linked Media Player", "linked_media_player", "media_player.apple_tv", validateMediaPlayer));
    return card("Advanced", body, true);
  }

  function playbackCard() {
    var body = el("div");
    body.appendChild(toggleField("Track Clock", "show_remaining_time", null, trackClockModeText));
    body.appendChild(toggleField("Show Progress Bar", "show_progress_bar"));
    if (supportsTrackInfoDuration()) {
      body.appendChild(toggleField("Auto-Show Track Info", "auto_show_track_info"));
      body.appendChild(numberField("Track Info Duration", "track_info_duration"));
    }
    return card("Playback", body, true);
  }

  function volumeCard() {
    var body = el("div");
    var timerWrap = el("div");
    var enabled = Number(S.speaker_panel_timeout) > 0;
    var badge = badgeFor(enabled);
    timerWrap.style.display = enabled ? "" : "none";
    body.appendChild(localToggleField("Speaker Panel Auto-Close", enabled, function (next) {
      var value = next
        ? normalizeDurationOption(lastSpeakerPanelTimeout || DEFAULT_SPEAKER_PANEL_TIMEOUT, SPEAKER_PANEL_TIMEOUT_OPTIONS, DEFAULT_SPEAKER_PANEL_TIMEOUT)
        : 0;
      S.speaker_panel_timeout = value;
      if (value > 0) lastSpeakerPanelTimeout = value;
      badge.className = "on-badge" + (value > 0 ? " active" : "");
      post(endpoint("speaker_panel_timeout") + "/set", { value: value }).then(renderAll);
    }));
    timerWrap.appendChild(durationSelectField("Timer", "speaker_panel_timeout", SPEAKER_PANEL_TIMEOUT_OPTIONS));
    body.appendChild(timerWrap);
    return card("Volume", body, true, badge);
  }

  function trackClockModeText() {
    return S.show_remaining_time ? "Time remaining" : "Track length";
  }

  function supportsTrackInfoDuration() {
    return S.device_profile === "esp32-p4-86-panel" || S.device_profile === "guition-esp32-s3-4848s040";
  }

  function idleScreenCard() {
    var badge = badgeFor(S.paused_dimming_enabled);
    var body = el("div");
    var details = el("div");
    details.style.display = S.paused_dimming_enabled ? "" : "none";
    body.appendChild(sectionDescription("When playback is paused."));
    body.appendChild(toggleField("Dim when idle", "paused_dimming_enabled", null, null, function (enabled) {
      details.style.display = enabled ? "" : "none";
      badge.className = "on-badge" + (enabled ? " active" : "");
    }));
    details.appendChild(durationSelectField("Dim After", "dim_timeout", [5, 10, 30, 60, 120, 300, 600]));
    details.appendChild(rangeField("Day Dimmed Brightness", "day_dim_brightness"));
    details.appendChild(rangeField("Night Dimmed Brightness", "night_dim_brightness"));
    body.appendChild(details);
    return card("Idle Screen", body, true, badge);
  }

  function screenSaverCard() {
    var badge = badgeFor(S.screen_saver_enabled);
    var body = el("div");
    var details = el("div");
    details.style.display = S.screen_saver_enabled ? "" : "none";
    body.appendChild(sectionDescription("When playback is paused and the device has been idle for a while."));
    body.appendChild(toggleField("Screen Saver", "screen_saver_enabled", null, null, function (enabled) {
      details.style.display = enabled ? "" : "none";
      badge.className = "on-badge" + (enabled ? " active" : "");
    }));
    details.appendChild(durationSelectField("Start Screen Saver After", "screen_saver_timeout", [10, 30, 60, 120, 300, 600, 1800]));
    details.appendChild(screenSaverActionField("Daytime Screen Saver", "day_idle_action", function () {
      renderAll();
    }));
    var dayDetails = el("div");
    dayDetails.style.display = usesDayClockAction() ? "" : "none";
    dayDetails.appendChild(rangeField("Day Clock Brightness", "day_clock_brightness"));
    dayDetails.appendChild(el("div", "spacer-8"));
    details.appendChild(dayDetails);
    details.appendChild(screenSaverActionField("Evening Screen Saver", "night_idle_action", function () {
      renderAll();
    }));
    var eveningDetails = el("div");
    eveningDetails.style.display = usesEveningClockAction() ? "" : "none";
    eveningDetails.appendChild(rangeField("Evening Clock Brightness", "evening_clock_brightness"));
    details.appendChild(eveningDetails);
    body.appendChild(details);
    return card("Screen Saver", body, true, badge);
  }

  function nightScheduleCard() {
    var badge = badgeFor(S.schedule_enabled);
    var body = el("div");
    body.appendChild(sectionDescription("Configure overnight device behaviour."));
    body.appendChild(toggleField("Schedule Screen Off", "schedule_enabled", null, null, function (enabled) {
      details.style.display = enabled ? "" : "none";
      badge.className = "on-badge" + (enabled ? " active" : "");
    }));

    var details = el("div");
    details.style.display = S.schedule_enabled ? "" : "none";
    details.appendChild(hourSelectField("On Time", "schedule_on_hour"));
    details.appendChild(hourSelectField("Off Time", "schedule_off_hour"));
    details.appendChild(durationSelectField("When Woken, Idle Time To Screen Off", "schedule_wake_timeout"));
    body.appendChild(details);
    return card("Night Schedule", body, true, badge);
  }

  function developerCard() {
    var badge = badgeFor(S.developer_experimental_features);
    var body = el("div");
    body.appendChild(toggleField("Developer/Experimental Features", "developer_experimental_features", null, null, function (enabled) {
      badge.className = "on-badge" + (enabled ? " active" : "");
    }));
    return card("Developer", body, true, badge);
  }

  function screenBrightnessCard() {
    var body = el("div");
    body.appendChild(rangeField("Day Active Brightness", "day_active_brightness"));
    body.appendChild(rangeField("Night Active Brightness", "night_active_brightness"));
    return card("Screen Brightness", body, true);
  }

  function sectionTitle(text) {
    var title = el("div", "section-title");
    title.textContent = text;
    return title;
  }

  function sectionDescription(text) {
    var description = el("p", "field-hint");
    description.style.fontSize = ".9rem";
    description.style.lineHeight = "1.45";
    description.style.marginTop = "-2px";
    description.style.marginBottom = "18px";
    description.textContent = text;
    return description;
  }

  function divider() {
    return el("div", "setting-divider");
  }

  function dayNightCard() {
    var body = el("div");
    body.appendChild(textField("Day/Night Source", "day_night_sensor", "binary_sensor.daytime", validateDayNightSensor));
    return card("Day/Night", body, true);
  }

  function screenToneCard() {
    var body = el("div");
    body.appendChild(rangeField("Day Screen Warmth", "screen_warmth_day"));
    body.appendChild(rangeField("Night Screen Warmth", "screen_warmth_night"));
    return card("Screen Tone", body, true);
  }

  function firmwareCard() {
    var body = el("div", "fw-body");
    var versionRow = el("div", "fw-row");
    var version = el("span", "fw-label");
    var installed = displayVersion(S.installed_version || "");
    version.innerHTML = '<span style="color:var(--text2)">Installed </span>' + esc(installed || "Dev");
    var checkWrap = el("div", "check-wrap");
    var status = el("span", "fw-status");
    status.innerHTML = firmwareInlineStatusText();
    var check = el("button", "btn btn-secondary btn-sm");
    check.textContent = firmwareButtonText();
    check.disabled = S.firmware_checking || S.firmware_state === "INSTALLING";
    check.onclick = function () {
      if (firmwareUpdateAvailable()) {
        installFirmwareUpdate();
        return;
      }
      S.firmware_checking = true;
      renderAll();
      post(endpoint("check_latest") + "/press");
      refreshPublicFirmwareState();
      setTimeout(function () {
        S.firmware_checking = false;
        refreshFirmwareState().then(renderAll);
      }, 10000);
    };
    checkWrap.appendChild(status);
    checkWrap.appendChild(check);
    versionRow.appendChild(version);
    versionRow.appendChild(checkWrap);
    body.appendChild(versionRow);

    var detail = firmwareDetailText();
    if (detail) {
      var detailNode = el("div", "fw-status");
      detailNode.innerHTML = detail;
      body.appendChild(detailNode);
    }

    var frequencyWrap = el("div");
    frequencyWrap.style.display = S.auto_update ? "" : "none";
    body.appendChild(toggleField("Auto Update", "auto_update", null, null, function (enabled) {
      frequencyWrap.style.display = enabled ? "" : "none";
    }));
    frequencyWrap.appendChild(selectField("Update Frequency", "update_frequency"));
    body.appendChild(frequencyWrap);
    return card("Firmware", body, true);
  }

  function renderDevice() {
    var wrap = els.deviceWrap;
    wrap.innerHTML = "";
    wrap.appendChild(clockCard());
    wrap.appendChild(dayNightCard());
    wrap.appendChild(screenBrightnessCard());
    wrap.appendChild(screenToneCard());
    if (supportsScreenRotation()) wrap.appendChild(rotationCard());
    wrap.appendChild(firmwareCard());
  }

  function clockCard() {
    var body = el("div");
    body.appendChild(segmentedSelectField("Clock Format", "clock_time_format"));
    body.appendChild(selectField("Timezone", "clock_timezone"));
    return card("Clock", body, true);
  }

  function rotationCard() {
    var body = el("div");
    body.appendChild(selectField("Screen Rotation", "screen_rotation"));
    return card("Rotation", body, true);
  }

  function supportsScreenRotation() {
    return S.device_profile === "guition-esp32-p4-jc4880p443" || S.device_profile === "guition-esp32-p4-jc1060p470" || S.device_profile === "guition-esp32-p4-jc8012p4a1";
  }

  function supportsClockScreenSaver() {
    return true;
  }

  function textField(label, key, placeholder, validator) {
    var f = field(label);
    var group = el("div", "input-group");
    var input = document.createElement("input");
    input.type = "text";
    input.value = S[key] || "";
    input.placeholder = placeholder || "";
    input.maxLength = 100;
    var save = el("button", "btn btn-primary");
    save.type = "button";
    save.textContent = "Save";
    var error = el("div", "field-error");
    save.onclick = function () {
      var value = input.value.trim();
      var msg = validator ? validator(value) : "";
      if (msg) {
        error.textContent = msg;
        return;
      }
      error.textContent = "";
      save.disabled = true;
      save.textContent = "Saving...";
      S[key] = value;
      postText(endpoint(key) + "/set", value).then(function (res) {
        save.disabled = false;
        save.textContent = "Save";
        if (res) showBanner("Saved", "success");
      });
    };
    group.appendChild(input);
    group.appendChild(save);
    f.appendChild(group);
    f.appendChild(error);
    return f;
  }

  function validateMediaPlayer(value) {
    if (!value) return "";
    return value.indexOf("media_player.") === 0 ? "" : "Use a media_player entity.";
  }

  function validateDayNightSensor(value) {
    if (!value) return "";
    if (value.indexOf("binary_sensor.") === 0 || value.indexOf("input_boolean.") === 0) return "";
    return "Use a binary_sensor or input_boolean entity.";
  }

  function toggleField(label, key, hint, modeText, onChange) {
    var f = field("");
    var row = el("div", "toggle-row");
    var text = el("span");
    text.textContent = label;
    var tog = el("div", S[key] ? "toggle on" : "toggle");
    var control = el("div", "toggle-control");
    var mode = modeText ? el("span", "toggle-mode") : null;
    if (mode) mode.textContent = modeText();
    tog.onclick = function () {
      S[key] = !S[key];
      tog.className = S[key] ? "toggle on" : "toggle";
      if (mode) mode.textContent = modeText();
      if (onChange) onChange(S[key]);
      post(endpoint(key) + (S[key] ? "/turn_on" : "/turn_off"));
    };
    row.appendChild(text);
    if (mode) control.appendChild(mode);
    control.appendChild(tog);
    row.appendChild(control);
    f.appendChild(row);
    if (hint) {
      var help = el("div", "field-hint");
      help.textContent = hint;
      f.appendChild(help);
    }
    return f;
  }

  function localToggleField(label, enabled, onChange) {
    var f = field("");
    var row = el("div", "toggle-row");
    var text = el("span");
    text.textContent = label;
    var tog = el("div", enabled ? "toggle on" : "toggle");
    tog.onclick = function () {
      enabled = !enabled;
      tog.className = enabled ? "toggle on" : "toggle";
      onChange(enabled);
    };
    row.appendChild(text);
    row.appendChild(tog);
    f.appendChild(row);
    return f;
  }

  function hourSelectField(label, key) {
    var f = field(label);
    f.appendChild(selectFromOptions(hourOptions(), clampNumber(Math.round(S[key]), 0, 23), function (value) {
      S[key] = Number(value);
      post(endpoint(key) + "/set", { value: S[key] });
    }, formatHour));
    return f;
  }

  function durationSelectField(label, key, options, formatter) {
    options = options || [10, 30, 60, 120, 300, 600, 1800, 3600];
    var value = normalizeDurationOption(S[key], options, 60);
    var f = field(label);
    f.appendChild(selectFromOptions(options, value, function (next) {
      S[key] = Number(next);
      if (key === "speaker_panel_timeout" && S[key] > 0) lastSpeakerPanelTimeout = S[key];
      post(endpoint(key) + "/set", { value: S[key] });
    }, formatter || formatDurationSeconds));
    return f;
  }

  function screenSaverActionField(label, key, onChange) {
    var options = supportsClockScreenSaver() ? ["Clock", "Screen Off", "Disabled"] : ["Screen Off", "Disabled"];
    var selected = normalizeScreenSaverAction(S[key]);
    if (options.indexOf(selected) === -1) selected = "Screen Off";
    var f = field(label);
    f.appendChild(selectFromOptions(options, selected, function (next) {
      S[key] = next;
      post(endpoint(key) + "/set", { option: next });
      if (onChange) onChange(next);
    }, screenSaverActionLabel));
    return f;
  }

  function usesClockAction() {
    return usesDayClockAction() || usesEveningClockAction();
  }

  function usesDayClockAction() {
    return normalizeScreenSaverAction(S.day_idle_action) === "Clock";
  }

  function usesEveningClockAction() {
    return normalizeScreenSaverAction(S.night_idle_action) === "Clock";
  }

  function normalizeScreenSaverAction(value) {
    if (value === "Show Clock" || value === "Clock" || value === "On") return "Clock";
    if (value === "Turn Screen Off" || value === "Screen Off" || value === "Off") return "Screen Off";
    if (value === "Disabled") return "Disabled";
    return "Screen Off";
  }

  function screenSaverActionLabel(value) {
    return normalizeScreenSaverAction(value);
  }

  function selectFromOptions(options, selected, onChange, formatter) {
    var select = document.createElement("select");
    select.className = "select";
    options.forEach(function (value) {
      var opt = document.createElement("option");
      opt.value = value;
      opt.textContent = formatter ? formatter(value) : value;
      if (Number(value) === Number(selected) || value === selected) opt.selected = true;
      select.appendChild(opt);
    });
    select.onchange = function () {
      onChange(select.value);
    };
    return select;
  }

  function hourOptions() {
    var options = [];
    for (var h = 0; h < 24; h++) options.push(h);
    return options;
  }

  function formatHour(value) {
    var h = Number(value);
    var suffix = h >= 12 ? "PM" : "AM";
    var hour = h % 12;
    if (hour === 0) hour = 12;
    return hour + ":00 " + suffix;
  }

  function normalizeDurationOption(value, options, fallback) {
    var n = Number(value);
    if (isNaN(n)) return fallback;
    var best = options[0];
    var bestDelta = Math.abs(n - best);
    options.forEach(function (option) {
      var delta = Math.abs(n - option);
      if (delta < bestDelta) {
        best = option;
        bestDelta = delta;
      }
    });
    return best;
  }

  function formatDurationSeconds(value) {
    var n = Number(value);
    if (n < 60) return n + " seconds";
    if (n === 60) return "1 minute";
    if (n < 3600) return Math.round(n / 60) + " minutes";
    return "1 hour";
  }

  function rangeField(label, key) {
    var spec = NUMBER_LIMITS[key];
    var f = field(label);
    var row = el("div", "range-wrap");
    var input = document.createElement("input");
    input.type = "range";
    input.min = spec.min;
    input.max = spec.max;
    input.step = spec.step;
    input.value = clampNumber(S[key], spec.min, spec.max);
    var value = el("span", "range-val");
    value.textContent = input.value + spec.suffix;
    input.oninput = function () {
      value.textContent = input.value + spec.suffix;
    };
    input.onchange = function () {
      S[key] = Number(input.value);
      post(endpoint(key) + "/set", { value: input.value });
    };
    row.appendChild(input);
    row.appendChild(value);
    f.appendChild(row);
    return f;
  }

  function numberField(label, key) {
    var spec = NUMBER_LIMITS[key];
    var f = field(label);
    var row = el("div", "number-row");
    var input = document.createElement("input");
    input.type = "number";
    input.min = spec.min;
    input.max = spec.max;
    input.step = spec.step;
    input.value = clampNumber(S[key], spec.min, spec.max);
    var suffix = el("span", "suffix");
    suffix.textContent = spec.suffix;
    var error = el("div", "field-error");
    input.onchange = function () {
      var value = Number(input.value);
      if (isNaN(value) || value < spec.min || value > spec.max) {
        error.textContent = "Enter " + spec.min + " to " + spec.max + ".";
        return;
      }
      error.textContent = "";
      S[key] = value;
      if (key === "speaker_panel_timeout" && value > 0) lastSpeakerPanelTimeout = value;
      post(endpoint(key) + "/set", { value: value });
    };
    row.appendChild(input);
    row.appendChild(suffix);
    f.appendChild(row);
    f.appendChild(error);
    return f;
  }

  function selectField(label, key, onChange) {
    var f = field(label);
    var options = (S[key + "_options"] || []).slice();
    if ((key === "day_idle_action" || key === "night_idle_action") && !supportsClockScreenSaver()) {
      options = options.filter(function (option) { return normalizeScreenSaverAction(option) !== "Clock"; });
      if (normalizeScreenSaverAction(S[key]) === "Clock") S[key] = "Screen Off";
    }
    if (options.indexOf(S[key]) === -1 && S[key]) options.unshift(S[key]);
    if (!options.length) options.push(S[key] || "");
    var select = document.createElement("select");
    select.className = "select";
    options.forEach(function (option) {
      var opt = document.createElement("option");
      opt.value = option;
      opt.textContent = key === "clock_timezone" ? formatTimezoneOption(option) : option;
      if (option === S[key]) opt.selected = true;
      select.appendChild(opt);
    });
    select.onchange = function () {
      S[key] = select.value;
      post(endpoint(key) + "/set", { option: select.value });
      if (onChange) onChange(select.value);
    };
    f.appendChild(select);
    return f;
  }

  function segmentedSelectField(label, key, onChange) {
    var f = field(label);
    var options = (S[key + "_options"] || []).slice();
    if (options.indexOf(S[key]) === -1 && S[key]) options.unshift(S[key]);
    if (!options.length) options.push(S[key] || "");
    var group = el("div", "segmented");
    group.setAttribute("role", "tablist");
    options.forEach(function (option) {
      var button = el("button", "segmented-option" + (option === S[key] ? " active" : ""));
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", option === S[key] ? "true" : "false");
      button.textContent = option;
      button.onclick = function () {
        S[key] = option;
        Array.prototype.forEach.call(group.children, function (child) {
          var active = child.textContent === option;
          child.className = "segmented-option" + (active ? " active" : "");
          child.setAttribute("aria-selected", active ? "true" : "false");
        });
        post(endpoint(key) + "/set", { option: option });
        if (onChange) onChange(option);
      };
      group.appendChild(button);
    });
    f.appendChild(group);
    return f;
  }

  function timezoneId(option) {
    var idx = String(option || "").indexOf(" (");
    return idx > 0 ? option.substring(0, idx) : String(option || "");
  }

  function formatGmtOffset(minutes) {
    var sign = minutes >= 0 ? "+" : "-";
    var abs = Math.abs(minutes);
    var h = Math.floor(abs / 60);
    var m = abs % 60;
    return "GMT" + sign + h + (m ? ":" + String(m).padStart(2, "0") : "");
  }

  function timezoneOffsetMinutes(tzId, date) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tzId,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).formatToParts(date);
      var values = {};
      parts.forEach(function (part) {
        if (part.type !== "literal") values[part.type] = part.value;
      });
      var localAsUtc = Date.UTC(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day),
        Number(values.hour),
        Number(values.minute),
        Number(values.second)
      );
      return Math.round((localAsUtc - date.getTime()) / 60000);
    } catch (_) {
      return null;
    }
  }

  function formatTimezoneOption(option) {
    var tzId = timezoneId(option);
    var offset = timezoneOffsetMinutes(tzId, new Date());
    if (offset == null || !isFinite(offset)) return option;
    return tzId + " (" + formatGmtOffset(offset) + ")";
  }

  function statusRow(label, value, dotClass) {
    var row = el("div", "status-row");
    var l = el("span");
    l.textContent = label;
    var v = el("span", "status-value");
    if (dotClass) {
      var dot = el("span", "dot " + dotClass);
      v.appendChild(dot);
    }
    v.appendChild(document.createTextNode(value));
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }

  function field(labelText) {
    var f = el("div", "field");
    if (labelText) {
      var l = document.createElement("label");
      l.textContent = labelText;
      f.appendChild(l);
    }
    return f;
  }

  function card(title, bodyElement, defaultCollapsed, badge) {
    var c = el("div", "card");
    var cardKey = slug(title);
    var header = el("div", "card-header");
    var h = document.createElement("h3");
    h.textContent = title;
    var right = el("div", "card-header-right");
    if (badge) right.appendChild(badge);
    var chevron = el("span", "card-chevron");
    chevron.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    right.appendChild(chevron);
    header.appendChild(h);
    header.appendChild(right);
    var body = el("div", "card-body");
    body.appendChild(bodyElement);
    c.appendChild(header);
    c.appendChild(body);
    var collapsed = cardCollapsed.hasOwnProperty(cardKey) ? cardCollapsed[cardKey] : defaultCollapsed;
    if (collapsed) c.classList.add("collapsed");
    header.onclick = function (ev) {
      if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(ev.target.tagName)) return;
      c.classList.toggle("collapsed");
      cardCollapsed[cardKey] = c.classList.contains("collapsed");
    };
    return c;
  }

  function badgeFor(active, text) {
    var b = el("span", "on-badge" + (active ? " active" : ""));
    b.textContent = text || "On";
    return b;
  }

  function clampNumber(value, min, max) {
    var n = Number(value);
    if (isNaN(n)) n = min;
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }

  function isSpecificFirmwareVersion(version) {
    var value = String(version == null ? "" : version).trim().toLowerCase();
    return !!value && value !== "dev" && value !== "0.0.0";
  }

  function firmwareVersionsSame(a, b) {
    return String(a == null ? "" : a).trim().toLowerCase() ===
      String(b == null ? "" : b).trim().toLowerCase();
  }

  function firmwareManifestSlug() {
    var profile = String(S.device_profile || "").trim();
    return FIRMWARE_MANIFEST_SLUGS[profile] || "";
  }

  function publicFirmwareManifestUrl() {
    var manifestSlug = firmwareManifestSlug();
    return manifestSlug ? FIRMWARE_PUBLIC_MANIFEST_BASE + encodeURIComponent(manifestSlug) + "/manifest.json" : "";
  }

  function firmwareInfoFromPublicManifest(data) {
    if (!data || typeof data !== "object") return null;
    var version = String(data.version || "").trim();
    if (!isSpecificFirmwareVersion(version)) return null;
    var builds = Array.isArray(data.builds) ? data.builds : [];
    for (var i = 0; i < builds.length; i++) {
      var ota = (builds[i] || {}).ota || {};
      if (!ota.path) continue;
      return {
        latest_version: version,
        release_url: String(ota.release_url || "").trim()
      };
    }
    return null;
  }

  function setPublicFirmwareInfo(info) {
    if (!info) return false;
    var latest = String(info.latest_version || "").trim();
    if (!isSpecificFirmwareVersion(latest)) return false;
    S.latest_version = latest;
    if (info.release_url) S.firmware_release_url = info.release_url;
    S.update_available = firmwareUpdateAvailable();
    return true;
  }

  function refreshPublicFirmwareState() {
    var url = publicFirmwareManifestUrl();
    if (!url) return Promise.resolve(false);
    return safeGet(url).then(function (data) {
      return setPublicFirmwareInfo(firmwareInfoFromPublicManifest(data));
    });
  }

  function installedFirmwareMatchesPublicRelease() {
    return isSpecificFirmwareVersion(S.installed_version) &&
      isSpecificFirmwareVersion(S.latest_version) &&
      firmwareVersionsSame(S.installed_version, S.latest_version);
  }

  function publicFirmwareUpdateAvailable() {
    return isSpecificFirmwareVersion(S.latest_version) && !installedFirmwareMatchesPublicRelease();
  }

  function deviceFirmwareUpdateAvailable() {
    return S.firmware_state === "UPDATE AVAILABLE" && isSpecificFirmwareVersion(S.latest_version);
  }

  function firmwareUpdateAvailable() {
    return deviceFirmwareUpdateAvailable() || publicFirmwareUpdateAvailable();
  }

  function installFirmwareUpdate() {
    if (deviceFirmwareUpdateAvailable()) {
      S.firmware_state = "INSTALLING";
      renderAll();
      startFirmwareInstallRefresh();
      post(endpoint("firmware_update") + "/install");
      return;
    }

    S.firmware_checking = true;
    renderAll();
    post(endpoint("check_latest") + "/press");
    refreshPublicFirmwareState();
    setTimeout(function () {
      S.firmware_checking = false;
      fetchEntity("firmware_update").then(function () {
        if (deviceFirmwareUpdateAvailable()) {
          S.firmware_state = "INSTALLING";
          renderAll();
          startFirmwareInstallRefresh();
          post(endpoint("firmware_update") + "/install");
          return;
        }
        renderAll();
      });
    }, 10000);
  }

  function firmwareInlineStatusText() {
    if (S.firmware_state === "INSTALLING") return "Installing...";
    if (S.firmware_checking) return "Checking...";
    if (firmwareUpdateAvailable()) return "";
    if (S.firmware_state === "NO UPDATE" || S.firmware_state === "UP_TO_DATE") return "Up to date";
    if (installedFirmwareMatchesPublicRelease()) return "Up to date";
    return "";
  }

  function firmwareDetailText() {
    if (S.firmware_state === "INSTALLING") return "Installing update...";
    if (firmwareUpdateAvailable()) {
      var text = "Latest public version: " + esc(displayVersion(S.latest_version));
      if (S.firmware_release_url) {
        text += ' <a href="' + escAttr(S.firmware_release_url) + '" target="_blank" rel="noopener">release notes</a>';
      }
      return text;
    }
    if (S.firmware_checking) return "Checking public firmware...";
    return "";
  }

  function firmwareButtonText() {
    if (S.firmware_state === "INSTALLING") return "Installing...";
    if (firmwareUpdateAvailable()) return "Install Update";
    return S.firmware_checking ? "Checking..." : "Check for Update";
  }

  function displayVersion(value) {
    var v = String(value || "").trim();
    if (!v) return "";
    return v.toLowerCase() === "dev" ? "Dev" : v;
  }

  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;");
  }

  function isEditingSetting() {
    var active = document.activeElement;
    if (!active || !els.root || !els.root.contains(active)) return false;
    return /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(active.tagName);
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  var bannerTimer = null;
  function showBanner(message, type) {
    if (!els.banner) return;
    els.banner.textContent = message;
    els.banner.className = "banner banner-" + (type || "success");
    els.banner.style.display = "";
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () {
      els.banner.style.display = "none";
    }, 3500);
  }

  var ANSI_LEVEL = {
    "1;31": "log-error",
    "0;31": "log-error",
    "0;33": "log-warn",
    "0;32": "log-info",
    "0;35": "log-config",
    "0;36": "log-debug",
    "0;37": "log-verbose"
  };
  var ANSI_RE = /\033\[[\d;]*m/g;

  function appendLog(msg, lvl) {
    if (!els.logOutput) return;
    var line = document.createElement("div");
    line.className = "log-line";
    var text = String(msg || "");
    var match = text.match(/\033\[([\d;]+)m/);
    var cls = match ? ANSI_LEVEL[match[1]] : "";
    if (cls) line.classList.add(cls);
    else if (lvl === 1) line.classList.add("log-error");
    else if (lvl === 2) line.classList.add("log-warn");
    else if (lvl === 3) line.classList.add("log-info");
    else if (lvl === 4) line.classList.add("log-config");
    else if (lvl === 5) line.classList.add("log-debug");
    else if (lvl >= 6) line.classList.add("log-verbose");
    line.textContent = text.replace(ANSI_RE, "");
    var atBottom = els.logOutput.scrollHeight - els.logOutput.scrollTop - els.logOutput.clientHeight < 40;
    els.logOutput.appendChild(line);
    var overflow = els.logOutput.childNodes.length - 1000;
    for (var i = 0; i < overflow; i++) els.logOutput.removeChild(els.logOutput.firstChild);
    if (atBottom) els.logOutput.scrollTop = els.logOutput.scrollHeight;
  }

  function initSSE() {
    try {
      evtSource = new EventSource("/events");
      evtSource.addEventListener("open", function () {
        refreshFirmwareState();
      });
      evtSource.addEventListener("state", function (e) {
        try {
          var data = JSON.parse(e.data);
          var key = ID_TO_KEY[eventId(data)];
          if (!key) return;
          applyEntityToState(key, data);
          scheduleRender();
        } catch (_) {}
      });
      evtSource.addEventListener("log", function (e) {
        var data;
        try { data = JSON.parse(e.data); } catch (_) { data = { msg: e.data }; }
        appendLog(data.msg || e.data, data.lvl);
      });
    } catch (_) {}
  }

  buildUI();
  renderAll();
  fetchAllState().then(function () {
    return refreshPublicFirmwareState();
  }).then(function () {
    renderAll();
    startWebActivityHeartbeat();
  });
  initSSE();
  window.addEventListener("pagehide", stopWebActivityHeartbeat);
  window.addEventListener("beforeunload", stopWebActivityHeartbeat);
})();
