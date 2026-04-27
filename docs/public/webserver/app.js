(function () {
  "use strict";

  var CSS = "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--bg:#1b1b1f;--surface:#202127;--surface2:#2b2c31;--surface3:#33343a;--border:#3c3f44;--border-hover:rgba(255,255,255,.16);--text:#dfdfd6;--text2:#a0a0a7;--text3:#707078;--accent:#4f7cff;--accent-hover:#7fa0ff;--accent-soft:rgba(79,124,255,.16);--success:#30a46c;--success-soft:rgba(48,164,108,.14);--danger:#f14158;--danger-soft:rgba(241,65,88,.12);--warn:#d99a2b;--radius:8px;--gap:16px;--shadow-1:0 1px 2px rgba(0,0,0,.2),0 1px 2px rgba(0,0,0,.24);--shadow-2:0 3px 12px rgba(0,0,0,.28),0 1px 4px rgba(0,0,0,.2)}esp-app{display:none!important}html{font-size:16px}body{font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;min-height:100vh;margin:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}#mp-app{width:100%;max-width:960px;margin:0 auto}.mp-header{display:flex;align-items:center;background:var(--bg);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;height:56px;padding:0 20px}.mp-brand{font-size:1rem;font-weight:650;color:var(--text);margin-right:auto;white-space:nowrap}.mp-nav{display:flex;align-items:center;height:100%}.mp-tab{padding:0 16px;height:100%;display:flex;align-items:center;color:var(--text2);cursor:pointer;font-size:.875rem;font-weight:550;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}.mp-tab:hover{color:var(--text)}.mp-tab.active{color:var(--accent);border-bottom-color:var(--accent)}.mp-page{display:none}.mp-page.active{display:block}.mp-wrap{padding:var(--gap)}.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:var(--gap);transition:border-color .25s}.card:hover{border-color:#4a4d54}.card-header{display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer;user-select:none;margin:-24px -24px 0 -24px;padding:24px 24px 0 24px}.card-header h3{font-size:.92rem;font-weight:650;color:var(--text)}.card-body{padding-top:20px}.card-chevron{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;color:var(--text3);transition:transform .25s ease;flex-shrink:0}.card-chevron svg{width:100%;height:100%}.card.collapsed .card-chevron{transform:rotate(-90deg)}.card.collapsed .card-body{display:none}.card-header-right{display:flex;align-items:center;gap:8px}.on-badge{display:none;align-items:center;gap:4px;font-size:.6rem;font-weight:700;color:var(--success);padding:2px 8px 2px 6px;background:var(--success-soft);border-radius:999px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}.card.collapsed .on-badge.active{display:inline-flex}.on-badge::before{content:\"\";display:block;width:6px;height:6px;border-radius:50%;background:var(--success);flex-shrink:0}.field{margin-bottom:22px}.field:last-child{margin-bottom:0}label{display:block;font-size:.85rem;color:var(--text2);margin-bottom:6px;font-weight:550}.field-hint{font-size:.76rem;color:var(--text2);margin-top:6px}.field-error{font-size:.76rem;color:var(--danger);margin-top:5px}.field-error:empty{display:none}input[type=text],input[type=number]{width:100%;padding:10px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;letter-spacing:0;outline:none;transition:border-color .25s,box-shadow .25s;font-family:inherit;color-scheme:dark}input[type=text]:focus,input[type=number]:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}input::placeholder{color:var(--text2);opacity:.7}.select,select{width:100%;padding:10px 36px 10px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;outline:none;transition:border-color .25s,box-shadow .25s;-webkit-appearance:none;appearance:none;color-scheme:dark;font-family:inherit;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 14px center}.select:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}select option{background:var(--surface);color:var(--text)}.input-group{display:flex;gap:8px}.input-group input{flex:1;min-width:0}.btn{padding:10px 20px;border:none;border-radius:20px;font-size:.875rem;font-weight:650;cursor:pointer;transition:background .25s,opacity .25s,box-shadow .25s,border-color .25s;font-family:inherit;letter-spacing:.01em;white-space:nowrap}.btn:active{opacity:.85}.btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:var(--accent-hover);box-shadow:0 2px 12px var(--accent-soft)}.btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border)}.btn-secondary:hover{border-color:var(--border-hover);background:rgba(255,255,255,.06)}.btn-danger{background:var(--danger);color:#fff}.btn-sm{padding:7px 14px;font-size:.8rem}.btn:disabled{opacity:.35;cursor:not-allowed}.toggle-row{display:flex;justify-content:space-between;align-items:center;min-height:36px;gap:16px}.toggle-row span{font-size:.9rem}.toggle{position:relative;width:44px;height:24px;background:var(--surface2);border-radius:999px;cursor:pointer;transition:background .25s;border:1px solid var(--border);flex-shrink:0}.toggle.on{background:var(--accent);border-color:var(--accent)}.toggle::after{content:\"\";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s ease;box-shadow:0 1px 3px rgba(0,0,0,.3)}.toggle.on::after{transform:translateX(20px)}.range-wrap{display:flex;align-items:center;gap:12px}.range-wrap input[type=range]{flex:1;-webkit-appearance:none;height:4px;background:var(--surface2);border-radius:2px;outline:none}.range-wrap input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);cursor:pointer;box-shadow:0 0 0 3px var(--accent-soft);transition:box-shadow .2s}.range-wrap input[type=range]::-webkit-slider-thumb:hover{box-shadow:0 0 0 5px var(--accent-soft)}.range-wrap input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--accent);cursor:pointer;border:none}.range-val{min-width:54px;text-align:right;font-size:.85rem;color:var(--text2);font-variant-numeric:tabular-nums}.number-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.suffix{font-size:.85rem;color:var(--text2);min-width:30px}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.status-list{display:flex;flex-direction:column;gap:10px}.status-row{display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px 14px}.status-row span:first-child{font-size:.85rem;color:var(--text2)}.status-value{font-size:.9rem;font-weight:600;text-align:right;word-break:break-word}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:1px;background:var(--text3)}.dot.green{background:var(--success)}.dot.red{background:var(--danger)}.dot.warn{background:var(--warn)}.fw-body{display:flex;flex-direction:column;gap:12px}.fw-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:36px}.fw-label{font-size:.9rem}.fw-status{font-size:.8rem;color:var(--text2)}.check-wrap{display:flex;align-items:center;gap:8px;flex-shrink:0}.spacer-8{height:8px}.log-toolbar{display:flex;justify-content:flex-end;padding:12px var(--gap) 0}.log-output{margin:8px var(--gap) var(--gap);padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);font-family:ui-monospace,\"SF Mono\",SFMono-Regular,Menlo,Consolas,monospace;font-size:.75rem;line-height:1.7;color:var(--text2);overflow-x:auto;overflow-y:auto;max-height:70vh;white-space:pre;word-break:break-all}.log-line{padding:1px 0;border-left:3px solid transparent;padding-left:8px}.log-error{color:#f66f81;border-left-color:#f14158;background:var(--danger-soft)}.log-warn{color:#f9b44e;border-left-color:#da8b17;background:rgba(234,179,8,.06)}.log-info{color:#3dd68c}.log-config{color:#c8abfa}.log-debug{color:#5c73e7}.log-verbose{color:var(--text2)}.banner{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;padding:10px 24px;border-radius:var(--radius);font-size:.85rem;font-weight:650;color:#fff;box-shadow:var(--shadow-2);animation:bannerIn .25s ease;max-width:calc(100% - 32px);text-align:center}.banner-success{background:var(--success)}.banner-error{background:var(--danger)}@keyframes bannerIn{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@media(max-width:680px){.mp-header{padding:0 14px}.mp-tab{padding:0 10px}.mp-wrap{padding:12px}.grid-2{grid-template-columns:1fr}.input-group{flex-direction:column}.btn{width:100%}.fw-row,.status-row{align-items:flex-start;flex-direction:column}.check-wrap{width:100%}.check-wrap .btn{flex:1}.range-val{text-align:left;min-width:42px}}";

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  var fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(fonts);

  var S = {
    media_player: "",
    linked_media_player: "",
    day_night_sensor: "",
    show_remaining_time: true,
    show_progress_bar: true,
    track_info_duration: 5,
    speaker_panel_timeout: 15,
    day_active_brightness: 100,
    night_active_brightness: 80,
    day_dim_brightness: 35,
    night_dim_brightness: 25,
    dim_timeout: 60,
    screen_saver_timeout: 300,
    clock_brightness: 35,
    day_screen_saver: true,
    night_screen_saver: true,
    clock_screensaver: true,
    screen_warmth_day: 30,
    screen_warmth_night: 60,
    clock_timezone: "UTC",
    clock_timezone_options: ["UTC"],
    auto_update: true,
    update_frequency: "Daily",
    update_frequency_options: ["Hourly", "Daily", "Weekly"],
    firmware_state: "",
    installed_version: "",
    latest_version: "",
    update_available: false,
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
    track_info_duration: { domain: "number", name: "Playback: Track Info Duration", number: true },
    speaker_panel_timeout: { domain: "number", name: "Speakers: Auto-Close Timeout", number: true },
    day_active_brightness: { domain: "number", name: "Day: Active Brightness", number: true },
    night_active_brightness: { domain: "number", name: "Night: Active Brightness", number: true },
    day_dim_brightness: { domain: "number", name: "Day: Dim Brightness", number: true },
    night_dim_brightness: { domain: "number", name: "Night: Dim Brightness", number: true },
    dim_timeout: { domain: "number", name: "Screen Saver: Paused Dimming", number: true },
    screen_saver_timeout: { domain: "number", name: "Screen Saver: Timer", number: true },
    clock_brightness: { domain: "number", name: "Screen Saver: Clock Brightness", number: true },
    day_screen_saver: { domain: "switch", name: "Day: Screen Saver", bool: true },
    night_screen_saver: { domain: "switch", name: "Night: Screen Saver", bool: true },
    clock_screensaver: { domain: "switch", name: "Screen Saver: Clock", bool: true },
    screen_warmth_day: { domain: "number", name: "Day: Screen Warmth", number: true },
    screen_warmth_night: { domain: "number", name: "Night: Screen Warmth", number: true },
    clock_timezone: { domain: "select", name: "Clock: Timezone", optionsKey: "clock_timezone_options" },
    auto_update: { domain: "switch", name: "Auto Update", bool: true },
    update_frequency: { domain: "select", name: "Update Frequency", optionsKey: "update_frequency_options" },
    firmware_update: { domain: "update", name: "Firmware Update", update: true },
    check_latest: { domain: "button", name: "Check Latest Firmware", skipFetch: true },
    install_latest: { domain: "button", name: "Install Latest Firmware", skipFetch: true },
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
    dim_timeout: { min: 1, max: 300, step: 1, suffix: "s" },
    screen_saver_timeout: { min: 1, max: 600, step: 1, suffix: "s" },
    clock_brightness: { min: 1, max: 100, step: 1, suffix: "%" },
    screen_warmth_day: { min: 0, max: 100, step: 5, suffix: "%" },
    screen_warmth_night: { min: 0, max: 100, step: 5, suffix: "%" }
  };

  var els = {};
  var currentTab = "settings";
  var renderTimer = null;
  var evtSource = null;
  var cardCollapsed = {};

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
  });

  function eventId(d) {
    return (d && (d.name_id || d.id)) || "";
  }

  function safeGet(url) {
    return fetch(url)
      .then(function (r) {
        if (!r.ok) return null;
        return r.json();
      })
      .catch(function () {
        return null;
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

    if (spec.update) {
      S.firmware_state = data.state || "";
      S.installed_version = data.current_version || data.current || "";
      S.latest_version = data.latest_version || data.value || "";
      S.update_available = !!(
        (S.installed_version && S.latest_version && S.installed_version !== S.latest_version) ||
        data.state === "UPDATE AVAILABLE"
      );
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
      if (!isNaN(n)) S[key] = n;
    } else if (v != null) {
      S[key] = String(v);
    }
  }

  function fetchEntity(key) {
    var spec = ENTITIES[key];
    if (!spec || spec.skipFetch) return Promise.resolve();
    var url = endpoint(key);
    if (spec.optionsKey) url += "?detail=all";
    return safeGet(url).then(function (data) {
      if (data) applyEntityToState(key, data);
    });
  }

  function fetchAllState() {
    return Promise.all(Object.keys(ENTITIES).map(fetchEntity));
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
    buildLogsPage(root);

    var espApp = document.querySelector("esp-app");
    if (espApp) espApp.parentNode.insertBefore(root, espApp);
    else document.body.insertBefore(root, document.body.firstChild);

    els.root = root;
    switchTab("settings");
  }

  function buildHeader(parent) {
    var header = el("div", "mp-header");
    var brand = el("div", "mp-brand");
    brand.textContent = "Media Player";
    header.appendChild(brand);

    var nav = el("nav", "mp-nav");
    [
      { id: "settings", label: "Settings" },
      { id: "device", label: "Device" },
      { id: "logs", label: "Logs" }
    ].forEach(function (tab) {
      var node = el("div", "mp-tab");
      node.textContent = tab.label;
      node.onclick = function () { switchTab(tab.id); };
      nav.appendChild(node);
      els["tab_" + tab.id] = node;
    });
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

  function buildLogsPage(parent) {
    var page = el("div", "mp-page");
    page.id = "mp-logs";
    var toolbar = el("div", "log-toolbar");
    var clear = el("button", "btn btn-secondary btn-sm");
    clear.textContent = "Clear";
    clear.onclick = function () { els.logOutput.innerHTML = ""; };
    toolbar.appendChild(clear);
    page.appendChild(toolbar);
    var output = el("div", "log-output");
    page.appendChild(output);
    parent.appendChild(page);
    els.logsPage = page;
    els.logOutput = output;
  }

  function switchTab(tab) {
    currentTab = tab;
    ["settings", "device", "logs"].forEach(function (id) {
      els["tab_" + id].className = "mp-tab" + (id === tab ? " active" : "");
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
    content.appendChild(playbackCard());
    content.appendChild(screenSaverCard());
    content.appendChild(screenToneCard());
    content.appendChild(firmwareCard());

    wrap.appendChild(content);
  }

  function setupCard() {
    var body = el("div");
    body.appendChild(textField("Media Player", "media_player", "media_player.living_room", validateMediaPlayer));
    body.appendChild(textField("Linked Media Player", "linked_media_player", "media_player.apple_tv", validateMediaPlayer));
    body.appendChild(textField("Day-Night Sensor", "day_night_sensor", "binary_sensor.daytime", validateDayNightSensor));
    var hint = el("div", "field-hint");
    hint.textContent = "Changing media-player fields can reboot the device so Home Assistant subscriptions refresh.";
    body.appendChild(hint);
    return card("Setup", body, false);
  }

  function playbackCard() {
    var body = el("div");
    body.appendChild(toggleField("Track Clock", "show_remaining_time", "On: time remaining. Off: track length."));
    body.appendChild(toggleField("Show Progress Bar", "show_progress_bar"));
    body.appendChild(numberField("Track Info Duration", "track_info_duration"));
    body.appendChild(numberField("Speaker Panel Auto-Close", "speaker_panel_timeout"));
    return card("Playback", body, true);
  }

  function screenSaverCard() {
    var badge = badgeFor(S.day_screen_saver || S.night_screen_saver || S.clock_screensaver);
    var body = el("div");
    var brightnessGrid = el("div", "grid-2");
    brightnessGrid.appendChild(rangeField("Day Active Brightness", "day_active_brightness"));
    brightnessGrid.appendChild(rangeField("Night Active Brightness", "night_active_brightness"));
    brightnessGrid.appendChild(rangeField("Day Dim Brightness", "day_dim_brightness"));
    brightnessGrid.appendChild(rangeField("Night Dim Brightness", "night_dim_brightness"));
    body.appendChild(brightnessGrid);
    body.appendChild(el("div", "spacer-8"));
    body.appendChild(numberField("Paused Dimming", "dim_timeout"));
    body.appendChild(numberField("Screen Saver Timer", "screen_saver_timeout"));
    body.appendChild(rangeField("Clock Brightness", "clock_brightness"));
    body.appendChild(toggleField("Day Screen Saver", "day_screen_saver"));
    body.appendChild(toggleField("Night Screen Saver", "night_screen_saver"));
    body.appendChild(toggleField("Clock Screen Saver", "clock_screensaver"));
    body.appendChild(selectField("Timezone", "clock_timezone"));
    return card("Screen Saver", body, true, badge);
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
    var latest = displayVersion(S.latest_version || "");
    version.innerHTML = '<span style="color:var(--text2)">Installed</span> ' + esc(installed || "Unknown");
    var latestRow = el("div", "fw-row");
    var latestLabel = el("span", "fw-label");
    latestLabel.innerHTML = '<span style="color:var(--text2)">Latest</span> ' + esc(latest || "Unknown");
    var checkWrap = el("div", "check-wrap");
    var status = el("span", "fw-status");
    status.textContent = firmwareStatusText();
    var check = el("button", "btn btn-secondary btn-sm");
    check.textContent = "Check";
    check.onclick = function () {
      check.disabled = true;
      check.textContent = "Checking...";
      post(endpoint("check_latest") + "/press")
        .then(function () {
          return new Promise(function (resolve) { setTimeout(resolve, 16000); });
        })
        .then(function () { return fetchEntity("firmware_update"); })
        .then(function () {
          check.disabled = false;
          check.textContent = "Check";
          renderAll();
        });
    };
    checkWrap.appendChild(status);
    checkWrap.appendChild(check);
    versionRow.appendChild(version);
    versionRow.appendChild(checkWrap);
    body.appendChild(versionRow);
    latestRow.appendChild(latestLabel);
    body.appendChild(latestRow);

    if (S.update_available) {
      var updateRow = el("div", "fw-row");
      var label = el("span", "fw-label");
      label.textContent = "Update available";
      var install = el("button", "btn btn-primary btn-sm");
      install.textContent = "Install";
      install.onclick = function () {
        install.disabled = true;
        install.textContent = "Installing...";
        post(endpoint("firmware_update") + "/install");
      };
      updateRow.appendChild(label);
      updateRow.appendChild(install);
      body.appendChild(updateRow);
    }

    body.appendChild(toggleField("Auto Update", "auto_update"));
    body.appendChild(selectField("Update Frequency", "update_frequency"));
    return card("Firmware", body, true);
  }

  function renderDevice() {
    var wrap = els.deviceWrap;
    wrap.innerHTML = "";
    var body = el("div", "status-list");
    body.appendChild(statusRow("Online", S.online ? "Connected" : "Disconnected", S.online ? "green" : "red"));
    body.appendChild(statusRow("WiFi Strength", S.wifi_strength == null ? "Unknown" : Math.round(S.wifi_strength) + "%"));
    body.appendChild(statusRow("IP Address", S.ip_address || "Unknown"));
    wrap.appendChild(card("Device", body, false));
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

  function toggleField(label, key, hint) {
    var f = field("");
    var row = el("div", "toggle-row");
    var text = el("span");
    text.textContent = label;
    var tog = el("div", S[key] ? "toggle on" : "toggle");
    tog.onclick = function () {
      S[key] = !S[key];
      tog.className = S[key] ? "toggle on" : "toggle";
      post(endpoint(key) + (S[key] ? "/turn_on" : "/turn_off"));
    };
    row.appendChild(text);
    row.appendChild(tog);
    f.appendChild(row);
    if (hint) {
      var help = el("div", "field-hint");
      help.textContent = hint;
      f.appendChild(help);
    }
    return f;
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
      post(endpoint(key) + "/set", { value: value });
    };
    row.appendChild(input);
    row.appendChild(suffix);
    f.appendChild(row);
    f.appendChild(error);
    return f;
  }

  function selectField(label, key) {
    var f = field(label);
    var options = (S[key + "_options"] || []).slice();
    if (options.indexOf(S[key]) === -1 && S[key]) options.unshift(S[key]);
    if (!options.length) options.push(S[key] || "");
    var select = document.createElement("select");
    select.className = "select";
    options.forEach(function (option) {
      var opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      if (option === S[key]) opt.selected = true;
      select.appendChild(opt);
    });
    select.onchange = function () {
      S[key] = select.value;
      post(endpoint(key) + "/set", { option: select.value });
    };
    f.appendChild(select);
    return f;
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

  function badgeFor(active) {
    var b = el("span", "on-badge" + (active ? " active" : ""));
    b.textContent = "On";
    return b;
  }

  function clampNumber(value, min, max) {
    var n = Number(value);
    if (isNaN(n)) n = min;
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }

  function firmwareStatusText() {
    if (S.update_available) return "Update available";
    if (S.firmware_state === "NO UPDATE" || S.firmware_state === "UP_TO_DATE") return "Up to date";
    if (S.latest_version && S.installed_version && S.latest_version === S.installed_version) return "Up to date";
    return S.firmware_state || "";
  }

  function displayVersion(value) {
    var v = String(value || "").trim();
    if (!v) return "";
    return v.toLowerCase() === "dev" ? "Dev" : v;
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
  fetchAllState().then(renderAll);
  initSSE();
})();
