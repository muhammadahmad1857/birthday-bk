import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const DEBUG = {
  on: true,
  t0: performance.now(),
  log(...args) {
    if (!this.on) return;
    const dt = ((performance.now() - this.t0) / 1000).toFixed(3);
    console.log(`[BakarDebug +${dt}s]`, ...args);
  },
  warn(...args) {
    if (!this.on) return;
    const dt = ((performance.now() - this.t0) / 1000).toFixed(3);
    console.warn(`[BakarDebug +${dt}s]`, ...args);
  },
  error(...args) {
    if (!this.on) return;
    const dt = ((performance.now() - this.t0) / 1000).toFixed(3);
    console.error(`[BakarDebug +${dt}s]`, ...args);
  },
};

function timedStep(name, fn) {
  const t = performance.now();
  DEBUG.log(`START ${name}`);
  try {
    const out = fn();
    DEBUG.log(`DONE  ${name} (${(performance.now() - t).toFixed(1)}ms)`);
    return out;
  } catch (err) {
    DEBUG.error(`FAIL  ${name} (${(performance.now() - t).toFixed(1)}ms)`, err);
    throw err;
  }
}

window.addEventListener("error", (e) => {
  DEBUG.error(
    "window.error",
    e.message,
    "@",
    e.filename,
    e.lineno + ":" + e.colno,
  );
});

window.addEventListener("unhandledrejection", (e) => {
  DEBUG.error("unhandledrejection", e.reason);
});

window.addEventListener("offline", () => DEBUG.warn("Network offline"));
window.addEventListener("online", () => DEBUG.log("Network online"));
DEBUG.log("Script module evaluated. readyState =", document.readyState);

/* ═══════════════════════════════════════════════════════════
   BIRTHDAY BAKAR — script.js
  Three.js ES module build via importmap
   ═══════════════════════════════════════════════════════════ */

/* ─── PLAYLIST CONFIG ───────────────────────────────────────
   Add your songs to the 'song/' folder and list them below.
   ─────────────────────────────────────────────────────────── */
const PLAYLIST = [
  {
    title: "we fell in love in october",
    artist: "girl in red",
    file: "song/girl in red - we fell in love in october.mp3",
  },
  {
    title: "My Ordinary Life",
    artist: "The Living Tombstone",
    file: "song/My Ordinary Life-The Living Tombstone(MP3_160K).mp3",
  },
];

/* ─── GSAP Plugin ─── */
gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   GALAXY BACKGROUND  (Canvas 2D — lightweight, full-page)
   ═══════════════════════════════════════════════════════════ */
function initGalaxy() {
  const canvas = document.getElementById("galaxy-bg");
  const ctx = canvas.getContext("2d");
  const isMob = window.innerWidth < 768;

  let W, H, stars, nebulae;

  function buildStars() {
    const count = isMob ? 200 : 400;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.006,
      dx: (Math.random() - 0.5) * 0.06,
      dy: (Math.random() - 0.5) * 0.06,
      hue: [0, 60, 180, 270, 300][Math.floor(Math.random() * 5)],
    }));
    nebulae = Array.from({ length: isMob ? 5 : 10 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 80 + Math.random() * 160,
      hue: [280, 320, 200][Math.floor(Math.random() * 3)],
      a: 0.02 + Math.random() * 0.04,
    }));
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#04000f";
    ctx.fillRect(0, 0, W, H);

    // Nebula patches
    nebulae.forEach((n) => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, `hsla(${n.hue},80%,40%,${n.a})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, n.r, n.r * 0.6, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stars
    stars.forEach((s) => {
      s.x += s.dx;
      s.y += s.dy;
      s.a += s.da;
      if (s.a > 1) s.da = -Math.abs(s.da);
      if (s.a < 0) s.da = Math.abs(s.da);
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;

      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
      glow.addColorStop(0, `hsla(${s.hue},80%,90%,${s.a})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `hsla(${s.hue},60%,95%,${s.a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════════════
   SAKURA PETALS
   ═══════════════════════════════════════════════════════════ */
function initSakura() {
  const wrap = document.getElementById("sakura");
  const n = window.innerWidth < 768 ? 8 : 18;

  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    const sz = 8 + Math.random() * 10;
    p.style.cssText = `
      left:${Math.random() * 100}%;
      width:${sz}px; height:${sz}px;
      animation-duration:${9 + Math.random() * 10}s;
      animation-delay:${i * (14000 / n)}ms;
      opacity:${0.5 + Math.random() * 0.5};
    `;
    wrap.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════════
   THREE.JS CAKE SCENE
   ═══════════════════════════════════════════════════════════ */
function initCake() {
  const container = document.getElementById("cake-container");

  // ── Renderer ──────────────────────────────────────────────
  const W = container.clientWidth || 600;
  const H = container.clientHeight || 420;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; // r152+ API
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.insertBefore(renderer.domElement, container.firstChild);
  // Explicitly set container height to match canvas so it's visible
  container.style.minHeight = H + "px";

  // ── Scene ─────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04000f, 0.018);

  // ── Camera ────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
  camera.position.set(0, 5, 13);
  camera.lookAt(0, 2, 0);

  // ── Post-processing (bloom) ───────────────────────────────
  let composer = null;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(W, H),
      1.8, // strength
      0.55, // radius
      0.65, // threshold
    );
    composer.addPass(bloom);
  } catch (e) {
    composer = null; // fallback to renderer.render
  }

  // ── Lights ────────────────────────────────────────────────
  // Ambient
  scene.add(new THREE.AmbientLight(0x2a0060, 0.5));

  // Hemisphere (purple sky, dark floor)
  scene.add(new THREE.HemisphereLight(0x6600cc, 0x000010, 0.4));

  // Key light (warm gold, casts shadows)
  const keyLight = new THREE.SpotLight(0xffcc55, 2.5, 40, Math.PI / 5, 0.3, 1);
  keyLight.position.set(4, 14, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.bias = -0.001;
  keyLight.target.position.set(0, 2, 0);
  scene.add(keyLight);
  scene.add(keyLight.target);

  // Rim lights (pink left, cyan right)
  const rimPink = new THREE.PointLight(0xff69b4, 1.8, 20);
  rimPink.position.set(-6, 6, -4);
  scene.add(rimPink);

  const rimCyan = new THREE.PointLight(0x00ffcc, 1.2, 18);
  rimCyan.position.set(6, 4, -5);
  scene.add(rimCyan);

  // Bounce light (warm, from below)
  const bounce = new THREE.PointLight(0xff9944, 0.6, 12);
  bounce.position.set(0, -2, 4);
  scene.add(bounce);

  // ── Material Helpers ─────────────────────────────────────
  function phys(color, rough, metal, emit = 0x000000, emitInt = 0, cc = 0) {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: rough,
      metalness: metal,
      emissive: emit,
      emissiveIntensity: emitInt,
      clearcoat: cc,
      clearcoatRoughness: 0.1,
    });
  }

  // ── Ground plane ─────────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({
      color: 0x08001a,
      roughness: 0.8,
      metalness: 0.3,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.95;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Ambient sparkle particles ─────────────────────────────
  const sparkCount = window.innerWidth < 768 ? 80 : 200;
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkCol = new Float32Array(sparkCount * 3);
  const sparkSeed = new Float32Array(sparkCount); // for animation

  const sparkColors = [
    [1, 0.42, 0.71], // pink
    [1, 0.84, 0], // gold
    [0, 1, 0.8], // cyan
    [0.61, 0.35, 0.71], // purple
  ];

  for (let i = 0; i < sparkCount; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    const r = 2.5 + Math.random() * 3.5;
    sparkPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    sparkPos[i * 3 + 1] = 0.5 + r * Math.sin(theta) * Math.sin(phi) * 0.6;
    sparkPos[i * 3 + 2] = r * Math.cos(theta);
    const c = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    sparkCol[i * 3] = c[0];
    sparkCol[i * 3 + 1] = c[1];
    sparkCol[i * 3 + 2] = c[2];
    sparkSeed[i] = Math.random() * Math.PI * 2;
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkCol, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sparkles = new THREE.Points(sparkGeo, sparkMat);
  sparkles.position.set(0, 2, 0);
  scene.add(sparkles);

  // ── Cake Group ────────────────────────────────────────────
  const cake = new THREE.Group();
  scene.add(cake);

  // Board
  const board = new THREE.Mesh(
    new THREE.CylinderGeometry(2.7, 2.7, 0.18, 32),
    phys(0x2a0e00, 0.7, 0.3),
  );
  board.position.y = -0.74;
  board.castShadow = board.receiveShadow = true;
  cake.add(board);

  // Gold trim ring
  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(2.7, 0.07, 8, 64),
    phys(0xffd700, 0.1, 0.95, 0xffd700, 0.3),
  );
  trim.rotation.x = Math.PI / 2;
  trim.position.y = -0.66;
  cake.add(trim);

  // Tier helper
  function tier(rTop, rBot, h, y, color, roughness = 0.55) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBot, h, 48),
      phys(color, roughness, 0.05, 0x000000, 0, 0.1),
    );
    m.position.y = y;
    m.castShadow = m.receiveShadow = true;
    cake.add(m);
    return m;
  }

  // Cake tiers
  tier(2.25, 2.45, 1.3, 0, 0x3d1a00); // bottom  — chocolate
  tier(1.65, 1.75, 1.05, 1.75, 0x8b0000); // middle  — red velvet
  tier(1.05, 1.15, 0.85, 3.15, 0x6a2d8f); // top     — purple

  // Frosting dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    phys(0xfff5e6, 0.08, 0.0, 0x000000, 0, 1.0), // clearcoat = glossy icing
  );
  dome.position.y = 3.6;
  dome.castShadow = true;
  cake.add(dome);

  // Frosting rings (torus on each tier)
  const icingMat = phys(0xfff5e6, 0.1, 0.0, 0x000000, 0, 0.9);
  [
    [2.1, 0.14, 0.72],
    [1.5, 0.11, 2.29],
    [0.95, 0.09, 3.61],
  ].forEach(([r, tube, y]) => {
    const t = new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, 10, 48),
      icingMat.clone(),
    );
    t.rotation.x = Math.PI / 2;
    t.position.y = y;
    t.castShadow = true;
    cake.add(t);
  });

  // Frosting drips (bottom tier perimeter)
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const h = 0.18 + Math.random() * 0.42;
    const drip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.04, h, 6),
      icingMat.clone(),
    );
    drip.position.set(
      Math.cos(angle) * 2.2,
      -0.1 - h / 2 + 0.65,
      Math.sin(angle) * 2.2,
    );
    drip.castShadow = true;
    cake.add(drip);
  }

  // Sprinkles on bottom tier
  const spkColors = [
    0xff69b4, 0xffd700, 0x00ffcc, 0xff6347, 0x9b59b6, 0xffffff,
  ];
  for (let i = 0; i < 55; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.5 + Math.random() * 1.6;
    const sp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.2, 6),
      phys(spkColors[Math.floor(Math.random() * spkColors.length)], 0.2, 0.6),
    );
    sp.position.set(Math.cos(angle) * radius, 0.66, Math.sin(angle) * radius);
    sp.rotation.z = (Math.random() - 0.5) * Math.PI * 0.8;
    sp.rotation.x = (Math.random() - 0.5) * 0.5;
    cake.add(sp);
  }

  // Decorative sugar pearls around dome
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const pearl = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      phys(0xffffff, 0.05, 0.7, 0xfff0cc, 0.5, 1),
    );
    pearl.position.set(Math.cos(a) * 0.9, 3.58, Math.sin(a) * 0.9);
    cake.add(pearl);
  }

  // ── CANDLES ───────────────────────────────────────────────
  const CANDLE_N = 6;
  const candleAlive = new Array(CANDLE_N).fill(true);
  let blownCount = 0;
  const flameGroups = [];
  const flameMeshes = [];
  const candleLights = [];
  const flameSeeds = [];

  // Positions: 1 centre + 5 in ring
  const candlePos = [{ x: 0, z: 0 }];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    candlePos.push({ x: Math.cos(a) * 0.55, z: Math.sin(a) * 0.55 });
  }

  const candleHues = [
    0xff69b4, 0xffd700, 0x9b59b6, 0x00ffcc, 0xff4444, 0xffd700,
  ];

  candlePos.forEach((pos, i) => {
    const g = new THREE.Group();
    g.position.set(pos.x, 4.1, pos.z);
    cake.add(g);

    // Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.6, 10),
      phys(candleHues[i], 0.5, 0.1),
    );
    body.position.y = 0.3;
    body.castShadow = true;
    g.add(body);

    // Wick
    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.1, 5),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 }),
    );
    wick.position.y = 0.65;
    g.add(wick);

    // Flame group
    const fg = new THREE.Group();
    fg.position.y = 0.72;
    g.add(fg);
    flameGroups.push(fg);
    flameSeeds.push(Math.random() * Math.PI * 2);

    // Outer flame (orange)
    const outerF = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.28, 10),
      new THREE.MeshStandardMaterial({
        color: 0xff5500,
        emissive: 0xff3300,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      }),
    );
    outerF.position.y = 0.14;
    fg.add(outerF);

    // Inner flame (yellow-white)
    const innerF = new THREE.Mesh(
      new THREE.ConeGeometry(0.046, 0.17, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffff88,
        emissive: 0xffffaa,
        emissiveIntensity: 5,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
      }),
    );
    innerF.position.y = 0.145;
    fg.add(innerF);

    // Track meshes for raycasting
    flameMeshes.push({ group: fg, index: i, mesh1: outerF, mesh2: innerF });

    // Candle point light
    const cl = new THREE.PointLight(0xffaa44, 1.0, 5, 2);
    cl.position.y = 0.8;
    g.add(cl);
    candleLights.push(cl);
  });

  // ── OrbitControls ─────────────────────────────────────────
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.58;
  controls.enablePan = false;
  controls.minDistance = 5;
  controls.maxDistance = 20;
  controls.target.set(0, 2, 0);

  // ── Candle interaction ────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const speechEl = document.getElementById("speech-bubble");
  const comboEl = document.getElementById("combo-display");
  const blownCountEl = document.getElementById("candle-blown");
  let speechTO = null;

  const msgs = [
    "One breath, one victory! You're basically Naruto now. 🍃",
    "TWO DOWN! The cake trembles before you!",
    "HALF-WAY! Even Luffy needed meat for this. ⚓",
    "FOUR CANDLES! Demon King-level lung capacity. 👁️",
    "ONE LEFT! Madara has entered the chat. 💥",
    "🎉 SUGOI! ALL BLOWN! HAPPY BIRTHDAY BAKAR! 🎂",
  ];

  function showBubble(msg) {
    speechEl.textContent = msg;
    speechEl.classList.add("show");
    if (speechTO) clearTimeout(speechTO);
    speechTO = setTimeout(() => speechEl.classList.remove("show"), 3200);
  }

  function blowCandle(i) {
    if (!candleAlive[i]) return;
    candleAlive[i] = false;
    blownCount++;

    gsap.to(flameGroups[i].scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.35,
      ease: "back.in(2)",
    });
    gsap.to(candleLights[i], { intensity: 0, duration: 0.35 });

    // Update progress
    blownCountEl.textContent = blownCount;

    // Combo display
    comboEl.innerHTML = `${blownCount}<span class="c-label">COMBO!</span>`;
    gsap.fromTo(
      comboEl,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
    );

    showBubble(msgs[blownCount - 1]);

    if (blownCount === CANDLE_N) setTimeout(celebrate, 600);
  }

  function celebrate() {
    // Camera zoom-in
    gsap.to(camera.position, {
      z: 7,
      y: 5.5,
      duration: 1.8,
      ease: "power2.inOut",
    });
    controls.autoRotate = false;
    controls.autoRotateSpeed = 3;

    // Confetti burst
    confettiBurst(90);

    // Boost sparkle speed
    sparkles.material.size = 0.2;
  }

  function normCoords(cX, cY) {
    const rect = renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((cX - rect.left) / rect.width) * 2 - 1,
      -((cY - rect.top) / rect.height) * 2 + 1,
    );
  }

  function tryBlowAt(nc) {
    raycaster.setFromCamera(nc, camera);
    const targets = [];
    flameMeshes.forEach((f) => {
      if (!candleAlive[f.index]) return;
      targets.push(f.mesh1, f.mesh2);
    });
    const hits = raycaster.intersectObjects(targets);
    if (!hits.length) return;
    const hitMesh = hits[0].object;
    const entry = flameMeshes.find(
      (f) => f.mesh1 === hitMesh || f.mesh2 === hitMesh,
    );
    if (entry) blowCandle(entry.index);
  }

  renderer.domElement.addEventListener("click", (e) => {
    tryBlowAt(normCoords(e.clientX, e.clientY));
  });
  renderer.domElement.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      tryBlowAt(normCoords(t.clientX, t.clientY));
    },
    { passive: false },
  );

  // ── Resize (window-driven to avoid ResizeObserver feedback loop) ──
  let resizeQueued = false;
  function applyCakeResize() {
    const nW = container.clientWidth || W;
    const nH = Math.min(nW * 0.72, 500);
    renderer.setSize(nW, nH);
    if (composer) composer.setSize(nW, nH);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
    container.style.minHeight = nH + "px";
  }

  function scheduleCakeResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      applyCakeResize();
    });
  }

  window.addEventListener("resize", scheduleCakeResize);
  applyCakeResize();

  // ── Render Loop ───────────────────────────────────────────
  const clock = new THREE.Clock();
  let bass = 0; // updated by music player

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Flame flicker
    flameGroups.forEach((fg, i) => {
      if (!candleAlive[i]) return;
      const seed = flameSeeds[i];
      fg.scale.x = 1 + Math.sin(t * 9 + seed) * 0.14;
      fg.scale.y = 1 + Math.cos(t * 7 + seed * 1.3) * 0.09;
      fg.position.x = Math.sin(t * 5 + seed * 2) * 0.012;
      candleLights[i].intensity =
        0.8 + Math.sin(t * 12 + seed) * 0.4 + bass * 0.6;
    });

    // Sparkle drift
    const pos = sparkGeo.attributes.position.array;
    for (let i = 0; i < sparkCount; i++) {
      const seed = sparkSeed[i];
      pos[i * 3] += Math.sin(t * 0.4 + seed) * 0.003;
      pos[i * 3 + 1] += Math.cos(t * 0.5 + seed * 1.2) * 0.002 + bass * 0.002;
      pos[i * 3 + 2] += Math.sin(t * 0.3 + seed * 0.8) * 0.003;
    }
    sparkGeo.attributes.position.needsUpdate = true;

    // Music-reactive cake pulse
    if (bass > 0.3) {
      cake.scale.setScalar(1 + bass * 0.04);
      rimPink.intensity = 1.8 + bass * 2;
    } else {
      cake.scale.setScalar(1);
    }

    controls.update();
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  animate();

  // Expose bass setter for music player
  window._setBass = (v) => {
    bass = v;
  };
}

/* ═══════════════════════════════════════════════════════════
   MUSIC PLAYER  (Web Audio API + Visualizer)
   ═══════════════════════════════════════════════════════════ */
function initMusicPlayer() {
  if (!PLAYLIST.length) return;

  const audioEl = document.getElementById("audio-el");
  const toggleBtn = document.getElementById("player-toggle");
  const panel = document.getElementById("player-panel");
  const btnPlay = document.getElementById("btn-play");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnShuffle = document.getElementById("btn-shuffle");
  const btnRepeat = document.getElementById("btn-repeat");
  const songName = document.getElementById("song-name");
  const songArtist = document.getElementById("song-artist");
  const pfill = document.getElementById("progress-fill");
  const pbar = document.getElementById("progress-bar");
  const tCur = document.getElementById("t-cur");
  const tDur = document.getElementById("t-dur");
  const volCtrl = document.getElementById("vol-ctrl");
  const vizCanvas = document.getElementById("visualizer");
  const vizCtx = vizCanvas.getContext("2d");

  let trackIndex = 0;
  let isPlaying = false;
  let shuffle = false;
  let repeat = false;
  let audioCtx = null;
  let analyser = null;
  let freqData = null;
  let panelOpen = false;

  audioEl.addEventListener("loadstart", () => DEBUG.log("audio: loadstart"));
  audioEl.addEventListener("canplay", () => DEBUG.log("audio: canplay"));
  audioEl.addEventListener("canplaythrough", () =>
    DEBUG.log("audio: canplaythrough"),
  );
  audioEl.addEventListener("waiting", () =>
    DEBUG.warn("audio: waiting (buffering)"),
  );
  audioEl.addEventListener("stalled", () => DEBUG.warn("audio: stalled"));
  audioEl.addEventListener("error", () => {
    const mediaErr = audioEl.error;
    DEBUG.error(
      "audio: error",
      mediaErr ? { code: mediaErr.code, message: mediaErr.message } : "unknown",
    );
  });

  // Panel toggle
  toggleBtn.addEventListener("click", () => {
    panelOpen = !panelOpen;
    panel.classList.toggle("hidden", !panelOpen);
  });
  panel.classList.add("hidden");

  // Setup Web Audio
  function setupAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audioEl);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
  }

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function loadTrack(idx) {
    const t = PLAYLIST[idx];
    DEBUG.log("loadTrack", idx, t.file);
    audioEl.src = t.file;
    songName.textContent = t.title;
    songArtist.textContent = t.artist;
    pfill.style.width = "0%";
    tCur.textContent = "0:00";
    tDur.textContent = "0:00";
  }

  function play() {
    setupAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    audioEl
      .play()
      .then(() => {
        isPlaying = true;
        btnPlay.textContent = "⏸";
        toggleBtn.classList.add("playing");
        DEBUG.log("audio: playing");
      })
      .catch((err) => {
        if (err && err.name === "AbortError") {
          DEBUG.warn(
            "audio: play interrupted (AbortError), usually harmless during quick play/pause toggles",
          );
        } else {
          DEBUG.error("audio: play failed", err);
        }
      });
  }

  function pause() {
    audioEl.pause();
    isPlaying = false;
    btnPlay.textContent = "▶";
    toggleBtn.classList.remove("playing");
    DEBUG.log("audio: paused");
  }

  function nextTrack() {
    if (shuffle) {
      trackIndex = Math.floor(Math.random() * PLAYLIST.length);
    } else {
      trackIndex = (trackIndex + 1) % PLAYLIST.length;
    }
    loadTrack(trackIndex);
    if (isPlaying) play();
  }

  function prevTrack() {
    if (audioEl.currentTime > 3) {
      audioEl.currentTime = 0;
      return;
    }
    trackIndex = (trackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadTrack(trackIndex);
    if (isPlaying) play();
  }

  btnPlay.addEventListener("click", () => {
    isPlaying ? pause() : play();
  });
  btnNext.addEventListener("click", nextTrack);
  btnPrev.addEventListener("click", prevTrack);

  btnShuffle.addEventListener("click", () => {
    shuffle = !shuffle;
    btnShuffle.classList.toggle("active", shuffle);
  });
  btnRepeat.addEventListener("click", () => {
    repeat = !repeat;
    btnRepeat.classList.toggle("active", repeat);
  });

  audioEl.addEventListener("ended", () => {
    if (repeat) {
      audioEl.currentTime = 0;
      play();
    } else nextTrack();
  });

  audioEl.addEventListener("timeupdate", () => {
    if (!audioEl.duration) return;
    const pct = audioEl.currentTime / audioEl.duration;
    pfill.style.width = pct * 100 + "%";
    tCur.textContent = fmt(audioEl.currentTime);
    tDur.textContent = fmt(audioEl.duration);
  });

  pbar.addEventListener("click", (e) => {
    const rect = pbar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioEl.currentTime = pct * audioEl.duration;
  });

  volCtrl.addEventListener("input", () => {
    audioEl.volume = volCtrl.value / 100;
  });
  audioEl.volume = 0.7;

  // Visualizer draw loop
  function drawViz() {
    requestAnimationFrame(drawViz);
    const vW = vizCanvas.width;
    const vH = vizCanvas.height;
    vizCtx.clearRect(0, 0, vW, vH);

    if (!analyser || !isPlaying) {
      // Idle state — soft pulse line
      const t = performance.now() / 1000;
      const grad = vizCtx.createLinearGradient(0, 0, vW, 0);
      grad.addColorStop(0, "rgba(155,89,182,0.2)");
      grad.addColorStop(0.5, "rgba(255,105,180,0.4)");
      grad.addColorStop(1, "rgba(0,255,204,0.2)");
      vizCtx.strokeStyle = grad;
      vizCtx.lineWidth = 2;
      vizCtx.beginPath();
      for (let x = 0; x < vW; x++) {
        const y =
          vH / 2 +
          Math.sin((x / vW) * Math.PI * 4 + t * 2) * 6 * Math.sin(t * 0.5);
        x === 0 ? vizCtx.moveTo(x, y) : vizCtx.lineTo(x, y);
      }
      vizCtx.stroke();
      return;
    }

    analyser.getByteFrequencyData(freqData);

    // Drive cake bass reactivity
    const bassVal = (freqData[0] + freqData[1] + freqData[2]) / (255 * 3);
    if (window._setBass) window._setBass(bassVal);

    // Bars
    const bars = freqData.length;
    const bW = vW / bars;
    const hues = [280, 320, 200, 180];

    freqData.forEach((v, i) => {
      const pct = v / 255;
      const h = vH * pct;
      const hue = hues[i % hues.length];
      const grad = vizCtx.createLinearGradient(0, vH, 0, vH - h);
      grad.addColorStop(0, `hsla(${hue},100%,55%,0.9)`);
      grad.addColorStop(1, `hsla(${hue + 40},100%,75%,0.7)`);
      vizCtx.fillStyle = grad;
      vizCtx.fillRect(i * bW + 1, vH - h, Math.max(1, bW - 2), h);
    });
  }

  loadTrack(0);
  drawViz();
}

/* ═══════════════════════════════════════════════════════════
   CONFETTI BURST
   ═══════════════════════════════════════════════════════════ */
function confettiBurst(n) {
  const cols = [
    "#ff69b4",
    "#ffd700",
    "#9b59b6",
    "#00ffcc",
    "#ff4444",
    "#ffffff",
  ];
  const cnt = window.innerWidth < 768 ? Math.ceil(n * 0.5) : n;
  for (let i = 0; i < cnt; i++) {
    const el = document.createElement("div");
    el.className = "confetti-p";
    const sz = 6 + Math.random() * 8;
    el.style.cssText = `
      left:${8 + Math.random() * 84}%;
      width:${sz}px; height:${sz}px;
      background:${cols[Math.floor(Math.random() * cols.length)]};
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      animation-duration:${1.5 + Math.random() * 2.5}s;
      animation-delay:${Math.random() * 0.6}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

/* ═══════════════════════════════════════════════════════════
   GSAP — SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
function initGSAP() {
  // ── Hero entrance ─────────────────────────────────────────
  gsap.to(".hero-eye", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power2.out",
    delay: 0.5,
  });
  gsap.to(".hero-title", {
    opacity: 1,
    scale: 1,
    duration: 1.1,
    ease: "back.out(1.5)",
    delay: 0.8,
    onStart() {
      gsap.set(".hero-title", { scale: 0.5 });
    },
  });
  gsap.to(".hero-sub", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power2.out",
    delay: 1.3,
    onStart() {
      gsap.set(".hero-sub", { y: 30 });
    },
  });
  gsap.to(".hero-badge", {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: "back.out(2)",
    delay: 1.8,
    onStart() {
      gsap.set(".hero-badge", { scale: 0 });
    },
  });

  // ── Cake section title ────────────────────────────────────
  gsap.from(".s-cake .s-title", {
    y: -40,
    opacity: 0,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: { trigger: "#cake-section", start: "top 80%" },
  });

  // ── Wish cards — alternate slide in ──────────────────────
  gsap.utils.toArray(".wish-card").forEach((card, i) => {
    gsap.from(card, {
      x: i % 2 === 0 ? -220 : 220,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%" },
    });
  });

  // ── Stat bars fill ────────────────────────────────────────
  gsap.utils.toArray(".s-fill").forEach((bar) => {
    const pct = parseInt(bar.dataset.pct, 10);
    const color = bar.dataset.color;
    if (color) {
      bar.style.background = `linear-gradient(90deg, #6a0dad, ${color})`;
      bar.style.boxShadow = `0 0 10px ${color}99`;
    }
    gsap.fromTo(
      bar,
      { width: "0%" },
      {
        width: pct + "%",
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: bar, start: "top 88%" },
      },
    );
  });

  // ── Profile card ──────────────────────────────────────────
  gsap.from(".profile-card", {
    y: 70,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".profile-card", start: "top 85%" },
  });

  // ── Roast bubbles pop-in ──────────────────────────────────
  gsap.utils.toArray(".roast").forEach((r, i) => {
    gsap.to(r, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)",
      delay: i * 0.18,
      scrollTrigger: { trigger: "#profile-section", start: "top 65%" },
      onStart() {
        gsap.set(r, { scale: 0.5 });
      },
    });
  });

  // ── Footer JoJo arrow ────────────────────────────────────
  ScrollTrigger.create({
    trigger: "#footer-section",
    start: "top 65%",
    once: true,
    onEnter() {
      gsap.to("#jojo-arrow", {
        x: window.innerWidth + 300,
        duration: 2,
        ease: "power2.inOut",
        onStart() {
          gsap.set("#jojo-arrow", { x: -window.innerWidth - 300 });
        },
      });
      gsap.to("#sepia-overlay", {
        backgroundColor: "rgba(160,120,60,0.28)",
        duration: 1.2,
        delay: 1.5,
        ease: "power1.out",
      });
      gsap.from(".footer-body > *", {
        y: 30,
        opacity: 0,
        stagger: 0.18,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.4,
      });
    },
  });

  // ── Subtle parallax on galaxy scroll ─────────────────────
  gsap.to("#galaxy-bg", {
    y: () => window.scrollY * 0.2,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   LOADER FADEOUT
   ═══════════════════════════════════════════════════════════ */
function hideLoader() {
  const loader = document.getElementById("loader");
  gsap.to(loader, {
    opacity: 0,
    duration: 0.8,
    delay: 0.3,
    ease: "power2.out",
    onComplete: () => loader.classList.add("hidden"),
  });
}

/* ═══════════════════════════════════════════════════════════
   INIT — wait for full load so Three.js container has layout
   ═══════════════════════════════════════════════════════════ */
window.addEventListener("load", () => {
  DEBUG.log("window.load fired");

  const loaderSafetyTO = setTimeout(() => {
    DEBUG.warn(
      "Loader safety timeout hit (>12s). Forcing loader hide so UI is usable.",
    );
    hideLoader();
  }, 12000);

  timedStep("initGalaxy", initGalaxy);
  timedStep("initSakura", initSakura);

  // Two rAF frames to ensure layout is fully computed
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        timedStep("initCake", initCake);
        timedStep("initMusicPlayer", initMusicPlayer);
        timedStep("initGSAP", initGSAP);
      } finally {
        clearTimeout(loaderSafetyTO);
        timedStep("hideLoader", hideLoader);
      }
    });
  });
});
