// Motor común Ikeriano (three.js r170) — optimizado para gama baja (Redmi A2)
import * as THREE from './three.module.min.js';
export { THREE };
export const $ = s => document.querySelector(s);
// ---- Escena ----
export function crearEscena(fondo = 0x050814) {
  const canvas = document.getElementById('c');
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  r.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(fondo);
  scene.fog = new THREE.Fog(fondo, 30, 80);
  const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xdde6ff, 0x221a33, 1.4));
  const d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.set(5, 12, 8); scene.add(d);
  const resize = () => { const w = innerWidth, h = innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  const upd = []; let last = performance.now(), acc = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    acc += t - last; last = t;
    if (acc < 30) return; // tope ~33 fps para móviles modestos
    const dt = Math.min(acc / 1000, 0.1); acc = 0;
    for (const f of upd) f(dt, t / 1000);
    r.render(scene, cam);
  }
  requestAnimationFrame(loop);
  return { r, scene, cam, onFrame: f => upd.push(f) };
}
const matCache = {};
export const mat = (c, e = 0) => matCache[c + ':' + e] ||= new THREE.MeshLambertMaterial({ color: c, emissive: e ? c : 0, emissiveIntensity: e });
export function caja(w, h, d, c, e) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, e)); }
export function cil(rt, rb, h, c, seg = 16, e) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(c, e)); }
export function texto(t, { w = 256, h = 64, fg = '#fff', bg = null, font = 'bold 40px sans-serif' } = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, w / 2, h / 2 + 2);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.userData = { cv, g }; return tx;
}
export function cartel(t, ancho, opts) { const tx = texto(t, opts); const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, ancho * (opts?.h || 64) / (opts?.w || 256)), new THREE.MeshBasicMaterial({ map: tx, transparent: !opts?.bg })); return m; }
// ---- Personas 3D low-poly (originales, no son parecidos de personas reales) ----
export function persona({ piel = 0xe0b08a, ropa = 0x2244aa, pelo = 0x2a1a10, pant = 0x222222, alto = 1 } = {}) {
  const g = new THREE.Group();
  const piernaL = caja(0.18, 0.8, 0.2, pant); piernaL.position.set(-0.12, 0.4, 0);
  const piernaR = piernaL.clone(); piernaR.position.x = 0.12;
  const torso = caja(0.55, 0.7, 0.3, ropa); torso.position.y = 1.15;
  const brazoL = new THREE.Group(); const bl = caja(0.14, 0.65, 0.16, ropa); bl.position.y = -0.3; brazoL.add(bl); brazoL.position.set(-0.36, 1.48, 0);
  const brazoR = new THREE.Group(); const br = bl.clone(); brazoR.add(br); brazoR.position.set(0.36, 1.48, 0);
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(piel)); cabeza.position.y = 1.72; cabeza.scale.y = 1.15;
  const pel = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 6, 0, Math.PI * 2, 0, 1.4), mat(pelo)); pel.position.y = 1.76;
  const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 4), mat(0x111111)); ojo.position.set(-0.07, 1.75, 0.18); const ojo2 = ojo.clone(); ojo2.position.x = 0.07;
  g.add(piernaL, piernaR, torso, brazoL, brazoR, cabeza, pel, ojo, ojo2); g.scale.setScalar(alto);
  g.userData = { brazoL, brazoR, piernaL, piernaR, fase: Math.random() * 6 };
  return g;
}
export function animarPersona(p, t, modo = 'idle') {
  const u = p.userData, s = Math.sin(t * 2 + u.fase);
  if (modo === 'habla') { u.brazoR.rotation.x = -0.6 + Math.sin(t * 5) * 0.3; u.brazoL.rotation.x = s * 0.1; }
  else if (modo === 'corre') { const k = Math.sin(t * 12); u.piernaL.rotation.x = k * 0.8; u.piernaR.rotation.x = -k * 0.8; u.brazoL.rotation.x = -k; u.brazoR.rotation.x = k; }
  else if (modo === 'celebra') { u.brazoL.rotation.z = 2.6 + s * 0.3; u.brazoR.rotation.z = -2.6 - s * 0.3; }
  else { u.brazoL.rotation.set(s * 0.05, 0, 0.08); u.brazoR.rotation.set(-s * 0.05, 0, -0.08); u.piernaL.rotation.x = u.piernaR.rotation.x = 0; }
}
export const ROPAS = [0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xf39c12, 0x16a085, 0xd35400, 0x2c3e50, 0xe84393, 0x6c5ce7];
export const PIELES = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
export const PELOS = [0x2a1a10, 0x111111, 0x8b5a2b, 0xd9b26a, 0x555555];
export const azar = a => a[Math.floor(Math.random() * a.length)];
export const personaAzar = () => persona({ piel: azar(PIELES), ropa: azar(ROPAS), pelo: azar(PELOS), pant: azar([0x222222, 0x1e3a5f, 0x3b3b3b]) });
// ---- Toque: responde al primer toque, un deslizamiento nunca selecciona ----
export function tocar(el, fn) {
  let x0 = 0, y0 = 0, id = null, mov = false;
  el.addEventListener('pointerdown', e => { id = e.pointerId; x0 = e.clientX; y0 = e.clientY; mov = false; desbloquearAudio(); }, { passive: true });
  el.addEventListener('pointermove', e => { if (e.pointerId === id && Math.hypot(e.clientX - x0, e.clientY - y0) > 12) mov = true; }, { passive: true });
  el.addEventListener('pointerup', e => { if (e.pointerId !== id) return; id = null; if (!mov) { e.preventDefault(); fn(e); } });
  el.addEventListener('pointercancel', () => { id = null; });
  el.addEventListener('click', e => e.preventDefault());
}
['contextmenu', 'selectstart', 'dragstart', 'gesturestart'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
document.addEventListener('touchmove', e => { if (!e.target.closest('.scroll')) e.preventDefault(); }, { passive: false });
// ---- Audio: voces Piper pregeneradas + efectos sintetizados ----
let AC = null;
export function desbloquearAudio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); }
const vozCache = {}; let vozActual = null;
export function voz(nombre) {
  try { if (vozActual) vozActual.pause(); const a = vozCache[nombre] ||= new Audio('voz/' + nombre + '.mp3'); a.currentTime = 0; a.play().catch(() => { }); vozActual = a; } catch (e) { }
}
export function tono(f = 440, dur = 0.15, tipo = 'sine', vol = 0.2, cuando = 0) {
  if (!AC) return; const t = AC.currentTime + cuando, o = AC.createOscillator(), g = AC.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur);
}
export const sfx = {
  clic: () => tono(880, 0.06, 'square', 0.08),
  bien: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.25, 'triangle', 0.15, i * 0.09)),
  mal: () => [300, 220, 150].forEach((f, i) => tono(f, 0.3, 'sawtooth', 0.12, i * 0.14)),
  tension: () => [196, 233, 196, 233].forEach((f, i) => tono(f, 0.4, 'triangle', 0.1, i * 0.4)),
  tic: () => tono(1500, 0.03, 'square', 0.05),
  caida: () => { if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(60, t + 1.2); g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.3); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + 1.3); },
  sintonia: () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tono(f, 0.22, 'triangle', 0.13, i * 0.13)),
  telefono: () => { for (let i = 0; i < 6; i++) tono(i % 2 ? 480 : 440, 0.12, 'sine', 0.12, i * 0.13); },
  aplauso: () => { if (!AC) return; const n = AC.sampleRate * 1.5, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.3 ? 1 : 0.2) * (1 - i / n); const s = AC.createBufferSource(), g = AC.createGain(); g.gain.value = 0.25; s.buffer = b; s.connect(g).connect(AC.destination); s.start(); },
};
// ---- UI ----
export function panel(html, botones = []) {
  const p = $('#panel'); p.innerHTML = html; p.style.display = 'block';
  botones.forEach(([sel, fn]) => p.querySelectorAll(sel).forEach(b => tocar(b, e => { sfx.clic(); fn(b, e); })));
}
export const ocultarPanel = () => { $('#panel').style.display = 'none'; };
export function rotulo(t, ms = 2200) { const r = $('#rotulo'); r.textContent = t; r.classList.add('on'); clearTimeout(r._t); r._t = setTimeout(() => r.classList.remove('on'), ms); }
export const espera = ms => new Promise(r => setTimeout(r, ms));
export const euros = n => n < 1 ? n.toFixed(2).replace('.', ',') + ' €' : Math.round(n).toLocaleString('es-ES') + ' €';
