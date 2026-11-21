// Neon Coast Studio's hand-in program (Node 22, standard library only).
//
// The app itself is the static site in app/ — index.html plus its ES modules, no build step and no network
// request — and this program delivers it: it copies app/ and screenshots/ into the output directory and
// writes dossier.json there with the vendored make.fun library, exactly as the scorer will rebuild it.
// Before copying, it refuses a tree the gate would refuse anyway (no app/index.html, or a screenshots/
// folder that does not hold three or four images), so a broken hand-in fails here instead of at grading.
//
// Try the app first with `node serve.ts`, then hand in with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing: there is no app to hand in');
}
const shots = existsSync(join(here, 'screenshots'))
  ? readdirSync(join(here, 'screenshots')).filter((name) => /\.(png|jpe?g)$/i.test(name))
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an
// entry the scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/
// or 48 MiB of app files in all, or a path under app/ over 1000 bytes).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
const appFiles = readdirSync(join(out, 'app'), { recursive: true }).length;
console.log(`Neon Coast Studio handed in: ${shots.length} screenshots, ${appFiles} app entries, dossier ${dossier.length} bytes -> ${out}`);
