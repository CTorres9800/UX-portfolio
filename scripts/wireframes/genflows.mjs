// Generates Blend Metrics user-flow SVGs using the case-study legend language.
// Palette sampled from public/images/cs-flow-legend.png + cs-flow-scope-editing.png
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const OUT = process.argv[2];
if (!OUT) throw new Error('usage: node genflows.mjs <outDir>');

const C = {
  startEnd: '#C9D9FF',
  action: '#FCFCFD',
  actionStroke: '#E5E5E7',
  screen: '#E8EEFF',
  decision: '#EAECF0',
  text: '#101828',
  blue: '#6D8DDD',
  red: '#D16A7F',
  greenBg: '#BFF3CD',
  greenFg: '#17966A',
  redBg: '#FAC1CA',
  redFg: '#C4485F',
};

// ---- geometry ----
const SE_R = 66;          // start/end radius
const AC_W = 196, AC_H = 78;
const SC_W = 196, SC_H = 152;
const DEC = 122;                       // decision square side (rotated 45deg)
const DEC_HALF = (DEC * Math.SQRT2) / 2; // ~86.3 rendered half-extent

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n) => Math.round(n * 100) / 100;

function textBlock(lines, cx, cy, size = 15, weight = 500) {
  const lh = size * 1.32;
  const total = (lines.length - 1) * lh;
  return lines
    .map((ln, i) => {
      const y = cy - total / 2 + i * lh + size * 0.35;
      return `<text x="${r2(cx)}" y="${r2(y)}" font-family="DM Sans, -apple-system, BlinkMacSystemFont, sans-serif" font-size="${size}" font-weight="${weight}" fill="${C.text}" text-anchor="middle">${esc(ln)}</text>`;
    })
    .join('');
}

const halfOf = {
  start: SE_R, end: SE_R,
  action: AC_W / 2,
  screen: SC_W / 2,
  decision: DEC_HALF,
};
const vHalfOf = {
  start: SE_R, end: SE_R,
  action: AC_H / 2,
  screen: SC_H / 2,
  decision: DEC_HALF,
};

function shape(node) {
  const { type, x, y, label } = node;
  const lines = label.split('\n');
  if (type === 'start' || type === 'end') {
    return `<circle cx="${x}" cy="${y}" r="${SE_R}" fill="${C.startEnd}"/>` + textBlock(lines, x, y, 15, 600);
  }
  if (type === 'action') {
    return `<rect x="${x - AC_W / 2}" y="${y - AC_H / 2}" width="${AC_W}" height="${AC_H}" rx="10" fill="${C.action}" stroke="${C.actionStroke}" stroke-width="1.5"/>` + textBlock(lines, x, y);
  }
  if (type === 'screen') {
    const L = x - SC_W / 2, T = y - SC_H / 2;
    const d = `M${L + 5} ${T} H${L + SC_W - 5} a5 5 0 0 1 5 5 V${T + 148} C${L + 163} ${T + 133}, ${L + 137} ${T + 158}, ${L + 106} ${T + 146} C${L + 72} ${T + 134}, ${L + 33} ${T + 154}, ${L} ${T + 145} V${T + 5} a5 5 0 0 1 5 -5 Z`;
    return `<path d="${d}" fill="${C.screen}"/>` + textBlock(lines, x, y - 8);
  }
  if (type === 'decision') {
    return `<rect x="${x - DEC / 2}" y="${y - DEC / 2}" width="${DEC}" height="${DEC}" rx="10" fill="${C.decision}" transform="rotate(45 ${x} ${y})"/>` + textBlock(lines, x, y, 13);
  }
  throw new Error('unknown type ' + type);
}

// rounded elbow polyline with start dot + arrowhead
function path(pts, opts = {}) {
  const color = opts.color || C.blue;
  const r = 12;
  const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const unit = (f, t) => { const d = dist(f, t) || 1; return { x: (t.x - f.x) / d, y: (t.y - f.y) / d }; };

  let d = `M ${r2(pts[0].x)} ${r2(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
    const u1 = unit(p1, p0), u2 = unit(p1, p2);
    const d1 = Math.min(r, dist(p0, p1) / 2), d2 = Math.min(r, dist(p1, p2) / 2);
    d += ` L ${r2(p1.x + u1.x * d1)} ${r2(p1.y + u1.y * d1)} Q ${r2(p1.x)} ${r2(p1.y)} ${r2(p1.x + u2.x * d2)} ${r2(p1.y + u2.y * d2)}`;
  }
  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
  const u = unit(prev, last);
  const back = { x: last.x - u.x * 11, y: last.y - u.y * 11 };
  const perp = { x: -u.y, y: u.x };
  d += ` L ${r2(back.x)} ${r2(back.y)}`;
  const head = `M ${r2(last.x)} ${r2(last.y)} L ${r2(back.x + perp.x * 5.2)} ${r2(back.y + perp.y * 5.2)} L ${r2(back.x - perp.x * 5.2)} ${r2(back.y - perp.y * 5.2)} Z`;
  const dash = opts.dashed ? ' stroke-dasharray="7 6"' : '';
  return (
    `<path d="${d}" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"${dash}/>` +
    `<circle cx="${r2(pts[0].x)}" cy="${r2(pts[0].y)}" r="3.2" fill="#fff" stroke="${color}" stroke-width="1.6"/>` +
    `<path d="${head}" fill="${color}"/>`
  );
}

function badge(kind, cx, cy) {
  if (kind === 'yes') {
    return `<circle cx="${cx}" cy="${cy}" r="13" fill="${C.greenBg}" stroke="#fff" stroke-width="2"/>` +
      `<path d="M${cx - 5.5} ${cy + 0.3} L${cx - 1.7} ${cy + 4} L${cx + 5.5} ${cy - 3.4}" stroke="${C.greenFg}" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="13" fill="${C.redBg}" stroke="#fff" stroke-width="2"/>` +
    `<path d="M${cx - 4.5} ${cy - 4.5} L${cx + 4.5} ${cy + 4.5} M${cx + 4.5} ${cy - 4.5} L${cx - 4.5} ${cy + 4.5}" stroke="${C.redFg}" stroke-width="2.1" fill="none" stroke-linecap="round"/>`;
}

function edgeLabel(txt, cx, cy) {
  return `<text x="${cx}" y="${cy}" font-family="DM Sans, sans-serif" font-size="13" font-weight="600" fill="#667085" text-anchor="middle">${esc(txt)}</text>`;
}

// ---- flow assembly ----
function build(nodes, edges, extras = []) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const body = [];
  const pts = [];

  for (const e of edges) {
    const A = byId[e.from], B = byId[e.to];
    let wp;
    if (e.waypoints) {
      wp = e.waypoints;
    } else {
      // straight horizontal, edge-to-edge
      const x1 = A.x + halfOf[A.type] + 10;
      const x2 = B.x - halfOf[B.type] - 6;
      wp = [{ x: x1, y: A.y }, { x: x2, y: B.y }];
    }
    body.push(path(wp, { color: e.color, dashed: e.dashed }));
    if (e.badge) {
      const m = e.badgeAt || { x: (wp[0].x + wp[wp.length - 1].x) / 2, y: (wp[0].y + wp[wp.length - 1].y) / 2 };
      body.push(badge(e.badge, m.x, m.y));
    }
    if (e.label && e.labelAt) body.push(edgeLabel(e.label, e.labelAt.x, e.labelAt.y));
    wp.forEach((p) => pts.push(p));
  }
  for (const n of nodes) {
    body.push(shape(n));
    pts.push({ x: n.x - halfOf[n.type], y: n.y - vHalfOf[n.type] });
    pts.push({ x: n.x + halfOf[n.type], y: n.y + vHalfOf[n.type] });
  }
  body.push(...extras);
  return { body: body.join(''), pts };
}

function render({ nodes, edges, extras = [], padX = 44, padY = 44, title = '' }) {
  const { body, pts } = build(nodes, edges, extras);
  const minX = Math.min(...pts.map((p) => p.x)) - padX;
  const minY = Math.min(...pts.map((p) => p.y)) - padY;
  const maxX = Math.max(...pts.map((p) => p.x)) + padX;
  const maxY = Math.max(...pts.map((p) => p.y)) + padY;
  const w = Math.round(maxX - minX), h = Math.round(maxY - minY);
  const a11y = title ? `<title>${esc(title)}</title>` : '';
  // Inlined into the page (not <img>), so it inherits the page's DM Sans webfont.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(minX)} ${r2(minY)} ${w} ${h}" style="width:100%;height:auto;display:block" role="img">${a11y}${body}</svg>\n`;
}

// helpers for laying out a spine
const X0 = 200, STEP = 310;
const X = (i) => X0 + STEP * i;

// =====================  LEGEND  =====================
const legend = (() => {
  const y = 100;
  const nodes = [
    { id: 'a', type: 'start', label: 'Start/End', x: 90, y },
    { id: 'b', type: 'action', label: 'Action', x: 340, y },
    { id: 'c', type: 'screen', label: 'Screen/Page', x: 620, y },
    { id: 'd', type: 'decision', label: 'Decision', x: 890, y },
  ];
  // padY tuned so the legend keeps the same proportions as the existing case-study legend
  return render({ nodes, edges: [], padX: 60, padY: 110, title: 'User flow legend: Start/End, Action, Screen/Page, Decision' });
})();

// =====================  FLOW 1  =====================
const flow1 = (() => {
  const S = 420, UP = 120;
  const nodes = [
    { id: 'a0', type: 'start', label: 'Workflow\nDashboard', x: X(0), y: S },
    { id: 'a1', type: 'action', label: 'Click Create\nWorkflow', x: X(1), y: S },
    { id: 'a2', type: 'screen', label: 'Name Workflow\nModal', x: X(2), y: S },
    { id: 'a3', type: 'action', label: 'Enter workflow\nname', x: X(3), y: S },
    { id: 'a4', type: 'screen', label: 'Blank Canvas\nEmpty State', x: X(4), y: S },
    { id: 'a5', type: 'action', label: 'Click “Add a\nTrigger”', x: X(5), y: S },
    { id: 'a6', type: 'screen', label: 'Sidebar Drawer\nTrigger List', x: X(6), y: S },
    { id: 'a7', type: 'decision', label: 'Trigger\nfound?', x: X(7), y: S },
    { id: 'a8', type: 'action', label: 'Drag trigger to\ndrop zone', x: X(8), y: S },
    { id: 'a9', type: 'screen', label: 'Trigger Active\nSetup Tab', x: X(9), y: S },
    { id: 'a10', type: 'end', label: 'Trigger on\ncanvas', x: X(10), y: S },
    { id: 'b1', type: 'action', label: 'Search for\ntrigger', x: X(7), y: UP },
  ];
  const edges = [];
  for (let i = 0; i < 10; i++) edges.push({ from: 'a' + i, to: 'a' + (i + 1), badge: i === 7 ? 'yes' : null });
  edges.push({ from: 'a7', to: 'b1', color: C.red, badge: 'no', badgeAt: { x: X(7), y: 250 },
    waypoints: [{ x: X(7), y: S - DEC_HALF - 8 }, { x: X(7), y: UP + AC_H / 2 + 6 }] });
  edges.push({ from: 'b1', to: 'a6', dashed: true,
    waypoints: [{ x: X(7) - AC_W / 2 - 10, y: UP }, { x: X(6), y: UP }, { x: X(6), y: S - SC_H / 2 - 6 }] });
  return render({ nodes, edges, title: 'Flow 1 — Creating a Workflow: dashboard to first trigger on canvas' });
})();

// =====================  FLOW 2  =====================
const flow2 = (() => {
  const S = 460, UP = 140, L1 = 760, L2 = 890;
  const nodes = [
    { id: 'a0', type: 'start', label: 'Trigger on\ncanvas', x: X(0), y: S },
    { id: 'a1', type: 'screen', label: 'Trigger Setup\nSidebar', x: X(1), y: S },
    { id: 'a2', type: 'decision', label: 'Account\nconnected?', x: X(2), y: S },
    { id: 'a3', type: 'action', label: 'Select trigger\nevent type', x: X(3), y: S },
    { id: 'a4', type: 'decision', label: 'Triggers\ncomplete?', x: X(4), y: S },
    { id: 'a5', type: 'action', label: 'Click + to\nadd step', x: X(5), y: S },
    { id: 'a6', type: 'screen', label: 'Sidebar Drawer\nAction List', x: X(6), y: S },
    { id: 'a7', type: 'action', label: 'Drag action\nonto canvas', x: X(7), y: S },
    { id: 'a8', type: 'screen', label: 'Action Setup\nTab', x: X(8), y: S },
    { id: 'a9', type: 'action', label: 'Map fields via\ndata flyout', x: X(9), y: S },
    { id: 'a10', type: 'decision', label: 'Steps\ncomplete?', x: X(10), y: S },
    { id: 'a11', type: 'end', label: 'Sequence\nbuilt', x: X(11), y: S },
    { id: 'b1', type: 'screen', label: 'Authorization\nWindow', x: X(2), y: UP },
    { id: 'b2', type: 'action', label: 'Click Connect\nto authorize', x: X(3), y: UP },
  ];
  const edges = [];
  for (let i = 0; i < 11; i++) edges.push({ from: 'a' + i, to: 'a' + (i + 1), badge: [2, 4, 10].includes(i) ? 'yes' : null });
  edges.push({ from: 'a2', to: 'b1', color: C.red, badge: 'no', badgeAt: { x: X(2), y: 290 },
    waypoints: [{ x: X(2), y: S - DEC_HALF - 8 }, { x: X(2), y: UP + SC_H / 2 + 4 }] });
  edges.push({ from: 'b1', to: 'b2' });
  edges.push({ from: 'b2', to: 'a3', waypoints: [{ x: X(3), y: UP + AC_H / 2 + 8 }, { x: X(3), y: S - AC_H / 2 - 6 }] });
  edges.push({ from: 'a4', to: 'a1', color: C.red, badge: 'no', badgeAt: { x: (X(4) + X(1)) / 2, y: L1 },
    waypoints: [{ x: X(4), y: S + DEC_HALF + 8 }, { x: X(4), y: L1 }, { x: X(1), y: L1 }, { x: X(1), y: S + SC_H / 2 + 8 }] });
  edges.push({ from: 'a10', to: 'a5', color: C.red, badge: 'no', badgeAt: { x: (X(10) + X(5)) / 2, y: L2 },
    waypoints: [{ x: X(10), y: S + DEC_HALF + 8 }, { x: X(10), y: L2 }, { x: X(5), y: L2 }, { x: X(5), y: S + AC_H / 2 + 8 }] });
  return render({ nodes, edges, title: 'Flow 2 — Configuring Triggers and Actions: connect accounts, configure events, map fields' });
})();

// =====================  FLOW 3  =====================
const flow3 = (() => {
  const S = 520, UP = 200, LOW = 840, LOOP = 1080;
  const nodes = [
    { id: 'a0', type: 'start', label: 'Sequence\nbuilt', x: X(0), y: S },
    { id: 'a1', type: 'action', label: 'Add Split Path\nnode', x: X(1), y: S },
    { id: 'a2', type: 'screen', label: 'Split Path Setup\nSidebar', x: X(2), y: S },
    { id: 'a3', type: 'decision', label: 'Split\ntype?', x: X(3), y: S },
    { id: 'u1', type: 'screen', label: 'Conditions Tab\nAND/OR builder', x: X(4), y: UP },
    { id: 'u2', type: 'action', label: 'Build condition\nrules', x: X(5), y: UP },
    { id: 'u3', type: 'screen', label: 'Data Flyout\nfield picker', x: X(6), y: UP },
    { id: 'l1', type: 'screen', label: 'Percentage Split\ntab', x: X(4), y: LOW },
    { id: 'l2', type: 'action', label: 'Set distribution\nacross paths', x: X(5), y: LOW },
    { id: 'l3', type: 'decision', label: 'Totals\n100%?', x: X(6), y: LOW },
    { id: 'a7', type: 'action', label: 'Name each\npath', x: X(7), y: S },
    { id: 'a8', type: 'screen', label: 'Path Preview\ncontact routing', x: X(8), y: S },
    { id: 'a9', type: 'action', label: 'Add steps to\neach branch', x: X(9), y: S },
    { id: 'a10', type: 'decision', label: 'Merge\npaths?', x: X(10), y: S },
    { id: 'a11', type: 'action', label: 'Set merge\npoint', x: X(11), y: S },
    { id: 'a12', type: 'end', label: 'Branching\nconfigured', x: X(12), y: S },
  ];
  const edges = [
    { from: 'a0', to: 'a1' }, { from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' },
    // split into two lanes
    { from: 'a3', to: 'u1', label: 'Conditional', labelAt: { x: X(3) + 84, y: UP - 22 },
      waypoints: [{ x: X(3), y: S - DEC_HALF - 8 }, { x: X(3), y: UP }, { x: X(4) - SC_W / 2 - 6, y: UP }] },
    { from: 'a3', to: 'l1', label: 'Percentage', labelAt: { x: X(3) + 84, y: LOW - 22 },
      waypoints: [{ x: X(3), y: S + DEC_HALF + 8 }, { x: X(3), y: LOW }, { x: X(4) - SC_W / 2 - 6, y: LOW }] },
    { from: 'u1', to: 'u2' }, { from: 'u2', to: 'u3' },
    { from: 'l1', to: 'l2' },
    { from: 'l2', to: 'l3' },
    // lanes rejoin
    { from: 'u3', to: 'a7',
      waypoints: [{ x: X(6) + SC_W / 2 + 10, y: UP }, { x: X(7), y: UP }, { x: X(7), y: S - AC_H / 2 - 6 }] },
    { from: 'l3', to: 'a7', badge: 'yes', badgeAt: { x: X(7), y: LOW - 90 },
      waypoints: [{ x: X(6) + DEC_HALF + 10, y: LOW }, { x: X(7), y: LOW }, { x: X(7), y: S + AC_H / 2 + 6 }] },
    // percentage validation loop
    { from: 'l3', to: 'l2', color: C.red, badge: 'no', badgeAt: { x: (X(6) + X(5)) / 2, y: LOOP },
      waypoints: [{ x: X(6), y: LOW + DEC_HALF + 8 }, { x: X(6), y: LOOP }, { x: X(5), y: LOOP }, { x: X(5), y: LOW + AC_H / 2 + 8 }] },
    { from: 'a7', to: 'a8' }, { from: 'a8', to: 'a9' }, { from: 'a9', to: 'a10' },
    { from: 'a10', to: 'a11', badge: 'yes' },
    { from: 'a11', to: 'a12' },
    // merge? no -> skip merge point
    { from: 'a10', to: 'a12', color: C.red, badge: 'no', badgeAt: { x: X(11), y: 300 },
      waypoints: [{ x: X(10), y: S - DEC_HALF - 8 }, { x: X(10), y: 300 }, { x: X(12), y: 300 }, { x: X(12), y: S - SE_R - 6 }] },
  ];
  return render({ nodes, edges, title: 'Flow 3 — Configuring Split Paths: conditional and percentage branching logic' });
})();

// =====================  FLOW 4  =====================
const flow4 = (() => {
  const S = 440, UP = 140;
  const nodes = [
    { id: 'a0', type: 'start', label: 'Workflow\nbuilt', x: X(0), y: S },
    { id: 'a1', type: 'action', label: 'Open workflow\noptions menu', x: X(1), y: S },
    { id: 'a2', type: 'action', label: 'Select “Run\nWorkflow Test”', x: X(2), y: S },
    { id: 'a3', type: 'screen', label: 'Test Running\nstate', x: X(3), y: S },
    { id: 'a4', type: 'screen', label: 'Test Results\npass / fail per\nconnection', x: X(4), y: S },
    { id: 'a5', type: 'decision', label: 'All steps\npass?', x: X(5), y: S },
    { id: 'a6', type: 'screen', label: 'Ready to\nPublish', x: X(6), y: S },
    { id: 'a7', type: 'end', label: 'Tests\npassing', x: X(7), y: S },
    { id: 'b1', type: 'action', label: 'Expand failed\nnode details', x: X(5), y: UP },
    { id: 'b2', type: 'screen', label: 'Inline error\ndetail on node', x: X(4), y: UP },
    { id: 'b3', type: 'action', label: 'Fix node\nconfiguration', x: X(3), y: UP },
  ];
  const edges = [];
  for (let i = 0; i < 7; i++) edges.push({ from: 'a' + i, to: 'a' + (i + 1), badge: i === 5 ? 'yes' : null });
  edges.push({ from: 'a5', to: 'b1', color: C.red, badge: 'no', badgeAt: { x: X(5), y: 280 },
    waypoints: [{ x: X(5), y: S - DEC_HALF - 8 }, { x: X(5), y: UP + AC_H / 2 + 6 }] });
  edges.push({ from: 'b1', to: 'b2', waypoints: [{ x: X(5) - AC_W / 2 - 10, y: UP }, { x: X(4) + SC_W / 2 + 6, y: UP }] });
  edges.push({ from: 'b2', to: 'b3', waypoints: [{ x: X(4) - SC_W / 2 - 10, y: UP }, { x: X(3) + AC_W / 2 + 6, y: UP }] });
  edges.push({ from: 'b3', to: 'a2', dashed: true,
    waypoints: [{ x: X(3) - AC_W / 2 - 10, y: UP }, { x: X(2), y: UP }, { x: X(2), y: S - AC_H / 2 - 6 }] });
  return render({ nodes, edges, title: 'Flow 4 — Testing a Workflow: run test, review pass/fail, debug failed nodes' });
})();

// =====================  FLOW 5  =====================
const flow5 = (() => {
  const S = 480, UP = 160, LOW = 820;
  const nodes = [
    { id: 'a0', type: 'start', label: 'Tests\npassing', x: X(0), y: S },
    { id: 'a1', type: 'action', label: 'Click Publish', x: X(1), y: S },
    { id: 'a2', type: 'screen', label: 'Publish Confirm\nStep 1', x: X(2), y: S },
    { id: 'a3', type: 'decision', label: 'Confirm\npublish?', x: X(3), y: S },
    { id: 'a4', type: 'screen', label: 'Final Confirm\nStep 2', x: X(4), y: S },
    { id: 'a5', type: 'screen', label: 'Success State', x: X(5), y: S },
    { id: 'a6', type: 'decision', label: 'Go to\ndashboard?', x: X(6), y: S },
    { id: 'a7', type: 'screen', label: 'Workflow\nDashboard', x: X(7), y: S },
    { id: 'a8', type: 'action', label: 'Search, filter\n& sort', x: X(8), y: S },
    { id: 'a9', type: 'screen', label: 'Workflow list\nstatus & version\nhistory', x: X(9), y: S },
    { id: 'a10', type: 'action', label: 'Pause, rename\nor delete', x: X(10), y: S },
    { id: 'a11', type: 'end', label: 'Workflow\nmanaged', x: X(11), y: S },
    { id: 'b1', type: 'end', label: 'Back to\ncanvas', x: X(3), y: UP },
    { id: 'b2', type: 'end', label: 'Keep working\non canvas', x: X(6), y: LOW },
  ];
  const edges = [];
  for (let i = 0; i < 11; i++) edges.push({ from: 'a' + i, to: 'a' + (i + 1), badge: [3, 6].includes(i) ? 'yes' : null });
  edges.push({ from: 'a3', to: 'b1', color: C.red, badge: 'no', badgeAt: { x: X(3), y: 310 },
    waypoints: [{ x: X(3), y: S - DEC_HALF - 8 }, { x: X(3), y: UP + SE_R + 6 }] });
  edges.push({ from: 'a6', to: 'b2', color: C.red, badge: 'no', badgeAt: { x: X(6), y: 660 },
    waypoints: [{ x: X(6), y: S + DEC_HALF + 8 }, { x: X(6), y: LOW - SE_R - 6 }] });
  return render({ nodes, edges, title: 'Flow 5 — Publishing and Managing Workflows: two-step confirmation and dashboard management' });
})();

const files = {
  'bm-flow-legend.svg': legend,
  'bm-flow-1-creating.svg': flow1,
  'bm-flow-2-triggers-actions.svg': flow2,
  'bm-flow-3-split-paths.svg': flow3,
  'bm-flow-4-testing.svg': flow4,
  'bm-flow-5-publishing.svg': flow5,
};
mkdirSync(OUT, { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  const p = join(OUT, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, svg);
  console.log(`${name.padEnd(32)} ${(svg.length / 1024).toFixed(1)} KB`);
}
