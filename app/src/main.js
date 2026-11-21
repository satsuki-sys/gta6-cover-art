// Neon Coast Studio's editor: wires the controls to the cover renderer in ./cover.js, keeps the photo and
// panel state, and exports the finished cover as a PNG at the three post sizes. A `?shot=` query instead
// sets up one fixed scene for a screenshot (./shots.js).
import { LAYOUTS, drawCoverArt, panelRects } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = [
  { name: 'Boulevard', src: 'samples/boulevard.jpg' },
  { name: 'Pier', src: 'samples/pier.jpg' },
  { name: 'Neon Drive', src: 'samples/neon-drive.jpg' },
];
const SIZES = [[1080, 1080], [1080, 1350], [1920, 1080]];
const PANEL_DEFAULTS = [
  { photo: 0, zoom: 1.12, ox: 0, oy: 0 },
  { photo: 1, zoom: 1.22, ox: 0.08, oy: -0.04 },
  { photo: 2, zoom: 1.05, ox: 0, oy: 0.04 },
  { photo: 1, zoom: 1.28, ox: -0.08, oy: 0 },
  { photo: 0, zoom: 1.1, ox: 0.04, oy: 0.08 },
  { photo: 2, zoom: 1.18, ox: 0, oy: 0 },
];

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const photos = [];
const state = {
  size: [1080, 1350], layout: 'grid', grade: 'sunset',
  title: 'Neon Coast', caption: 'Vice Heat', titlePos: 'bottom', titleColor: 'sunset',
  selected: 0, panels: [],
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function say(text) { status.textContent = text; }

function resetPanels(assign) {
  const count = LAYOUTS[state.layout].panels.length;
  state.panels = Array.from({ length: count }, (_, i) => {
    const d = PANEL_DEFAULTS[i % PANEL_DEFAULTS.length];
    const photo = assign ? assign[i % assign.length] : d.photo;
    return { photo: photos.length ? photo % photos.length : 0, zoom: d.zoom, ox: d.ox, oy: d.oy, fit: 'fill' };
  });
  if (state.selected >= count) state.selected = 0;
}

function renderState() {
  return {
    layout: state.layout, grade: state.grade, title: state.title, caption: state.caption,
    titlePos: state.titlePos, titleColor: state.titleColor,
    panels: state.panels.map((p) => ({ ...p, img: photos[p.photo]?.img ?? null })),
  };
}

function redraw() {
  const [w, h] = state.size;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  drawCoverArt(canvas.getContext('2d'), w, h, renderState());
}

function setSeg(id, attr, value) {
  document.querySelectorAll(`#${id} button`).forEach((b) => {
    b.classList.toggle('on', b.dataset[attr] === String(value));
  });
}

function syncPanelControls() {
  const p = state.panels[state.selected];
  if (!p) return;
  const zoom = document.getElementById('zoom');
  zoom.value = Math.round(p.zoom * 100);
  document.getElementById('zoomVal').textContent = `${zoom.value}%`;
  const offX = document.getElementById('offX');
  offX.value = Math.round(p.ox * 100);
  document.getElementById('offXVal').textContent = offX.value;
  const offY = document.getElementById('offY');
  offY.value = Math.round(p.oy * 100);
  document.getElementById('offYVal').textContent = offY.value;
  setSeg('fitSeg', 'fit', p.fit);
  document.querySelectorAll('#panelList button').forEach((b, i) => b.classList.toggle('on', i === state.selected));
}

function buildPanelList() {
  const list = document.getElementById('panelList');
  list.innerHTML = '';
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1} · ${photos[p.photo]?.name ?? 'empty'}`;
    b.addEventListener('click', () => { state.selected = i; syncPanelControls(); });
    list.appendChild(b);
  });
  syncPanelControls();
}

function syncControls() {
  setSeg('layoutSeg', 'layout', state.layout);
  setSeg('gradeSeg', 'grade', state.grade);
  setSeg('posSeg', 'pos', state.titlePos);
  setSeg('colorSeg', 'color', state.titleColor);
  setSeg('sizeSeg', 'size', state.size.join('x'));
  document.getElementById('titleInput').value = state.title;
  document.getElementById('captionInput').value = state.caption;
  buildPanelList();
}

function wireSeg(id, attr, apply) {
  document.getElementById(id).addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    apply(b.dataset[attr]);
  });
}

wireSeg('layoutSeg', 'layout', (v) => { state.layout = v; resetPanels(); syncControls(); redraw(); });
wireSeg('gradeSeg', 'grade', (v) => { state.grade = v; syncControls(); redraw(); });
wireSeg('posSeg', 'pos', (v) => { state.titlePos = v; syncControls(); redraw(); });
wireSeg('colorSeg', 'color', (v) => { state.titleColor = v; syncControls(); redraw(); });
wireSeg('fitSeg', 'fit', (v) => { state.panels[state.selected].fit = v; syncPanelControls(); redraw(); });
wireSeg('sizeSeg', 'size', (v) => {
  state.size = v.split('x').map(Number);
  syncControls();
  redraw();
});

document.getElementById('titleInput').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('captionInput').addEventListener('input', (e) => { state.caption = e.target.value; redraw(); });

function bindSlider(id, key, valId, format) {
  document.getElementById(id).addEventListener('input', (e) => {
    const p = state.panels[state.selected];
    if (!p) return;
    p[key] = Number(e.target.value) / 100;
    document.getElementById(valId).textContent = format(e.target.value);
    redraw();
  });
}
bindSlider('zoom', 'zoom', 'zoomVal', (v) => `${v}%`);
bindSlider('offX', 'ox', 'offXVal', (v) => v);
bindSlider('offY', 'oy', 'offYVal', (v) => v);

function assignPhoto(index) {
  const p = state.panels[state.selected];
  if (!p) return;
  p.photo = index;
  buildPanelList();
  redraw();
  say(`Panel ${state.selected + 1} now shows ${photos[index]?.name ?? 'that photo'}.`);
}

document.getElementById('photoStrip').addEventListener('click', (e) => {
  const b = e.target.closest('button.thumb');
  if (b) assignPhoto(Number(b.dataset.photo));
});

document.getElementById('onePhoto').addEventListener('click', () => {
  const photo = state.panels[state.selected]?.photo ?? 0;
  state.panels.forEach((p) => { p.photo = photo; });
  buildPanelList();
  redraw();
  say('Every panel shows the one photo — reposition each panel for the poster look.');
});

document.getElementById('mixPhotos').addEventListener('click', () => {
  state.panels.forEach((p, i) => { p.photo = i % photos.length; });
  buildPanelList();
  redraw();
  say('Panels now mix all the loaded photos.');
});

document.getElementById('photoInput').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    photos.push({ name: file.name.replace(/\.[^.]+$/, ''), img });
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.dataset.photo = String(photos.length - 1);
    const thumb = document.createElement('img');
    thumb.src = url;
    thumb.alt = file.name;
    const label = document.createElement('span');
    label.textContent = photos[photos.length - 1].name;
    b.append(thumb, label);
    document.getElementById('photoStrip').appendChild(b);
    assignPhoto(photos.length - 1);
  }
  if (files.length) say(`${files.length} photo(s) added — they never leave this machine.`);
});

// Direct manipulation on the preview: click selects a panel, drag repositions it, the wheel zooms it.
let drag = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height, px: (e.clientX - r.left) * (canvas.width / r.width), py: (e.clientY - r.top) * (canvas.height / r.height) };
}
canvas.addEventListener('pointerdown', (e) => {
  const { fx, fy } = canvasPoint(e);
  const rects = panelRects(canvas.width, canvas.height, state.layout);
  const i = rects.findIndex((r) => fx * canvas.width >= r.x && fx * canvas.width < r.x + r.w && fy * canvas.height >= r.y && fy * canvas.height < r.y + r.h);
  if (i < 0) return;
  state.selected = i;
  syncPanelControls();
  const p = state.panels[i];
  drag = { x: e.clientX, y: e.clientY, ox: p.ox, oy: p.oy, rect: rects[i] };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = state.panels[state.selected];
  const r = canvas.getBoundingClientRect();
  const scaleX = canvas.width / r.width;
  p.ox = Math.max(-1, Math.min(1, drag.ox + ((e.clientX - drag.x) * scaleX) / (drag.rect.w * 0.4)));
  p.oy = Math.max(-1, Math.min(1, drag.oy + ((e.clientY - drag.y) * scaleX) / (drag.rect.h * 0.4)));
  syncPanelControls();
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const p = state.panels[state.selected];
  if (!p) return;
  p.zoom = Math.max(0.6, Math.min(3, p.zoom * (e.deltaY < 0 ? 1.06 : 0.94)));
  syncPanelControls();
  redraw();
}, { passive: false });

function exportPng(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  drawCoverArt(c.getContext('2d'), w, h, renderState());
  c.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-coast-cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    say(`Saved neon-coast-cover-${w}x${h}.png`);
  }, 'image/png');
}

document.getElementById('exportBtn').addEventListener('click', () => exportPng(state.size[0], state.size[1]));
document.getElementById('exportAllBtn').addEventListener('click', () => {
  SIZES.forEach(([w, h], i) => setTimeout(() => exportPng(w, h), i * 400));
});

function applyScene(scene) {
  state.layout = scene.layout;
  state.grade = scene.grade;
  state.title = scene.title;
  state.caption = scene.caption;
  state.titlePos = scene.titlePos;
  state.titleColor = scene.titleColor;
  state.size = scene.size.split('x').map(Number);
  resetPanels(scene.assign);
  state.selected = Math.min(scene.selected || 0, state.panels.length - 1);
  syncControls();
  redraw();
}

const ready = (async () => {
  for (const s of SAMPLES) photos.push({ name: s.name, img: await loadImage(s.src) });
})();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, async (scene) => { await ready; applyScene(scene); });
} else {
  await ready;
  resetPanels();
  syncControls();
  redraw();
}
