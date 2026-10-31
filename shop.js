/* ==========================================================================
   UMBER · the menu, the signature drinks, the takeaway cups and the beans
   Built from products.js; every "Add" goes into the one basket in app.js.
   Plain JavaScript, no libraries.
   ========================================================================== */
(() => {
  "use strict";
  const U = window.UMBER, S = window.UMBER_SHOP;
  if (!U || !S) return;
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => `${S.currency}${Number(n).toFixed(2)}`;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const drink = (id) => S.drinks.find((d) => d.id === id);

  // a photo, or (until it exists) a drawn stand-in of the right vessel
  function photo(src, kind, alt, cls = "") {
    return `<span class="ph ph-${kind} ${cls}"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async"
      onload="this.parentElement.classList.add('has-photo')" onerror="this.remove()"></span>`;
  }
  const tags = (d) => [
    d.origin ? "Single origin" : "",
    d.vessel === "dessert" || d.vessel === "bowl" ? "Dessert" : d.temp === "iced" ? "Iced" : "Hot",
    d.signature ? "Signature" : "",
    d.togo ? "To go" : ""
  ].filter(Boolean);

  /* ---------- Going to the menu from elsewhere ---------- */
  // tell the story film this is a jump, not a scroll into the story (lab/story-film.js)
  function goTo(id) {
    const el = $(id);
    if (!el) return;
    window.UMBER_NAV_UNTIL = performance.now() + 2000;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!["menu", "signature", "pour", "takeaway", "beans"].includes(id)) return;
    e.preventDefault();
    if (a.dataset.menuFilter) setFilter(a.dataset.menuFilter);
    goTo(id);
    history.replaceState(null, "", `#${id}`);
  });

  /* ---------- "Watch the story" in the top bar ---------- */
  // plays the film again from wherever you are (lab/story-film.js); on pages with
  // another story it simply goes to that story
  document.querySelectorAll("[data-to-wheel]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); U.toWheel(); }));
  document.querySelectorAll("#storyBtn, [data-watch-story]").forEach((b) => b.addEventListener("click", () => {
    if (window.UMBER_STORY) window.UMBER_STORY.watch();
    else { const st = $("story"); if (st) st.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  }));

  /* ---------- The menu: filters that really filter ---------- */
  const grid = $("menuGrid"), filtersEl = $("menuFilters"), countEl = $("menuCount");
  let filter = "all";
  const matches = (d, f) => f === "all" || (f === "origin" && d.origin) || (f === "hot" && d.temp === "hot") || (f === "iced" && d.temp === "iced")
    || (f === "signature" && d.signature) || (f === "takeaway" && d.togo);
  const filterBtns = S.filters.map((f) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "menu-filter"; b.dataset.filter = f.id;
    b.textContent = f.label;
    b.addEventListener("click", () => setFilter(f.id));
    filtersEl.appendChild(b);
    return b;
  });

  function card(d) {
    const sizes = d.sizes ? S.options[d.sizes] : null;
    return `<li class="card" data-id="${d.id}">
      <button class="card-open" type="button" aria-label="${esc(d.name)}: details and options">
        ${photo(S.photo.drink(d.id), d.vessel, d.name, d.origin ? "card-photo ph-origin" : "card-photo")}
      </button>
      <div class="card-body">
        <p class="card-tags">${tags(d).map((t) => `<span>${t}</span>`).join("")}</p>
        <h3 class="card-name">${esc(d.name)}</h3>
        <p class="card-line">${esc(d.line)}</p>
        <div class="card-foot">
          <span class="card-price">${sizes ? "from " : ""}${money(d.price)}</span>
          <button class="card-add" type="button" aria-label="Add ${esc(d.name)} to the basket"><span aria-hidden="true">+</span></button>
        </div>
      </div>
    </li>`;
  }
  // even rows: four across on a computer, three on a tablet; a phone lists them one per row. If the count leaves
  // a gap, the first drinks take more room (one or two cards two wide, or one two by two),
  // so every row is full and the columns never change with the filter
  function gridPlan(n) {
    const w = innerWidth;
    const c = w < 600 ? 1 : w < 900 ? 3 : 4;              // phones: one drink per row, photo beside the words
    const extra = (c - (n % c)) % c;               // empty places in the last row
    if (extra === 0 || n < 2) return { c, wide: 0, large: false };
    return { c, wide: Math.min(extra, n), large: false };            // one to three cards two wide (a 2 x 2 card cropped the cup)
  }
  function layoutMenu() {
    const items = grid.children, plan = gridPlan(items.length);
    grid.style.setProperty("--cols", plan.c);
    [...items].forEach((li, i) => {
      li.classList.toggle("is-wide", i < plan.wide);
      li.classList.toggle("is-large", i === 0 && plan.large);
    });
  }
  let menuW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== menuW) { menuW = innerWidth; layoutMenu(); } });

  // phones: the first eight drinks, then one button opens the rest, so the menu stays a menu and not a long scroll
  const PHONE_FIRST = 8;
  const moreBtn = document.createElement("button");
  moreBtn.type = "button"; moreBtn.className = "menu-more";
  grid.after(moreBtn);
  let menuOpen = false;
  function setMore(n) {
    grid.classList.toggle("is-open", menuOpen);
    moreBtn.hidden = n <= PHONE_FIRST;
    moreBtn.setAttribute("aria-expanded", String(menuOpen));
    moreBtn.innerHTML = menuOpen ? `Show fewer drinks <span aria-hidden="true">↑</span>` : `Show all ${n} drinks <span aria-hidden="true">↓</span>`;
  }
  moreBtn.addEventListener("click", () => {
    menuOpen = !menuOpen;
    setMore(grid.children.length);
    if (!menuOpen) goTo("menu");
    else grid.children[PHONE_FIRST]?.querySelector("button")?.focus({ preventScroll: true });
  });

  function renderMenu() {
    const list = S.drinks.filter((d) => matches(d, filter));
    grid.innerHTML = list.map(card).join("");
    layoutMenu();
    setMore(list.length);
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    const label = S.filters.find((f) => f.id === filter).label;
    countEl.textContent = `${label}: ${list.length} drinks.`;
  }
  function setFilter(f) {
    if (!S.filters.some((x) => x.id === f) || f === filter) return;
    filter = f; menuOpen = false;
    if (reduced) { renderMenu(); return; }
    grid.classList.add("is-changing");
    setTimeout(() => { renderMenu(); grid.classList.remove("is-changing"); }, 180);
  }

  // the quick "+" adds the usual: the first size, here or to go as the filter suggests
  function quickAdd(d, btn) {
    const size = d.sizes ? S.options[d.sizes][0] : null;
    const where = d.togo && filter === "takeaway" ? "To go" : "In the café";
    addDrink(d, size, where, btn);
  }
  function addDrink(d, size, where, btn) {
    const price = d.price + ((size && size.add) || 0);
    const detail = [size && size.label, where].filter(Boolean).join(" · ");
    U.addItem({ id: `drink-${d.id}-${size ? size.id : "one"}-${where === "To go" ? "togo" : "here"}`, name: d.name, detail, price }, btn);
  }
  grid.addEventListener("click", (e) => {
    const li = e.target.closest(".card");
    if (!li) return;
    const d = drink(li.dataset.id);
    if (e.target.closest(".card-add")) quickAdd(d, e.target.closest(".card-add"));
    else if (e.target.closest(".card-open")) openDrink(d);
  });

  /* ---------- One product, larger, with its options ---------- */
  const dialog = $("productDialog"), body = $("pdBody");
  function radios(name, items, checked) {
    return items.map((o, i) => `<label class="pd-opt"><input type="radio" name="${name}" value="${o.id}" ${i === checked ? "checked" : ""}>
      <span>${esc(o.label)}${o.note ? ` <small>${esc(o.note)}</small>` : ""}${o.add ? ` <small>+${money(o.add)}</small>` : ""}</span></label>`).join("");
  }
  function openDrink(d) {
    const sizes = d.sizes ? S.options[d.sizes] : null;
    const places = d.togo ? [{ id: "here", label: "In the café" }, { id: "togo", label: "To go" }] : null;
    const vessel = S.vessels[d.vessel];
    body.innerHTML = `
      ${photo(S.photo.drink(d.id), d.vessel, d.name, d.origin ? "pd-photo ph-origin" : "pd-photo")}
      <div class="pd-copy">
        <p class="card-tags">${tags(d).map((t) => `<span>${t}</span>`).join("")}</p>
        <h2 class="pd-name" id="pdName">${esc(d.name)}</h2>
        <p class="pd-line">${esc(d.line)}</p>
        <h3 class="pd-h">What's in it</h3>
        <p class="pd-recipe">${d.recipe.map(esc).join(" · ")}</p>
        <p class="pd-serve">Served in a ${esc(vessel.toLowerCase())}${d.togo ? "; to go in an UMBER paper cup" : ""}.</p>
        ${sizes ? `<fieldset class="pd-set"><legend>Size</legend>${radios("size", sizes, 0)}</fieldset>` : ""}
        ${places ? `<fieldset class="pd-set"><legend>Where</legend>${radios("where", places, filter === "takeaway" ? 1 : 0)}</fieldset>` : ""}
        <div class="pd-buy">
          <button class="order pd-add" type="button"><span class="order-label">Add to basket</span><span class="order-price" id="pdPrice"></span></button>
        </div>
        <p class="pd-note">Proposed recipe and price, to confirm. <mark class="check" title="To confirm">CHECK</mark></p>
      </div>`;
    const price = () => {
      const s = sizes ? sizes.find((o) => o.id === body.querySelector('input[name="size"]:checked').value) : null;
      $("pdPrice").textContent = money(d.price + ((s && s.add) || 0));
      return s;
    };
    price();
    body.onchange = price;
    body.querySelector(".pd-add").onclick = (e) => {
      const s = price();
      const w = places ? body.querySelector('input[name="where"]:checked').value : "here";
      addDrink(d, s, w === "togo" ? "To go" : "In the café", e.currentTarget);
    };
    show();
  }
  function openBean(b) {
    const stop = b.wheel != null ? U.STOPS[b.wheel] : null;
    body.innerHTML = `
      ${photo(S.photo.bean(b.id), "bag", `UMBER ${b.name} coffee bag`, "pd-photo pd-bag")}
      <div class="pd-copy">
        <p class="card-tags"><span>${esc(b.kind)}</span><span>${esc(b.roast)} roast</span></p>
        <h2 class="pd-name" id="pdName">${esc(b.name)}</h2>
        <p class="pd-line">${esc(b.line)}</p>
        <h3 class="pd-h">Tasting notes</h3>
        <p class="pd-recipe">${b.notes.map(esc).join(" · ")}</p>
        <p class="pd-serve">Good for: ${esc(b.brew)}. ${esc(b.weight)} bag.</p>
        <fieldset class="pd-set"><legend>Grind</legend>${radios("grind", S.grind, 0)}</fieldset>
        <div class="pd-buy">
          <button class="order pd-add" type="button"><span class="order-label">Add to basket</span><span class="order-price">${money(b.price)}</span></button>
          ${stop ? `<button class="story-link pd-wheel" type="button">Taste it in the café: ${esc(stop.note)} on the wheel <span aria-hidden="true">↑</span></button>` : ""}
        </div>
        <p class="pd-note">Proposed notes, roast, weight and price, to confirm. <mark class="check" title="To confirm">CHECK</mark></p>
      </div>`;
    body.onchange = null;
    body.querySelector(".pd-add").onclick = (e) => {
      const g = S.grind.find((o) => o.id === body.querySelector('input[name="grind"]:checked').value);
      addBean(b, g, e.currentTarget);
    };
    const w = body.querySelector(".pd-wheel");
    if (w) w.onclick = () => { dialog.close(); U.choose(b.wheel); U.toWheel(); };
    show();
  }
  function show() {
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    dialog.querySelector(".pd-close").focus({ preventScroll: true });
  }
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });   // a click outside closes

  /* ---------- Signature creations ---------- */
  $("sigList").innerHTML = S.showcase.map((x) => {
    const d = drink(x.id);
    return `<li class="sig-item" style="--tone:${x.tone}">
      <button class="sig-open" type="button" data-id="${d.id}" aria-label="${esc(d.name)}: details and options">
        ${photo(S.photo.drink(d.id), d.vessel, d.name, "sig-photo")}
      </button>
      <div class="sig-copy">
        <h3 class="sig-name">${esc(d.name)}</h3>
        <p class="sig-words">${esc(x.words)}</p>
        <p class="sig-foot"><span>${money(d.price)}</span><button class="sig-link" type="button" data-id="${d.id}">See the drink <span aria-hidden="true">→</span></button></p>
      </div>
    </li>`;
  }).join("");
  $("sigList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (b) openDrink(drink(b.dataset.id));
  });

  /* ---------- The takeaway cups ---------- */
  $("togoCups").innerHTML = S.cups.map((c) => `<li class="togo-cup togo-${c.id}">
      <span class="togo-swatch" aria-hidden="true"></span>
      <div><h3>${esc(c.name)}</h3><p>${esc(c.line)} <small>${esc(c.sizes)}</small></p></div></li>`).join("");

  /* ---------- Coffee for home ---------- */
  const beanGrid = $("bagGrid");
  beanGrid.innerHTML = S.beans.map((b) => `<li class="bag-card" data-id="${b.id}" style="--bag:${b.colour}">
      <button class="bag-open" type="button" aria-label="${esc(b.name)}: details and grind">
        ${photo(S.photo.bean(b.id), "bag", `UMBER ${b.name} coffee bag`, "bag-photo")}
      </button>
      <div class="bag-body">
        <p class="card-tags"><span>${esc(b.kind)}</span><span>${esc(b.roast)}</span></p>
        <h3 class="bag-name">${esc(b.name)}</h3>
        <p class="bag-notes">${b.notes.map(esc).join(" · ")}</p>
        <label class="bag-grind"><span class="sr-only">Grind for ${esc(b.name)}</span>
          <select>${S.grind.map((g) => `<option value="${g.id}">${esc(g.label)}</option>`).join("")}</select>
        </label>
        <div class="card-foot">
          <span class="card-price">${money(b.price)} <small>${esc(b.weight)}</small></span>
          <button class="bag-add" type="button">Add to basket</button>
        </div>
      </div>
    </li>`).join("");
  function addBean(b, g, btn) {
    U.addItem({ id: `bean-${b.id}-${g.id}`, name: `${b.name} coffee, ${b.weight}`, detail: g.label, price: b.price }, btn);
  }
  beanGrid.addEventListener("click", (e) => {
    const li = e.target.closest(".bag-card");
    if (!li) return;
    const b = S.beans.find((x) => x.id === li.dataset.id);
    if (e.target.closest(".bag-add")) {
      const g = S.grind.find((o) => o.id === li.querySelector("select").value);
      addBean(b, g, e.target.closest(".bag-add"));
    } else if (e.target.closest(".bag-open")) openBean(b);
  });

  /* ---------- The basket drawer ---------- */
  const drawer = $("basketDrawer"), panel = drawer.querySelector(".drawer-panel");
  const listEl = $("drawerList"), emptyEl = $("drawerEmpty"), totalEl = $("drawerTotal"), checkoutBtn = $("drawerCheckout");
  let opener = null;
  function renderBasket() {
    const lines = U.basket();
    listEl.innerHTML = lines.map((l) => `<li class="line" data-key="${esc(l.key)}">
        <div class="line-text"><p class="line-name">${esc(l.name)}</p>${l.detail ? `<p class="line-detail">${esc(l.detail)}</p>` : ""}</div>
        <div class="line-qty">
          <button type="button" data-step="-1" aria-label="One less ${esc(l.name)}">−</button>
          <span aria-label="Quantity">${l.qty}</span>
          <button type="button" data-step="1" aria-label="One more ${esc(l.name)}">+</button>
        </div>
        <p class="line-price">${money(l.price * l.qty)}</p>
      </li>`).join("");
    emptyEl.hidden = lines.length > 0;
    checkoutBtn.hidden = lines.length === 0;
    totalEl.textContent = money(lines.reduce((s, l) => s + l.price * l.qty, 0));
  }
  listEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    const key = b.closest(".line").dataset.key;
    const l = U.basket().find((x) => x.key === key);
    U.setQty(key, l.qty + Number(b.dataset.step));
  });
  U.onBasket(renderBasket);
  function openDrawer() {
    opener = document.activeElement;
    renderBasket();
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    panel.focus({ preventScroll: true });
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    setTimeout(() => { drawer.hidden = true; }, reduced ? 0 : 320);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }
  document.addEventListener("umber:basket", openDrawer);

  /* ---------- "Added": a small note at the bottom, with the way to the basket ---------- */
  const toast = document.createElement("div");
  toast.className = "added";
  toast.setAttribute("aria-hidden", "true");       // the basket already tells screen readers (app.js)
  toast.innerHTML = `<span class="added-tick"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></span>
    <span class="added-text"><strong class="added-name"></strong><span class="added-sub"></span></span>
    <button class="added-open" type="button" tabindex="-1">View basket</button>`;
  document.body.appendChild(toast);
  let toastTimer = 0;
  document.addEventListener("umber:added", (e) => {
    if (!drawer.hidden) return;                     // the basket is open: it shows the change itself
    const d = e.detail, n = U.basket().reduce((s, l) => s + l.qty, 0);
    toast.querySelector(".added-name").textContent = `${d.name} added`;
    toast.querySelector(".added-sub").textContent = `${n} item${n === 1 ? "" : "s"} · ${money(U.basket().reduce((s, l) => s + l.price * l.qty, 0))}`;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 3200);
  });
  toast.querySelector(".added-open").addEventListener("click", () => {
    toast.classList.remove("is-on");
    openDrawer();
  });
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeDrawer(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) closeDrawer(); });

  /* ---------- The top bar over the cream sections ---------- */
  // the bar is cream on dark; over the light sections it turns cocoa so it stays readable
  const light = [$("menu"), $("pour"), $("beans")].filter(Boolean);
  const afterStory = $("yourCup") || $("menu");
  let onLight = false, solid = false;
  function barTone() {
    const y = 36;
    const now = light.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    if (now !== onLight) { onLight = now; document.body.classList.toggle("bar-on-light", now); }
    // past the café and the film the bar gets its own background, so text never slides under the logo
    const s = afterStory && afterStory.getBoundingClientRect().top <= 72;
    if (s !== solid) { solid = s; document.body.classList.toggle("bar-solid", s); }
  }
  addEventListener("scroll", barTone, { passive: true });
  addEventListener("resize", barTone);
  barTone();

  /* ---------- Start ---------- */
  renderMenu();
  if (location.hash === "#menu" || location.hash === "#beans") setTimeout(() => goTo(location.hash.slice(1)), 300);
})();
