/* ==========================================================================
   UMBER · Pour your own cup
   A real photograph of an empty UMBER glass mug, and inside it a small live
   liquid simulation (WebGL2): press and hold an ingredient and it pours in
   from above.

   How it behaves, studied from slow-motion films of real pours:
   - every liquid has a weight. Lighter ones rise, heavier ones sink, and the
     drink settles into soft horizontal layers: sauce at the bottom, then milk,
     then espresso, then foam on top (a layered latte, or an iced latte where
     the espresso floats over the cold milk);
   - a pour plunges in as a plume, spreads out at its own level and hangs in
     smooth marbled ribbons and curtains, not in smoke-like swirls;
   - coffee is clear: dark in the middle of the glass, amber where it is thin,
     and the café behind glows through it. Milk is the opposite: it scatters
     light, so even a little of it turns the drink opaque and creamy;
   - ice is clear and bright, the drink looks lighter through it, and it floats
     with its top above the surface.
   The glass's own highlights and the UMBER print stay in front. When you stop,
   the page names the drink on the menu closest to what you poured, and offers
   to add it to the basket.

   The photograph and its map (inside of the glass, depth, highlights) are in
   assets/img/pour/pour-assets.js as data URLs, so the effect also works when
   the site is opened as files (file://). Without WebGL2, the glass fills in
   calm layers instead. Plain JavaScript, no libraries.
   ========================================================================== */
(() => {
  "use strict";
  const U = window.UMBER, S = window.UMBER_SHOP;
  const stage = document.getElementById("pourStage");
  const canvas = document.getElementById("pourCanvas");
  if (!U || !S || !stage || !canvas) return;
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => `${S.currency}${Number(n).toFixed(2)}`;

  /* ---------- What can be poured ----------
     absorb:  how strongly the liquid swallows red, green and blue light through its depth
              (clear liquids: espresso, caramel, honey; the rest also scatter)
     scatter: how milky it is (milk 1: opaque and creamy even when diluted)
     weight:  heavier sinks, lighter rises (sauces are heaviest, foam floats on top)
     rate:    share of the glass per second while you hold
     swatch:  its colour in the pour and on the button */
  const INGREDIENTS = [
    { id: "espresso", label: "Espresso", group: 0, absorb: [2.7, 5.6, 8.5], scatter: 0.03, weight: 0.0, rate: 0.10, width: 0.0045, swatch: "#3b1d10", hot: true },
    { id: "milk", label: "Milk", group: 0, absorb: [0.02, 0.04, 0.09], scatter: 1.0, weight: 0.35, rate: 0.17, width: 0.0075, swatch: "#f1e9dc" },
    { id: "matcha", label: "Matcha", group: 0, absorb: [1.35, 0.32, 2.1], scatter: 0.5, weight: 0.3, rate: 0.12, width: 0.0055, swatch: "#7f9d4c", hot: true },
    { id: "ice", label: "Ice", group: 0, ice: true, swatch: "#dfeef2" },
    { id: "chocolate", label: "Chocolate", group: 1, absorb: [3.0, 4.0, 5.0], scatter: 0.35, weight: 1.0, rate: 0.05, width: 0.0034, swatch: "#3b1f14" },
    { id: "caramel", label: "Caramel", group: 1, absorb: [0.45, 1.5, 3.6], scatter: 0.04, weight: 1.0, rate: 0.05, width: 0.0034, swatch: "#b36a26" },
    { id: "pistachio", label: "Pistachio", group: 1, absorb: [0.85, 0.32, 1.85], scatter: 0.75, weight: 0.85, rate: 0.05, width: 0.0038, swatch: "#a3b26a" },
    { id: "creme-brulee", label: "Crème brûlée", group: 1, absorb: [0.2, 0.6, 1.9], scatter: 0.65, weight: 0.85, rate: 0.05, width: 0.0038, swatch: "#e0bd72" },
    { id: "banana", label: "Banana", group: 1, absorb: [0.1, 0.3, 1.6], scatter: 0.6, weight: 0.75, rate: 0.05, width: 0.0038, swatch: "#ead67e" },
    { id: "coconut", label: "Coconut", group: 1, absorb: [0.03, 0.05, 0.1], scatter: 0.9, weight: 0.6, rate: 0.05, width: 0.0042, swatch: "#f5f0e4" },
    { id: "honey", label: "Honey", group: 1, absorb: [0.3, 1.0, 3.0], scatter: 0.02, weight: 1.2, rate: 0.04, width: 0.003, swatch: "#d39a2c" },
    { id: "foam", label: "Milk foam", group: 2, absorb: [0.02, 0.04, 0.09], scatter: 1.0, weight: -1.6, rate: 0.11, width: 0.009, swatch: "#fbf7ef", foam: true },
    { id: "cinnamon", label: "Cinnamon", group: 2, dust: true, swatch: "#9a5a2e" },
    { id: "cocoa", label: "Cocoa", group: 2, dust: true, swatch: "#4a2a1c" }
  ];
  const GROUPS = ["Coffee & milk", "Sauces & flavours", "On top"];
  const byId = Object.fromEntries(INGREDIENTS.map((x) => [x.id, x]));
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const isTap = (x) => x.ice || x.dust;

  /* ---------- The glass: what is in it ---------- */
  const amounts = {};           // share of the glass, per ingredient (dust: number of pinches)
  let volume = 0;               // 0 … 1 (1 = full, just under the rim)
  let ice = [];                 // { u, v, vy, size, rot, landed, bob }
  let dust = { c: [0, 0, 0], a: 0, target: 0 };
  const amountOf = (id) => amounts[id] || 0;

  /* ---------- Load the photograph and its map ---------- */
  let engine = null;            // the WebGL engine, or the calm 2D fallback
  function loadAssets() {
    if (window.UMBER_POUR_IMG) return Promise.resolve(window.UMBER_POUR_IMG);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "assets/img/pour/pour-assets.js";
      s.onload = () => (window.UMBER_POUR_IMG ? resolve(window.UMBER_POUR_IMG) : reject());
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  // the map: R = inside of the glass, G = depth (0 at the glass wall, 1 in the middle), B = the glass's highlights
  function readMap(img) {
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0;
    const rows = new Float32Array(c.height);
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const m = d[(y * c.width + x) * 4] / 255;
        if (m > 0.5) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        rows[y] += m;
      }
    }
    // the volume below each height, so pouring fills the narrow bottom faster, like a real glass
    const h = y1 - y0 + 1, cum = new Float32Array(h + 1);
    for (let i = 0; i < h; i++) cum[i + 1] = cum[i] + rows[y1 - i];
    for (let i = 0; i <= h; i++) cum[i] /= cum[h];
    return { w: c.width, h: c.height, box: [x0 / c.width, y0 / c.height, (x1 + 1) / c.width, (y1 + 1) / c.height], cum };
  }
  // the surface height (0 = bottom … 1 = top of the inside) for a volume
  function levelFor(map, v) {
    const cum = map.cum, n = cum.length - 1;
    let lo = 0, hi = n;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < v) lo = m; else hi = m; }
    const t = (v - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]);
    return (lo + t) / n;
  }

  /* ==========================================================================
     The WebGL2 engine
     Two fields of "dye" ride on the flow: A = absorbance (rgb) and weight,
     B = milkiness and foam. Both are carried with a sharp (MacCormack) scheme,
     so layers and ribbons keep crisp edges instead of blurring into fog.
     ========================================================================== */
  function makeEngine(plateImg, mapImg, map) {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;
    gl.getExtension("OES_texture_float_linear");

    const VERT = `#version 300 es
      in vec2 aPos; out vec2 vUv;
      void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
    const HEAD = `#version 300 es
      precision highp float; precision highp sampler2D;
      in vec2 vUv; out vec4 o;`;
    // in the simulation, v = 0 is the top of the inside of the glass and v grows downwards
    const LIQ = `
      uniform sampler2D uMask; uniform float uSurf;
      float liquid(vec2 p){ return step(uSurf, p.y) * step(0.5, texture(uMask, p).r) * step(0.0, p.x) * step(p.x, 1.0) * step(p.y, 1.0); }`;

    const SH = {
      // velocity: carried by itself, and slowed a little (the liquid is not water: milk and syrup are thick)
      advect: `${HEAD} ${LIQ}
        uniform sampler2D uVel; uniform float uDt, uDiss;
        void main(){
          vec2 p = vUv - uDt * texture(uVel, vUv).xy;
          o = vec4(uDiss * texture(uVel, p).xy * liquid(vUv), 0, 1);
        }`,
      // dye, one step back along the flow (never pulling colour in from the air)
      advectD: `${HEAD} ${LIQ}
        uniform sampler2D uVel, uSrc; uniform float uDt;
        void main(){
          vec2 p = vUv - uDt * texture(uVel, vUv).xy;
          o = liquid(p) > 0.5 ? texture(uSrc, p) : texture(uSrc, vUv);
        }`,
      // MacCormack correction: forward, back, and half the error added back, clamped so nothing overshoots
      mac: `${HEAD} ${LIQ}
        uniform sampler2D uVel, uSrc, uHat, uBar; uniform float uDt, uDiff; uniform vec2 uTxD;
        void main(){
          vec2 p = vUv - uDt * texture(uVel, vUv).xy;
          vec4 hat = texture(uHat, vUv);
          vec4 r = hat + 0.5 * (texture(uSrc, vUv) - texture(uBar, vUv));
          vec2 c = (floor(p / uTxD - 0.5) + 0.5) * uTxD;
          vec4 a1 = texture(uSrc, c), a2 = texture(uSrc, c + vec2(uTxD.x, 0.0));
          vec4 a3 = texture(uSrc, c + vec2(0.0, uTxD.y)), a4 = texture(uSrc, c + uTxD);
          r = clamp(r, min(min(a1, a2), min(a3, a4)), max(max(a1, a2), max(a3, a4)));
          vec4 nb = 0.25 * (texture(uSrc, vUv + vec2(uTxD.x, 0.0)) + texture(uSrc, vUv - vec2(uTxD.x, 0.0)) + texture(uSrc, vUv + vec2(0.0, uTxD.y)) + texture(uSrc, vUv - vec2(0.0, uTxD.y)));
          r = mix(r, nb, uDiff * liquid(vUv));
          o = liquid(p) > 0.5 ? r : hat;
        }`,
      splat: `${HEAD}
        uniform sampler2D uSrc; uniform vec2 uPoint; uniform float uRadius, uAspect, uStrength; uniform vec4 uValue; uniform int uMix;
        void main(){
          vec2 d = vUv - uPoint; d.x *= uAspect;
          float g = exp(-dot(d, d) / uRadius);
          vec4 b = texture(uSrc, vUv);
          o = uMix == 1 ? mix(b, uValue, clamp(g * uStrength, 0.0, 1.0)) : b + uValue * g;
        }`,
      // weight: heavier than its neighbours at the same height sinks, lighter rises.
      // (Measured against the mean of its row, so calm layers stay calm and only real differences move.)
      buoy: `${HEAD} ${LIQ}
        uniform sampler2D uVel, uDye; uniform float uDt, uG;
        void main(){
          vec2 v = texture(uVel, vUv).xy;
          float rho = texture(uDye, vUv).a, sum = 0.0, w = 0.0;
          for (int i = 0; i < 16; i++) {
            vec2 q = vec2((float(i) + 0.5) / 16.0, vUv.y);
            float l = liquid(q); sum += texture(uDye, q).a * l; w += l;
          }
          float mean = w > 0.0 ? sum / w : rho;
          v.y += uDt * uG * (rho - mean);
          o = vec4(clamp(v, -1.6, 1.6) * liquid(vUv), 0.0, 1.0);
        }`,
      // as the level rises, the new liquid at the top is the drink's own top layer
      // (or, in an empty glass, the first thing poured)
      fillAir: `${HEAD} ${LIQ}
        uniform sampler2D uDye; uniform vec4 uColour; uniform float uWobble, uSeed;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec4 d = texture(uDye, vUv);
          // a real pour is never perfectly even: a little unevenness in weight lets heavier liquid
          // break through in curtains and fingers instead of sitting in a flat sheet
          float n = hash(floor(vUv * vec2(48.0, 64.0)) + uSeed) - 0.5;
          o = vUv.y < uSurf + 0.006 ? uColour + vec4(0.0, 0.0, 0.0, n * uWobble) : d;
        }`,
      curl: `${HEAD}
        uniform sampler2D uVel; uniform vec2 uTx;
        void main(){
          float L = texture(uVel, vUv - vec2(uTx.x, 0)).y, R = texture(uVel, vUv + vec2(uTx.x, 0)).y;
          float T = texture(uVel, vUv - vec2(0, uTx.y)).x, B = texture(uVel, vUv + vec2(0, uTx.y)).x;
          o = vec4(0.5 * (R - L - B + T), 0, 0, 1);
        }`,
      vort: `${HEAD} ${LIQ}
        uniform sampler2D uVel, uCurl; uniform vec2 uTx; uniform float uDt, uK;
        void main(){
          float L = texture(uCurl, vUv - vec2(uTx.x, 0)).x, R = texture(uCurl, vUv + vec2(uTx.x, 0)).x;
          float T = texture(uCurl, vUv - vec2(0, uTx.y)).x, B = texture(uCurl, vUv + vec2(0, uTx.y)).x;
          float C = texture(uCurl, vUv).x;
          vec2 f = 0.5 * vec2(abs(B) - abs(T), abs(R) - abs(L));
          f /= length(f) + 1e-4;
          f *= uK * C; f.y *= -1.0;
          o = vec4(clamp(texture(uVel, vUv).xy + f * uDt, -1.6, 1.6) * liquid(vUv), 0, 1);
        }`,
      div: `${HEAD} ${LIQ}
        uniform sampler2D uVel; uniform vec2 uTx;
        void main(){
          vec2 l = vUv - vec2(uTx.x, 0), r = vUv + vec2(uTx.x, 0), t = vUv - vec2(0, uTx.y), b = vUv + vec2(0, uTx.y);
          float L = texture(uVel, l).x * liquid(l), R = texture(uVel, r).x * liquid(r);
          float T = texture(uVel, t).y * liquid(t), B = texture(uVel, b).y * liquid(b);
          o = vec4(0.5 * (R - L + B - T), 0, 0, 1);
        }`,
      pressure: `${HEAD} ${LIQ}
        uniform sampler2D uP, uDiv; uniform vec2 uTx;
        void main(){
          float C = texture(uP, vUv).x;
          vec2 l = vUv - vec2(uTx.x, 0), r = vUv + vec2(uTx.x, 0), t = vUv - vec2(0, uTx.y), b = vUv + vec2(0, uTx.y);
          float L = liquid(l) > 0.5 ? texture(uP, l).x : C, R = liquid(r) > 0.5 ? texture(uP, r).x : C;
          float T = liquid(t) > 0.5 ? texture(uP, t).x : C, B = liquid(b) > 0.5 ? texture(uP, b).x : C;
          o = vec4((L + R + B + T - texture(uDiv, vUv).x) * 0.25 * liquid(vUv), 0, 0, 1);
        }`,
      grad: `${HEAD} ${LIQ}
        uniform sampler2D uP, uVel; uniform vec2 uTx;
        void main(){
          float C = texture(uP, vUv).x;
          vec2 l = vUv - vec2(uTx.x, 0), r = vUv + vec2(uTx.x, 0), t = vUv - vec2(0, uTx.y), b = vUv + vec2(0, uTx.y);
          float L = liquid(l) > 0.5 ? texture(uP, l).x : C, R = liquid(r) > 0.5 ? texture(uP, r).x : C;
          float T = liquid(t) > 0.5 ? texture(uP, t).x : C, B = liquid(b) > 0.5 ? texture(uP, b).x : C;
          o = vec4((texture(uVel, vUv).xy - vec2(R - L, B - T)) * liquid(vUv), 0, 1);
        }`,
      // the picture: the photograph, the liquid inside the glass, the pour, ice, steam, and the glass in front
      show: `${HEAD}
        uniform sampler2D uPlate, uMap, uDyeA, uDyeB;
        uniform vec4 uBox; uniform float uSurf, uTime, uAgit, uSteam, uImgAspect, uBoxAspect;
        uniform vec4 uStream; uniform vec3 uStreamCol; uniform float uStreamClear, uStreamFoam;
        uniform vec4 uIce[5]; uniform int uIceN; uniform float uEmpty; uniform vec4 uDust;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
        vec3 toLin(vec3 c){ return pow(c, vec3(2.2)); } vec3 toSrgb(vec3 c){ return pow(max(c, 0.0), vec3(1.0/2.2)); }

        // how the drink looks at a point: light from the room behind passes through what is clear,
        // light from the front bounces off what is milky. L = how much drink the eye looks through.
        vec3 drink(vec2 p, float L, vec3 behind, float key, out float opaque, out float foamy){
          vec4 a = texture(uDyeA, p), b = texture(uDyeB, p);
          vec3 A = max(a.rgb, vec3(0.0));
          float Sc = max(b.r, 0.0);
          foamy = clamp(b.g, 0.0, 1.0);
          vec3 through = exp(-A * L);
          float op = max(1.0 - exp(-Sc * L * 10.0), foamy);
          vec3 albedo = exp(-A * 0.42) * vec3(0.99, 0.95, 0.875);
          vec3 front = albedo * key;
          vec3 back = (behind * 1.2 + vec3(0.06, 0.035, 0.016)) * through;
          opaque = op;
          return mix(back, front, op);
        }

        void main(){
          vec2 uv = vec2(vUv.x, 1.0 - vUv.y);                 // picture coordinates, y down
          vec3 plate = texture(uPlate, uv).rgb;
          vec2 s = (uv - uBox.xy) / (uBox.zw - uBox.xy);        // coordinates inside the glass
          vec3 mp = texture(uMap, uv).rgb;                      // inside, depth, highlight
          float inside = mp.r;
          vec3 behind = toLin(plate);
          vec3 col = behind;
          float depth = mp.g;
          float window = smoothstep(0.75, 0.0, s.x);            // the window light comes from the left
          float key = 0.5 + 0.34 * window;
          float L = mix(0.2, 1.0, smoothstep(0.0, 0.85, depth)); // thin at the glass wall, deep in the middle

          // --- the liquid ---
          float wob = (0.005 * sin(s.x * 17.0 + uTime * 2.6) + 0.0025 * sin(s.x * 39.0 - uTime * 3.7)) * uAgit;
          float surf = uSurf + wob;
          // the top of the liquid, seen from a little above: a thin ellipse, wider the lower the level
          float xc = clamp((s.x - 0.5) / 0.5, -1.0, 1.0);
          float e = (0.008 + 0.022 * clamp(uSurf, 0.0, 1.0)) * sqrt(max(0.0, 1.0 - xc * xc));
          float body = inside * smoothstep(surf - 0.0025, surf + 0.0025, s.y);
          float sheet = inside * smoothstep(surf - e - 0.002, surf - e + 0.002, s.y) * (1.0 - smoothstep(surf - 0.0025, surf + 0.0025, s.y));
          float liq = (body + sheet) * (1.0 - uEmpty);
          float opq, fo;
          vec2 dp = clamp(vec2(s.x, max(s.y, surf + 0.012)), 0.0, 1.0);
          vec3 lc = drink(dp, L, behind, key, opq, fo);
          // milky liquid is rounder: a little shade towards the glass wall and deeper down
          float shade = mix(0.42, 1.0, pow(smoothstep(0.0, 0.95, depth), 0.65)) * mix(1.05, 0.84, clamp((s.y - surf) / max(0.001, 1.0 - surf), 0.0, 1.0));
          lc = mix(lc, lc * shade, opq);
          if (fo > 0.0) {                                       // milk foam: fine bubbles, soft and bright
            float bub = fbm(s * vec2(80.0, 110.0) + uTime * 0.03);
            float cells = smoothstep(0.4, 0.8, noise(s * vec2(240.0, 300.0)));
            lc = mix(lc, lc * (0.9 + 0.22 * bub) * (0.95 + 0.08 * cells) + 0.012, fo);
          }
          // the top surface, seen from above: the whole depth of the drink, catching the light
          float topLit = sheet * (1.0 - body);
          float o2, f2;
          vec3 top = drink(dp, 1.4, behind, key * 1.12, o2, f2);
          top += 0.03 * smoothstep(0.0, 1.0, (surf - s.y) / max(e, 0.001)) * (1.0 - o2 * 0.5);
          lc = mix(lc, top, topLit);
          // a pinch of cinnamon or cocoa, resting on the surface
          if (uDust.a > 0.0) {
            float sp = smoothstep(0.62, 0.8, noise(s * vec2(420.0, 520.0))) + 0.5 * smoothstep(0.7, 0.9, noise(s * vec2(170.0, 210.0) + 3.1));
            float onTop = topLit + exp(-pow((s.y - surf - 0.008) / 0.009, 2.0)) * 0.85 * inside;
            lc = mix(lc, toLin(uDust.rgb) * (0.7 + 0.5 * noise(s * 900.0)), clamp((sp * 1.4 + 0.25) * onTop * uDust.a, 0.0, 0.92));
          }
          float men = exp(-pow((s.y - surf) / 0.0035, 2.0)) * inside;   // the meniscus line at the front
          lc = mix(lc, lc * 1.25 + 0.02, men * 0.45);
          col = mix(col, lc, liq * 0.98);

          // --- ice: clear blocks, the drink looks lighter through them, bright edges where light bends ---
          for (int i = 0; i < 5; i++) {
            if (i >= uIceN) break;
            vec4 c = uIce[i];                                     // x, y (in glass coordinates), size, rotation
            vec2 d = s - c.xy; d.x *= uBoxAspect;
            float cs = cos(c.w), sn = sin(c.w);
            d = mat2(cs, -sn, sn, cs) * d;
            float hs = c.z * 0.5, rr = c.z * 0.14;
            vec2 q = abs(d) - vec2(hs - rr);
            float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr;
            sd += c.z * 0.035 * (noise(d / c.z * 3.5 + c.w * 7.0) - 0.5);   // no two cubes are the same shape
            float a = smoothstep(0.003, -0.003, sd) * step(0.5, inside + step(s.y, 0.0));
            if (a <= 0.0) continue;
            float inner = clamp(-sd / hs, 0.0, 1.0);           // 0 at the cube's edge, 1 in its middle
            vec2 dn = normalize(d + 1e-5);
            // the cube bends what is behind it, most at its rounded edges
            vec2 n = dn * (0.25 + 0.75 * smoothstep(0.4, 0.0, inner));
            vec2 off = n * 0.022;
            vec3 behindR = toLin(texture(uPlate, uv - off * (uBox.zw - uBox.xy)).rgb);
            vec2 sp = s.xy - off * vec2(1.0 / uBoxAspect, 1.0);
            float under = smoothstep(surf - 0.006, surf + 0.006, s.y) * (1.0 - uEmpty);
            float o3, f3;
            vec3 thr = drink(clamp(vec2(sp.x, max(sp.y, surf + 0.012)), 0.0, 1.0), L * 0.45, behindR, key * 1.06, o3, f3);
            vec3 icec = mix(behindR * 1.07 + vec3(0.01, 0.012, 0.014), thr * vec3(1.02, 1.04, 1.07) + 0.008, under);
            // a cloudy, cracked heart, as in real ice, and a few trapped bubbles
            float cloud = fbm(d / c.z * 5.0 + c.w * 4.0);
            icec += vec3(0.05, 0.055, 0.06) * smoothstep(0.45, 0.95, inner) * smoothstep(0.55, 0.85, cloud);
            float crack = smoothstep(0.01, 0.0, abs(fbm(d / c.z * 2.6 + 7.0 + c.w) - 0.5)) * smoothstep(0.25, 0.6, inner);
            icec += 0.04 * crack;
            float bub = smoothstep(0.92, 0.97, noise(d / c.z * 26.0 + c.w * 11.0)) * smoothstep(0.3, 0.7, inner);
            icec += 0.06 * bub;
            // the edge: bright where it faces the light, broken; a dark refraction line just inside on the far side
            float lit = dot(dn, vec2(-0.7, -0.7));
            float br = smoothstep(0.3, 0.7, noise(d / c.z * 8.0 + c.w * 5.0));
            float rim = smoothstep(0.07, 0.0, inner);
            icec += vec3(0.2, 0.21, 0.22) * rim * br * (0.25 + 0.75 * max(lit, 0.0));
            float band = smoothstep(0.05, 0.1, inner) * smoothstep(0.22, 0.1, inner);
            icec *= 1.0 - 0.32 * band * max(-lit + 0.2, 0.0) * smoothstep(0.25, 0.65, noise(d / c.z * 5.0 - c.w));
            // one face catches the window a little more than the other
            float ex = d.x - hs * 0.2 * sin(c.w * 2.0 + 1.0);
            icec *= ex < 0.0 ? 1.04 : 0.97;
            icec += 0.035 * exp(-pow(ex / (c.z * 0.012), 2.0)) * smoothstep(0.15, 0.45, inner) * br;
            float glint = exp(-pow((d.x + d.y + hs * 0.6) / (c.z * 0.04), 2.0)) * smoothstep(0.2, 0.5, inner) * smoothstep(0.9, 0.6, inner);
            icec += 0.1 * glint;
            // where the cube meets the surface, a bright waterline
            icec += 0.07 * exp(-pow((s.y - surf) / 0.003, 2.0)) * (1.0 - uEmpty);
            col = mix(col, icec, a);
          }

          // --- the pour: a thin stream from above, into the glass ---
          if (uStream.w > 0.0) {
            float sx = uStream.x + 0.0012 * sin(uv.y * 11.0 + uTime * 5.0) * (0.3 + uv.y);
            float w = uStream.y * (1.0 + 0.05 * sin(uv.y * 70.0 - uTime * 30.0));
            float dx = (uv.x - sx) * uImgAspect;
            float a = smoothstep(w, w * 0.55, abs(dx)) * step(uStream.z, uv.y) * step(uv.y, uStream.w);
            vec3 sc = toLin(uStreamCol);
            float side = dx / w;                                   // -1 left … 1 right
            if (uStreamClear > 0.5) {                              // clear liquid: amber in the middle, the café through it
              sc = mix(sc * 0.55, sc * 1.6, smoothstep(0.9, 0.0, abs(side))) + behind * 0.25;
            }
            sc *= 0.85 + 0.3 * smoothstep(0.6, -0.8, side);       // lit from the left
            sc += 0.06 * exp(-pow((side + 0.45) / 0.18, 2.0));    // a thin highlight down the stream
            if (uStreamFoam > 0.5) sc *= 0.92 + 0.16 * noise(uv * 300.0 + uTime * 8.0);
            col = mix(col, sc, a * 0.97);
          }

          // --- steam over a hot cup: thin, slow, and gone within a few centimetres ---
          if (uSteam > 0.0) {
            float top = uBox.y - 0.02;
            float h = clamp((top - uv.y) / 0.22, 0.0, 1.0);
            float cx = (uBox.x + uBox.z) * 0.5;
            float sxw = (uBox.z - uBox.x) * 0.36;
            float n = fbm(vec2((uv.x - cx) * 7.0 + 0.5 * sin(uv.y * 7.0 + uTime * 0.6), uv.y * 4.5 + uTime * 0.42));
            float wisp = smoothstep(0.6, 0.82, n) * smoothstep(0.0, 0.2, h) * pow(1.0 - h, 1.6) * smoothstep(sxw, sxw * 0.2, abs(uv.x - cx));
            col = mix(col, vec3(0.86, 0.84, 0.8), wisp * 0.2 * uSteam * step(uv.y, top));
          }

          // --- the glass in front: its highlights and the UMBER print ---
          col += toLin(vec3(mp.b)) * inside * 0.9;
          o = vec4(toSrgb(col), 1.0);
        }`
    };

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const progs = {};
    for (const [k, src] of Object.entries(SH)) {
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
      gl.bindAttribLocation(p, 0, "aPos");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); const name = info.name.replace(/\[0\]$/, ""); u[name] = gl.getUniformLocation(p, info.name); }
      progs[k] = { p, u };
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    function tex(w, h, internal, format, type, filter, data) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (data && data.width) gl.texImage2D(gl.TEXTURE_2D, 0, internal, format, type, data);
      else gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data || null);
      return t;
    }
    function fbo(w, h) {
      const t = tex(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR);
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      return { t, f, w, h };
    }
    const pair = (w, h) => { const a = fbo(w, h), b = fbo(w, h); return { read: a, write: b, swap() { const x = this.read; this.read = this.write; this.write = x; } }; };

    // photograph and map
    const plate = tex(0, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, plateImg);
    const mapTex = tex(0, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, mapImg);
    // the inside of the glass alone, cut to the glass's box, for the simulation
    const box = map.box;
    const boxAspect = ((box[2] - box[0]) * plateImg.width) / ((box[3] - box[1]) * plateImg.height);
    const simW = innerWidth < 700 ? 96 : 128, simH = Math.round(simW / boxAspect);
    const dyeW = simW * 3, dyeH = simH * 3;
    const mc = document.createElement("canvas");
    mc.width = dyeW; mc.height = dyeH;
    const mctx = mc.getContext("2d");
    mctx.drawImage(mapImg, box[0] * mapImg.width, box[1] * mapImg.height, (box[2] - box[0]) * mapImg.width, (box[3] - box[1]) * mapImg.height, 0, 0, dyeW, dyeH);
    const maskTex = tex(0, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, mc);

    const vel = pair(simW, simH), dyeA = pair(dyeW, dyeH), dyeB = pair(dyeW, dyeH), pres = pair(simW, simH);
    const divF = fbo(simW, simH), curlF = fbo(simW, simH), hatF = fbo(dyeW, dyeH), barF = fbo(dyeW, dyeH);

    function run(prog, target, uniforms) {
      const P = progs[prog];
      gl.useProgram(P.p);
      let unit = 0;
      for (const [k, v] of Object.entries(uniforms)) {
        const loc = P.u[k];
        if (loc == null) continue;
        if (v && v.tex !== undefined) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v.tex); gl.uniform1i(loc, unit++); }
        else if (typeof v === "number") gl.uniform1f(loc, v);
        else if (v && v.i !== undefined) gl.uniform1i(loc, v.i);
        else if (v.length === 2) gl.uniform2fv(loc, v);
        else if (v.length === 3) gl.uniform3fv(loc, v);
        else gl.uniform4fv(loc, v);
      }
      if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.f); gl.viewport(0, 0, target.w, target.h); }
      else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const T = (t) => ({ tex: t });
    const I = (i) => ({ i });
    const txV = [1 / simW, 1 / simH], txD = [1 / dyeW, 1 / dyeH];

    function splat(target, point, radius, value, mixMode, strength = 1) {
      run("splat", target.write, { uSrc: T(target.read.t), uPoint: point, uRadius: radius, uAspect: boxAspect, uValue: value, uMix: I(mixMode ? 1 : 0), uStrength: strength });
      target.swap();
    }
    const valA = (x) => [...x.absorb, x.weight];
    const valB = (x) => [x.scatter, x.foam ? 1 : 0, 0, 0];
    function clearDye() {
      for (const f of [dyeA.read, dyeA.write, dyeB.read, dyeB.write, vel.read, vel.write, pres.read, pres.write]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, f.f); gl.viewport(0, 0, f.w, f.h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
    function carry(field, common, dt) {
      run("advectD", hatF, { ...common, uVel: T(vel.read.t), uSrc: T(field.read.t), uDt: dt });
      run("advectD", barF, { ...common, uVel: T(vel.read.t), uSrc: T(hatF.t), uDt: -dt });
      run("mac", field.write, { ...common, uVel: T(vel.read.t), uSrc: T(field.read.t), uHat: T(hatF.t), uBar: T(barF.t), uDt: dt, uTxD: txD, uDiff: 0.035 });
      field.swap();
    }

    function step(dt, st) {
      const surf = st.surfV;
      const common = { uMask: T(maskTex), uSurf: surf };
      // the rising level is what is being poured; heavier liquid then sinks through, lighter stays on top
      if (st.pouring) {
        const seed = Math.random() * 100;
        run("fillAir", dyeA.write, { ...common, uDye: T(dyeA.read.t), uColour: valA(st.pouring), uWobble: 0.12, uSeed: seed }); dyeA.swap();
        run("fillAir", dyeB.write, { ...common, uDye: T(dyeB.read.t), uColour: valB(st.pouring), uWobble: 0, uSeed: seed }); dyeB.swap();
      }
      run("advect", vel.write, { ...common, uVel: T(vel.read.t), uDt: dt, uDiss: Math.exp(-dt * 1.4) });
      vel.swap();
      run("buoy", vel.write, { ...common, uVel: T(vel.read.t), uDye: T(dyeA.read.t), uDt: dt, uG: 2.6 });
      vel.swap();
      // the stream: where it meets the liquid it brings its own liquid in, and pushes down as a plume
      if (st.impact) {
        const x = st.impact.x;
        const p = [st.impact.u, Math.min(0.995, surf + 0.014)];
        const r = 0.0005 + x.width * 0.055;
        // where the stream plunges in it already mixes a little with what is there
        splat(dyeA, p, r, valA(x), true, 0.7);
        splat(dyeB, p, r, valB(x), true, 0.7);
        const push = st.impact.push;
        splat(vel, [p[0] + (Math.random() - 0.5) * 0.02, p[1] + 0.01], 0.0011, [(Math.random() - 0.5) * push * 0.25, push, 0, 0], false);
      }
      for (const k of st.kicks) splat(vel, k.p, k.r, [k.vx, k.vy, 0, 0], false);
      // a little swirl, only enough to keep the plume's edges alive
      run("curl", curlF, { uVel: T(vel.read.t), uTx: txV });
      run("vort", vel.write, { ...common, uVel: T(vel.read.t), uCurl: T(curlF.t), uTx: txV, uDt: dt, uK: reduced ? 0.5 : 2.0 });
      vel.swap();
      run("div", divF, { ...common, uVel: T(vel.read.t), uTx: txV });
      for (let i = 0; i < 24; i++) { run("pressure", pres.write, { ...common, uP: T(pres.read.t), uDiv: T(divF.t), uTx: txV }); pres.swap(); }
      run("grad", vel.write, { ...common, uP: T(pres.read.t), uVel: T(vel.read.t), uTx: txV });
      vel.swap();
      carry(dyeA, common, dt);
      carry(dyeB, common, dt);
    }

    function draw(st) {
      const ice4 = new Float32Array(20);
      st.ice.slice(0, 5).forEach((c, i) => ice4.set([c.u, c.v, c.size, c.rot], i * 4));
      const P = progs.show;
      gl.useProgram(P.p);
      if (P.u.uIce) gl.uniform4fv(P.u.uIce, ice4);
      const sx = st.stream;
      run("show", null, {
        uPlate: T(plate), uMap: T(mapTex), uDyeA: T(dyeA.read.t), uDyeB: T(dyeB.read.t),
        uBox: box, uSurf: st.surfV, uTime: st.time, uAgit: st.agit, uSteam: st.steam,
        uImgAspect: plateImg.width / plateImg.height, uBoxAspect: boxAspect,
        uStream: sx ? [sx.u, sx.w, sx.top, sx.bottom] : [0, 0, 0, 0],
        uStreamCol: sx ? sx.colour : [0, 0, 0], uStreamClear: sx && sx.clear ? 1 : 0, uStreamFoam: sx && sx.foam ? 1 : 0,
        uIceN: I(Math.min(5, st.ice.length)), uEmpty: st.emptying, uDust: [...st.dust.c, st.dust.a]
      });
    }
    function resize() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }
    // for testing: read the fields down the middle of the glass
    function probe(field) {
      const f = { a: dyeA, b: dyeB, v: vel }[field].read;
      gl.bindFramebuffer(gl.FRAMEBUFFER, f.f);
      const out = [], px = new Float32Array(4);
      for (let i = 0; i < 20; i++) { gl.readPixels(Math.floor(f.w / 2), Math.floor((i + 0.5) / 20 * f.h), 1, 1, gl.RGBA, gl.FLOAT, px); out.push([...px].map((v) => +v.toFixed(2))); }
      return out;
    }
    return { step, draw, resize, clearDye, probe, box, boxAspect, kind: "gl" };
  }

  /* ==========================================================================
     The calm fallback (no WebGL2): the photograph and soft layers, drawn in 2D,
     heaviest at the bottom, as a real drink settles
     ========================================================================== */
  function makeFallback(plateImg, mapImg, map) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const layers = [];
    const box = map.box;
    const cut = document.createElement("canvas");
    cut.width = mapImg.width; cut.height = mapImg.height;
    const cx = cut.getContext("2d");
    cx.drawImage(mapImg, 0, 0);
    const id = cx.getImageData(0, 0, cut.width, cut.height);
    for (let i = 0; i < id.data.length; i += 4) id.data[i + 3] = id.data[i];
    cx.putImageData(id, 0, 0);
    const boxAspect = ((box[2] - box[0]) * plateImg.width) / ((box[3] - box[1]) * plateImg.height);
    return {
      kind: "2d", box, boxAspect,
      resize() { const dpr = Math.min(2, devicePixelRatio || 1); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; },
      clearDye() { layers.length = 0; },
      add(x, amount) { const l = layers.find((y) => y.x === x); if (l) l.a += amount; else layers.push({ x, a: amount }); layers.sort((p, q) => q.x.weight - p.x.weight); },
      step() {},
      draw(st) {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        const off = document.createElement("canvas"); off.width = W; off.height = H;
        const o = off.getContext("2d");
        const bx = box[0] * W, by = box[1] * H, bw = (box[2] - box[0]) * W, bh = (box[3] - box[1]) * H;
        let filled = 0;
        const sum = layers.reduce((s, l) => s + l.a, 0) || 1;
        const levelPx = (1 - st.surfV) * bh;
        for (const l of layers) {
          const h = (l.a / sum) * levelPx;
          const g = o.createLinearGradient(0, by + bh - filled - h, 0, by + bh - filled);
          g.addColorStop(0, l.x.swatch); g.addColorStop(1, l.x.swatch);
          o.fillStyle = g;
          o.fillRect(bx, by + bh - filled - h - 1, bw, h + 2);
          filled += h;
        }
        o.globalCompositeOperation = "destination-in";
        o.drawImage(cut, 0, 0, W, H);
        ctx.globalAlpha = 0.94;
        ctx.drawImage(off, 0, 0);
        ctx.globalAlpha = 1;
      }
    };
  }

  /* ==========================================================================
     Pouring: the state, the loop, and the controls
     ========================================================================== */
  let map = null, running = false, visible = false, lastT = 0, time = 0, lastActive = -1e9;
  let pouring = null;           // { x, btn }
  let stream = null;            // { u, w, top, bottom, colour, clear, foam, ending }
  let agit = 0, emptying = 0, kicks = [];
  const RIM_PAD = 0.04;         // the top 4% of the inside stays empty, below the rim

  const surfV = () => 1 - levelFor(map, volume) * (1 - RIM_PAD);
  const isHot = () => INGREDIENTS.some((x) => x.hot && amountOf(x.id) > 0.03) && ice.length === 0 && emptying === 0;

  function stateFor() {
    const sv = surfV();
    const st = { surfV: emptying > 0 ? Math.min(1, sv + emptying) : sv, time, agit, kicks, ice, dust, emptying: emptying > 0.98 ? 1 : 0, steam: 0, stream: null, impact: null, pouring: null, firstPour: volume < 0.012 };
    st.steam = isHot() && !reduced ? Math.min(1, volume * 1.6) : 0;
    if (stream && engine) {
      const b = engine.box;
      const surfY = b[1] + st.surfV * (b[3] - b[1]);       // picture y of the surface
      st.stream = { u: stream.u, w: stream.w, top: stream.top, bottom: Math.min(stream.bottom, surfY), colour: stream.colour, clear: stream.clear, foam: stream.foam };
      if (pouring && stream.bottom >= surfY - 0.002) {
        const x = pouring.x;
        st.impact = { u: (stream.u - b[0]) / (b[2] - b[0]), x, push: 0.75 + x.width * 90 + x.weight * 0.5 };
        st.pouring = x;
      }
    }
    return st;
  }

  // one step of everything: rdt is real time (the stream, the level, the ice), the liquid steps at most 1/30 s
  function tick(rdt) {
    const dt = Math.min(1 / 30, rdt);
    time += rdt;
    if (stream) {
      const fall = 2.4 * rdt;
      if (!stream.ending) stream.bottom = Math.min(1, stream.bottom + fall);
      else { stream.top += fall; if (stream.top >= stream.bottom) stream = null; }
    }
    const st = stateFor();
    if (pouring && st.impact) {
      const x = pouring.x;
      const room = 1 - volume;
      const more = Math.min(room, x.rate * rdt);
      volume += more;
      amounts[x.id] = (amounts[x.id] || 0) + more;
      if (engine.kind === "2d") engine.add(x, more);
      agit = Math.min(1, agit + dt * 3);
      if (room - more <= 0.001) { stopPour(); full(); }
      judgeSoon();
    }
    agit = Math.max(0, agit - dt * 0.6);
    dust.a += (dust.target - dust.a) * Math.min(1, rdt * 3);
    // ice: falls, lands with a little splash, then floats with its top above the surface and bobs
    for (const c of ice) {
      const floatV = st.surfV + c.size * 0.22;
      if (!c.landed) {
        c.vy += 2.2 * rdt; c.v += c.vy * rdt;
        if (volume > 0.02 && c.v >= floatV) { c.landed = true; c.v = floatV; kicks.push({ p: [c.u, Math.min(0.99, st.surfV + 0.03)], r: 0.004, vx: 0, vy: 1.1 }); agit = Math.min(1, agit + 0.5); }
        else if (c.v >= 1 - c.size * 0.55) { c.landed = true; c.v = 1 - c.size * 0.55; }
      } else {
        const target = volume > 0.02 ? Math.min(floatV, 1 - c.size * 0.55) + Math.sin(time * 1.6 + c.bob) * 0.003 : 1 - c.size * 0.55;
        c.v += (target - c.v) * Math.min(1, dt * 4);
        c.rot += Math.sin(time * 0.7 + c.bob) * 0.0012;
      }
    }
    if (emptying > 0) {
      emptying = Math.min(1, emptying + rdt * 1.6);
      if (emptying >= 1) finishEmpty();
    }
    engine.step(dt, st);
    kicks = [];
    return st;
  }

  let frozen = false;           // tests drive the glass by hand
  function frame(now) {
    if (!running || frozen) { running = false; return; }
    const rdt = Math.min(0.25, (now - lastT) / 1000 || 1 / 60);
    lastT = now;
    const st = tick(rdt);
    engine.draw(st);
    if (pouring || stream || agit > 0.01 || time - lastActive < 10 || st.steam > 0 || emptying > 0) requestAnimationFrame(frame);
    else running = false;
  }
  function wake() {
    if (!engine || running || !visible) return;
    running = true; lastT = performance.now();
    requestAnimationFrame(frame);
  }

  /* ---------- Controls ---------- */
  const pads = $("pourPads"), verdict = $("pourVerdict"), hint = $("pourHint"), addBtn = $("pourAdd"), priceEl = $("pourPrice");

  function startPour(x, btn) {
    if (!engine || pouring) return;
    if (emptying) return;
    if (volume >= 0.995) { full(); return; }
    lastActive = time;
    pouring = { x, btn };
    if (btn) btn.classList.add("is-pouring");
    const b = engine.box;
    const u = b[0] + (b[2] - b[0]) * (0.42 + Math.random() * 0.12);
    const clear = x.scatter < 0.1;
    stream = { u, w: x.width, top: 0, bottom: 0, colour: rgb(x.swatch), clear, foam: !!x.foam, ending: false };
    wake();
  }
  function stopPour() {
    if (!pouring) return;
    if (pouring.btn) pouring.btn.classList.remove("is-pouring");
    if (stream) stream.ending = true;
    pouring = null;
    lastActive = time;
    judge();
  }
  function addIce() {
    if (!engine || ice.length >= 5 || emptying) return;
    const spots = [0.3, 0.7, 0.5, 0.17, 0.84];
    ice.push({ u: spots[ice.length] + (Math.random() - 0.5) * 0.04, v: -0.4, vy: 0, size: 0.25 + Math.random() * 0.04, rot: (Math.random() - 0.5) * 0.9, landed: false, bob: Math.random() * 6 });
    lastActive = time;
    wake();
    judge();
  }
  function addDust(x) {
    if (!engine || emptying || volume < 0.05) { hint.textContent = "Pour something first, then dust it on top."; return; }
    const c = rgb(x.swatch);
    const before = dust.target;
    dust.c = before > 0 ? dust.c.map((v, i) => (v * before + c[i] * 0.35) / (before + 0.35)) : c;
    dust.target = Math.min(1, before + 0.35);
    amounts[x.id] = (amounts[x.id] || 0) + 1;
    lastActive = time;
    wake();
    judge();
  }
  function full() { hint.textContent = "The glass is full. Empty it to pour again."; }

  GROUPS.forEach((label, gi) => {
    const g = document.createElement("div");
    g.className = "pour-group";
    g.setAttribute("role", "group");
    g.setAttribute("aria-label", label);
    g.innerHTML = `<p class="pour-group-label">${label}</p><div class="pour-group-pads"></div>`;
    const row = g.lastElementChild;
    INGREDIENTS.filter((x) => x.group === gi).forEach((x) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pour-pad";
      b.dataset.id = x.id;
      b.style.setProperty("--c", x.swatch);
      b.innerHTML = `<span class="pour-dot" aria-hidden="true"></span>${x.label}`;
      b.setAttribute("aria-label", x.ice ? "Add an ice cube" : x.dust ? `Dust ${x.label.toLowerCase()} on top` : `Pour ${x.label.toLowerCase()}, press and hold`);
      const act = () => (x.ice ? addIce() : x.dust ? addDust(x) : startPour(x, b));
      b.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        act();
      });
      b.addEventListener("pointerup", stopPour);
      b.addEventListener("pointercancel", stopPour);
      b.addEventListener("lostpointercapture", stopPour);
      // keyboard: hold Space or Enter to pour
      b.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (e.repeat) return;
        act();
      });
      b.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") stopPour(); });
      b.addEventListener("blur", stopPour);
      b.addEventListener("contextmenu", (e) => e.preventDefault());
      row.appendChild(b);
    });
    pads.appendChild(g);
  });

  /* ---------- What did you make? ---------- */
  function name() {
    const t = volume;
    if (t < 0.02 && !ice.length) return null;
    const a = amountOf;
    const e = a("espresso"), m = a("milk"), f = a("foam"), mt = a("matcha");
    const sauce = (id) => a(id) > 0.025;
    const milky = m + f + a("coconut") * 0.5;
    const iced = ice.length > 0;
    const spice = a("cinnamon") > 0, cocoa = a("cocoa") > 0;
    if (e < 0.02) {
      if (mt > 0.03) return milky > 0.08 ? { id: "pumpkin-spice-matcha", text: "a matcha latte, close to our pumpkin spice matcha", hint: spice ? "With the cinnamon on top, nearly ours." : "Dust cinnamon on top for the spice." } : { text: "Matcha, waiting for its milk.", hint: "Add milk for a matcha latte." };
      if (sauce("pistachio") && milky > 0.1) return { id: "pistachio-white-hot-chocolate", text: "a pistachio white hot chocolate" };
      if (t < 0.02) return { text: "Ice, waiting for its coffee.", hint: "Add a shot of espresso." };
      return { text: "Lovely, but where is the coffee?", hint: "Every UMBER cup starts with espresso." };
    }
    if (iced) {
      if (sauce("banana")) return { id: "banana-cream-latte", text: "a banana cream latte" };
      if (sauce("pistachio")) return { id: "pistachio-latte", text: "an iced pistachio latte" };
      if (sauce("caramel") || sauce("honey")) return { id: "brown-sugar-iced-latte", text: "a brown sugar iced latte" };
      if (f > 0.03 && m < 0.1) return { id: "vanilla-cream-cold-brew", text: "coffee under cold cream, like our vanilla cream cold brew" };
      if (m > 0.1) return { id: "iced-latte", text: "an iced latte" };
      return { id: "cold-brew", text: "something close to our cold brew", hint: "Ours is steeped slowly, for twelve hours." };
    }
    if (sauce("creme-brulee")) return { id: "creme-brulee-latte", text: "a crème brûlée latte" };
    if (sauce("coconut") || (a("coconut") > 0.02 && sauce("chocolate"))) return { id: "coconut-bonbon-latte", text: "a coconut bon-bon latte" };
    if (sauce("pistachio")) return { id: "pistachio-latte", text: "a pistachio latte" };
    if (sauce("banana")) return { id: "banana-cream-latte", text: "a banana latte", hint: "Ours is iced, with banana cream on top." };
    if (sauce("honey")) return { id: "honey-cinnamon-latte", text: "a honey latte", hint: spice ? "With the cinnamon, just like ours." : "Ours has cinnamon on top." };
    if (sauce("chocolate")) return { id: "mocha", text: "a mocha" };
    if (sauce("caramel")) return { id: "salted-caramel-latte", text: "a salted caramel latte" };
    if (cocoa && f > 0.03) return { id: "tiramisu-latte", text: "something like our tiramisu latte" };
    if (milky < 0.03) return t < 0.3 ? { id: "espresso", text: "an espresso" } : { id: "espresso", text: "a very long espresso", hint: "A double, perhaps? Most of us stop at one shot." };
    if (f / t > 0.28) return { id: "cappuccino", text: "a cappuccino" };
    if (milky < 0.42 && t < 0.62) return { id: "flat-white", text: "a flat white" };
    return { id: "latte", text: "a latte" };
  }
  let current = null, judgeTimer = 0;
  function judge() {
    const r = name();
    current = r && r.id ? S.drinks.find((d) => d.id === r.id) : null;
    if (!r) { verdict.textContent = "Start with a shot of espresso."; hint.textContent = ""; addBtn.hidden = true; return; }
    verdict.textContent = r.id ? `You poured ${r.text}.` : r.text;
    hint.textContent = r.hint || (current ? current.line : "");
    addBtn.hidden = !current;
    if (current) priceEl.textContent = money(current.price);
  }
  function judgeSoon() { clearTimeout(judgeTimer); judgeTimer = setTimeout(judge, 120); }

  addBtn.addEventListener("click", () => {
    if (!current) return;
    const size = current.sizes ? S.options[current.sizes][0] : null;
    U.addItem({
      id: `drink-${current.id}-${size ? size.id : "one"}-here`, name: current.name,
      detail: [size && size.label, "In the café", "poured by you"].filter(Boolean).join(" · "),
      price: current.price
    }, addBtn);
  });

  $("pourReset").addEventListener("click", () => {
    stopPour();
    if (!engine) return;
    if (volume <= 0 && !ice.length) return;
    emptying = 0.0001;               // the level runs down, then the glass is clean
    wake();
  });
  function finishEmpty() {
    emptying = 0;
    volume = 0; ice = []; stream = null;
    dust = { c: [0, 0, 0], a: 0, target: 0 };
    for (const k of Object.keys(amounts)) delete amounts[k];
    engine.clearDye();
    hint.textContent = "";
    judge();
  }

  /* ---------- Start when the section comes near ---------- */
  let started = false;
  async function start() {
    if (started) return;
    started = true;
    try {
      const assets = await loadAssets();
      const [plateImg, mapImg] = await Promise.all([loadImg(assets.plate), loadImg(assets.map)]);
      map = readMap(mapImg);
      let e = null;
      try { e = makeEngine(plateImg, mapImg, map); } catch (err) { e = null; if (window.__umberPourDebug) console.error(err); }
      engine = e || makeFallback(plateImg, mapImg, map);
      if (!engine) return;
      stage.classList.add(engine.kind === "gl" ? "is-live" : "is-calm");
      engine.resize();
      engine.clearDye();
      running = true; lastT = performance.now(); requestAnimationFrame(frame);
    } catch (_) { /* the photograph alone stays */ }
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { start(); if (engine) { engine.resize(); wake(); } }
  }, { rootMargin: "200px" }).observe(stage);
  addEventListener("resize", () => { if (engine) { engine.resize(); lastActive = time; wake(); } });

  // for testing: what is in the glass, and a way to pour at a steady 60 frames a second
  window.__umberPour = {
    get volume() { return volume; }, probe: (f) => engine.probe(f), get surf() { return surfV(); }, get amounts() { return { ...amounts }; }, get ice() { return ice.length; }, get kind() { return engine && engine.kind; },
    drive(id, seconds, settle = 0) {
      if (!engine) return false;
      frozen = true;
      const x = byId[id];
      if (x && x.ice) addIce(); else if (x && x.dust) addDust(x); else if (x) startPour(x, null);
      const n = Math.round(seconds * 60);
      for (let i = 0; i < n; i++) tick(1 / 60);
      stopPour();
      for (let i = 0; i < Math.round(settle * 60); i++) tick(1 / 60);
      engine.draw(stateFor());
      return true;
    }
  };
  judge();
})();
