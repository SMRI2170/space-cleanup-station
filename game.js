// ============================================================
// Space Cleanup Station - Ultimate Edition with Web Audio & Particles
// ============================================================

const GAME_STATE = {
  credits: 0,
  speedLevel: 1,
  capacityLevel: 1,
  attractLevel: 1,
  droneCount: 0,
  carriedDebris: [],
  missionIndex: 0,
  hasSorter: false,
  hasRecycler: false,
  isAutoPlay: false,
  feverGauge: 0,
  isFever: false,
  isShuttleDocked: false,
  soundEnabled: true,
  combo: 0,
  comboTimer: 0,
  bestCombo: 0,
  pulseCooldown: 0,
  pulseActive: 0,
};

const MISSIONS = [
  "デブリを拾って回収ボックスに運ぼう (0/5)",
  "バッグ容量をアップグレードしよう",
  "🧲 マグネットタワーを建設しよう",
  "🤖 回収ドローンを購入しよう",
  "⚙️ デブリ分別機を建設しよう",
  "🏭 大型リサイクラーを建設して自動化を完成させよう！",
  "🎉 完全自動化ステーション完成！宇宙のゴミを一掃しよう！"
];

// --- 🎵 Procedural Web Audio Engine ---
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15, slideTo = null) {
  if (!GAME_STATE.soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
    }
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

let coinPitchCounter = 0;
function playCoinSound() {
  initAudio();
  const baseFreq = 587.33; // D5
  const notes = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
  const freq = notes[coinPitchCounter % notes.length];
  coinPitchCounter++;
  playTone(freq, 'triangle', 0.12, 0.12, freq * 1.2);
}

function playVacuumSound() {
  initAudio();
  playTone(320, 'sine', 0.08, 0.08, 640);
}

function playDockSound() {
  initAudio();
  playTone(85, 'sawtooth', 0.6, 0.35, 30);
  setTimeout(() => playTone(220, 'triangle', 0.3, 0.2, 440), 100);
}

function playRareAlertSound() {
  initAudio();
  playTone(880, 'square', 0.15, 0.18);
  setTimeout(() => playTone(1174.66, 'square', 0.2, 0.2), 160);
}

function playFeverSound() {
  initAudio();
  [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.15, 0.15), i * 70);
  });
}

function playUpgradeSound() {
  initAudio();
  [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.18, 0.14), i * 90);
  });
}

// --- Three.js Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010206);
scene.fog = new THREE.FogExp2(0x010206, 0.012);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 17, 13.5);
camera.lookAt(0, 0, 0);

let cameraShake = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

// Earth Texture Canvas
function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b194f';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#1e3a29';
  ctx.beginPath();
  ctx.arc(150, 100, 70, 0, Math.PI * 2);
  ctx.arc(280, 140, 90, 0, Math.PI * 2);
  ctx.arc(420, 80, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.ellipse(Math.random() * 512, Math.random() * 256, 60, 15, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

// --- Dynamic Lighting ---
const ambientLight = new THREE.AmbientLight(0x1e293b, 1.3);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.2);
sunLight.position.set(20, 30, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

const earthshineLight = new THREE.DirectionalLight(0x0ea5e9, 1.8);
earthshineLight.position.set(-18, -10, -18);
scene.add(earthshineLight);

const stationBulb = new THREE.PointLight(0x38bdf8, 2.2, 16);
stationBulb.position.set(0, 2.0, 0);
scene.add(stationBulb);

// Cosmic Starfield
const starGeo = new THREE.BufferGeometry();
const starCount = 1000;
const starPos = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i += 3) {
  starPos[i] = (Math.random() - 0.5) * 220;
  starPos[i+1] = (Math.random() - 0.5) * 140;
  starPos[i+2] = (Math.random() - 0.5) * 220;

  const tint = Math.random();
  if (tint > 0.8) { starColors[i]=0.4; starColors[i+1]=0.8; starColors[i+2]=1.0; }
  else if (tint > 0.6) { starColors[i]=1.0; starColors[i+1]=0.8; starColors[i+2]=0.4; }
  else { starColors[i]=1.0; starColors[i+1]=1.0; starColors[i+2]=1.0; }
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
const starMat = new THREE.PointsMaterial({ size: 0.85, vertexColors: true, transparent: true, opacity: 0.9 });
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// Planet Earth
const earthGroup = new THREE.Group();
earthGroup.position.set(0, -70, -40);

const earthMesh = new THREE.Mesh(
  new THREE.SphereGeometry(55, 48, 24),
  new THREE.MeshStandardMaterial({ map: createEarthTexture(), roughness: 0.7, metalness: 0.1 })
);
earthGroup.add(earthMesh);

const atmoMesh = new THREE.Mesh(
  new THREE.SphereGeometry(56.2, 32, 16),
  new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22, side: THREE.BackSide })
);
earthGroup.add(atmoMesh);
scene.add(earthGroup);

// --- Base Materials ---
const suitWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.38, metalness: 0.15 });
const techDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
const goldVisorMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.08, metalness: 0.98 });
const cyanLightMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 2.5 });
const orangeGlowMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 2.8 });
const platBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.75 });
const platTileMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.85 });

// --- ✨ High Performance Particle System ---
const particlePool = [];
const PARTICLE_MAX = 120;
const pGeo = new THREE.PlaneGeometry(0.18, 0.18);
const pMatSpark = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
const pMatPlasma = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, side: THREE.DoubleSide });

for (let i = 0; i < PARTICLE_MAX; i++) {
  const pMesh = new THREE.Mesh(pGeo, pMatSpark);
  pMesh.visible = false;
  scene.add(pMesh);
  particlePool.push({
    mesh: pMesh,
    active: false,
    life: 0,
    maxLife: 1.0,
    vel: new THREE.Vector3()
  });
}

function spawnParticle(pos, vel, isPlasma = false, maxLife = 0.6) {
  const p = particlePool.find(item => !item.active);
  if (!p) return;
  p.active = true;
  p.mesh.visible = true;
  p.mesh.material = isPlasma ? pMatPlasma : pMatSpark;
  p.mesh.position.copy(pos);
  p.vel.copy(vel);
  p.life = 0;
  p.maxLife = maxLife;
  p.mesh.scale.set(1, 1, 1);
}

function updateParticles(dt) {
  particlePool.forEach(p => {
    if (p.active) {
      p.life += dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      const ratio = 1 - (p.life / p.maxLife);
      if (ratio <= 0) {
        p.active = false;
        p.mesh.visible = false;
      } else {
        p.mesh.scale.set(ratio, ratio, ratio);
        p.mesh.lookAt(camera.position);
      }
    }
  });
}

// --- Central Main Platform ---
const platformGroup = new THREE.Group();

const platGeo = new THREE.CylinderGeometry(5.6, 5.8, 0.45, 6);
const platform = new THREE.Mesh(platGeo, platBaseMat);
platform.position.y = -0.22;
platform.receiveShadow = true;
platformGroup.add(platform);

const walkwayGeo = new THREE.CylinderGeometry(5.0, 5.0, 0.05, 6);
const walkway = new THREE.Mesh(walkwayGeo, platTileMat);
walkway.position.y = 0.02;
walkway.receiveShadow = true;
platformGroup.add(walkway);

const neonRing = new THREE.Mesh(
  new THREE.TorusGeometry(4.8, 0.06, 8, 32),
  new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.8 })
);
neonRing.rotation.x = Math.PI / 2;
neonRing.position.y = 0.06;
platformGroup.add(neonRing);

const hazardRing = new THREE.Mesh(
  new THREE.TorusGeometry(5.4, 0.08, 8, 32),
  new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.4 })
);
hazardRing.rotation.x = Math.PI / 2;
hazardRing.position.y = 0.03;
platformGroup.add(hazardRing);
scene.add(platformGroup);

// --- Station Expansion Modules ---
const rotatingSolarPanels = [];
const blinkingBeacons = [];

function createExpansionModule(type, angleOffset) {
  const modGroup = new THREE.Group();

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.35, 6), platBaseMat);
  deck.receiveShadow = true;
  const tile = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.05, 6), platTileMat);
  tile.position.y = 0.18;
  tile.receiveShadow = true;
  modGroup.add(deck, tile);

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 2.8), techDarkMat);
  bridge.position.set(0, 0, -2.2);
  bridge.receiveShadow = true;
  modGroup.add(bridge);

  if (type === 'solar') {
    const pGroup = new THREE.Group();
    pGroup.position.y = 0.8;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 1.2), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.9, roughness: 0.2 }));
    wingL.position.set(-2.2, 0, 0);
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 1.2), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.9, roughness: 0.2 }));
    wingR.position.set(2.2, 0, 0);
    pGroup.add(wingL, wingR);
    modGroup.add(pGroup);
    rotatingSolarPanels.push(pGroup);
  } else if (type === 'dock') {
    const dockRing = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.15, 8, 24), techDarkMat);
    dockRing.rotation.x = Math.PI / 2;
    dockRing.position.y = 0.4;
    const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), cyanLightMat);
    l1.position.set(1.4, 0.45, 0);
    const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), cyanLightMat);
    l2.position.set(-1.4, 0.45, 0);
    modGroup.add(dockRing, l1, l2);
    blinkingBeacons.push(l1, l2);
  } else if (type === 'dome') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.9 }));
    dome.position.y = 0.2;
    modGroup.add(dome);
  } else if (type === 'factory') {
    const tower1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 2.0, 12), techDarkMat);
    tower1.position.set(-0.8, 1.0, 0);
    const tower2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 2.0, 12), techDarkMat);
    tower2.position.set(0.8, 1.0, 0);
    modGroup.add(tower1, tower2);
  }

  return modGroup;
}

function dockStationModule(slot) {
  const modTypes = {
    magnet: { type: 'solar', dist: 7.2, rot: Math.PI * 0.7 },
    drone: { type: 'dock', dist: 7.2, rot: -Math.PI * 0.7 },
    sorter: { type: 'dome', dist: 7.2, rot: Math.PI * 0.15 },
    recycler: { type: 'factory', dist: 7.2, rot: -Math.PI * 0.15 },
  };

  const info = modTypes[slot.id];
  if (!info) return;

  const moduleMesh = createExpansionModule(info.type, info.rot);
  const targetX = Math.cos(info.rot) * info.dist;
  const targetZ = Math.sin(info.rot) * info.dist;

  moduleMesh.position.set(targetX * 1.8, 4.0, targetZ * 1.8);
  moduleMesh.rotation.y = -info.rot + Math.PI / 2;
  scene.add(moduleMesh);

  let t = 0;
  const dockAnim = setInterval(() => {
    t += 0.05;
    moduleMesh.position.lerp(new THREE.Vector3(targetX, -0.22, targetZ), 0.15);

    if (t >= 1.0) {
      moduleMesh.position.set(targetX, -0.22, targetZ);
      clearInterval(dockAnim);
      cameraShake = 0.4;
      playDockSound();

      // Spawn Docking Sparks
      for (let s = 0; s < 18; s++) {
        spawnParticle(
          new THREE.Vector3(targetX, 0.2, targetZ),
          new THREE.Vector3((Math.random()-0.5)*5, Math.random()*4 + 1, (Math.random()-0.5)*5),
          false,
          0.8
        );
      }
      spawnPopup("🚀 新モジュール合体！", window.innerWidth / 2, window.innerHeight * 0.3);
    }
  }, 16);
}

// --- Player (Astronaut) ---
const playerGroup = new THREE.Group();
playerGroup.position.set(0, 0.2, 1.2);

const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.72, 16), suitWhiteMat);
body.position.y = 0.55;
body.castShadow = true;
playerGroup.add(body);

const chestPack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.15), techDarkMat);
chestPack.position.set(0, 0.65, 0.28);
const chestLight = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), cyanLightMat);
chestLight.position.set(0.1, 0.70, 0.36);
chestLight.rotation.x = Math.PI / 2;
playerGroup.add(chestPack, chestLight);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), suitWhiteMat);
head.position.y = 1.18;
head.castShadow = true;
playerGroup.add(head);

const visor = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), goldVisorMat);
visor.scale.set(1.15, 0.75, 0.95);
visor.position.set(0, 1.22, 0.23);
playerGroup.add(visor);

const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.60, 0.32), techDarkMat);
backpack.position.set(0, 0.68, -0.34);
backpack.castShadow = true;

const antPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), techDarkMat);
antPole.position.set(0.18, 0.45, -0.05);
const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), goldVisorMat);
antTip.position.set(0.18, 0.68, -0.05);
backpack.add(antPole, antTip);
playerGroup.add(backpack);

const thrusterFlame = new THREE.Mesh(
  new THREE.ConeGeometry(0.16, 0.5, 12),
  new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
);
thrusterFlame.position.set(0, 0.05, -0.15);
thrusterFlame.rotation.x = Math.PI;
playerGroup.add(thrusterFlame);

const auraGeo = new THREE.RingGeometry(1.2, 1.4, 32);
const auraMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
const suctionAura = new THREE.Mesh(auraGeo, auraMat);
suctionAura.rotation.x = Math.PI / 2;
suctionAura.position.y = 0.06;
playerGroup.add(suctionAura);

scene.add(playerGroup);

// --- Dropoff Box ---
const dropoffGroup = new THREE.Group();
dropoffGroup.position.set(0, 0, -1.8);

const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.95, 1.1), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.3 }));
boxMesh.position.y = 0.48;
boxMesh.castShadow = true;
boxMesh.receiveShadow = true;
dropoffGroup.add(boxMesh);

const hopperMesh = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.42, 16), techDarkMat);
hopperMesh.position.y = 1.08;
hopperMesh.rotation.x = Math.PI;
dropoffGroup.add(hopperMesh);

const dropLight = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16),
  new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 2.5 })
);
dropLight.position.set(0, 0.65, 0.56);
dropLight.rotation.x = Math.PI / 2;
dropoffGroup.add(dropLight);
scene.add(dropoffGroup);

// --- 4 Facility Expansion Slots ---
const SLOTS_DATA = [
  { id: 'magnet', name: '🧲 マグネットタワー', cost: 20, pos: [-3.2, 0, -1.0], unlocked: false, mesh: null },
  { id: 'drone', name: '🤖 回収ドローン', cost: 50, pos: [3.2, 0, -1.0], unlocked: false, mesh: null },
  { id: 'sorter', name: '⚙️ デブリ分別機', cost: 100, pos: [-2.5, 0, 2.5], unlocked: false, mesh: null },
  { id: 'recycler', name: '🏭 大型リサイクラー', cost: 200, pos: [2.5, 0, 2.5], unlocked: false, mesh: null },
];

SLOTS_DATA.forEach(slot => {
  const slotGroup = new THREE.Group();
  slotGroup.position.set(...slot.pos);

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 16), techDarkMat);
  pad.position.y = 0.04;
  slotGroup.add(pad);

  const holoGeo = new THREE.SphereGeometry(0.85, 16, 12);
  const holoMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, wireframe: true });
  const holo = new THREE.Mesh(holoGeo, holoMat);
  holo.position.y = 0.75;
  slotGroup.add(holo);
  slot.hologram = holo;

  scene.add(slotGroup);
  slot.group = slotGroup;
});

function buildFacilityMesh(slot) {
  slot.hologram.visible = false;
  const mGroup = new THREE.Group();

  if (slot.id === 'magnet') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.8, 16), suitWhiteMat);
    pole.position.y = 0.9;
    pole.castShadow = true;
    const magnetHead = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.14, 12, 24), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, metalness: 0.7 }));
    magnetHead.position.y = 1.75;
    magnetHead.rotation.y = Math.PI / 2;
    magnetHead.castShadow = true;
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), cyanLightMat);
    core.position.y = 1.75;
    mGroup.add(pole, magnetHead, core);
  } else if (slot.id === 'drone') {
    const dock = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.22, 12), techDarkMat);
    dock.position.y = 0.11;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.70, 0.05, 8, 24), cyanLightMat);
    ring.position.y = 0.24;
    ring.rotation.x = Math.PI / 2;
    mGroup.add(dock, ring);
    spawnDrone(slot.pos);
    GAME_STATE.droneCount = 1;
    document.getElementById('btn-upgrade-drone').style.display = 'flex';
  } else if (slot.id === 'sorter') {
    const bodyS = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.95, 0.95), suitWhiteMat);
    bodyS.position.y = 0.58;
    bodyS.castShadow = true;
    const hopper = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.26, 0.38, 16), techDarkMat);
    hopper.position.set(-0.28, 1.15, 0);
    const scanBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.65), cyanLightMat);
    scanBar.position.set(0.66, 0.58, 0);
    mGroup.add(bodyS, hopper, scanBar);
    GAME_STATE.hasSorter = true;
  } else if (slot.id === 'recycler') {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.80, 0.80, 1.5, 20), techDarkMat);
    tank.position.y = 0.80;
    tank.castShadow = true;
    const glowWin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.40, 0.32), new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 2.2 }));
    glowWin.position.set(0.76, 0.80, 0);
    mGroup.add(tank, glowWin);
    GAME_STATE.hasRecycler = true;
  }

  mGroup.scale.set(0.01, 0.01, 0.01);
  slot.group.add(mGroup);
  slot.mesh = mGroup;

  let s = 0.01;
  const popTimer = setInterval(() => {
    s += 0.14;
    if (s >= 1.0) {
      mGroup.scale.set(1, 1, 1);
      clearInterval(popTimer);
      dockStationModule(slot);
    } else {
      mGroup.scale.set(s, s, s);
    }
  }, 16);
}

// --- 🚀 Step 4: Visiting Cargo Shuttle ---
let shuttleMesh = null;
let shuttleState = 'away';
const shuttleCardEl = document.getElementById('shuttle-card');

function buildCargoShuttle() {
  const sGroup = new THREE.Group();

  const hull = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 16), suitWhiteMat);
  hull.rotation.x = Math.PI / 2;
  hull.scale.set(1.0, 1.0, 0.55);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), cyanLightMat);
  canopy.scale.set(0.7, 0.4, 1.1);
  canopy.position.set(0, 0.35, 0.6);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 1.4), techDarkMat);
  wing.position.set(0, -0.05, -0.4);

  const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.8, 12), orangeGlowMat);
  engL.rotation.x = Math.PI / 2;
  engL.position.set(-0.85, 0, -1.6);

  const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.8, 12), orangeGlowMat);
  engR.rotation.x = Math.PI / 2;
  engR.position.set(0.85, 0, -1.6);

  sGroup.add(hull, canopy, wing, engL, engR);
  sGroup.position.set(0, 30, -30);
  scene.add(sGroup);
  shuttleMesh = sGroup;
}

buildCargoShuttle();

function triggerShuttleVisit() {
  if (shuttleState !== 'away') return;
  shuttleState = 'approaching';
  shuttleMesh.position.set(-18, 12, -22);
  shuttleMesh.rotation.set(0, Math.PI * 0.25, 0);

  const dockPos = new THREE.Vector3(-4.5, 0.8, -4.5);

  let progress = 0;
  const approachTimer = setInterval(() => {
    progress += 0.02;
    shuttleMesh.position.lerp(dockPos, 0.08);

    if (progress >= 1.0 || shuttleMesh.position.distanceTo(dockPos) < 0.3) {
      clearInterval(approachTimer);
      shuttleMesh.position.copy(dockPos);
      shuttleState = 'docked';
      GAME_STATE.isShuttleDocked = true;
      shuttleCardEl.style.display = 'block';
      cameraShake = 0.25;
      playDockSound();
      spawnPopup("🚀 貨物船が着陸！(売却x3倍)", window.innerWidth / 2, window.innerHeight * 0.35, true);

      setTimeout(() => {
        departShuttle();
      }, 12000);
    }
  }, 30);
}

function departShuttle() {
  if (shuttleState !== 'docked') return;
  shuttleState = 'departing';
  GAME_STATE.isShuttleDocked = false;
  shuttleCardEl.style.display = 'none';

  let depProgress = 0;
  const depTimer = setInterval(() => {
    depProgress += 0.03;
    shuttleMesh.position.y += 0.4;
    shuttleMesh.position.z += 0.6;
    shuttleMesh.position.x += 0.3;

    if (depProgress >= 1.0 || shuttleMesh.position.y > 35) {
      clearInterval(depTimer);
      shuttleMesh.position.set(0, 40, -40);
      shuttleState = 'away';
    }
  }, 30);
}

setTimeout(triggerShuttleVisit, 14000);
setInterval(triggerShuttleVisit, 36000);

// --- Drone Fleet ---
const droneList = [];

function spawnDrone(dockPos) {
  const droneObj = new THREE.Group();
  droneObj.position.set(dockPos[0] + (Math.random()-0.5)*1.5, 1.3 + droneList.length * 0.4, dockPos[2] + (Math.random()-0.5)*1.5);

  const dBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), suitWhiteMat);
  dBody.castShadow = true;

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), cyanLightMat);
  eye.scale.set(0.75, 0.45, 0.45);
  eye.position.set(0, 0.05, 0.25);

  const jetL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), techDarkMat);
  jetL.position.set(-0.32, -0.05, -0.15);
  const jetR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), techDarkMat);
  jetR.position.set(0.32, -0.05, -0.15);

  const beamCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.8, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  beamCone.rotation.x = Math.PI / 2;
  beamCone.position.set(0, 0, 1.0);
  beamCone.visible = false;
  droneObj.add(beamCone);

  droneObj.add(dBody, eye, jetL, jetR);
  scene.add(droneObj);

  droneList.push({
    obj: droneObj,
    beam: beamCone,
    state: 'idle',
    target: null,
    carriedType: null,
    speed: 5.8 + Math.random() * 0.8
  });
}

// --- Debris Management ---
const debrisList = [];
const DEBRIS_TYPES = [
  { name: 'metal', label: 'チタン片', value: 1, color: 0x94a3b8, weight: 0.60 },
  { name: 'solar', label: 'ソーラー板', value: 3, color: 0x1d4ed8, weight: 0.30 },
  { name: 'satellite', label: '衛星部品', value: 10, color: 0xfacc15, weight: 0.10 },
  { name: 'rare_rocket', label: '🚀 ロケットエンジン残骸', value: 200, isRare: true },
  { name: 'rare_telescope', label: '🛰️ 宇宙望遠鏡コア', value: 350, isRare: true },
  { name: 'rare_crystal', label: '💎 宇宙結晶隕石', value: 500, isRare: true },
];

const CONTRACTS = [
  { type: 'satellite', target: 3, time: 45, reward: 120 },
  { type: 'solar', target: 5, time: 40, reward: 90 },
  { type: 'metal', target: 8, time: 35, reward: 80 },
];
let contractIndex = 0;
let activeContract = null;
let contractChoices = [];
let contractResult = null;

function getDebrisLabel(name) {
  const type = DEBRIS_TYPES.find(item => item.name === name);
  return type ? type.label.replace(/^.*?\s/, '') : name;
}

function openContractSelection() {
  activeContract = null;
  contractResult = null;
  const offset = contractIndex % CONTRACTS.length;
  contractChoices = [0, 1, 2].map(index => ({ ...CONTRACTS[(offset + index) % CONTRACTS.length] }));
  contractIndex++;
  renderContractChoices();
  renderContractResult();
}

function renderContractChoices() {
  if (!contractChoicesEl) return;
  contractChoicesEl.innerHTML = '';
  contractChoicesEl.style.display = contractChoices.length > 0 ? 'flex' : 'none';
  contractChoices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.className = 'contract-choice';
    button.textContent = `${index + 1}. ${getDebrisLabel(choice.type)} ${choice.target}個 / ${choice.time}秒 / +${choice.reward}💰`;
    button.addEventListener('click', event => {
      event.stopPropagation();
      selectContract(index);
    });
    contractChoicesEl.appendChild(button);
  });
}

function renderContractResult() {
  if (!contractResultEl) return;
  if (!contractResult) {
    contractResultEl.className = 'contract-result';
    return;
  }

  contractResultEl.className = `contract-result visible ${contractResult.success ? 'success' : 'failure'}`;
  contractResultTitleEl.textContent = contractResult.success ? '✅ 契約達成！' : '⏱ 契約失敗';
  contractResultDescEl.textContent = contractResult.success
    ? `+${contractResult.reward}💰を獲得しました`
    : `${getDebrisLabel(contractResult.contract.type)}があと${contractResult.missing}個必要でした`;
  btnContractRetry.style.display = contractResult.success ? 'none' : 'block';
}

function selectContract(index) {
  const choice = contractChoices[index];
  if (!choice || activeContract) return;
  activeContract = { ...choice, progress: 0, timeLeft: choice.time };
  contractResult = null;
  contractChoices = [];
  renderContractChoices();
  renderContractResult();
  playUpgradeSound();
  spawnPopup(`📦 ${getDebrisLabel(choice.type)}契約を受注！`, window.innerWidth / 2, window.innerHeight * 0.3, true);
  updateUI();
}

function showContractResult(success, contract, reward = 0) {
  activeContract = null;
  contractChoices = [];
  contractResult = {
    success,
    contract: { ...contract },
    reward,
    missing: Math.max(0, contract.target - contract.progress),
  };
  renderContractChoices();
  renderContractResult();
  updateUI();
}

function retryContract() {
  if (!contractResult || contractResult.success) return;
  const contract = contractResult.contract;
  activeContract = { ...contract, progress: 0, timeLeft: contract.time };
  contractResult = null;
  renderContractResult();
  playUpgradeSound();
  updateUI();
}

function createDebrisMesh(type) {
  const group = new THREE.Group();
  if (type.name === 'metal') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.25, 0.12), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 }));
    m.castShadow = true;
    group.add(m);
  } else if (type.name === 'solar') {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.04), new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.95, roughness: 0.12 }));
    panel.castShadow = true;
    const border = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.05), techDarkMat);
    border.position.y = 0.18;
    group.add(panel, border);
  } else if (type.name === 'satellite') {
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.18 }));
    core.castShadow = true;
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12), cyanLightMat);
    lens.position.z = 0.24;
    lens.rotation.x = Math.PI / 2;
    group.add(core, lens);
  } else if (type.name === 'rare_rocket') {
    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.1, 16), goldVisorMat);
    nozzle.rotation.x = Math.PI;
    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.08, 8, 24), orangeGlowMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = -0.45;
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 16), suitWhiteMat);
    tank.position.y = 0.8;
    group.add(nozzle, glowRing, tank);
    group.scale.set(1.3, 1.3, 1.3);
  } else if (type.name === 'rare_telescope') {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 16), techDarkMat);
    const goldMirror = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16), goldVisorMat);
    goldMirror.position.y = 0.72;
    const solarWing1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.6), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.95 }));
    solarWing1.position.set(1.1, 0, 0);
    const solarWing2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.6), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.95 }));
    solarWing2.position.set(-1.1, 0, 0);
    group.add(tube, goldMirror, solarWing1, solarWing2);
    group.scale.set(1.2, 1.2, 1.2);
  } else if (type.name === 'rare_crystal') {
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0, roughness: 0.1, metalness: 0.9 }));
    const ringAura = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 8, 24), cyanLightMat);
    ringAura.rotation.x = Math.PI / 3;
    group.add(crystal, ringAura);
    group.scale.set(1.25, 1.25, 1.25);
  }

  if (type.isRare) {
    const radarRing = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.55, 24),
      new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    radarRing.rotation.x = Math.PI / 2;
    group.add(radarRing);
  }

  return group;
}

function spawnDebris(forceRare = false) {
  let type = DEBRIS_TYPES[0];
  if (forceRare) {
    const rareRoll = Math.random();
    if (rareRoll > 0.65) type = DEBRIS_TYPES[5];
    else if (rareRoll > 0.35) type = DEBRIS_TYPES[4];
    else type = DEBRIS_TYPES[3];
  } else {
    const roll = Math.random();
    if (roll > 0.90) type = DEBRIS_TYPES[2];
    else if (roll > 0.60) type = DEBRIS_TYPES[1];
  }

  const mesh = createDebrisMesh(type);
  const angle = Math.random() * Math.PI * 2;
  const dist = forceRare ? 5.8 : (4.5 + Math.random() * 3.5);
  mesh.position.set(Math.cos(angle) * dist, 0.3 + Math.random() * 0.8, Math.sin(angle) * dist);
  mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);

  const item = {
    mesh: mesh,
    type: type,
    isBeingCollected: false,
    tumble: new THREE.Vector3((Math.random()-0.5)*0.03, (Math.random()-0.5)*0.03, (Math.random()-0.5)*0.03)
  };

  scene.add(mesh);
  debrisList.push(item);
}

for (let i = 0; i < 28; i++) spawnDebris();

// Rare Debris Alert System
const alertBannerEl = document.getElementById('alert-banner');
function triggerRareDebrisEvent() {
  if (GAME_STATE.isFever) return;
  spawnDebris(true);
  playRareAlertSound();
  alertBannerEl.innerHTML = `🚨 <b>大型レアデブリ飛来中！</b> (高額ボーナス！)`;
  alertBannerEl.className = 'show';
  cameraShake = 0.2;
  setTimeout(() => alertBannerEl.classList.remove('show'), 4500);
}

setTimeout(triggerRareDebrisEvent, 9000);
setInterval(triggerRareDebrisEvent, 24000);

// --- ⚡ Step 5: Debris Storm Fever Overdrive ---
function triggerFeverMode() {
  GAME_STATE.isFever = true;
  GAME_STATE.feverGauge = 100;
  cameraShake = 0.45;
  playFeverSound();

  alertBannerEl.innerHTML = `⚡ <b>DEBRIS STORM FEVER!! (超覚醒中)</b> ⚡`;
  alertBannerEl.className = 'show fever';

  for (let i = 0; i < 16; i++) {
    spawnDebris(i % 3 === 0);
  }

  const feverInterval = setInterval(() => {
    GAME_STATE.feverGauge -= 12.5;
    updateUI();
    if (GAME_STATE.feverGauge <= 0) {
      clearInterval(feverInterval);
      GAME_STATE.isFever = false;
      GAME_STATE.feverGauge = 0;
      alertBannerEl.classList.remove('show');
      updateUI();
    }
  }, 1000);
}

// --- Floating Touch Controls ---
const joyEl = document.getElementById('dynamic-joystick');
const knobEl = document.getElementById('dynamic-knob');

let isDragging = false;
let startX = 0, startY = 0;
let moveVector = { x: 0, z: 0 };
const maxRadius = 50;

function onPointerStart(e) {
  initAudio();
  if (e.target.closest('button')) return;
  GAME_STATE.isAutoPlay = false;

  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;

  joyEl.style.display = 'block';
  joyEl.style.left = `${startX}px`;
  joyEl.style.top = `${startY}px`;
  knobEl.style.transform = 'translate(-50%, -50%)';

  moveVector.x = 0;
  moveVector.z = 0;
}

function onPointerMove(e) {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const clampedDist = Math.min(dist, maxRadius);

  const knobX = Math.cos(angle) * clampedDist;
  const knobY = Math.sin(angle) * clampedDist;
  knobEl.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

  moveVector.x = knobX / maxRadius;
  moveVector.z = knobY / maxRadius;
}

function onPointerEnd() {
  isDragging = false;
  joyEl.style.display = 'none';
  moveVector.x = 0;
  moveVector.z = 0;
}

window.addEventListener('pointerdown', onPointerStart, { passive: false });
window.addEventListener('pointermove', onPointerMove, { passive: false });
window.addEventListener('pointerup', onPointerEnd);
window.addEventListener('pointercancel', onPointerEnd);

// Sound Toggle
const btnAudio = document.getElementById('btn-audio');
btnAudio.addEventListener('click', (e) => {
  e.stopPropagation();
  initAudio();
  GAME_STATE.soundEnabled = !GAME_STATE.soundEnabled;
  btnAudio.textContent = GAME_STATE.soundEnabled ? '🔊 サウンド: ON' : '🔇 サウンド: OFF';
});

// Keyboard WASD
const keys = {};
window.addEventListener('keydown', e => {
  initAudio();
  keys[e.key.toLowerCase()] = true;
  GAME_STATE.isAutoPlay = false;
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// --- UI Management ---
const creditsNumEl = document.getElementById('credits-num');
const incomeRateEl = document.getElementById('income-rate');
const capacityNumEl = document.getElementById('capacity-num');
const capacityBarEl = document.getElementById('capacity-bar');
const feverBarEl = document.getElementById('fever-bar');
const missionDescEl = document.getElementById('mission-desc');
const contractDescEl = document.getElementById('contract-desc');
const contractChoicesEl = document.getElementById('contract-choices');
const contractResultEl = document.getElementById('contract-result');
const contractResultTitleEl = document.getElementById('contract-result-title');
const contractResultDescEl = document.getElementById('contract-result-desc');
const btnContractRetry = document.getElementById('btn-contract-retry');
const btnContractNext = document.getElementById('btn-contract-next');
const comboCardEl = document.getElementById('combo-card');
const comboNumEl = document.getElementById('combo-num');
const comboMultEl = document.getElementById('combo-mult');
const comboTimeEl = document.getElementById('combo-time');
const pulseStatusEl = document.getElementById('pulse-status');

const btnSpeed = document.getElementById('btn-upgrade-speed');
const btnCap = document.getElementById('btn-upgrade-capacity');
const btnAttract = document.getElementById('btn-upgrade-attract');
const btnDrone = document.getElementById('btn-upgrade-drone');
const btnPulse = document.getElementById('btn-pulse');
const btnAuto = document.getElementById('btn-auto');

function updateUI() {
  creditsNumEl.textContent = GAME_STATE.credits.toLocaleString();
  missionDescEl.textContent = MISSIONS[GAME_STATE.missionIndex];

  if (activeContract) {
    contractDescEl.textContent = `${getDebrisLabel(activeContract.type)}を${activeContract.target}個回収 (${activeContract.progress}/${activeContract.target}) 残り${Math.ceil(activeContract.timeLeft)}秒`;
  } else if (contractResult) {
    contractDescEl.textContent = contractResult.success ? '契約達成。次の契約を選択' : '契約失敗。再挑戦または別契約を選択';
  } else {
    contractDescEl.textContent = '契約を1つ選んで回収を開始';
  }

  const comboBonus = Math.min(75, Math.max(0, GAME_STATE.combo - 1) * 8);
  comboNumEl.textContent = `COMBO x${GAME_STATE.combo}`;
  comboMultEl.textContent = `納品ボーナス +${comboBonus}%`;
  comboTimeEl.textContent = `あと${Math.ceil(GAME_STATE.comboTimer)}秒`;
  comboCardEl.classList.toggle('active', GAME_STATE.combo > 0);

  if (GAME_STATE.pulseCooldown > 0) {
    pulseStatusEl.textContent = `${Math.ceil(GAME_STATE.pulseCooldown)}秒`;
    btnPulse.classList.add('disabled');
  } else {
    pulseStatusEl.textContent = GAME_STATE.pulseActive > 0 ? 'ACTIVE' : 'READY';
    btnPulse.classList.remove('disabled');
  }
  btnAuto.textContent = GAME_STATE.isAutoPlay ? '🤖 自動: ON' : '🤖 自動: OFF';

  const maxCap = 3 + (GAME_STATE.capacityLevel - 1) * 3;
  const currentCount = GAME_STATE.carriedDebris.length;
  capacityNumEl.textContent = `${currentCount}/${maxCap}`;

  const pct = (currentCount / maxCap) * 100;
  capacityBarEl.style.width = `${pct}%`;
  capacityBarEl.classList.toggle('full', currentCount >= maxCap);

  feverBarEl.style.width = `${Math.min(100, GAME_STATE.feverGauge)}%`;

  const feverMult = GAME_STATE.isFever ? 2.2 : 1.0;
  const pulseAttractMult = GAME_STATE.pulseActive > 0 ? 2.0 : 1.0;
  const attractRad = (1.8 + (GAME_STATE.attractLevel - 1) * 0.7) * feverMult * pulseAttractMult;
  suctionAura.scale.set(attractRad, attractRad, attractRad);

  const costSpeed = 15 * GAME_STATE.speedLevel;
  const costCap = 20 * GAME_STATE.capacityLevel;
  const costAttract = 15 * GAME_STATE.attractLevel;
  const costDrone = 80 * GAME_STATE.droneCount;

  document.getElementById('lvl-speed').textContent = `Lv.${GAME_STATE.speedLevel}`;
  document.getElementById('cost-speed').textContent = `${costSpeed} 💰`;
  btnSpeed.classList.toggle('disabled', GAME_STATE.credits < costSpeed);

  document.getElementById('lvl-capacity').textContent = `Lv.${GAME_STATE.capacityLevel}`;
  document.getElementById('cost-capacity').textContent = `${costCap} 💰`;
  btnCap.classList.toggle('disabled', GAME_STATE.credits < costCap);

  document.getElementById('lvl-attract').textContent = `Lv.${GAME_STATE.attractLevel}`;
  document.getElementById('cost-attract').textContent = `${costAttract} 💰`;
  btnAttract.classList.toggle('disabled', GAME_STATE.credits < costAttract);

  if (GAME_STATE.droneCount > 0) {
    document.getElementById('lvl-drone').textContent = `${GAME_STATE.droneCount}機`;
    document.getElementById('cost-drone').textContent = `${costDrone} 💰`;
    btnDrone.classList.toggle('disabled', GAME_STATE.credits < costDrone || GAME_STATE.droneCount >= 3);
  }
}

btnSpeed.addEventListener('click', (e) => {
  e.stopPropagation();
  const cost = 15 * GAME_STATE.speedLevel;
  if (GAME_STATE.credits >= cost) {
    GAME_STATE.credits -= cost;
    GAME_STATE.speedLevel++;
    playUpgradeSound();
    updateUI();
  }
});

btnCap.addEventListener('click', (e) => {
  e.stopPropagation();
  const cost = 20 * GAME_STATE.capacityLevel;
  if (GAME_STATE.credits >= cost) {
    GAME_STATE.credits -= cost;
    GAME_STATE.capacityLevel++;
    playUpgradeSound();
    if (GAME_STATE.missionIndex === 1) GAME_STATE.missionIndex = 2;
    updateUI();
  }
});

btnAttract.addEventListener('click', (e) => {
  e.stopPropagation();
  const cost = 15 * GAME_STATE.attractLevel;
  if (GAME_STATE.credits >= cost) {
    GAME_STATE.credits -= cost;
    GAME_STATE.attractLevel++;
    playUpgradeSound();
    updateUI();
  }
});

btnDrone.addEventListener('click', (e) => {
  e.stopPropagation();
  const cost = 80 * GAME_STATE.droneCount;
  if (GAME_STATE.credits >= cost && GAME_STATE.droneCount < 3) {
    GAME_STATE.credits -= cost;
    GAME_STATE.droneCount++;
    spawnDrone([3.2, 0, -1.0]);
    playUpgradeSound();
    updateUI();
    spawnPopup("🤖 ドローン編隊増備！", window.innerWidth / 2, window.innerHeight * 0.4);
  }
});

btnAuto.addEventListener('click', (e) => {
  e.stopPropagation();
  GAME_STATE.isAutoPlay = !GAME_STATE.isAutoPlay;
  updateUI();
});

btnContractRetry.addEventListener('click', (e) => {
  e.stopPropagation();
  retryContract();
});

btnContractNext.addEventListener('click', (e) => {
  e.stopPropagation();
  openContractSelection();
  updateUI();
});

btnPulse.addEventListener('click', (e) => {
  e.stopPropagation();
  initAudio();
  if (GAME_STATE.pulseCooldown > 0) return;

  GAME_STATE.pulseActive = 4;
  GAME_STATE.pulseCooldown = 12;
  playUpgradeSound();
  spawnPopup('🌀 吸引ブースト発動！', window.innerWidth / 2, window.innerHeight * 0.42, true);
  for (let i = 0; i < 12; i++) {
    spawnParticle(
      playerGroup.position.clone(),
      new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 2, (Math.random() - 0.5) * 4),
      true,
      0.65
    );
  }
  updateUI();
});

function spawnPopup(text, x, y, isBig = false) {
  const el = document.createElement('div');
  el.className = 'popup-text';
  if (isBig) {
    el.style.fontSize = '26px';
    el.style.color = '#38bdf8';
  }
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

let firstDepositCount = 0;
let totalEarnedInSec = 0;

setInterval(() => {
  incomeRateEl.textContent = `+${totalEarnedInSec}/s`;
  totalEarnedInSec = 0;
}, 1000);

function depositDebris(sourceList, fromPlayer = false) {
  let earned = 0;
  let hasRare = false;

  sourceList.forEach(t => {
    let val = t.value;
    if (t.isRare) hasRare = true;
    if (GAME_STATE.hasSorter) val *= 2;
    if (GAME_STATE.hasRecycler) val = Math.round(val * 1.5);
    if (GAME_STATE.isShuttleDocked) val *= 3;
    earned += val;

    if (activeContract && t.name === activeContract.type) {
      activeContract.progress++;
    }
  });

  const comboBonus = fromPlayer ? Math.min(0.75, Math.max(0, GAME_STATE.combo - 1) * 0.08) : 0;
  earned = Math.round(earned * (1 + comboBonus));

  if (earned > 0) {
    GAME_STATE.credits += earned;
    totalEarnedInSec += earned;
    playCoinSound();

    // Spawn Coin Shower Particles
    for (let c = 0; c < 6; c++) {
      spawnParticle(
        new THREE.Vector3(dropoffGroup.position.x, 1.2, dropoffGroup.position.z),
        new THREE.Vector3((Math.random()-0.5)*3, Math.random()*3 + 1.5, (Math.random()-0.5)*3),
        false,
        0.7
      );
    }

    // Charge Fever Gauge
    if (!GAME_STATE.isFever) {
      GAME_STATE.feverGauge = Math.min(100, GAME_STATE.feverGauge + sourceList.length * 15);
      if (GAME_STATE.feverGauge >= 100) {
        triggerFeverMode();
      }
    }

    if (fromPlayer && comboBonus > 0) {
      spawnPopup(`🔥 コンボ納品! +${earned} 💰`, window.innerWidth / 2, window.innerHeight * 0.35, true);
    } else if (GAME_STATE.isShuttleDocked) {
      spawnPopup(`🚀 貨物船納品! +${earned} 💰 (x3倍)`, window.innerWidth / 2, window.innerHeight * 0.35, true);
    } else if (hasRare) {
      cameraShake = 0.4;
      spawnPopup(`🎉 レア回収! +${earned} 💰`, window.innerWidth / 2, window.innerHeight * 0.35, true);
    } else {
      spawnPopup(`+${earned} 💰`, window.innerWidth / 2, window.innerHeight * 0.4);
    }

    if (GAME_STATE.missionIndex === 0) {
      firstDepositCount += sourceList.length;
      if (firstDepositCount >= 5) GAME_STATE.missionIndex = 1;
      else MISSIONS[0] = `デブリを拾って回収ボックスに運ぼう (${firstDepositCount}/5)`;
    }
    if (fromPlayer) {
      GAME_STATE.combo = 0;
      GAME_STATE.comboTimer = 0;
    }

    if (activeContract && activeContract.progress >= activeContract.target) {
      const completedContract = activeContract;
      GAME_STATE.credits += completedContract.reward;
      totalEarnedInSec += completedContract.reward;
      spawnPopup(`📦 契約達成! +${completedContract.reward} 💰`, window.innerWidth / 2, window.innerHeight * 0.28, true);
      showContractResult(true, completedContract, completedContract.reward);
    }

    updateUI();
  }
}

// --- 🤖 Intelligent Auto-Play Bot System ---
function runAutoPlayLogic(dt) {
  const maxCap = 3 + (GAME_STATE.capacityLevel - 1) * 3;

  if (contractResult) {
    if (contractResult.success) openContractSelection();
    else retryContract();
  } else if (!activeContract && contractChoices.length > 0) {
    selectContract(0);
  }

  if (GAME_STATE.missionIndex === 1 && GAME_STATE.credits >= 20) {
    btnCap.click();
  } else if (GAME_STATE.credits >= 15 * GAME_STATE.speedLevel && GAME_STATE.speedLevel < 3) {
    btnSpeed.click();
  } else if (GAME_STATE.droneCount > 0 && GAME_STATE.droneCount < 3 && GAME_STATE.credits >= 80 * GAME_STATE.droneCount) {
    btnDrone.click();
  }

  let targetSlotToBuy = null;
  SLOTS_DATA.forEach(slot => {
    if (!slot.unlocked && GAME_STATE.credits >= slot.cost && !targetSlotToBuy) {
      targetSlotToBuy = slot;
    }
  });

  if (targetSlotToBuy) {
    const slotPos = new THREE.Vector3(...targetSlotToBuy.pos);
    const toSlot = new THREE.Vector3().subVectors(slotPos, playerGroup.position);
    if (toSlot.length() > 0.4) {
      toSlot.normalize();
      moveVector.x = toSlot.x;
      moveVector.z = toSlot.z;
      return;
    }
  }

  if (GAME_STATE.carriedDebris.length >= maxCap) {
    const toBox = new THREE.Vector3().subVectors(dropoffGroup.position, playerGroup.position);
    if (toBox.length() > 1.2) {
      toBox.normalize();
      moveVector.x = toBox.x;
      moveVector.z = toBox.z;
    } else {
      moveVector.x = 0;
      moveVector.z = 0;
    }
  } else {
    let target = null;
    let minDist = Infinity;

    debrisList.forEach(d => {
      if (!d.isBeingCollected && d.type.isRare) {
        target = d;
      }
    });

    if (!target) {
      debrisList.forEach(d => {
        if (!d.isBeingCollected) {
          const dist = playerGroup.position.distanceTo(d.mesh.position);
          if (dist < minDist) { minDist = dist; target = d; }
        }
      });
    }

    if (target) {
      const toDebris = new THREE.Vector3().subVectors(target.mesh.position, playerGroup.position);
      toDebris.normalize();
      moveVector.x = toDebris.x;
      moveVector.z = toDebris.z;
    }
  }
}

// --- Main 3D Game Loop ---
const clock = new THREE.Clock();
let hudRefreshTimer = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const baseSpeed = 5.4 + (GAME_STATE.speedLevel - 1) * 0.8;
  const feverSpeed = GAME_STATE.isFever ? 1.8 : 1.0;
  const pulseSpeed = GAME_STATE.pulseActive > 0 ? 1.65 : 1.0;
  const speed = baseSpeed * feverSpeed * pulseSpeed;

  if (GAME_STATE.pulseCooldown > 0) GAME_STATE.pulseCooldown = Math.max(0, GAME_STATE.pulseCooldown - dt);
  if (GAME_STATE.pulseActive > 0) GAME_STATE.pulseActive = Math.max(0, GAME_STATE.pulseActive - dt);
  if (GAME_STATE.comboTimer > 0) {
    GAME_STATE.comboTimer = Math.max(0, GAME_STATE.comboTimer - dt);
    if (GAME_STATE.comboTimer === 0) GAME_STATE.combo = 0;
  }
  if (activeContract) {
    activeContract.timeLeft -= dt;
    if (activeContract.timeLeft <= 0) {
      const failedContract = activeContract;
      showContractResult(false, failedContract);
      spawnPopup('⏱ 契約失敗！再挑戦しよう', window.innerWidth / 2, window.innerHeight * 0.3);
    }
  }
  hudRefreshTimer += dt;
  if (hudRefreshTimer >= 0.15) {
    hudRefreshTimer = 0;
    updateUI();
  }

  earthMesh.rotation.y += dt * 0.03;

  // Station Solar Rotation & Beacon Blinking
  rotatingSolarPanels.forEach(p => {
    p.rotation.y += dt * 0.1;
  });
  const beaconGlow = (Math.sin(Date.now() * 0.006) + 1) * 1.2;
  blinkingBeacons.forEach(b => {
    if (b.material) b.material.emissiveIntensity = beaconGlow;
  });

  // Particle System Update
  updateParticles(dt);

  if (GAME_STATE.isAutoPlay) {
    runAutoPlayLogic(dt);
  }

  // 1. Movement
  let inputX = moveVector.x;
  let inputZ = moveVector.z;

  if (keys['w'] || keys['arrowup']) inputZ -= 1;
  if (keys['s'] || keys['arrowdown']) inputZ += 1;
  if (keys['a'] || keys['arrowleft']) inputX -= 1;
  if (keys['d'] || keys['arrowright']) inputX += 1;

  const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
  if (len > 0.05) {
    const normX = inputX / Math.max(1, len);
    const normZ = inputZ / Math.max(1, len);

    playerGroup.position.x += normX * speed * dt;
    playerGroup.position.z += normZ * speed * dt;

    const distFromOrigin = Math.sqrt(playerGroup.position.x * playerGroup.position.x + playerGroup.position.z * playerGroup.position.z);
    if (distFromOrigin > 6.5) {
      playerGroup.position.x = (playerGroup.position.x / distFromOrigin) * 6.5;
      playerGroup.position.z = (playerGroup.position.z / distFromOrigin) * 6.5;
    }

    const targetAngle = Math.atan2(normX, normZ);
    playerGroup.rotation.y = THREE.MathUtils.lerp(playerGroup.rotation.y, targetAngle, dt * 14);

    playerGroup.rotation.x = THREE.MathUtils.lerp(playerGroup.rotation.x, normZ * 0.35, dt * 10);
    playerGroup.rotation.z = THREE.MathUtils.lerp(playerGroup.rotation.z, -normX * 0.35, dt * 10);

    const flameScale = GAME_STATE.isFever ? 2.0 : 1.4;
    thrusterFlame.scale.set(flameScale, flameScale * 1.2 + Math.random() * 0.5, flameScale);

    // Jetpack Trail Particles
    if (Math.random() > 0.4) {
      const trailPos = playerGroup.position.clone();
      trailPos.y += 0.2;
      spawnParticle(
        trailPos,
        new THREE.Vector3(-normX * 1.5 + (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.3, -normZ * 1.5 + (Math.random()-0.5)*0.5),
        true,
        0.35
      );
    }
  } else {
    playerGroup.rotation.x = THREE.MathUtils.lerp(playerGroup.rotation.x, 0, dt * 8);
    playerGroup.rotation.z = THREE.MathUtils.lerp(playerGroup.rotation.z, 0, dt * 8);
    thrusterFlame.scale.set(0.7, 0.7, 0.7);
  }

  // Camera
  let shakeX = (Math.random() - 0.5) * cameraShake;
  let shakeY = (Math.random() - 0.5) * cameraShake;
  cameraShake = Math.max(0, cameraShake - dt * 0.8);

  const targetCamX = playerGroup.position.x * 0.45 + shakeX;
  const targetCamZ = playerGroup.position.z * 0.45 + 13.5;
  const targetCamY = 16.5 + shakeY;

  camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), dt * 5);
  camera.lookAt(playerGroup.position.x * 0.3, 0.5, playerGroup.position.z * 0.3);

  // Backpack
  const maxCap = 3 + (GAME_STATE.capacityLevel - 1) * 3;
  const fillRatio = GAME_STATE.carriedDebris.length / maxCap;
  const targetBackpackScale = 1.0 + fillRatio * 0.9;
  backpack.scale.lerp(new THREE.Vector3(targetBackpackScale, targetBackpackScale, targetBackpackScale), dt * 10);

  // 2. Automatic Smart 3D Debris Suction
  const feverMult = GAME_STATE.isFever ? 2.2 : 1.0;
  const pulseAttractMult = GAME_STATE.pulseActive > 0 ? 2.0 : 1.0;
  const attractRad = (1.8 + (GAME_STATE.attractLevel - 1) * 0.7) * feverMult * pulseAttractMult;
  debrisList.forEach((d) => {
    if (!d.isBeingCollected && GAME_STATE.carriedDebris.length < maxCap) {
      const dist = playerGroup.position.distanceTo(d.mesh.position);
      if (dist < attractRad) {
        d.isBeingCollected = true;
        d.target = playerGroup;
        playVacuumSound();
      }
    }
  });

  // 3. Magnet Tower Pulling
  const magnetSlot = SLOTS_DATA.find(s => s.id === 'magnet');
  if (magnetSlot.unlocked || GAME_STATE.isFever) {
    const pullSpeed = GAME_STATE.isFever ? dt * 1.5 : dt * 0.45;
    debrisList.forEach(d => {
      if (!d.isBeingCollected) {
        const dest = new THREE.Vector3(0, 0.5, -1.8);
        d.mesh.position.lerp(dest, pullSpeed);
      }
    });
  }

  // 4. Update Debris Positions
  const suckSpeed = GAME_STATE.isFever ? dt * 25 : dt * 15;
  for (let i = debrisList.length - 1; i >= 0; i--) {
    const d = debrisList[i];
    if (d.isBeingCollected && d.target) {
      d.mesh.position.lerp(d.target.position, suckSpeed);
      d.mesh.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), dt * 14);

      if (d.mesh.position.distanceTo(d.target.position) < 0.45) {
        scene.remove(d.mesh);
        debrisList.splice(i, 1);
        if (d.target === playerGroup) {
          GAME_STATE.carriedDebris.push(d.type);
          GAME_STATE.combo++;
          GAME_STATE.comboTimer = 5;
          GAME_STATE.bestCombo = Math.max(GAME_STATE.bestCombo, GAME_STATE.combo);
          updateUI();
        } else {
          const dBot = droneList.find(b => b.obj === d.target);
          if (dBot) {
            dBot.carriedType = d.type;
            dBot.state = 'returning';
            if (dBot.beam) dBot.beam.visible = false;
          }
        }
      }
    } else {
      d.mesh.rotation.x += d.tumble.x;
      d.mesh.rotation.y += d.tumble.y;
    }
  }

  if (debrisList.length < 28) spawnDebris();

  // 5. Automatic Dropoff at Box
  const distToBox = playerGroup.position.distanceTo(dropoffGroup.position);
  if (distToBox < 2.4 && GAME_STATE.carriedDebris.length > 0) {
    const toDeposit = [...GAME_STATE.carriedDebris];
    GAME_STATE.carriedDebris = [];
    depositDebris(toDeposit, true);
  }

  // 6. Drone Fleet Loop
  droneList.forEach(drone => {
    if (drone.state === 'idle') {
      if (drone.beam) drone.beam.visible = false;
      let target = null;
      let minDist = Infinity;
      debrisList.forEach(d => {
        if (!d.isBeingCollected) {
          const dist = drone.obj.position.distanceTo(d.mesh.position);
          if (dist < minDist) { minDist = dist; target = d; }
        }
      });
      if (target) {
        drone.target = target;
        drone.target.isBeingCollected = true;
        drone.target.target = drone.obj;
        drone.state = 'flying';
        if (drone.beam) drone.beam.visible = true;
      }
    } else if (drone.state === 'flying' && drone.target) {
      drone.obj.position.lerp(drone.target.mesh.position, dt * drone.speed);
      drone.obj.lookAt(drone.target.mesh.position);
      if (drone.beam) drone.beam.visible = true;
    } else if (drone.state === 'returning') {
      if (drone.beam) drone.beam.visible = false;
      drone.obj.position.lerp(new THREE.Vector3(0, 1.2, -1.8), dt * (drone.speed + 0.6));
      drone.obj.lookAt(new THREE.Vector3(0, 1.2, -1.8));
      if (drone.obj.position.distanceTo(new THREE.Vector3(0, 1.2, -1.8)) < 1.4) {
        depositDebris([drone.carriedType]);
        drone.carriedType = null;
        drone.state = 'idle';
      }
    }
  });

  // 7. Auto Facility Slot Interactions
  SLOTS_DATA.forEach(slot => {
    if (!slot.unlocked) {
      const slotPos = new THREE.Vector3(...slot.pos);
      const dist = new THREE.Vector2(playerGroup.position.x - slotPos.x, playerGroup.position.z - slotPos.z).length();
      if (dist < 1.6) {
        if (GAME_STATE.credits >= slot.cost) {
          GAME_STATE.credits -= slot.cost;
          slot.unlocked = true;
          buildFacilityMesh(slot);

          if (slot.id === 'magnet' && GAME_STATE.missionIndex === 2) GAME_STATE.missionIndex = 3;
          if (slot.id === 'drone' && GAME_STATE.missionIndex === 3) GAME_STATE.missionIndex = 4;
          if (slot.id === 'sorter' && GAME_STATE.missionIndex === 4) GAME_STATE.missionIndex = 5;
          if (slot.id === 'recycler' && GAME_STATE.missionIndex === 5) GAME_STATE.missionIndex = 6;
          updateUI();
        }
      }
    }
  });

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

openContractSelection();
updateUI();
animate();
