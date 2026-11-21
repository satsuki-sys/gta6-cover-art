// Fixed scenes for screenshots: ?shot=cover paints one cover full-frame, ?shot=editor opens the editor in a
// named state. Every value can be overridden from the query string; window.__shotReady is set once painted.
const SCENES = {
  cover: {
    layout: 'grid', size: '1920x1080', grade: 'sunset', title: 'Neon Coast',
    caption: 'Vice Heat', titlePos: 'bottom', titleColor: 'sunset', selected: 0,
    assign: [0, 1, 2, 0, 1, 2],
  },
  poster: {
    layout: 'stack', size: '1080x1350', grade: 'neon', title: 'Midnight Run',
    caption: 'Neon Coast Nights', titlePos: 'bottom', titleColor: 'neon', selected: 0,
    assign: [1, 2, 0, 1],
  },
  editor: {
    layout: 'grid', size: '1080x1350', grade: 'sunset', title: 'Neon Coast',
    caption: 'Vice Heat', titlePos: 'bottom', titleColor: 'sunset', selected: 1,
    assign: [0, 1, 2, 0, 1, 2],
  },
  export: {
    layout: 'trio', size: '1080x1080', grade: 'neon', title: 'Night Drive',
    caption: 'Export Ready', titlePos: 'top', titleColor: 'ice', selected: 0,
    assign: [2, 0, 1],
  },
};

export async function runShot(shot, query, applyScene) {
  const scene = { ...(SCENES[shot] || SCENES.editor) };
  for (const key of ['layout', 'grade', 'title', 'caption', 'titlePos', 'titleColor', 'size']) {
    if (query.get(key)) scene[key] = query.get(key);
  }
  if (shot === 'cover' || shot === 'poster') document.body.classList.add('shot-cover');
  await applyScene(scene);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
