// Share cards (Open Graph images, 1200x630) rendered at build time with Satori + Resvg.
// Same look as the site: indigo field, 12-column guides, the block field from the hero.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SITE_URL } from '../site.config.mjs';

const W = 1200, H = 630;
const root = process.cwd();
const nm = (p: string) => fs.readFile(path.join(root, 'node_modules', p));

let fontsP: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 600; style: 'normal' }[]> | null = null;
function fonts() {
  fontsP ??= Promise.all([
    nm('@fontsource/archivo/files/archivo-latin-400-normal.woff'),
    nm('@fontsource/archivo/files/archivo-latin-500-normal.woff'),
    nm('@fontsource/archivo/files/archivo-latin-600-normal.woff'),
    nm('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff'),
  ]).then(([a4, a5, a6, m4]) => [
    { name: 'Archivo', data: a4, weight: 400, style: 'normal' },
    { name: 'Archivo', data: a5, weight: 500, style: 'normal' },
    { name: 'Archivo', data: a6, weight: 600, style: 'normal' },
    { name: 'Plex', data: m4, weight: 400, style: 'normal' },
  ]);
  return fontsP;
}

/** A public image (webp, png, jpg) as a PNG data URI Satori can draw. */
export async function imageData(publicPath: string, size = 192) {
  const buf = await sharp(path.join(root, 'public', publicPath)).resize(size, size, { fit: 'cover' }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// Tiny element helper so we can build the tree without JSX.
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type, props: { style, children: children.length <= 1 ? children[0] : children },
});

// Deterministic pseudo-random numbers, so a card is identical from one build to the next.
function rng(seed: string) {
  let x = 2166136261;
  for (const c of seed) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; };
}

function blockField(seed: string, accent: string | undefined) {
  const r = rng(seed), g = 30, s = 5, out: Node[] = [];
  for (let x = g / 2; x < W; x += g) {
    const lit = r() < 0.18; // a few columns "commit", like the hero animation
    for (let y = g / 2; y < H; y += g) {
      const fx = x / W, fy = y / H;
      const w = Math.max(0, fx - 0.5) * 1.9 * Math.max(0, 1 - Math.abs(fy - 0.42) * 1.3);
      if (w > 0.03 && r() < 0.55 + w * 0.4) {
        const a = Math.min(1, w) * (lit ? 0.62 : 0.26);
        const c = lit && accent && r() < 0.35 ? accent : '#FFFFFF';
        out.push(h('div', { position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, background: c, opacity: a }));
      }
    }
  }
  return out;
}

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const guides = () =>
  h('div', { position: 'absolute', left: 64, right: 64, top: 0, bottom: 0, display: 'flex' },
    ...Array.from({ length: 12 }, (_, i) =>
      h('div', { flex: 1, height: '100%', borderLeft: '1px solid rgba(255,255,255,.06)', ...(i === 11 ? { borderRight: '1px solid rgba(255,255,255,.06)' } : {}) })));

export interface Card {
  seed: string;          // anything unique, drives the block pattern
  kicker: string;        // mono line above the title
  title: string;
  sub?: string;          // optional line under the title
  path?: string;         // shown bottom left after the domain
  logo?: string;         // data URI from imageData()
  accent?: string;       // brand colour of a portfolio company
  theme?: 'indigo' | 'ink';
}

export async function renderCard(c: Card) {
  const bg = c.theme === 'ink' ? '#13142A' : '#393A8F';
  const len = c.title.length;
  const size = len <= 26 ? 96 : len <= 44 ? 80 : len <= 70 ? 64 : 54;
  const host = new URL(SITE_URL).hostname;

  const tree = h('div', { width: W, height: H, display: 'flex', position: 'relative', background: bg, color: '#fff', fontFamily: 'Archivo' },
    guides(),
    ...blockField(c.seed, c.accent),
    // radial wash in the company colour
    c.accent ? h('div', { position: 'absolute', left: 0, top: 0, width: W, height: H, backgroundImage: `radial-gradient(circle at 100% 0%, ${rgba(c.accent, 0.42)} 0%, ${rgba(c.accent, 0)} 55%)` }) : null,
    h('div', { position: 'absolute', left: 64, right: 64, top: 56, bottom: 52, display: 'flex', flexDirection: 'column' },
      // header: logo lock-up and kicker
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        h('div', { display: 'flex', alignItems: 'center' },
          h('span', { fontSize: 34, fontWeight: 600, letterSpacing: -0.7 }, 'Gami'),
          h('div', { width: 3, height: 32, background: 'rgba(255,255,255,.55)', marginLeft: 16, marginRight: 16 }),
          h('span', { fontSize: 25, fontWeight: 400, letterSpacing: 0.5, opacity: 0.85 }, 'Capital')),
        h('span', { fontFamily: 'Plex', fontSize: 20, color: 'rgba(255,255,255,.62)' }, c.kicker)),
      // title block
      h('div', { display: 'flex', flexDirection: 'column', marginTop: 'auto', maxWidth: c.logo ? 860 : 980 },
        c.logo ? { type: 'img', props: { src: c.logo, width: 104, height: 104, style: { borderRadius: 24, marginBottom: 34, boxShadow: '0 16px 40px rgba(0,0,0,.35)' } } } : null,
        h('div', { fontSize: size, fontWeight: 400, lineHeight: 1.02, letterSpacing: -size * 0.03 }, c.title),
        c.sub ? h('div', { fontSize: 26, lineHeight: 1.4, color: 'rgba(255,255,255,.75)', marginTop: 24, maxWidth: 860 }, c.sub) : null),
      // footer
      h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.18)', fontFamily: 'Plex', fontSize: 19, color: 'rgba(255,255,255,.6)' },
        h('span', {}, `${host}${c.path ?? ''}`),
        h('span', {}, 'Geneva, Switzerland'))));

  const svg = await satori(tree as never, { width: W, height: H, fonts: await fonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
}

export const png = (buf: Uint8Array) =>
  new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/png' } });
