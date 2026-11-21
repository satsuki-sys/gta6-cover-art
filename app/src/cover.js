// Neon Coast Studio's cover renderer: photo panels, colour grades and big poster lettering on a 2D canvas.
// Everything is drawn from the state object the editor builds, so the live preview and the exported PNG are
// the same picture at different sizes.

export const LAYOUTS = {
  grid: {
    label: 'Vice Grid',
    panels: [
      { x: 0, y: 0, w: 0.52, h: 0.62 },
      { x: 0.52, y: 0, w: 0.48, h: 0.34 },
      { x: 0.52, y: 0.34, w: 0.24, h: 0.28 },
      { x: 0.76, y: 0.34, w: 0.24, h: 0.28 },
      { x: 0, y: 0.62, w: 0.34, h: 0.38 },
      { x: 0.34, y: 0.62, w: 0.66, h: 0.38 },
    ],
  },
  stack: {
    label: 'Poster Stack',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.46 },
      { x: 0, y: 0.46, w: 0.5, h: 0.3 },
      { x: 0.5, y: 0.46, w: 0.5, h: 0.3 },
      { x: 0, y: 0.76, w: 1, h: 0.24 },
    ],
  },
  trio: {
    label: 'Hero Trio',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.64 },
      { x: 0, y: 0.64, w: 0.5, h: 0.36 },
      { x: 0.5, y: 0.64, w: 0.5, h: 0.36 },
    ],
  },
  quad: {
    label: 'Four Corners',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
};

export const GRADES = {
  sunset: { label: 'Vice Sunset', filter: 'saturate(1.25) contrast(1.06)', stops: [[0, 'rgba(255,122,64,0.10)'], [0.55, 'rgba(255,47,128,0.16)'], [1, 'rgba(46,8,84,0.34)']] },
  neon: { label: 'Neon Night', filter: 'saturate(1.4) contrast(1.12) hue-rotate(-8deg)', stops: [[0, 'rgba(0,229,255,0.10)'], [0.6, 'rgba(120,0,180,0.18)'], [1, 'rgba(255,47,180,0.26)']] },
  day: { label: 'Chrome Day', filter: 'saturate(1.08) brightness(1.05)', stops: [[0, 'rgba(140,240,255,0.08)'], [1, 'rgba(255,170,60,0.14)']] },
  mono: { label: 'Mono Heat', filter: 'grayscale(0.9) contrast(1.18)', stops: [[0, 'rgba(255,190,90,0.10)'], [1, 'rgba(30,6,40,0.30)']] },
};

export const TITLE_COLORS = {
  sunset: { label: 'Sunset', pair: ['#ffd23f', '#ff2f80'] },
  ice: { label: 'Ice', pair: ['#a8f6ff', '#2f9dff'] },
  neon: { label: 'Neon', pair: ['#5ff5ff', '#ff4fd8'] },
  gold: { label: 'Gold', pair: ['#fff3b0', '#f59e23'] },
  white: { label: 'White', pair: ['#ffffff', '#d9d4e8'] },
};

/** The pixel rectangle of every panel of `layout` on a w x h canvas, in layout order. */
export function panelRects(w, h, layout) {
  return LAYOUTS[layout].panels.map((p) => ({ x: p.x * w, y: p.y * h, w: p.w * w, h: p.h * h }));
}

let noisePattern = null;
function grainPattern(ctx) {
  if (noisePattern) return noisePattern;
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 90 + Math.random() * 165;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  noisePattern = ctx.createPattern(tile, 'repeat');
  return noisePattern;
}

function drawPanelPhoto(ctx, rect, panel, grade, index) {
  const gap = Math.max(4, rect.w * 0.012);
  const x = rect.x + gap / 2;
  const y = rect.y + gap / 2;
  const w = rect.w - gap;
  const h = rect.h - gap;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (panel.img) {
    const iw = panel.img.naturalWidth;
    const ih = panel.img.naturalHeight;
    const coverScale = Math.max(w / iw, h / ih);
    const fitScale = Math.min(w / iw, h / ih);
    const scale = (panel.fit === 'fit' ? fitScale : coverScale) * (panel.zoom || 1);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x + (w - dw) / 2 + (panel.ox || 0) * w * 0.4;
    const dy = y + (h - dh) / 2 + (panel.oy || 0) * h * 0.4;
    ctx.filter = grade.filter;
    ctx.drawImage(panel.img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    const hue = 262 + index * 24;
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, `hsl(${hue} 70% 30%)`);
    grad.addColorStop(1, `hsl(${hue + 60} 85% 16%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `700 ${Math.round(h * 0.09)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
  }
  const shade = ctx.createLinearGradient(x, y, x, y + h);
  shade.addColorStop(0, 'rgba(0,0,0,0.16)');
  shade.addColorStop(0.35, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = Math.max(2.5, Math.min(w, h) * 0.012);
  ctx.strokeRect(x, y, w, h);
}

function fitFontSize(ctx, text, maxWidth, start) {
  let size = start;
  ctx.font = `italic 900 ${size}px "Arial Black", Impact, "Franklin Gothic Heavy", sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 16) {
    size *= 0.94;
    ctx.font = `italic 900 ${size}px "Arial Black", Impact, "Franklin Gothic Heavy", sans-serif`;
  }
  return size;
}

function drawLettering(ctx, w, h, state) {
  const title = (state.title || '').trim().toUpperCase();
  const caption = (state.caption || '').trim().toUpperCase();
  const pair = (TITLE_COLORS[state.titleColor] || TITLE_COLORS.sunset).pair;
  const atBottom = state.titlePos !== 'top';
  const unit = Math.min(w, h);
  if (atBottom) {
    const scrim = ctx.createLinearGradient(0, h * 0.58, 0, h);
    scrim.addColorStop(0, 'rgba(8,2,18,0)');
    scrim.addColorStop(1, 'rgba(8,2,18,0.78)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
  } else {
    const scrim = ctx.createLinearGradient(0, 0, 0, h * 0.42);
    scrim.addColorStop(0, 'rgba(8,2,18,0.78)');
    scrim.addColorStop(1, 'rgba(8,2,18,0)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, w, h * 0.42);
  }
  ctx.textAlign = 'center';
  let titleBase;
  if (title) {
    const size = fitFontSize(ctx, title, w * 0.92, unit * 0.175);
    titleBase = atBottom ? h - unit * 0.055 : size + unit * 0.045;
    const grad = ctx.createLinearGradient(0, titleBase - size, 0, titleBase);
    grad.addColorStop(0, pair[0]);
    grad.addColorStop(1, pair[1]);
    ctx.save();
    try { ctx.letterSpacing = '1px'; } catch { /* older canvas: lettering still reads */ }
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.16;
    ctx.shadowOffsetY = size * 0.05;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#150324';
    ctx.lineWidth = size * 0.11;
    ctx.strokeText(title, w / 2, titleBase);
    ctx.fillStyle = grad;
    ctx.fillText(title, w / 2, titleBase);
    ctx.restore();
  }
  if (caption) {
    const size = unit * 0.042;
    ctx.save();
    ctx.font = `700 ${size}px "Segoe UI", system-ui, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(size * 0.32)}px`; } catch { /* as above */ }
    const tw = ctx.measureText(caption).width + size * 0.32 * caption.length;
    const pillW = tw + size * 1.7;
    const pillH = size * 1.9;
    const px = (w - pillW) / 2;
    const py = title
      ? (atBottom ? titleBase - unit * 0.175 - pillH + size * 0.4 : titleBase + size * 0.55)
      : (atBottom ? h - pillH - unit * 0.05 : unit * 0.05);
    ctx.beginPath();
    ctx.roundRect(px, py, pillW, pillH, pillH / 2);
    ctx.fillStyle = 'rgba(10,3,24,0.85)';
    ctx.fill();
    ctx.strokeStyle = pair[1];
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(caption, w / 2, py + pillH / 2 + size * 0.36);
    ctx.restore();
  }
  ctx.save();
  ctx.font = `600 ${Math.round(unit * 0.021)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 5;
  ctx.textAlign = atBottom ? 'left' : 'right';
  const tag = 'NEON COAST STUDIO';
  ctx.fillText(tag, atBottom ? unit * 0.03 : w - unit * 0.03, atBottom ? unit * 0.045 : h - unit * 0.03);
  ctx.restore();
}

/** Draws the whole cover described by `state` onto ctx at w x h. Panels carry their loaded image or null. */
export function drawCoverArt(ctx, w, h, state) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#0a0614';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(w, h, state.layout);
  rects.forEach((rect, i) => drawPanelPhoto(ctx, rect, state.panels[i] || {}, grade, i));
  const overlay = ctx.createLinearGradient(0, 0, w * 0.25, h);
  grade.stops.forEach(([at, color]) => overlay.addColorStop(at, color));
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, w, h);
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(5,0,14,0.42)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  drawLettering(ctx, w, h, state);
}
