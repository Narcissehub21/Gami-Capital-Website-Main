// Generates the favicon set and the square logo used in structured data.
// Run once after changing the brand: node scripts/make-icons.mjs
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'node:fs/promises';

const font = (f) => fs.readFile(new URL(`../node_modules/@fontsource/archivo/files/${f}`, import.meta.url));
const fonts = [
  { name: 'Archivo', data: await font('archivo-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'Archivo', data: await font('archivo-latin-600-normal.woff'), weight: 600, style: 'normal' },
];
const h = (type, style, ...children) => ({ type, props: { style, children: children.length <= 1 ? children[0] : children } });
const out = (p) => new URL(`../public/${p}`, import.meta.url);

// Square mark: indigo tile, "G" and the lock-up bar.
async function mark(size, radius) {
  const tree = h('div', { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#393A8F', borderRadius: radius, fontFamily: 'Archivo', color: '#fff' },
    h('span', { fontSize: size * 0.62, fontWeight: 600, letterSpacing: -size * 0.02, lineHeight: 1, marginTop: -size * 0.04 }, 'G'),
    h('div', { width: Math.max(1, size * 0.045), height: size * 0.44, background: '#9496E6', marginLeft: size * 0.06 }));
  return satori(tree, { width: size, height: size, fonts });
}
const toPng = (svg, w) => new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();

const svg = await mark(64, 14);
await fs.writeFile(out('favicon.svg'), svg);
for (const [file, size, r] of [['apple-touch-icon.png', 180, 0], ['icon-192.png', 192, 40], ['icon-512.png', 512, 108]]) {
  await fs.writeFile(out(file), toPng(await mark(size, r), size));
}

// favicon.ico with 16, 32 and 48 px PNG images inside.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(async (s) => toPng(await mark(s * 4, s * 0.9), s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await fs.writeFile(out('favicon.ico'), Buffer.concat([header, ...pngs]));

// Square logo for search engines (Organization.logo): lock-up on indigo.
const logo = h('div', { width: 600, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#393A8F', fontFamily: 'Archivo', color: '#fff' },
  h('span', { fontSize: 92, fontWeight: 600, letterSpacing: -2 }, 'Gami'),
  h('div', { width: 5, height: 84, background: '#9496E6', marginLeft: 26, marginRight: 26 }),
  h('span', { fontSize: 66, fontWeight: 400, opacity: 0.9 }, 'Capital'));
await fs.mkdir(out('images'), { recursive: true });
await fs.writeFile(out('images/gami-capital-logo.png'), toPng(await satori(logo, { width: 600, height: 600, fonts }), 600));
await sharp(out('images/gami-capital-logo.png').pathname).toFile(out('images/gami-capital-logo.webp').pathname);
console.log('icons written');
