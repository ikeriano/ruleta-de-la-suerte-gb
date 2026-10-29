import { THREE, crearEscena, caja, cil, mat, cartel, texto, persona, personaAzar, animarPersona, panel, ocultarPanel, rotulo, voz, sfx, espera, euros, $ } from './engine.js';
const { scene, cam, onFrame } = crearEscena(0x10061e);
// Gajos de la ruleta: importes INVENTADOS (inspirados en el formato), con Quiebra y Pierde Turno.
const GAJOS = [25, 50, 'QUIEBRA', 75, 100, 25, 150, 'PIERDE TURNO', 50, 200, 75, 25, 'QUIEBRA', 100, 50, 300, 25, 75, 'PIERDE TURNO', 150, 50, 100, 25, 500];
const COL = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xfb8c00, 0x8e24aa];
// Frases: refranes populares (dominio público) y frases INVENTADAS
const FRASES = [['REFRÁN', 'MÁS VALE TARDE QUE NUNCA'], ['REFRÁN', 'A QUIEN MADRUGA DIOS LE AYUDA'], ['REFRÁN', 'NO HAY MAL QUE POR BIEN NO VENGA'], ['COMIDA', 'TORTILLA DE PATATAS CON CEBOLLA'],
  ['LUGAR', 'LA PLAZA MAYOR DE SALAMANCA'], ['REFRÁN', 'EN CASA DEL HERRERO CUCHILLO DE PALO'], ['COSA', 'UNA CAJA LLENA DE SORPRESAS'], ['DEPORTE', 'PARTIDO DE BALONCESTO'],
  ['REFRÁN', 'PERRO LADRADOR POCO MORDEDOR'], ['LUGAR', 'LA PUERTA DEL SOL DE MADRID'], ['COMIDA', 'PAELLA VALENCIANA'], ['REFRÁN', 'OJOS QUE NO VEN CORAZÓN QUE NO SIENTE']];
const VOC = 'AEIOUÁÉÍÓÚ', CONS = 'BCDFGHJKLMNÑPQRSTVWXYZ', COSTE_VOCAL = 50;
const base = c => c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace('N\u0303', 'Ñ');
// --- Plató: ruleta horizontal central, tres atriles, panel de letras al fondo ---
const suelo = cil(16, 16, 0.2, 0x2a0d4a, 40); suelo.position.y = -0.1; scene.add(suelo);
const muro = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 14, 32, 1, true), new THREE.MeshLambertMaterial({ color: 0x1c0a3a, side: THREE.BackSide })); muro.position.y = 6; scene.add(muro);
const ruleta = new THREE.Group(); ruleta.position.set(0, 1.1, 0); scene.add(ruleta);
const pie = cil(1.8, 2.4, 1.1, 0x333355, 24); pie.position.set(0, 0.55, 0); scene.add(pie);
{ const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d'); const n = GAJOS.length;
  for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / n * Math.PI * 2 - Math.PI / 2; const v = GAJOS[i];
    g.fillStyle = v === 'QUIEBRA' ? '#111' : v === 'PIERDE TURNO' ? '#eee' : '#' + COL[i % COL.length].toString(16).padStart(6, '0'); g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 250, a0, a1); g.fill();
    g.save(); g.translate(256, 256); g.rotate((a0 + a1) / 2); g.fillStyle = v === 'QUIEBRA' ? '#fff' : '#111'; g.font = 'bold ' + (typeof v === 'number' ? 26 : 14) + 'px sans-serif'; g.textAlign = 'right'; g.fillText(String(v), 240, 8); g.restore(); }
  g.fillStyle = '#ffd54f'; g.beginPath(); g.arc(256, 256, 40, 0, 7); g.fill();
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.25, 48), [mat(0xffd54f), new THREE.MeshLambertMaterial({ map: tx }), mat(0x222222)]); ruleta.add(disco); }
for (let i = 0; i < 24; i++) { const p = cil(0.04, 0.04, 0.25, 0xffffff, 4); const a = i / 24 * Math.PI * 2; p.position.set(Math.cos(a) * 3.1, 0.25, Math.sin(a) * 3.1); ruleta.add(p); }
const atriles = [0, 1, 2].map(i => { const a = Math.PI / 2 + (i - 1) * 0.6; const x = Math.cos(a) * 4.6, z = Math.sin(a) * 4.6;
  const g = new THREE.Group(); g.position.set(x, 0, z); g.lookAt(0, 0, 0); scene.add(g);
  const at = caja(1.2, 1.1, 0.5, [0xd32f2f, 0xfbc02d, 0x1976d2][i]); at.position.set(0, 0.55, 0.5); g.add(at);
  const fl = cil(0.06, 0.06, 0.5, 0xffffff, 4); fl.rotation.x = Math.PI / 2; fl.position.set(0, 1.15, 0.9); g.add(fl); // flecha indicadora
  const p = personaAzar(); g.add(p); const sc = cartel('0 €', 1.1, { w: 256, h: 64, bg: '#000', fg: '#ffd54f', font: 'bold 36px sans-serif' }); sc.position.set(0, 0.6, 0.76); g.add(sc);
  return { g, p, sc, a, total: 0, ronda: 0, nombre: ['Tú', 'Carmen', 'Javi'][i] }; });
const presentador = persona({ ropa: 0x263238, pant: 0x263238, pelo: 0x1a1a1a }); presentador.position.set(-4.6, 0, -2.5); presentador.rotation.y = 1; scene.add(presentador);
const azafata = persona({ ropa: 0xc2185b, pant: 0xc2185b, pelo: 0x6d4c41, piel: 0xf1c27d }); azafata.position.set(4.6, 0, -6); azafata.rotation.y = -0.4; scene.add(azafata);
// Panel: 4 filas x 12 casillas
const COLS = 12, FILAS = 4; const casillas = [];
const marco = caja(13.6, 5.2, 0.3, 0x0d47a1); marco.position.set(0, 5, -9); scene.add(marco);
const ptx = []; for (let f = 0; f < FILAS; f++) for (let c = 0; c < COLS; c++) { const tx = texto('', { w: 64, h: 80, bg: '#0a5', font: 'bold 56px sans-serif', fg: '#000' }); const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.15), new THREE.MeshBasicMaterial({ map: tx })); m.position.set(-6 + 0.5 + c * 1.0 + 0.0, 6.7 - f * 1.2, -8.8); scene.add(m); casillas.push({ m, tx, letra: null, vista: false }); }
function pintaCasilla(cs) { const { cv, g } = cs.tx.userData; g.fillStyle = cs.letra === null ? '#0a7a3a' : cs.vista ? '#fff' : '#1e88e5'; g.fillRect(0, 0, 64, 80); g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeRect(1, 1, 62, 78);
  if (cs.vista && cs.letra) { g.fillStyle = '#000'; g.font = 'bold 52px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(cs.letra, 32, 43); } cs.tx.needsUpdate = true; }
const pista = cartel('', 6, { w: 512, h: 64, bg: '#4a148c', font: 'bold 40px sans-serif' }); pista.position.set(0, 2.05, -8.7); scene.add(pista);
// --- Estado ---
let frase = '', usadas = new Set(), turno = 0, modo = 'idle', giro = { v: 0 }, gajo = null, partida = 0;
const camObj = new THREE.Vector3(0, 7, 13), camMira = new THREE.Vector3(0, 2, -3), camPos = camObj.clone(), mira = camMira.clone();
const vista = (p, m) => { camObj.set(...p); camMira.set(...m); };
onFrame((dt, t) => { camPos.lerp(camObj, 1 - Math.pow(0.03, dt)); mira.lerp(camMira, 1 - Math.pow(0.03, dt)); cam.position.copy(camPos); cam.lookAt(mira);
  if (giro.v > 0) { ruleta.rotation.y += giro.v * dt; giro.v = Math.max(0, giro.v - giro.fr * dt); if (Math.random() < giro.v * dt * 3) sfx.tic(); if (giro.v === 0 && giro.fin) { const f = giro.fin; giro.fin = null; f(); } }
  animarPersona(presentador, t, modo === 'habla' ? 'habla' : 'idle'); animarPersona(azafata, t); atriles.forEach((a, i) => animarPersona(a.p, t, modo === 'celebra' && i === turno ? 'celebra' : 'idle')); });
function colocar(txt, cat) { usadas.clear(); casillas.forEach(c => { c.letra = null; c.vista = false; });
  const pal = txt.split(' '); const filas = [[]]; for (const p of pal) { const l = filas[filas.length - 1]; if ((l.join(' ') + ' ' + p).trim().length > COLS - 1) filas.push([p]); else l.push(p); }
  const f0 = filas.length <= 2 ? 1 : 0; filas.forEach((ws, fi) => { const s = ws.join(' '); const c0 = Math.floor((COLS - s.length) / 2); [...s].forEach((ch, k) => { if (ch !== ' ') { const cs = casillas[(f0 + fi) * COLS + c0 + k]; cs.letra = ch; } }); });
  casillas.forEach(pintaCasilla); const { cv, g } = pista.material.map.userData; g.fillStyle = '#4a148c'; g.fillRect(0, 0, 512, 64); g.fillStyle = '#fff'; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.fillText(cat, 256, 46); pista.material.map.needsUpdate = true; }
function destapa(L) { let n = 0; casillas.forEach(c => { if (c.letra && !c.vista && base(c.letra) === L) { c.vista = true; pintaCasilla(c); n++; } }); return n; }
const resuelto = () => casillas.every(c => !c.letra || c.vista);
const pendientes = t => [...new Set(casillas.filter(c => c.letra && !c.vista).map(c => base(c.letra)))].filter(l => t.includes(l));
function hud() { $('#hl').textContent = 'Panel ' + (partida + 1) + '/3 · Turno: ' + atriles[turno].nombre; $('#hr').textContent = atriles.map(a => a.nombre + ' ' + a.ronda + '€').join(' · '); atriles.forEach(a => { const { g } = a.sc.material.map.userData; g.fillStyle = '#000'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#ffd54f'; g.font = 'bold 36px sans-serif'; g.textAlign = 'center'; g.fillText(a.ronda + ' €', 128, 44); a.sc.material.map.needsUpdate = true; }); }
function menu() { modo = 'idle'; vista([0, 7, 13], [0, 3, -5]); partida = 0; atriles.forEach(a => { a.total = 0; a.ronda = 0; }); colocar('LA RULETA DE LA SUERTE', 'CONCURSO'); casillas.forEach(c => { c.vista = true; pintaCasilla(c); }); hud();
  panel(`<h1>La Ruleta de la Suerte</h1><p>Gira la ruleta, pide consonantes, compra vocales (50 €) y resuelve el panel antes que Carmen y Javi. ¡Cuidado con la Quiebra!</p><p style="font-size:12px;opacity:.7">Inspirado en Wheel of Fortune / La Ruleta de la Suerte y el juego de Roblox de ahoracaigo97.</p><span class="btn" id="j">JUGAR</span>`, [['#j', () => { sfx.sintonia(); nuevoPanel(); }]]); voz('rul_bienvenida'); }
function nuevoPanel() { const [cat, f] = FRASES[Math.floor(Math.random() * FRASES.length)]; frase = f; colocar(f, cat); atriles.forEach(a => a.ronda = 0); turno = partida % 3; hud(); jugar(); }
function vistaPanel() { vista([0, 5, 6], [0, 5, -9]); }
function jugar() { hud(); modo = 'habla'; if (turno === 0) miTurno(); else cpu(); }
function miTurno() { vista([0, 6, 9], [0, 2.5, -5]); const a = atriles[0];
  panel(`<h2>Tu turno · Llevas ${a.ronda} €</h2><span class="btn" id="g">🎡 GIRAR</span><span class="btn sec ${a.ronda < COSTE_VOCAL ? 'off' : ''}" id="v">COMPRAR VOCAL</span><span class="btn ok" id="r">RESOLVER</span>`, [['#g', () => girar(pedirConsonante)], ['#v', () => pedirLetra(VOC.slice(0, 5), L => { a.ronda -= COSTE_VOCAL; letra(L, 0); })], ['#r', resolver]]); }
function girar(cb) { ocultarPanel(); vista([0, 6.5, 5.5], [0, 1, 0]); voz('rul_gira'); giro.v = 7 + Math.random() * 5; giro.fr = 2.2 + Math.random(); giro.fin = () => { const n = GAJOS.length; let ang = (-ruleta.rotation.y + Math.PI) % (Math.PI * 2); if (ang < 0) ang += Math.PI * 2;
  // el puntero está delante del concursante 0 (eje +Z)
  const i = Math.floor(((ang / (Math.PI * 2)) * n + n * 0.25) % n); gajo = GAJOS[(n - 1 - i + n) % n]; rotulo(typeof gajo === 'number' ? gajo + ' €' : gajo, 1500); setTimeout(() => cb(gajo), 1500); }; }
function sigTurno() { turno = (turno + 1) % 3; setTimeout(jugar, 900); }
function pedirLetra(set, cb) { let h = '<h2>Elige letra</h2><div class="rej">'; for (const L of set) h += `<span class="btn ${usadas.has(L) ? 'off' : ''}" data-l="${L}">${L}</span>`; panel(h + '</div>', [['[data-l]', b => { ocultarPanel(); cb(b.dataset.l); }]]); }
function pedirConsonante(g) { if (g === 'QUIEBRA') { atriles[0].ronda = 0; sfx.mal(); voz('rul_quiebra'); hud(); return sigTurno(); } if (g === 'PIERDE TURNO') { sfx.mal(); return sigTurno(); } pedirLetra(CONS, L => letra(L, g)); }
function letra(L, valor) { usadas.add(L); vistaPanel(); const n = destapa(L); const a = atriles[turno];
  if (n) { sfx.bien(); a.ronda += valor * n; rotulo(`${n} × ${L}` + (valor ? ` = ${valor * n} €` : ''), 1400); hud(); if (resuelto()) return setTimeout(() => gana(turno), 1300); setTimeout(() => turno === 0 ? miTurno() : cpu(), 1600); }
  else { sfx.mal(); rotulo('No hay ' + L, 1200); voz('rul_nohay'); sigTurno(); } }
function resolver() { const ops = [frase]; const otras = FRASES.map(f => f[1]).filter(f => f !== frase && Math.abs(f.length - frase.length) < 10).sort(() => Math.random() - 0.5); ops.push(...otras.slice(0, 2)); while (ops.length < 3) ops.push(FRASES[ops.length][1]); ops.sort(() => Math.random() - 0.5);
  panel('<h2>¿Cuál es el panel?</h2>' + ops.map((o, i) => `<span class="btn" data-o="${i}" style="display:block">${o}</span>`).join(''), [['[data-o]', b => { if (ops[+b.dataset.o] === frase) gana(0); else { sfx.mal(); rotulo('¡No es correcto!'); sigTurno(); } }]]); }
async function cpu() { const a = atriles[turno]; ocultarPanel(); vista([a.g.position.x * 0.5, 3, a.g.position.z * 0.5 + 4], [a.g.position.x, 1.4, a.g.position.z]); rotulo('Turno de ' + a.nombre, 1200); await espera(1400);
  const desc = casillas.filter(c => c.letra && c.vista).length / casillas.filter(c => c.letra).length;
  if (desc > 0.65 && Math.random() < 0.7) { rotulo(a.nombre + ' resuelve: ' + frase, 2200); await espera(2200); return gana(turno); }
  const vocs = pendientes('AEIOU'); if (a.ronda >= 100 && vocs.length && Math.random() < 0.4) { a.ronda -= COSTE_VOCAL; const L = vocs[0]; rotulo(a.nombre + ' compra la ' + L, 1200); await espera(1200); return letra(L, 0); }
  girar(async g => { if (g === 'QUIEBRA') { a.ronda = 0; sfx.mal(); hud(); return sigTurno(); } if (g === 'PIERDE TURNO') { sfx.mal(); return sigTurno(); }
    const buenas = pendientes(CONS), todas = [...CONS].filter(l => !usadas.has(l)); const L = Math.random() < 0.6 && buenas.length ? buenas[Math.floor(Math.random() * buenas.length)] : todas[Math.floor(Math.random() * todas.length)];
    rotulo(a.nombre + ' pide la ' + L, 1200); await espera(1300); letra(L, g); }); }
async function gana(i) { casillas.forEach(c => { if (c.letra) { c.vista = true; pintaCasilla(c); } }); const a = atriles[i]; turno = i; a.total += Math.max(a.ronda, 100); modo = 'celebra'; sfx.aplauso(); vistaPanel(); voz(i === 0 ? 'rul_resuelto' : 'rul_otro'); rotulo(a.nombre + ' resuelve el panel', 2000); hud(); await espera(2600);
  partida++; if (partida < 3) return panel(`<h2>Marcador</h2><p>${atriles.map(x => x.nombre + ': ' + euros(x.total)).join('<br>')}</p><span class="btn" id="s">SIGUIENTE PANEL</span>`, [['#s', nuevoPanel]]);
  const mej = atriles.reduce((m, x) => x.total > m.total ? x : m); panel(`<h1>${mej === atriles[0] ? '¡Has ganado!' : 'Gana ' + mej.nombre}</h1><p>${atriles.map(x => x.nombre + ': ' + euros(x.total)).join('<br>')}</p><span class="btn" id="o">OTRA PARTIDA</span>`, [['#o', menu]]); }
menu();
