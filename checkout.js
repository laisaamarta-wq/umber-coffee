/* ==========================================================================
   UMBER · Checkout
   The basket comes from this browser (app.js keeps it in localStorage).
   The form asks how and when, and for whom, then "Pay" plays the payment:
   a short "paying" moment, then the confirmation with an order number.
   This is a concept site: no payment is taken, no card details are asked for,
   and the order is not sent anywhere.
   Plain JavaScript, no libraries.
   ========================================================================== */
(() => {
  "use strict";
  if (/[?&]checks\b/.test(location.search)) document.documentElement.dataset.checks = "show";   // show the CHECK marks
  const O = window.UMBER_ORDER;
  const $ = (id) => document.getElementById(id);
  const form = $("checkoutForm");
  const BASKET_KEY = "umber-basket-v1";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => `€${Number(n).toFixed(2)}`;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- The basket ---------- */
  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]");
      return Array.isArray(v) ? v.filter((l) => l && l.key && l.id && Number(l.qty) > 0) : [];
    } catch (_) { return []; }
  }
  function save() { try { localStorage.setItem(BASKET_KEY, JSON.stringify(lines)); } catch (_) {} }
  function clear() { lines = []; try { localStorage.removeItem(BASKET_KEY); } catch (_) {} }
  let lines = load();
  const isBean = (l) => l.id.startsWith("bean-");
  const itemsTotal = () => lines.reduce((s, l) => s + Number(l.price) * l.qty, 0);

  /* ---------- Pick up or delivery ---------- */
  const how = () => form.elements.fulfilment.value;
  const canDeliver = () => lines.length > 0 && (!O.delivery.beansOnly || lines.every(isBean));
  const deliveryFee = () => (how() === "delivery" && itemsTotal() < O.delivery.freeFrom ? O.delivery.fee : 0);

  function renderLines() {
    $("coLines").innerHTML = lines.map((l) => `<li class="co-line" data-key="${esc(l.key)}">
        <div class="co-line-text"><p class="co-line-name">${esc(l.name)}</p>${l.detail ? `<p class="co-line-detail">${esc(l.detail)}</p>` : ""}</div>
        <div class="line-qty co-qty">
          <button type="button" data-step="-1" aria-label="One less ${esc(l.name)}">−</button>
          <span aria-label="Quantity">${l.qty}</span>
          <button type="button" data-step="1" aria-label="One more ${esc(l.name)}">+</button>
        </div>
        <p class="co-line-price">${money(l.price * l.qty)}</p>
      </li>`).join("");
    $("coEmpty").hidden = lines.length > 0;
    form.classList.toggle("is-empty", lines.length === 0);
    renderHow();
  }
  $("coLines").addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    const l = lines.find((x) => x.key === b.closest(".co-line").dataset.key);
    l.qty = Math.min(99, l.qty + Number(b.dataset.step));
    if (l.qty <= 0) lines = lines.filter((x) => x !== l);
    save();
    renderLines();
  });

  function renderHow() {
    const deliverable = canDeliver();
    const dInput = form.querySelector('input[value="delivery"]');
    dInput.disabled = !deliverable;
    $("deliveryChoice").classList.toggle("is-off", !deliverable);
    if (!deliverable && how() === "delivery") form.querySelector('input[value="pickup"]').checked = true;
    $("deliveryText").textContent = `Coffee beans only, by courier. ${money(O.delivery.fee)}, free from ${money(O.delivery.freeFrom)}.`;
    const note = $("deliveryNote");
    note.hidden = deliverable || lines.length === 0;
    note.textContent = "Drinks are made fresh for pickup, so delivery is for coffee beans only.";
    const delivery = how() === "delivery";
    $("pickupFields").hidden = delivery;
    $("deliveryFields").hidden = !delivery;
    $("whenTitle").textContent = delivery ? "Where we deliver" : "When you will pick it up";
    // the summary
    const fee = deliveryFee();
    $("sumItems").textContent = money(itemsTotal());
    $("sumHowLabel").textContent = delivery ? "Delivery in Riga" : "Pickup at UMBER";
    $("sumHow").textContent = fee ? money(fee) : "Free";
    $("sumTotal").textContent = money(itemsTotal() + fee);
    $("payTotal").textContent = money(itemsTotal() + fee);
  }
  form.addEventListener("change", (e) => { if (e.target.name === "fulfilment") renderHow(); });

  /* ---------- Pickup times: today, or the next day the café is open ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const hm = (d) => `${d.getHours()}:${pad(d.getMinutes())}`;
  // the café's own clock (Europe/Riga), as a plain date, so a visitor abroad still sees Riga times
  function cafeNow() {
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: O.timeZone || "Europe/Riga", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).map((x) => [x.type, x.value]));
      return new Date(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    } catch (_) { return new Date(); }
  }
  function pickupSlots(now = cafeNow()) {
    const out = [];
    for (let add = 0; add < 7 && out.length === 0; add++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add);
      const [open, close] = O.hours[day.getDay()];
      const openAt = new Date(day); openAt.setHours(open, 0, 0, 0);
      const last = new Date(day); last.setHours(close, 0, 0, 0); last.setMinutes(last.getMinutes() - O.lastOrderMinutes);
      let first = new Date(Math.max(openAt, add === 0 ? now.getTime() + O.prepMinutes * 60000 : openAt.getTime()));
      if (add === 0 && first <= last && now >= openAt) {
        out.push({ value: "asap", label: `As soon as possible (in about ${O.prepMinutes} minutes)` });
        first = new Date(now.getTime() + (O.prepMinutes + 10) * 60000);
      }
      const step = O.slotMinutes * 60000;
      let t = new Date(Math.ceil(first.getTime() / step) * step);
      if (add > 0 || now < openAt) t = new Date(Math.max(t, openAt.getTime() + step));
      const dayName = add === 0 ? "Today" : add === 1 ? "Tomorrow" : day.toLocaleDateString("en-GB", { weekday: "long" });
      for (; t <= last; t = new Date(t.getTime() + step)) {
        out.push({ value: `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(t.getHours())}:${pad(t.getMinutes())}`, label: `${dayName} at ${hm(t)}` });
      }
    }
    return out;
  }
  function renderSlots() {
    const sel = $("pickupTime"), keep = sel.value;
    sel.innerHTML = pickupSlots().map((s) => `<option value="${s.value}">${esc(s.label)}</option>`).join("");
    if ([...sel.options].some((o) => o.value === keep)) sel.value = keep;
    const today = O.hours[cafeNow().getDay()];
    $("hoursNote").innerHTML = `Open today ${today[0]}:00–${today[1]}:00. <mark class="check" title="Opening hours to confirm">CHECK</mark>`;
  }

  /* ---------- Checking the form ---------- */
  const val = (n) => (form.elements[n] ? String(form.elements[n].value || "").trim() : "");
  function setError(name, msg) {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || "";
    const input = form.elements[name];
    if (input && input.setAttribute) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function check() {
    const ok = [];
    ok.push(setError("name", val("name").length >= 2 ? "" : "Please add your name."));
    ok.push(setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("email")) ? "" : "Please check your e-mail address."));
    ok.push(setError("phone", val("phone").replace(/\D/g, "").length >= 7 ? "" : "Please add a phone number, in case we need to reach you."));
    if (how() === "delivery") {
      ok.push(setError("street", val("street").length >= 3 ? "" : "Please add the street and house number."));
      ok.push(setError("postcode", O.delivery.postcode.test(val("postcode").replace(/\s/g, "")) ? "" : "We deliver in Riga only (postcode LV-1xxx)."));
    } else { setError("street", ""); setError("postcode", ""); }
    ok.push(setError("terms", form.elements.terms.checked ? "" : "Please agree to the ordering terms."));
    return ok.every(Boolean);
  }
  form.addEventListener("input", (e) => { if (e.target.getAttribute("aria-invalid") === "true") check(); });

  /* ---------- Pay ---------- */
  function order() {
    const delivery = how() === "delivery";
    const slot = $("pickupTime").selectedOptions[0];
    return {
      lines: lines.map((l) => ({ id: l.id, detail: l.detail, qty: l.qty })),
      fulfilment: delivery ? "delivery" : "pickup",
      pickupTime: delivery ? null : (slot ? slot.value : "asap"),
      pickupLabel: delivery ? null : (slot ? slot.textContent : ""),
      address: delivery ? { street: val("street"), apartment: val("apartment"), postcode: val("postcode").toUpperCase(), city: "Riga" } : null,
      customer: { name: val("name"), email: val("email"), phone: val("phone") },
      note: val("note")
    };
  }
  const payBtn = $("payBtn");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    $("formError").textContent = "";
    if (!lines.length) { $("formError").textContent = "Your basket is empty."; return; }
    if (!check()) {
      const bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }
    const o = order();
    const method = form.elements.method.value;
    payBtn.disabled = true;
    payBtn.classList.add("is-paying");
    payBtn.querySelector(".order-label").textContent =
      method === "apple" ? "Confirming with Apple Pay…" : method === "google" ? "Confirming with Google Pay…" : "Paying with card •••• 4242…";
    await new Promise((r) => setTimeout(r, reduced ? 300 : 1600));
    showDone({
      number: `UM-${Date.now().toString(36).slice(-5).toUpperCase()}`,
      method,
      fulfilment: o.fulfilment, pickupLabel: o.pickupLabel, address: o.address,
      name: o.customer.name, email: o.customer.email,
      lines: lines.map((l) => ({ name: l.name, detail: l.detail, qty: l.qty, total: l.price * l.qty })),
      fee: deliveryFee(), total: itemsTotal() + deliveryFee()
    });
    clear();
  });

  /* ---------- The confirmation ---------- */
  function showDone(d) {
    $("coForm").hidden = true;
    const done = $("coDone");
    done.hidden = false;
    const paidWith = { apple: "Apple Pay", google: "Google Pay", card: "Card •••• 4242" }[d.method] || "";
    $("doneKicker").textContent = "Thank you";
    $("doneTitle").textContent = d.fulfilment === "delivery" ? "Your coffee is on its way soon" : "Your order is in";
    $("doneLede").textContent = d.fulfilment === "delivery"
      ? `We will deliver to ${d.address.street}${d.address.apartment ? `, ${d.address.apartment}` : ""}, ${d.address.postcode} Riga.`
      : `See you at the counter${d.pickupLabel && !/soon/i.test(d.pickupLabel) ? `, ${d.pickupLabel.charAt(0).toLowerCase()}${d.pickupLabel.slice(1)}` : ", in about " + O.prepMinutes + " minutes"}.`;
    const meta = [["Order", d.number], ["Name", d.name]];
    if (d.email) meta.push(["Receipt", `would be sent to ${d.email}`]);
    if (paidWith) meta.push(["Paid with", paidWith]);
    meta.push(["Total", money(d.total)]);
    $("doneMeta").innerHTML = meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
    $("doneLines").innerHTML = d.lines.map((l) => `<li class="co-line"><div class="co-line-text"><p class="co-line-name">${l.qty} × ${esc(l.name)}</p>${l.detail ? `<p class="co-line-detail">${esc(l.detail)}</p>` : ""}</div><p class="co-line-price">${l.total != null ? money(l.total) : ""}</p></li>`).join("")
      + (d.fee ? `<li class="co-line"><div class="co-line-text"><p class="co-line-name">Delivery in Riga</p></div><p class="co-line-price">${money(d.fee)}</p></li>` : "");
    scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    done.focus({ preventScroll: true });
  }

  renderSlots();
  renderLines();
  setInterval(renderSlots, 60000);
  if (location.hash === "#terms") $("terms").scrollIntoView();
})();
