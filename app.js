/* ==========================================================================
   UMBER · app.js
   First screen: the café photograph is the hero. The tasting wheel re-lights
   the room, shows a small coffee preview (hover, tap or selection) and adds
   the chosen coffee to the basket. Plain JavaScript, no libraries.
   Motion = transform and opacity only.
   ========================================================================== */
(() => {
  "use strict";
  if (/[?&]checks\b/.test(location.search)) document.documentElement.dataset.checks = "show";   // show the CHECK marks

  /* ---------- The five tasting notes and the coffee each one belongs to ---------- */
  // Prices, origins and varieties are sample content to confirm [CHECK].
  const STOPS = [
    {
      note: "Citrus", coffee: "Ethiopia Yirgacheffe", country: "Ethiopia", region: "Yirgacheffe", process: "washed",
      line: "Bright as the first window of the day.",
      notes: "Citrus zest, fresh acidity, lively finish.",
      beans: "Heirloom · washed", brew: "Pour-over", price: "4.20",
      id: "citrus",
      liquid: "#d39a3e", tint: "#f3c27a"
    },
    {
      note: "Red berry", coffee: "Kenya Nyeri", country: "Kenya", region: "Nyeri", process: "washed",
      line: "Juicy and sharp, a little wild.",
      notes: "Red berries, bright fruitiness, delicate acidity.",
      beans: "SL28 & SL34 · washed", brew: "Filter", price: "4.40",
      id: "red-berry",
      liquid: "#7e2a28", tint: "#c4574a"
    },
    {
      note: "Honey", coffee: "Colombia Huila", country: "Colombia", region: "Huila", process: "honey",
      line: "Round and golden, like noon on the counter.",
      notes: "Honey, floral sweetness, soft caramel.",
      beans: "Caturra · honey process", brew: "Latte", price: "4.60",
      id: "honey",
      liquid: "#c0832f", tint: "#e2a458"
    },
    {
      note: "Caramel", coffee: "Brazil Cerrado", country: "Brazil", region: "Cerrado Mineiro", process: "natural",
      line: "Slow sun on the bench, something sweet.",
      notes: "Caramel, roasted hazelnut, milk chocolate.",
      beans: "Yellow Bourbon · natural", brew: "Cortado", price: "3.90",
      id: "caramel",
      liquid: "#87501f", tint: "#b8743a"
    },
    {
      note: "Cocoa", coffee: "Sumatra Gayo", country: "Indonesia", region: "Gayo, Sumatra", process: "wet-hulled",
      line: "Lamps on. Deep, quiet, almost velvet.",
      notes: "Cocoa, dark chocolate, roasted nuts.",
      beans: "Typica · wet-hulled", brew: "Espresso", price: "3.20",
      id: "cocoa",
      liquid: "#3a2217", tint: "#5a3220"
    }
  ];
  /* ---------- Coffee media: one photo series + steam loops, keyed by note id ---------- */
  // Swap files here without touching the coffee data. `poster` is also the static fallback.
  const MEDIA = Object.fromEntries(STOPS.map((s) => [s.id, {
    poster: `assets/img/coffee-${s.id}-720.jpg`,
    mp4: `assets/video/coffee-${s.id}.mp4`,
    webm: `assets/video/coffee-${s.id}.webm`
  }]));
  // H.264 MP4 where supported (Safari, Chrome, Edge), VP9 WebM otherwise
  const VIDEO_KIND = document.createElement("video").canPlayType('video/mp4; codecs="avc1.640028"') ? "mp4" : "webm";

  const START = 2;              // open on Honey, so the wheel can turn both ways
  const ANG0 = -110, STEP = 55; // wheel angles: -110°, -55°, 0°, 55°, 110°

  /* ---------- Elements ---------- */
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const hero = $("hero"), arrive = $("arrive"), bar = $("bar");
  const street = $("street"), threshold = $("threshold"), doorCopy = $("doorCopy");
  const heroUI = $("heroUI"), heroMedia = $("heroMedia");
  const roomImgs = [...document.querySelectorAll(".room-img")];
  const roomAfternoon = roomImgs.find((i) => i.dataset.room === "afternoon");
  const roomEvening = roomImgs.find((i) => i.dataset.room === "evening");
  const tintsEl = $("tints");
  const coffeeEl = $("coffee");
  const dialEl = $("dialEl"), knob = $("knob"), knobFace = $("knobFace"), stopsEl = $("dialStops");
  const sectorsEl = $("sectors"), knobNote = $("knobNote");
  const announce = $("announce");
  const canvas = $("motes");
  const soundBtn = $("soundBtn"), basketBtn = $("basketBtn"), basketCount = $("basketCount");
  const orderBtn = $("orderBtn");
  const coffeeVideo = $("coffeeVideo");
  const preview = $("preview");
  let pmFront = preview.querySelector(".pm-layer.is-front");
  let pmBack = preview.querySelector(".pm-layer:not(.is-front)");
  const previewAdd = $("previewAdd");

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceQuery.matches;
  reduceQuery.addEventListener?.("change", (e) => { reduced = e.matches; });

  /* ---------- Small helpers ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  // Preload the posters so the card never flashes empty (videos load on demand)
  STOPS.forEach((s) => { const im = new Image(); im.src = MEDIA[s.id].poster; });

  // Put a coffee into a <video>: poster always; the steam loop only when motion is welcome
  function setMedia(video, id) {
    const m = MEDIA[id];
    if (video.dataset.id === id) return;
    video.dataset.id = id;
    video.poster = m.poster;
    if (reduced) { video.removeAttribute("src"); video.load(); return; }
    video.src = m[VIDEO_KIND];
    video.play().catch(() => {}); // autoplay may be refused: the poster stays as the fallback
  }

  /* ---------- State ---------- */
  let committed = START;      // the selected coffee
  let target = START;         // where the knob is heading (continuous while dragging)
  let value = START;          // where the knob is drawn (smoothed)
  let dragging = false, interacted = false, hasSelected = false;
  let inView = true;

  /* ---------- Build tint layers, wheel sectors and note labels ---------- */
  const tintLayers = STOPS.map((s) => {
    const d = document.createElement("div");
    d.style.background = s.tint;
    tintsEl.appendChild(d);
    return d;
  });

  const NS = "http://www.w3.org/2000/svg";
  const sectorPaths = STOPS.map((s) => {
    const p = document.createElementNS(NS, "path");
    p.style.setProperty("--tint", s.tint);          // each note's arc in its own colour
    sectorsEl.appendChild(p);
    return p;
  });
  // a soft light behind the knob in the colour of the chosen note (one layer per note, cross-faded)
  const glowEl = document.createElement("div");
  glowEl.className = "dial-glow";
  glowEl.setAttribute("aria-hidden", "true");
  const glowLayers = STOPS.map((s) => {
    const g = document.createElement("span");
    g.style.setProperty("--tint", s.tint);
    glowEl.appendChild(g);
    return g;
  });
  // an inviting ring that breathes around the knob until the wheel is first touched
  const callEl = document.createElement("div");
  callEl.className = "dial-call";
  callEl.setAttribute("aria-hidden", "true");
  dialEl.prepend(glowEl, callEl);
  // wide invisible arcs on top, so each sector is easy to hover and tap
  const sectorHits = STOPS.map((s, i) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("class", "sector-hit");
    sectorsEl.appendChild(p);
    bindChoice(p, i);
    return p;
  });

  const stopBtns = STOPS.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dial-stop";
    b.style.setProperty("--tint", s.tint);
    b.innerHTML = `<span class="dial-dot" aria-hidden="true"></span>${s.note}`;
    b.setAttribute("aria-label", `Tasting note ${s.note}: ${s.coffee}, ${s.brew}, ${s.price} euros`);
    bindChoice(b, i);
    b.addEventListener("focus", () => showPreview(i));
    stopsEl.appendChild(b);
    return b;
  });

  // hover previews (mouse only); click or tap selects
  function bindChoice(el, i) {
    el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") showPreview(i); });
    el.addEventListener("click", () => {
      interacted = true;
      knob.classList.remove("is-nudge"); dialEl.classList.add("is-touched");
      target = i;
      select(i);
    });
  }

  function layoutDial() {
    const size = knob.offsetWidth;
    const cx = knob.offsetLeft + size / 2;
    const cy = knob.offsetTop + size / 2;
    const rLabel = size / 2 + 36;
    const rRing = size / 2 + 13;
    const W = dialEl.offsetWidth, H = dialEl.offsetHeight;
    sectorsEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
    [glowEl, callEl].forEach((el) => { el.style.left = `${cx}px`; el.style.top = `${cy}px`; });
    const pt = (deg, r) => {
      const a = (deg * Math.PI) / 180;
      return [cx + Math.sin(a) * r, cy - Math.cos(a) * r];
    };
    stopBtns.forEach((b, i) => {
      const deg = ANG0 + STEP * i;
      const [x, y] = pt(deg, rLabel);
      b.style.transform = `translate(${(x - W / 2).toFixed(1)}px, ${(y - H / 2).toFixed(1)}px) translate(-50%, -50%)`;
      // the sector: an arc on the ring, centred on this note, with a small gap either side
      const [x1, y1] = pt(deg - STEP / 2 + 4, rRing);
      const [x2, y2] = pt(deg + STEP / 2 - 4, rRing);
      const d = `M${x1.toFixed(1)},${y1.toFixed(1)} A${rRing},${rRing} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
      sectorPaths[i].setAttribute("d", d);
      sectorHits[i].setAttribute("d", d);
    });
  }

  /* ---------- Select a coffee: wheel, text, light and preview ---------- */
  function select(i) {
    const changed = i !== committed;
    hasSelected = true;
    showPreview(i);
    if (!changed) return;
    const s = STOPS[i];
    announce.textContent = `${s.note}: ${s.coffee}, ${s.brew}, ${s.price} euros.`;
    if (reduced) { applyText(i); return; }
    coffeeEl.classList.add("is-swapping");
    setTimeout(() => {
      applyText(i);
      coffeeEl.classList.remove("is-swapping");
    }, 260);
  }

  const selectListeners = [];
  function applyText(i) {
    const s = STOPS[i];
    committed = i;
    selectListeners.forEach((fn) => fn(i));
    root.style.setProperty("--stop", s.liquid);
    $("noteName").textContent = s.note;
    $("coffeeName").textContent = s.coffee;
    $("coffeeDesc").textContent = `${s.line} ${s.notes}`;
    $("coffeeBeans").textContent = s.beans;
    $("coffeeBrew").textContent = s.brew;
    $("coffeePrice").textContent = s.price;
    setMedia(coffeeVideo, s.id);
    knobNote.textContent = s.note;
    knob.setAttribute("aria-valuenow", String(i + 1));
    knob.setAttribute("aria-valuetext", `${s.note}: ${s.coffee}`);
    stopBtns.forEach((b, k) => {
      b.classList.toggle("is-current", k === i);
      b.setAttribute("aria-pressed", String(k === i));
    });
    sectorPaths.forEach((p, k) => p.classList.toggle("is-current", k === i));
    glowLayers.forEach((g, k) => g.classList.toggle("is-current", k === i));
    dialEl.style.setProperty("--note", s.tint);
    orderBtn.classList.remove("is-added");
  }

  /* ---------- The coffee card ---------- */
  let previewStop = -1;

  function fillPreview(i) {
    const s = STOPS[i];
    previewStop = i;
    preview.style.setProperty("--pv", s.liquid);
    $("previewNote").textContent = s.note;
    $("previewCoffee").textContent = s.coffee;
    $("previewDesc").textContent = s.notes;
    $("previewMeta").textContent = `${s.beans} · ${s.brew}`;
    $("previewPrice").textContent = s.price;
    previewAdd.classList.remove("is-added");
    previewAdd.setAttribute("aria-label", `Add ${s.coffee}, ${s.brew}, to basket`);
  }

  // cross-fade to the next coffee: load it in the back layer, then bring it forward.
  // Only the latest request may swap, so quick moves across the wheel never land on a stale cup.
  let mediaToken = 0;
  function showMedia(i) {
    const id = STOPS[i].id;
    const token = ++mediaToken;
    if (pmFront.dataset.id === id) return;
    setMedia(pmBack, id);
    let done = false;
    const swap = () => {
      if (done || token !== mediaToken) return;
      done = true;
      pmBack.classList.add("is-front");
      pmFront.classList.remove("is-front");
      const old = pmFront;
      [pmFront, pmBack] = [pmBack, pmFront];
      setTimeout(() => { if (!old.classList.contains("is-front")) old.pause(); }, 520);
    };
    if (reduced || pmBack.readyState >= 2) swap();
    else {
      pmBack.addEventListener("loadeddata", swap, { once: true });
      setTimeout(swap, 350); // never wait long: the poster is already there
    }
  }

  // the note being previewed lights up on the wheel
  function markHover(i) {
    stopBtns.forEach((b, k) => b.classList.toggle("is-hover", k === i && k !== committed));
    sectorPaths.forEach((p, k) => p.classList.toggle("is-hover", k === i && k !== committed));
  }

  function showPreview(i) {
    cancelHide();
    markHover(i);
    const open = preview.classList.contains("is-open");
    if (!open) {
      fillPreview(i);
      setMedia(pmFront, STOPS[i].id);
      pmFront.play().catch(() => {});
      preview.hidden = false;
      requestAnimationFrame(() => preview.classList.add("is-open"));
      return;
    }
    if (i === previewStop) return;
    showMedia(i);
    if (reduced) { fillPreview(i); return; }
    preview.classList.add("is-swapping");
    clearTimeout(showPreview.t);
    showPreview.t = setTimeout(() => { fillPreview(i); preview.classList.remove("is-swapping"); }, 220);
  }

  let hideTimer = 0;
  function cancelHide() { clearTimeout(hideTimer); }
  function hidePreview() {
    markHover(-1);
    preview.classList.remove("is-open");
    hideTimer = setTimeout(() => {
      if (preview.classList.contains("is-open")) return;
      preview.hidden = true;
      preview.querySelectorAll("video").forEach((v) => v.pause());
    }, 420);
  }

  // on a desktop the card with the coffee's photo stays open while the wheel is in view,
  // so the coffee on offer can always be seen (on phones the photo sits beside its name)
  const deskCard = matchMedia("(min-width: 1100px) and (hover: hover)");
  const phoneStage = matchMedia("(max-width: 899px)");
  let cardShown = false;
  // leaving the wheel area: go back to the selected coffee, or close if nothing was chosen yet
  const wheelWrap = dialEl.closest(".wheel-wrap");
  let leaveTimer = 0;
  wheelWrap.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse" || dragging) return;
    leaveTimer = setTimeout(() => { if (hasSelected || deskCard.matches) showPreview(committed); else hidePreview(); }, 280);
  });
  wheelWrap.addEventListener("pointerenter", () => clearTimeout(leaveTimer));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hidePreview(); });

  /* ---------- Turning the wheel ---------- */
  let lastAngle = 0, lastDetent = START;

  function knobCenter() {
    const r = knob.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function pointerAngle(e) {
    const c = knobCenter();
    const dx = e.clientX - c.x, dy = e.clientY - c.y;
    return { a: (Math.atan2(dx, -dy) * 180) / Math.PI, dist: Math.hypot(dx, dy) };
  }

  dialEl.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".dial-stop, .sector-hit")) return; // those are taps, not drags
    dragging = true;
    interacted = true;
    knob.classList.remove("is-nudge"); dialEl.classList.add("is-touched");
    dialEl.setPointerCapture(e.pointerId);
    lastAngle = pointerAngle(e).a;
    knob.focus({ preventScroll: true });
    e.preventDefault();
  });

  dialEl.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const { a, dist } = pointerAngle(e);
    if (dist < 14) { lastAngle = a; return; } // too close to the centre to read an angle
    let d = a - lastAngle;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    lastAngle = a;
    target = clamp(target + d / STEP, -0.15, STOPS.length - 1 + 0.15);
    const detent = Math.round(clamp(target, 0, STOPS.length - 1));
    if (detent !== lastDetent) {
      lastDetent = detent;
      knobNote.textContent = STOPS[detent].note; // preview the note in the centre
      showPreview(detent);
      if (navigator.vibrate) { try { navigator.vibrate(4); } catch (_) {} }
    }
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    const i = Math.round(clamp(target, 0, STOPS.length - 1));
    target = i;
    knobNote.textContent = STOPS[committed].note;
    select(i);
  };
  dialEl.addEventListener("pointerup", endDrag);
  dialEl.addEventListener("pointercancel", endDrag);
  dialEl.addEventListener("lostpointercapture", endDrag);

  knob.addEventListener("keydown", (e) => {
    const keys = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    let i = null;
    if (e.key in keys) i = clamp(Math.round(target) + keys[e.key], 0, STOPS.length - 1);
    if (e.key === "Home") i = 0;
    if (e.key === "End") i = STOPS.length - 1;
    if (i === null) return;
    e.preventDefault();
    interacted = true;
    knob.classList.remove("is-nudge"); dialEl.classList.add("is-touched");
    target = i;
    select(i);
  });
  knob.addEventListener("focus", () => { if (knob.matches(":focus-visible")) showPreview(committed); });

  /* ---------- Sound: two loops, mixed and warmed by the wheel ----------
     and under them, everywhere on the page, a calm ambient bed (soft piano and pad) */
  const sound = { ctx: null, on: false, cafe: null, vinyl: null, filter: null, master: null, ambient: null, els: [] };

  /* Two ways to play. On a real web address the loops go through Web Audio (needed on iPhone,
     where an <audio> element's volume cannot be changed). Opened as a file (file://), Chrome
     silences anything routed through Web Audio, so there each loop's own volume is faded by hand.
     Both give the same small "gain" object: gain.setTargetAtTime(value, time, seconds). */
  const VIA_GRAPH = location.protocol !== "file:";

  function initSound() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (VIA_GRAPH && !AC) return false;
    if (!VIA_GRAPH) return initPlainSound();
    const ctx = new AC();
    const make = (src) => {
      const el = new Audio(src);
      el.loop = true;
      el.preload = "auto";
      const node = ctx.createMediaElementSource(el);
      const g = ctx.createGain();
      g.gain.value = 0;
      node.connect(g);
      sound.els.push(el);
      return g;
    };
    sound.ctx = ctx;
    sound.cafe = make("assets/audio/morning-cafe.mp3");
    sound.vinyl = make("assets/audio/evening-vinyl.mp3");
    sound.filter = ctx.createBiquadFilter();
    sound.filter.type = "lowpass";
    sound.filter.frequency.value = 9000;
    sound.master = ctx.createGain();
    sound.master.gain.value = 0;
    sound.cafe.connect(sound.filter);
    sound.vinyl.connect(sound.filter);
    sound.filter.connect(sound.master).connect(ctx.destination);
    sound.ambient = make("assets/audio/ambient-bed.mp3");     // its own level, not tied to the café view
    sound.ambient.connect(ctx.destination);
    return true;
  }

  // file:// version: a level per loop eased towards its target; café and vinyl also follow the master
  function initPlainSound() {
    const t0 = performance.now();
    const level = () => {
      const p = { value: 0, target: 0, tau: 0.2 };
      p.setTargetAtTime = (v, _t, tau) => { p.target = v; p.tau = Math.max(0.02, tau); };
      return p;
    };
    const make = (src) => {
      const el = new Audio(src);
      el.loop = true;
      el.preload = "auto";
      el.volume = 0;
      sound.els.push(el);
      return { el, gain: level() };
    };
    const cafe = make("assets/audio/morning-cafe.mp3");
    const vinyl = make("assets/audio/evening-vinyl.mp3");
    const ambient = make("assets/audio/ambient-bed.mp3");
    const master = { gain: level() };
    sound.ctx = { get currentTime() { return (performance.now() - t0) / 1000; }, resume: () => Promise.resolve() };
    sound.cafe = cafe; sound.vinyl = vinyl; sound.ambient = ambient; sound.master = master;   // each has .gain, like a GainNode
    sound.filter = { frequency: { setTargetAtTime() {} } };   // no tone filter in this mode
    let last = performance.now();
    setInterval(() => {
      const now = performance.now(), dt = (now - last) / 1000;
      last = now;
      for (const p of [cafe.gain, vinyl.gain, ambient.gain, master.gain]) {
        p.value += (p.target - p.value) * (1 - Math.exp(-dt / p.tau));
      }
      const set = (ch, v) => { ch.el.volume = Math.min(1, Math.max(0, v)); };
      set(cafe, cafe.gain.value * master.gain.value);
      set(vinyl, vinyl.gain.value * master.gain.value);
      set(ambient, ambient.gain.value);
    }, 40);
    return true;
  }

  soundBtn.addEventListener("click", async () => {
    if (!sound.ctx && !initSound()) return;
    sound.on = !sound.on;
    const label = sound.on ? "Sound on" : "Sound off";
    soundBtn.setAttribute("aria-pressed", String(sound.on));
    soundBtn.setAttribute("aria-label", label);
    soundBtn.classList.toggle("sound-on", sound.on);
    soundBtn.querySelector(".sound-label").textContent = label;
    if (sound.on) {
      await sound.ctx.resume();
      sound.els.forEach((el) => el.play().catch(() => {}));
      sound.ambient.gain.setTargetAtTime(AMBIENT_LEVEL, sound.ctx.currentTime, 1.2);   // fades in slowly
      updateSound();
    } else {
      sound.master.gain.setTargetAtTime(0, sound.ctx.currentTime, 0.15);
      sound.ambient.gain.setTargetAtTime(0, sound.ctx.currentTime, 0.15);
      setTimeout(() => { if (!sound.on) sound.els.forEach((el) => el.pause()); }, 700);
    }
  });

  const AMBIENT_LEVEL = 0.4;    // the music bed: quiet, under the café
  function updateSound() {
    if (!sound.ctx || !sound.on) return;
    const k = clamp(value / (STOPS.length - 1));
    const now = sound.ctx.currentTime;
    sound.cafe.gain.setTargetAtTime(lerp(0.9, 0.12, k), now, 0.12);
    sound.vinyl.gain.setTargetAtTime(lerp(0.05, 0.85, k), now, 0.12);
    sound.filter.frequency.setTargetAtTime(14000 * Math.pow(0.15, k), now, 0.12);
    sound.master.gain.setTargetAtTime(inView ? 0.75 * seg(progress, 0.3, 0.6) : 0, now, 0.25);
  }

  /* ---------- Basket ----------
     One basket for everything: the wheel's coffees, the menu and the beans (shop.js).
     Each line is one product with its chosen options; adding the same again raises the count.
     The basket is kept in this browser (localStorage), so it is still there on the checkout
     page (checkout.html) and after a reload. Prices are checked again by the server at payment. */
  const BASKET_KEY = "umber-basket-v1";
  const basket = [];                       // { key, id, name, detail, price, qty }
  const basketListeners = [];
  const basketTotalQty = () => basket.reduce((n, l) => n + l.qty, 0);
  try {
    const saved = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]");
    if (Array.isArray(saved)) saved.forEach((l) => {
      if (l && l.key && l.id && l.name && Number(l.qty) > 0 && Number.isFinite(Number(l.price)))
        basket.push({ key: String(l.key), id: String(l.id), name: String(l.name), detail: String(l.detail || ""), price: Number(l.price), qty: Math.min(99, Math.floor(Number(l.qty))) });
    });
  } catch (_) { /* no storage: the basket lives for this visit only */ }
  function saveBasket() {
    try { localStorage.setItem(BASKET_KEY, JSON.stringify(basket)); } catch (_) {}
  }
  function basketChanged(said) {
    saveBasket();
    const n = basketTotalQty();
    basketCount.textContent = String(n);
    basketBtn.setAttribute("aria-label", `Basket, ${n} item${n === 1 ? "" : "s"}`);
    basketCount.classList.remove("bump");
    void basketCount.offsetWidth;
    basketCount.classList.add("bump");
    if (said) announce.textContent = said;
    basketListeners.forEach((fn) => fn(basket));
  }
  function addItem(item, btn) {
    const key = `${item.id}|${item.detail || ""}`;
    const line = basket.find((l) => l.key === key);
    if (line) line.qty += 1;
    else basket.push({ key, id: item.id, name: item.name, detail: item.detail || "", price: Number(item.price), qty: 1 });
    if (btn) btn.classList.add("is-added");
    basketChanged(`${item.name}${item.detail ? `, ${item.detail}` : ""}, added to your basket.`);
    document.dispatchEvent(new CustomEvent("umber:added", { detail: { name: item.name, detail: item.detail || "", price: Number(item.price) } }));
  }
  function setQty(key, qty) {
    const i = basket.findIndex((l) => l.key === key);
    if (i < 0) return;
    if (qty <= 0) basket.splice(i, 1); else basket[i].qty = qty;
    basketChanged();
  }
  // the wheel's coffee is the same item as on the menu ("Single origins"), so it is one line in the basket
  function addToBasket(i, btn) {
    const s = STOPS[i];
    const d = window.UMBER_SHOP && window.UMBER_SHOP.drinks.find((x) => x.origin === s.id);
    if (d) addItem({ id: `drink-${d.id}-one-here`, name: d.name, detail: "In the café", price: d.price }, btn);
    else addItem({ id: `wheel-${s.id}`, name: `${s.coffee} ${s.brew.toLowerCase()}`, detail: "In the café", price: s.price }, btn);
  }
  if (basket.length) {                   // a basket kept from an earlier visit
    const n = basketTotalQty();
    basketCount.textContent = String(n);
    basketBtn.setAttribute("aria-label", `Basket, ${n} item${n === 1 ? "" : "s"}`);
  }
  basketBtn.addEventListener("click", () => document.dispatchEvent(new CustomEvent("umber:basket")));
  orderBtn.addEventListener("click", () => addToBasket(committed, orderBtn));
  previewAdd.addEventListener("click", () => addToBasket(previewStop, previewAdd));

  /* ---------- Floating motes: depth from layers ---------- */
  // Near motes are large, sharp and slow; far motes are small, soft and quicker.
  const motes = (() => {
    const ctx = canvas.getContext("2d");
    let dpr = 1, list = [], w = 0, h = 0;
    const sprite = (soft) => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d");
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,240,216,1)");
      grad.addColorStop(soft ? 0.15 : 0.55, "rgba(255,236,206,0.85)");
      grad.addColorStop(1, "rgba(255,230,196,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return c;
    };
    const sharp = sprite(false), soft = sprite(true);
    const LAYERS = [
      { share: 0.5, r: [0.7, 1.4], v: 16, a: 0.28, img: soft },  // far
      { share: 0.32, r: [1.4, 2.4], v: 10, a: 0.4, img: soft },  // middle
      { share: 0.18, r: [2.6, 3.8], v: 6, a: 0.5, img: sharp }   // near
    ];
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      const count = Math.round(clamp((w * h) / 22000, 18, 56));
      list = [];
      LAYERS.forEach((L) => {
        const n = Math.round(count * L.share);
        for (let k = 0; k < n; k++) {
          list.push({
            L, x: Math.random() * w, y: Math.random() * h,
            r: lerp(L.r[0], L.r[1], Math.random()),
            ph: Math.random() * Math.PI * 2,
            sp: 0.7 + Math.random() * 0.6
          });
        }
      });
    }
    function draw(dt, t, alpha) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (alpha <= 0.01) return;
      const k = clamp(value / (STOPS.length - 1));
      const speed = lerp(1.15, 0.5, k); // deeper = heavier, slower air
      for (const m of list) {
        m.y -= m.L.v * m.sp * speed * dt;
        m.x += Math.sin(t * 0.0004 * m.sp + m.ph) * 4 * dt;
        if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
        if (m.x < -10) m.x = w + 10; else if (m.x > w + 10) m.x = -10;
        ctx.globalAlpha = m.L.a * alpha * (0.75 + 0.25 * Math.sin(t * 0.001 * m.sp + m.ph));
        const d = m.r * 2;
        ctx.drawImage(m.L.img, m.x - m.r, m.y - m.r, d, d);
      }
      ctx.globalAlpha = 1;
    }
    return { resize, draw };
  })();

  /* ---------- Draw the wheel and the room light each frame ---------- */
  function renderDial() {
    const angle = ANG0 + STEP * value;
    knobFace.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    knobFace.style.setProperty("--rot", `${angle.toFixed(2)}deg`);
    // live light: three real lightings of the café, blended by the wheel.
    // Citrus = morning, Honey = late morning, Caramel = low sun, Cocoa = lamps on.
    const light = value <= 0 ? 0 : value <= 2.5 ? (value / 2.5) * 1.1 : 1.1 + ((value - 2.5) / 1.5) * 0.9;
    roomAfternoon.style.opacity = clamp(light).toFixed(3);
    roomEvening.style.opacity = clamp(light - 1).toFixed(3);
    tintLayers.forEach((layer, i) => {
      layer.style.opacity = (clamp(1 - Math.abs(value - i)) * 0.06).toFixed(3);
    });
    const near = Math.round(clamp(value, 0, STOPS.length - 1));
    stopBtns.forEach((b, i) => b.classList.toggle("is-near", i === near && i !== committed));
    sectorPaths.forEach((p, i) => p.classList.toggle("is-near", i === near && i !== committed));
  }

  /* ---------- The doorway: scroll pushes through the glass door into the café ---------- */
  let progress = -1, arriveTop = 0, arriveRun = 1, nudged = false;
  // where the glass door sits in the street photo (0..1), and how the photo is framed
  const DOOR = { x: 0.508, y: 0.6 }, STREET = { w: 1280, h: 714, posX: 0.51, posY: 0.6 };

  function layoutStage() {
    const vw = innerWidth, vh = hero.clientHeight;
    arriveTop = arrive.getBoundingClientRect().top + scrollY;
    arriveRun = Math.max(1, arrive.offsetHeight - vh);
    const sc = Math.max(vw / STREET.w, vh / STREET.h);
    const w = STREET.w * sc, h = STREET.h * sc;
    const ox = (vw - w) * STREET.posX + DOOR.x * w;
    const oy = (vh - h) * STREET.posY + DOOR.y * h;
    street.style.transformOrigin = `${ox.toFixed(0)}px ${oy.toFixed(0)}px`;
    progress = -1; // redraw
  }

  function renderStage(p) {
    // 1. towards the door, through its dark glass
    const push = easeInOut(seg(p, 0, 0.42));
    const dark = easeInOut(seg(p, 0.3, 0.4)) * (1 - easeInOut(seg(p, 0.42, 0.54)));
    street.style.transform = reduced ? "none" : `scale(${(1 + 3.2 * push).toFixed(4)})`;
    const gone = p >= 0.41;
    street.style.opacity = gone ? "0" : "1";
    street.style.visibility = gone ? "hidden" : "visible";
    threshold.style.opacity = dark.toFixed(3);

    const words = easeOut(seg(p, 0, 0.16));
    doorCopy.style.opacity = (1 - words).toFixed(3);
    doorCopy.style.transform = reduced ? "none" : `translate3d(0, ${(-48 * words).toFixed(1)}px, 0)`;
    doorCopy.style.visibility = words >= 1 ? "hidden" : "visible";

    // 2. the café settles
    const settle = easeOut(seg(p, 0.4, 0.66));
    heroMedia.style.transform = reduced || settle >= 1 ? "none" : `scale(${(1.16 - 0.16 * settle).toFixed(4)})`;

    // 3. the coffee, the wheel and the card arrive
    // (phones: the photograph fills only the top, so they come in as the doorway's dark lifts,
    // and the screen is never left half empty)
    const d = phoneStage.matches ? easeOut(seg(p, 0.44, 0.58)) : easeOut(seg(p, 0.58, 0.7));
    heroUI.style.opacity = d.toFixed(3);
    heroUI.style.transform = reduced || d >= 1 ? "none" : `translate3d(0, ${((1 - d) * 24).toFixed(1)}px, 0)`;
    heroUI.classList.toggle("is-ready", d > 0);
    heroUI.style.pointerEvents = d > 0.6 ? "auto" : "none";
    bar.classList.toggle("is-inside", p > 0.45);
    if (d < 0.6 && preview.classList.contains("is-open")) hidePreview();
    if (d < 0.6) cardShown = false;
    else if (d >= 1 && deskCard.matches && !cardShown) { cardShown = true; showPreview(committed); }

    // a gentle nudge so first-time visitors see the wheel turns
    if (d >= 1 && !nudged && !interacted && !reduced) {
      nudged = true;
      setTimeout(() => { if (!interacted) knob.classList.add("is-nudge"); }, 450);
    }
  }

  /* ---------- One loop for everything ---------- */
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // the knob follows the finger with a little weight; with reduced motion it settles quickly
    const ease = reduced ? 0.5 : dragging ? 0.35 : 0.12;
    const k = 1 - Math.pow(1 - ease, dt * 60);
    const before = value;
    value += (target - value) * k;
    if (Math.abs(target - value) < 0.0005) value = target;
    if (value !== before || dragging) renderDial();
    const p = clamp((scrollY - arriveTop) / arriveRun, 0, 1.0001);
    if (p !== progress) { progress = p; renderStage(p); }
    updateSound();
    if (!reduced) motes.draw(dt, now, seg(progress, 0.46, 0.66));
    if (inView) requestAnimationFrame(tick);
  }

  new IntersectionObserver((entries) => {
    const was = inView;
    inView = entries[0].isIntersecting;
    if (inView && !was) { last = performance.now(); requestAnimationFrame(tick); }
  }).observe(hero);

  /* ---------- Shared with story.js ---------- */
  window.UMBER = {
    STOPS, MEDIA, VIDEO_KIND,
    selected: () => committed,
    onSelect: (fn) => { selectListeners.push(fn); },
    addToBasket,
    addItem, setQty,
    basket: () => basket,
    onBasket: (fn) => { basketListeners.push(fn); },
    // choose a coffee on the wheel from elsewhere on the page (the same as tapping its note)
    choose: (i) => { const b = stopBtns[i]; if (b) b.click(); },
    // back to the wheel: the end of the doorway stage, where the café and the wheel are fully in view
    toWheel: () => {
      const top = arrive.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + (arrive.offsetHeight - hero.clientHeight), behavior: reduced ? "auto" : "smooth" });
      setTimeout(() => knob.focus({ preventScroll: true }), reduced ? 0 : 900);
    }
  };

  // "Skip to the tasting wheel": go to where the wheel is fully in view, not to the middle of the doorway
  const skipLink = document.querySelector('.skip[href="#knob"]');
  if (skipLink) skipLink.addEventListener("click", (e) => { e.preventDefault(); window.UMBER.toWheel(); });

  /* ---------- Start ---------- */
  applyText(START);
  fillPreview(START);
  // pause loops while the first screen is off-screen (saves battery on phones)
  new IntersectionObserver(([e]) => {
    document.querySelectorAll(".hero video").forEach((v) => {
      if (!e.isIntersecting) v.pause();
      else if (v.src && (v === coffeeVideo || v.classList.contains("is-front"))) v.play().catch(() => {});
    });
  }).observe(hero);
  function layout() { layoutDial(); motes.resize(); layoutStage(); }
  layout();
  renderDial();
  addEventListener("resize", layout);
  addEventListener("load", layout);
  document.fonts?.ready.then(layoutDial);
  requestAnimationFrame(tick);

})();
