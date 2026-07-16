// Survey charts. Only the bars live in the SVG — the question sits in HTML above
// it so it can wrap; SVG text cannot, and these questions are long. Drawn at the
// width they actually render at (3 across a 1120 column, 24px gaps -> 357).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2];
if (!OUT) throw new Error('usage: node genresearch.mjs <outDir>');

const C = { ink: '#111111', body: '#3F3F3F', mute: '#8C8C8C',
            track: '#F1F1F1', accent: '#306CFE', accentSoft: '#B9CCFE' };
const F = 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const t = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${F}" font-size="${o.size || 12}" font-weight="${o.weight || 500}" fill="${o.fill || C.body}" text-anchor="${o.anchor || 'start'}">${esc(s)}</text>`;

const W = 357;
function bars(title, rows) {
  const ROW = 50, PCT_W = 38, N_W = 22;
  const h = rows.length * ROW - 8;
  const barW = W - PCT_W - N_W;
  const max = Math.max(...rows.map(r => r.pct));
  let s = '';
  rows.forEach((r, i) => {
    const y = i * ROW;
    const bw = Math.max(3, (r.pct / max) * barW);
    const on = i === 0;
    s += t(0, y + 11, r.label, { size: 11, weight: on ? 700 : 500, fill: on ? C.ink : C.body });
    s += `<rect x="0" y="${y + 20}" width="${barW}" height="13" rx="6.5" fill="${C.track}"/>`;
    s += `<rect x="0" y="${y + 20}" width="${bw}" height="13" rx="6.5" fill="${on ? C.accent : C.accentSoft}"/>`;
    s += t(barW + N_W, y + 30, `${r.n}`, { size: 9.5, fill: C.mute, anchor: 'end' });
    s += t(W, y + 30, `${r.pct}%`, { size: 12, weight: 700, fill: on ? C.accent : C.mute, anchor: 'end' });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img"><title>${esc(title)}</title>${s}</svg>\n`;
}

const files = {
  'bm-survey-confidence.svg': bars('Confidence before publishing', [
    { label: 'Not confident — I check it first', pct: 68, n: 23 },
    { label: 'Somewhat confident', pct: 23, n: 8 },
    { label: 'Very confident', pct: 9, n: 3 },
  ]),
  'bm-survey-timelost.svg': bars('Where time is lost', [
    { label: 'Working out why a step failed', pct: 35, n: 12 },
    { label: 'Setting up conditions, branches', pct: 26, n: 9 },
    { label: 'Finding the right trigger or action', pct: 21, n: 7 },
    { label: 'Re-checking before publishing', pct: 18, n: 6 },
  ]),
  'bm-survey-debug.svg': bars('How a failure gets diagnosed', [
    { label: 'Click into each step one by one', pct: 62, n: 21 },
    { label: 'Check the logs', pct: 23, n: 8 },
    { label: 'Rebuild the workflow from scratch', pct: 15, n: 5 },
  ]),
};
mkdirSync(OUT, { recursive: true });
for (const [n, s] of Object.entries(files)) {
  writeFileSync(join(OUT, n), s);
  console.log('  ' + n.padEnd(30), (s.length / 1024).toFixed(1) + ' KB');
}
