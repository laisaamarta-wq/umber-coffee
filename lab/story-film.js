/* ==========================================================================
   UMBER · The film · a short film that plays by itself
   The café hero is the film's first frame. Scrolling on from the café starts the
   film: the café dissolves into it and it plays to the end on its own (about
   25 seconds), with Skip always at hand. Only this one screen is held while it
   plays; scrolling up lets go. At the end (or on Skip) the page carries on to
   your cup: the same coffee, basket and wheel as the café above.
   The film and its chapters are planned in lab/film/film.js (`cut`).
   ========================================================================== */
(() => {
  "use strict";
  const U = window.UMBER, F = window.UMBER_FILM;
  const root = document.getElementById("story"), cup = document.getElementById("yourCup");
  if (!U || !F || !F.cut || !root || !cup) return;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;
  const $ = (s, el = root) => el.querySelector(s);

  const video = $(".sf-video"), endImg = $(".sf-end"), bar = $(".sf-progress span");
  const chapterEl = $(".sf-chapter"), skipBtn = $("#sfSkip"), playBtn = $("#sfPlay"), status = $("#sfStatus");
  const BASE = `assets/film/${F.cut.name}`;
  video.poster = `${BASE}-poster.jpg`;               // the first frame: the same café as the hero
  endImg.src = `${BASE}-end.jpg`;                     // the last frame: her first sip
  $(".sf-cup-bg img", cup).src = `${BASE}-end.jpg`;

  /* ---------- Where each chapter begins in the cut (seconds) ---------- */
  // the same arithmetic as lab/film/cut.py: dissolves overlap, speed may ease from one value to another
  const FPS = 24;
  const fade = (j) => (j === "soft" ? 3 : j && j.startsWith("dissolve") ? +j.slice(8) || 5 : 0) / FPS;
  const span = (p) => {
    const d = p.out - p.in, s = p.speed || 1;
    if (!Array.isArray(s)) return d / s;
    return s[0] === s[1] ? d / s[0] : (d / (s[1] - s[0])) * Math.log(s[1] / s[0]);
  };
  let total = 0;
  const marks = [], pieceAt = [];
  F.cut.pieces.forEach((p, i) => {
    const start = i ? total - fade(p.join) : 0;
    if (p.chapter != null) marks.push({ t: start, c: p.chapter, n: marks.length + 1 });
    const shot = F.shots.find((s) => s.id === p.shot) || {};
    pieceAt.push({ t: start, x: shot.phoneX });   // phones see a narrow slice of the frame (`phoneX`)
    total = start + span(p);
  });
  // the opening title, over the first shot: whose story this is, and what it is about
  marks.unshift({ t: 0.25, intro: true });
  let lastX = null;
  function frameAt(mediaTime) {
    const d = video.duration || total, t = mediaTime * (total / d) + 0.01;
    let x;
    for (const p of pieceAt) if (t >= p.t) x = p.x;
    const pos = W < 900 && x != null ? `${x}% 50%` : "";
    if (pos !== lastX) { video.style.objectPosition = pos; lastX = pos; }
  }
  // set on the frame itself where the browser can, so the slice moves exactly on the cut
  if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
    const onFrame = (_, meta) => { frameAt(meta.mediaTime); video.requestVideoFrameCallback(onFrame); };
    video.requestVideoFrameCallback(onFrame);
  } else video.addEventListener("timeupdate", () => frameAt(video.currentTime));
  const LINES = F.chapters.map((c) => c.title);
  const NAMES = F.chapters.map((c) => c.name);     // "Roasting", without a claim about where

  /* ---------- Layout ---------- */
  let H = innerHeight, W = innerWidth, top = 0;
  const cupTop = () => cup.getBoundingClientRect().top + scrollY;
  function layout() {
    H = innerHeight; W = innerWidth;
    top = root.getBoundingClientRect().top + scrollY;   // = where the café's pinned screen ends
    measureFit();
    if (state === "playing") scrollTo(0, top);
  }

  /* ---------- The café hands over to the film ---------- */
  const arrive = document.getElementById("arrive"), hero = document.getElementById("hero");
  const heroMedia = document.getElementById("heroMedia"), heroUI = document.getElementById("heroUI");
  const motes = document.getElementById("motes");
  // phones: the hero photograph fills only the top of the screen; it opens up to the film's
  // full-screen framing of the same café before the two meet, so the room never jumps
  const fit = { s: 1, tx: 0 };
  function measureFit() {
    const hm = heroMedia.offsetHeight || H;
    const img = heroMedia.querySelector(".room-img");
    const A = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 1280 / 714;
    const px = parseFloat(getComputedStyle(img || heroMedia).objectPosition) / 100 || 0.5;
    const pv = W >= 900 ? 0.5 : 0.6;                               // the film's framing (story-film.css)
    fit.s = Math.max(1, H / hm);
    const w1 = Math.max(W, hm * A), x1 = (W - w1) * px;
    const w2 = Math.max(W, H * 16 / 9), x2 = (W - w2) * pv;
    fit.tx = fit.s > 1.01 ? x2 - (W / 2 + (x1 - W / 2) * fit.s) : 0;
  }
  let hand = 0;   // 0: the café as on the homepage · 1: the film
  function handover(p) {
    hand = p;
    // once the film has the screen, the café is held out of sight as a whole (the café's own
    // scroll code redraws its parts whenever the page moves, e.g. on the way to your cup)
    html.classList.toggle("sf-hide-hero", p >= 1);
    if (p <= 0) {
      hero.style.removeProperty("--hero-bg");
      arrive.style.pointerEvents = "";
      heroMedia.style.opacity = ""; heroMedia.style.transform = "none"; heroMedia.style.transformOrigin = "";
      motes.style.opacity = "";
      heroUI.style.opacity = "1"; heroUI.style.transform = "none"; heroUI.style.pointerEvents = "auto";
      return;
    }
    arrive.style.pointerEvents = "none";            // the film and Skip lie underneath
    const z = ease(seg(p, 0, 0.55));
    const sc = (1 + (fit.s - 1) * z) * (1 + 0.025 * ease(p));        // and the camera starts to move
    heroMedia.style.transformOrigin = "50% 0";
    heroMedia.style.transform = `translate3d(${(fit.tx * z).toFixed(1)}px, 0, 0) scale(${sc.toFixed(4)})`;
    const fade = fit.s > 1.01 ? ease(seg(p, 0.45, 0.95)) : ease(seg(p, 0.15, 0.8));
    heroMedia.style.opacity = (1 - fade).toFixed(3);
    motes.style.opacity = (1 - fade).toFixed(3);
    hero.style.setProperty("--hero-bg", (1 - fade).toFixed(3));
    const leave = ease(seg(p, 0, 0.45));             // the coffee, the wheel and the card step away
    heroUI.style.opacity = (1 - leave).toFixed(3);
    heroUI.style.transform = `translate3d(0, ${(-24 * leave).toFixed(1)}px, 0)`;
    heroUI.style.pointerEvents = "none";
  }

  /* small time-based tweens (transform/opacity work only; scroll for the hand-off) */
  function tween(from, to, ms, fn) {
    return new Promise((done) => {
      if (ms <= 0 || reduced) { fn(to); done(); return; }
      const t0 = performance.now();
      const step = (now) => {
        const k = clamp((now - t0) / ms);
        fn(from + (to - from) * ease(k));
        if (k < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  }
  const scrollTween = (y, ms) => tween(scrollY, y, ms, (v) => scrollTo(0, v));

  /* ---------- The film ---------- */
  let loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    video.preload = "auto";
    video.src = `${BASE}.${U.VIDEO_KIND}`;
  }

  // idle → playing → done; "paused" when you scroll back up during the film
  let state = reduced ? "still" : "idle";
  if (reduced) { root.classList.add("is-reduced"); playBtn.hidden = false; }

  const lock = () => html.classList.add("sf-locked");
  const unlock = () => html.classList.remove("sf-locked");

  function play() {
    const go = video.play();
    if (go) go.catch(() => { if (state === "playing") playBtn.hidden = false; });
  }

  function start() {
    if (state === "playing" || state === "done") return;
    const resume = state === "paused" && video.currentTime > 0.2 && !video.ended;
    state = "playing";
    root.classList.add("is-playing");
    lock();
    scrollTo(0, top);                   // hold this one screen
    load();
    if (!resume) { try { video.currentTime = 0; } catch (_) {} }
    endImg.classList.remove("is-on");
    play();
    tween(hand, 1, resume ? 400 : 1000, handover);
    status.textContent = "The story is playing, about 25 seconds. Skip story is at the bottom right.";
    loop();
  }

  // scrolling up during the film: let go, keep the place, the café comes back
  function leaveUp() {
    if (state !== "playing") return;
    state = "paused";
    video.pause();
    root.classList.remove("is-playing");
    unlock();
    tween(hand, 0, 450, handover);
    status.textContent = "Story paused. Scroll down to carry on.";
  }

  // the end, or Skip: on to your cup
  function finish(skipped) {
    if (state === "done") return;
    const wasStill = state === "still";
    state = "done";
    video.pause();
    video.controls = false;
    root.classList.remove("is-playing");
    if (skipped && !wasStill) endImg.classList.add("is-on");      // the last moment, in a breath
    unlock();
    status.textContent = skipped ? "Story skipped." : "Story finished.";
    scrollTween(cupTop(), reduced ? 0 : skipped ? 900 : 1200).then(() => {
      if (!wasStill) handover(0);                 // the café is back, out of sight above
      cup.focus({ preventScroll: true });
    });
  }

  function again() {
    if (reduced) {
      state = "still";
      scrollTo(0, root.getBoundingClientRect().top + scrollY);
      playStill();
      return;
    }
    if (state === "playing") return;
    state = "idle";
    endImg.classList.remove("is-on");
    try { video.currentTime = 0; } catch (_) {}
    window.UMBER_NAV_UNTIL = performance.now() + 1400;   // the way there is a jump, not a scroll into the film
    const far = Math.abs(scrollY - top) > 2.5 * H;
    scrollTween(top, far ? 1100 : 800).then(start);
  }
  // the "Watch the story" button in the top bar (shop.js) plays it again from anywhere
  window.UMBER_STORY = { watch: again };

  // reduced motion: nothing moves until you ask; then the film plays with its own controls
  function playStill() {
    load();
    video.controls = true;
    root.classList.add("is-playing");
    playBtn.hidden = true;
    play();
  }

  /* progress and chapters, from the film's own clock */
  let raf = 0, shownChapter = -1, swapTimer = 0;
  function loop() {
    if (raf) return;
    const tick = () => {
      raf = 0;
      const d = video.duration || total;
      const t = (video.currentTime || 0) * (total / d);
      bar.style.transform = `scaleX(${clamp(t / total).toFixed(4)})`;
      let c = -1;
      for (let k = 0; k < marks.length; k++) {
        const end = k + 1 < marks.length ? marks[k + 1].t : total;
        if (t >= marks[k].t + 0.15 && t < end - 0.3) c = k;
      }
      if (c >= 0 && marks[c].c === F.chapters.length - 1) c = -1;   // her moment is left without words
      if (c !== shownChapter) showChapter(c);
      if (state === "playing") raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function showChapter(c) {
    shownChapter = c;
    const wasOn = chapterEl.classList.contains("is-on");
    chapterEl.classList.remove("is-on");
    clearTimeout(swapTimer);
    if (c < 0) return;
    swapTimer = setTimeout(() => {
      const m = marks[c];
      $(".sf-n").textContent = m.intro ? "The UMBER story" : String(m.n).padStart(2, "0");
      $(".sf-name").textContent = m.intro ? "" : NAMES[m.c];
      $(".sf-line").textContent = m.intro ? "From the farm to your cup." : LINES[m.c];
      chapterEl.classList.add("is-on");
    }, wasOn ? 260 : 0);
  }

  video.addEventListener("ended", () => {
    if (state === "playing") finish(false);
    else if (state === "still") { root.classList.remove("is-playing"); video.controls = false; }
  });
  document.addEventListener("visibilitychange", () => {
    if (state !== "playing") return;
    if (document.hidden) video.pause(); else play();
  });

  /* ---------- What starts it, and what lets go ---------- */
  let lastY = scrollY, lastInput = -1e9, touchY = null, hinted = 0;
  const intent = () => { lastInput = performance.now(); };
  function hint() {                                  // scrolling on during the film: point at Skip
    const now = performance.now();
    if (now - hinted < 1200) return;
    hinted = now;
    skipBtn.classList.add("is-hint");
    setTimeout(() => skipBtn.classList.remove("is-hint"), 700);
  }
  addEventListener("wheel", (e) => {
    intent();
    if (state !== "playing") return;
    if (e.deltaY < -2) leaveUp(); else if (e.deltaY > 2) hint();
  }, { passive: true });
  addEventListener("touchstart", (e) => { intent(); touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchmove", (e) => {
    intent();
    if (state !== "playing" || touchY == null) return;
    const dy = e.touches[0].clientY - touchY;
    if (dy > 40) { touchY = null; leaveUp(); } else if (dy < -40) { touchY = null; hint(); }
  }, { passive: true });
  addEventListener("pointerdown", intent, { passive: true });
  addEventListener("keydown", (e) => {
    intent();
    if (state !== "playing") return;
    if (e.key === "Escape") finish(true);
    else if (["ArrowUp", "PageUp", "Home"].includes(e.key)) leaveUp();
    else if (["ArrowDown", "PageDown", "End"].includes(e.key) || (e.key === " " && e.target === document.body)) hint();
  });

  addEventListener("scroll", () => {
    const y = scrollY, down = y > lastY;
    lastY = y;
    if (state === "playing" || state === "done" || state === "still") return;
    if (y > top - 1.5 * H) load();                 // close: get the film ready
    // one deliberate scroll on from the café starts it (a jump far down the page does not)
    // (a jump made by a link, such as "Order takeaway", passes the film by: shop.js marks it)
    const jumping = performance.now() < (window.UMBER_NAV_UNTIL || 0);
    if (down && !jumping && y > top + 2 && y < top + H * 0.9 && performance.now() - lastInput < 1500) start();
  }, { passive: true });

  skipBtn.addEventListener("click", () => finish(true));
  playBtn.addEventListener("click", () => (reduced ? playStill() : play()));
  document.getElementById("sfAgain").addEventListener("click", again);

  /* ---------- Your cup: the selected coffee, with the café's own basket and wheel ---------- */
  const cupVideo = $(".sf-cup-media video", cup);
  const article = (w) => (/^[aeiou]/i.test(w) ? "an" : "a");
  const notesList = $(".sf-notes-list", cup);
  const chips = U.STOPS.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "sf-note"; b.textContent = s.note;
    b.style.setProperty("--dot", s.tint);
    b.setAttribute("aria-label", `${s.note}: ${s.coffee}, ${s.brew}, ${s.price} euros`);
    // the wheel's own buttons choose the coffee, so the café, basket and wheel stay in step
    b.addEventListener("click", () => {
      const stop = document.querySelectorAll("#dialStops .dial-stop")[i];
      if (stop) stop.click();
    });
    notesList.appendChild(b);
    return b;
  });
  let cupShown = -1, cupInView = false;
  function fillCup(i) {
    const s = U.STOPS[i], m = U.MEDIA[s.id];
    const brew = s.brew.toLowerCase();
    const apply = () => {
      $('[data-copy="final"]', cup).textContent = `${s.coffee}, brewed as ${article(brew)} ${brew}. ${s.notes} Take a moment. Breathe it in.`;
      $('[data-copy="beans"]', cup).textContent = s.beans;
      $('[data-copy="brew"]', cup).textContent = s.brew;
      document.getElementById("storyPrice").textContent = s.price;
      document.getElementById("storyOrder").classList.remove("is-added");
      chips.forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
      cupVideo.poster = m.poster;
      cupVideo.src = m[U.VIDEO_KIND];
      if (cupInView && !reduced) cupVideo.play().catch(() => {});
      cup.classList.remove("is-swapping");
    };
    if (cupShown < 0 || reduced) apply();
    else { cup.classList.add("is-swapping"); setTimeout(apply, 280); }
    cupShown = i;
  }
  U.onSelect(fillCup);
  fillCup(U.selected());
  new IntersectionObserver(([e]) => {
    cupInView = e.isIntersecting;
    if (cupInView && !reduced) cupVideo.play().catch(() => {}); else cupVideo.pause();
  }).observe(cup);

  document.getElementById("storyOrder").addEventListener("click", (e) => U.addToBasket(U.selected(), e.currentTarget));
  document.getElementById("storyWheel").addEventListener("click", () => U.toWheel());

  addEventListener("resize", layout);
  addEventListener("load", layout);
  layout();
})();
