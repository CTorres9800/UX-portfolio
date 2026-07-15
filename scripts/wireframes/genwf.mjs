// Grayscale wireframes for the Blend Metrics case study.
// Sized 930x589 to match the Referrizer wireframes exactly.
// Fidelity ramps V1 (low) -> V2 (medium) -> V3 (mid-fi replica of the hi-fi screen).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2];
if (!OUT) throw new Error('usage: node genwf.mjs <outDir>');

const G = {
  ink: '#111111', body: '#3D3D3D', mute: '#8A8A8A',
  line: '#D8D8D8', soft: '#E8E8E8', fill: '#F1F1F1',
  canvas: '#FAFAFA', dot: '#DADADA', white: '#FFFFFF', solid: '#2E2E2E',
};
const F = 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const W = 930, H = 589, TOP = 34, SBX = 680, SBW = W - SBX;

const t = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${F}" font-size="${o.size || 8}" font-weight="${o.weight || 500}" fill="${o.fill || G.body}" text-anchor="${o.anchor || 'start'}">${esc(s)}</text>`;
const box = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 4}" fill="${o.fill || 'none'}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const ln = (x1, y1, x2, y2, o = {}) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1}" fill="none"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const cir = (cx, cy, r, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill || 'none'}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1}"/>`;
// gray placeholder bar — the low-fi stand-in for text
const bar = (x, y, w, h = 5, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${o.fill || G.line}"/>`;
const iconSq = (x, y, s = 18) =>
  box(x, y, s, s, { r: 4, fill: G.fill, stroke: G.line }) +
  box(x + s * 0.28, y + s * 0.28, s * 0.44, s * 0.44, { r: 1.5, stroke: G.mute });
const warn = (cx, cy, r = 6, o = {}) =>
  cir(cx, cy, r, { stroke: o.stroke || G.ink, sw: 1.2, fill: G.white }) +
  `<path d="M${cx} ${cy - 3} v3.4 M${cx} ${cy + 2.4} v0.6" stroke="${o.stroke || G.ink}" stroke-width="1.2" stroke-linecap="round"/>`;
const check = (cx, cy, r = 6) =>
  cir(cx, cy, r, { stroke: G.mute, sw: 1.2, fill: G.white }) +
  `<path d="M${cx - 2.6} ${cy} l1.8 1.9 3.4 -3.6" stroke="${G.body}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

// A real mouse pointer: classic arrow with a white keyline so it reads on any fill.
// Tip sits exactly at (x, y).
function cursor(x, y, scale = 1) {
  const d = 'M0 0 L0 15.2 L4.1 11.6 L6.7 17.2 L9.3 16 L6.7 10.5 L11.7 10.5 Z';
  return `<g transform="translate(${x},${y}) scale(${scale})">` +
    `<path d="${d}" fill="none" stroke="${G.white}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="${G.ink}" stroke="${G.ink}" stroke-width="0.6" stroke-linejoin="round"/>` +
    `</g>`;
}

function dots(x, y, w, h, step = 14) {
  let d = '';
  for (let gx = x + step; gx < x + w; gx += step)
    for (let gy = y + step; gy < y + h; gy += step) d += `M${gx} ${gy}h0.8`;
  return `<path d="${d}" stroke="${G.dot}" stroke-width="1" stroke-linecap="round"/>`;
}
function svg(body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"><title>${esc(title)}</title><rect width="${W}" height="${H}" fill="${G.white}"/>${body}<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="6" fill="none" stroke="${G.soft}"/></svg>\n`;
}

let UID = 0;
// The right sidebar is the top layer. Canvas content is clipped to the canvas
// region and the sidebar is painted last, so nodes always sit underneath it.
function clipCanvas(content) {
  const id = 'cc' + (++UID);
  return `<defs><clipPath id="${id}"><rect x="0" y="${TOP}" width="${SBX}" height="${H - TOP}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${content}</g>`;
}

// ---------- chrome ----------
function topBar(fid) {
  let s = box(0, 0, W, TOP, { r: 0, fill: G.white, stroke: 'none' }) + ln(0, TOP, W, TOP);
  s += box(10, 8, 18, 18, { r: 4, fill: G.fill });
  if (fid === 1) {
    s += bar(34, 14, 62, 6);
    s += bar(W - 190, 14, 54, 6);
    s += box(W - 122, 8, 20, 18, { r: 4, fill: G.white });
    s += box(W - 96, 8, 46, 18, { r: 4, fill: G.solid, stroke: G.solid });
    s += bar(W - 34, 14, 12, 6);
    return s;
  }
  s += `<path d="M22 17 l-5 0 M19.5 14.5 l-2.5 2.5 2.5 2.5" stroke="${G.body}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(34, 20, 'Test Workflow', { size: 10, weight: 700, fill: G.ink });
  if (fid === 3) {
    s += cir(W - 216, 17, 4.5, { stroke: G.mute });
    s += ln(W - 216, 17, W - 216, 14.5, { stroke: G.mute });
    s += t(W - 208, 20, 'Saved at 10:38AM', { size: 7.5, fill: G.mute });
  }
  s += box(W - 122, 8, 20, 18, { r: 4, fill: G.white });
  s += t(W - 112, 20, '…', { size: 9, anchor: 'middle', fill: G.body });
  s += box(W - 96, 8, 46, 18, { r: 4, fill: G.solid, stroke: G.solid });
  s += t(W - 73, 20, 'Publish', { size: 7.5, weight: 600, fill: G.white, anchor: 'middle' });
  s += t(W - 30, 20, '✕', { size: 8, anchor: 'middle', fill: G.body });
  return s;
}
function canvasBg(w = SBX) {
  return box(0, TOP, w, H - TOP, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, TOP, w, H - TOP);
}
function zoom(x = 14, y = H - 30) {
  let s = box(x, y, 18, 18, { r: 4, fill: G.white });
  s += cir(x + 8, y + 8, 3, { stroke: G.body }) + ln(x + 10.5, y + 10.5, x + 12.5, y + 12.5, { stroke: G.body });
  s += box(x + 24, y, 58, 18, { r: 4, fill: G.white });
  s += t(x + 33, y + 12, '−', { size: 9, fill: G.body });
  s += t(x + 53, y + 12, '100%', { size: 7, anchor: 'middle', fill: G.body });
  s += t(x + 71, y + 12, '+', { size: 9, fill: G.body });
  return s;
}
function nodeCard(x, y, title, sub, o = {}) {
  const w = o.w || 168, h = o.h || 40;
  let s = box(x, y, w, h, { r: 5, fill: G.white, stroke: o.stroke || G.line, sw: o.sw || 1 });
  s += iconSq(x + 8, y + (h - 18) / 2, 18);
  if (o.fid === 1) { s += bar(x + 32, y + h / 2 - 5, 62, 5); s += bar(x + 32, y + h / 2 + 3, 44, 4, { fill: G.soft }); return s; }
  s += t(x + 32, y + h / 2 - 1, title, { size: 8, weight: 600, fill: G.ink });
  if (sub) s += t(x + 32, y + h / 2 + 9, sub, { size: 6.8, fill: G.mute });
  return s;
}
function sidebarBg() {
  return box(SBX, TOP, SBW, H - TOP, { r: 0, fill: G.white, stroke: 'none' }) + ln(SBX, TOP, SBX, H);
}
function chevron(y = 96) {
  return cir(SBX, y, 8, { fill: G.white, stroke: G.line }) +
    `<path d="M${SBX - 2} ${y - 3.4} l3 3.4 -3 3.4" stroke="${G.body}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function tabs(y, active, opts = ['Setup', 'Conditions', 'Test'], o = {}) {
  let s = ln(SBX, y + 16, W, y + 16, { stroke: G.soft });
  const colW = SBW / opts.length;
  opts.forEach((o2, i) => {
    const cx = SBX + colW * i + colW / 2;
    const on = i === active;
    s += t(cx, y + 10, o2, { size: 7.6, weight: on ? 700 : 500, fill: on ? G.ink : G.mute, anchor: 'middle' });
    if (on) s += `<rect x="${SBX + colW * i + 10}" y="${y + 14.5}" width="${colW - 20}" height="2" rx="1" fill="${G.ink}"/>`;
  });
  if (o.warnOn != null) s += warn(SBX + colW * o.warnOn + colW / 2 + 22, y + 7, 4.5);
  return s;
}
function radioRow(x, y, w, title, sub, on, o = {}) {
  let s = box(x, y, w, 34, { r: 5, fill: G.white, stroke: on ? G.ink : G.line, sw: on ? 1.5 : 1 });
  s += cir(x + 14, y + 17, 5, { stroke: on ? G.ink : G.mute });
  if (on) s += cir(x + 14, y + 17, 2.4, { fill: G.ink, stroke: G.ink });
  if (o.fid === 1) { s += bar(x + 30, y + 12, 70, 5); s += bar(x + 30, y + 21, 100, 4, { fill: G.soft }); return s; }
  // Two-line rows stack title+sub around the centre; a title on its own has to be
  // centred on the radio, not left at the two-line baseline.
  const tx = x + 30;
  if (sub) {
    s += t(tx, y + 15, title, { size: 7.6, weight: 600, fill: G.ink });
    s += t(tx, y + 25, sub, { size: 6.4, fill: G.mute });
  } else {
    s += t(tx, y + 17 + 7.6 * 0.35, title, { size: 7.6, weight: 600, fill: G.ink });
  }
  return s;
}

// =====================================================================
// GROUP 1 — WORKFLOW CANVAS
// =====================================================================
const canvasV1 = (() => {
  // Low fidelity: the empty state and the docked trigger list both exist, but
  // nothing is named yet — placeholder bars stand in for copy.
  let c = canvasBg();
  c += box(256, 96, 168, 44, { r: 5, fill: G.fill, stroke: G.mute, dash: '4 3' });
  c += bar(304, 114, 72, 6);
  c += ln(340, 140, 340, 168, { stroke: G.line });
  c += box(256, 168, 168, 40, { r: 5, fill: G.fill, stroke: G.mute, dash: '4 3' });
  c += ln(340, 208, 340, 232, { stroke: G.line });
  c += cir(340, 248, 14, { fill: G.white, stroke: G.line });
  c += `<path d="M340 241 v14 M333 248 h14" stroke="${G.mute}" stroke-width="1.2" stroke-linecap="round"/>`;

  let sb = sidebarBg();
  sb += bar(SBX + 16, 50, 94, 6);
  sb += box(SBX + 16, 66, SBW - 32, 20, { r: 4, fill: G.fill, stroke: G.line });
  for (let i = 0; i < 7; i++) {
    const y = 96 + i * 40;
    sb += box(SBX + 16, y, SBW - 32, 34, { r: 5, fill: G.white });
    sb += box(SBX + 24, y + 8, 18, 18, { r: 4, fill: G.fill, stroke: G.line });
    sb += bar(SBX + 48, y + 11, 52, 5);
    sb += bar(SBX + 48, y + 21, 92, 4, { fill: G.soft });
  }
  return svg(topBar(1) + clipCanvas(c) + sb, 'Wireframe: Workflow Canvas v1 — low-fidelity empty state with a trigger drop zone and docked sidebar');
})();

const canvasV2 = (() => {
  // Medium fidelity: the drop zone gets a prompt and a floating "+", and the
  // sidebar rows get names — but no search, no descriptions, no drag affordance.
  let c = canvasBg();
  c += box(256, 96, 168, 54, { r: 5, fill: G.fill, stroke: G.mute, dash: '4 3' });
  c += t(340, 127, 'Drop a trigger here', { size: 7.6, fill: G.mute, anchor: 'middle' });
  c += ln(340, 150, 340, 178, { stroke: G.line });
  c += box(256, 178, 168, 40, { r: 5, fill: G.fill, stroke: G.mute, dash: '4 3' });
  c += ln(340, 218, 340, 242, { stroke: G.line });
  c += cir(340, 258, 14, { fill: G.white, stroke: G.line });
  c += `<path d="M340 251 v14 M333 258 h14" stroke="${G.body}" stroke-width="1.2" stroke-linecap="round"/>`;
  c += zoom();

  let sb = sidebarBg();
  sb += t(SBX + 16, 56, 'Add a workflow step', { size: 9, weight: 700, fill: G.ink });
  ['App Event', 'Webhook', 'Schedule', 'Forms', 'Workflow', 'Message', 'Alert'].forEach((r, i) => {
    const y = 76 + i * 40;
    sb += box(SBX + 16, y, SBW - 32, 34, { r: 5, fill: G.white });
    sb += iconSq(SBX + 24, y + 8, 18);
    sb += t(SBX + 48, y + 20, r, { size: 7.6, weight: 600, fill: G.ink });
  });
  return svg(topBar(2) + clipCanvas(c) + sb, 'Wireframe: Workflow Canvas v2 — dotted drop zone, floating add button and a named trigger list');
})();

const canvasV3 = (() => {
  // "V3: guided empty state with Add a Trigger prompt + sidebar auto-opens with trigger types."
  let c = canvasBg();
  c += box(256, 96, 168, 44, { r: 5, fill: G.fill, stroke: G.mute, dash: '4 3' });
  c += t(340, 116, 'Add a Trigger', { size: 8, weight: 600, fill: G.body, anchor: 'middle' });
  c += t(340, 127, 'Choose how this workflow starts', { size: 6.4, fill: G.mute, anchor: 'middle' });
  c += ln(340, 140, 340, 168, { stroke: G.line });
  c += box(256, 168, 168, 40, { r: 5, fill: G.fill, stroke: G.mute, dash: '4 3' });
  c += ln(340, 208, 340, 232, { stroke: G.line });
  c += cir(340, 248, 14, { fill: G.white, stroke: G.line });
  c += `<path d="M340 241 v14 M333 248 h14" stroke="${G.body}" stroke-width="1.2" stroke-linecap="round"/>`;
  // dragged card — sits fully inside the canvas, never crossing into the sidebar
  c += box(470, 104, 180, 34, { r: 5, fill: G.white, stroke: G.ink, sw: 1.4 });
  c += iconSq(478, 112, 18);
  c += t(502, 119, 'App Event', { size: 7.6, weight: 600, fill: G.ink });
  c += t(502, 129, 'Choose this to start your workflow', { size: 6, fill: G.mute });
  // pointer grabbing the card's lower-left edge, most of it below the card so it
  // reads as dragging rather than sitting on top of the label
  c += cursor(487, 133, 1.05);
  c += zoom();

  let sb = sidebarBg() + chevron(120);
  sb += t(SBX + 16, 56, 'Add a workflow step', { size: 9, weight: 700, fill: G.ink });
  sb += t(W - 16, 56, 'View All', { size: 7, weight: 600, fill: G.body, anchor: 'end' });
  sb += box(SBX + 16, 66, SBW - 32, 20, { r: 4, fill: G.white });
  sb += cir(SBX + 27, 76, 3, { stroke: G.mute }) + ln(SBX + 29.5, 78.5, SBX + 31.5, 80.5, { stroke: G.mute });
  sb += t(SBX + 37, 79, 'Find triggers', { size: 7, fill: G.mute });
  ['App Event', 'Webhook', 'Schedule', 'Forms', 'Workflow', 'Message', 'Alert'].forEach((r, i) => {
    const y = 96 + i * 40;
    sb += box(SBX + 16, y, SBW - 32, 34, { r: 5, fill: G.white });
    sb += iconSq(SBX + 24, y + 8, 18);
    sb += t(SBX + 48, y + 15, r, { size: 7.6, weight: 600, fill: G.ink });
    sb += t(SBX + 48, y + 25, 'Choose this to start your workflow', { size: 6, fill: G.mute });
  });
  return svg(topBar(3) + clipCanvas(c) + sb, 'Wireframe: Workflow Canvas v3 — guided empty state with auto-opened trigger sidebar');
})();

// =====================================================================
// GROUP 2 — SIDEBAR CONFIGURATION
// =====================================================================
const sideV1 = (() => {
  // "V1 had a flat settings panel that showed all options at once."
  let s = topBar(1) + canvasBg() + sidebarBg();
  s += nodeCard(256, 150, '', '', { fid: 1 });
  s += bar(SBX + 16, 48, 90, 6);
  for (let i = 0; i < 9; i++) {
    const y = 68 + i * 52;
    s += bar(SBX + 16, y, 54, 4, { fill: G.soft });
    s += box(SBX + 16, y + 10, SBW - 32, 24, { r: 4, fill: G.white });
  }
  return svg(s, 'Wireframe: Sidebar Configuration v1 — flat settings panel showing every option at once');
})();

const sideV2 = (() => {
  // "V2 introduced tabbed navigation (Setup, Conditions, Test)."
  let s = topBar(2) + canvasBg() + sidebarBg();
  s += nodeCard(256, 150, 'Send Message', 'Send email via Gmail');
  s += t(SBX + 16, 52, 'Step Settings', { size: 9, weight: 700, fill: G.ink });
  s += tabs(62, 0);
  s += t(SBX + 16, 100, 'Which event will start the workflow?', { size: 7.4, weight: 600, fill: G.ink });
  ['New Attachment', 'New Email', 'New Label'].forEach((r, i) => {
    s += radioRow(SBX + 16, 110 + i * 40, SBW - 32, r, '', i === 1);
  });
  s += t(SBX + 16, 248, 'Settings', { size: 7.4, weight: 600, fill: G.ink });
  for (let i = 0; i < 3; i++) {
    const y = 258 + i * 44;
    s += bar(SBX + 16, y, 46, 4, { fill: G.soft });
    s += box(SBX + 16, y + 8, SBW - 32, 22, { r: 4, fill: G.white });
  }
  return svg(s, 'Wireframe: Sidebar Configuration v2 — tabbed navigation for Setup, Conditions and Test');
})();

const sideV3 = (() => {
  // "V3: fully contextual sidebar + inline validation for required fields."
  let s = topBar(3) + canvasBg() + sidebarBg() + chevron(120);
  s += nodeCard(256, 150, 'Send Message', 'Send email via Gmail');
  s += iconSq(SBX + 16, 46, 24);
  s += t(SBX + 48, 56, 'Send Message', { size: 9, weight: 700, fill: G.ink });
  s += t(SBX + 48, 66, 'Send email via Gmail', { size: 6.6, fill: G.mute });
  s += tabs(78, 0, ['Setup', 'Conditions', 'Test'], { warnOn: 0 });
  s += t(SBX + 16, 114, 'Which event will start the workflow?', { size: 7.4, weight: 600, fill: G.ink });
  const evs = [['New Attachment', 'Triggers when you receive a new attachment'], ['New Email', 'Triggers when a new e-mail appears in mailbox.'], ['New Email Matching Search', 'Triggers when you receive a new email'], ['New Label', 'Triggers when you add a new label.']];
  evs.forEach((e, i) => { s += radioRow(SBX + 16, 124 + i * 40, SBW - 32, e[0], e[1], i === 1); });
  s += t(SBX + 16, 300, 'Fetch trigger events from…', { size: 7.4, weight: 600, fill: G.ink });
  s += cir(SBX + 21, 316, 4.5, { stroke: G.mute }) + t(SBX + 30, 319, 'All Forms', { size: 7, fill: G.body });
  s += cir(SBX + 92, 316, 4.5, { stroke: G.ink }) + cir(SBX + 92, 316, 2.2, { fill: G.ink, stroke: G.ink });
  s += t(SBX + 101, 319, 'Specific Forms', { size: 7, fill: G.body });
  // required field in error state — heavier stroke stands in for the red
  s += box(SBX + 16, 330, SBW - 32, 26, { r: 4, fill: G.white, stroke: G.ink, sw: 1.5 });
  s += t(SBX + 26, 346, 'Select Forms', { size: 7.4, fill: G.body });
  s += warn(W - 40, 343, 5);
  s += `<path d="M${W - 26} 341 l3 3 3 -3" stroke="${G.body}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(SBX + 16, 368, 'This is an error message.', { size: 6.8, weight: 600, fill: G.ink });
  s += t(SBX + 16, 392, 'Settings', { size: 7.4, weight: 600, fill: G.ink });
  for (let i = 0; i < 2; i++) {
    const y = 402 + i * 42;
    s += bar(SBX + 16, y, 46, 4, { fill: G.soft });
    s += box(SBX + 16, y + 8, SBW - 32, 22, { r: 4, fill: G.white });
  }
  s += zoom();
  return svg(s, 'Wireframe: Sidebar Configuration v3 — contextual sidebar with inline validation');
})();

// =====================================================================
// GROUP 3 — SPLIT PATH BUILDER
// =====================================================================
const splitV1 = (() => {
  // "V1 only supported linear workflows with no branching."
  let s = topBar(1) + canvasBg(W);
  let y = 90;
  for (let i = 0; i < 3; i++) {
    s += nodeCard(381, y, '', '', { fid: 1 });
    if (i < 2) s += ln(465, y + 40, 465, y + 76, { stroke: G.line });
    y += 76;
  }
  return svg(s, 'Wireframe: Split Path Builder v1 — linear workflow with no branching');
})();

const splitV2 = (() => {
  // "V2 introduced a basic conditional split with two paths."
  let s = topBar(2) + canvasBg() + sidebarBg();
  s += nodeCard(256, 70, 'Trigger Name', 'Message is received');
  s += ln(340, 110, 340, 140, { stroke: G.line });
  s += nodeCard(256, 140, 'Split Path', 'Condition based split');
  s += ln(340, 180, 340, 200, { stroke: G.line });
  s += `<path d="M210 226 v-16 q0 -10 10 -10 h240 q10 0 10 10 v16" fill="none" stroke="${G.line}"/>`;
  s += ln(340, 200, 340, 200);
  s += t(210, 240, 'Path 1', { size: 7, anchor: 'middle', fill: G.mute });
  s += t(470, 240, 'Path 2', { size: 7, anchor: 'middle', fill: G.mute });
  s += nodeCard(126, 254, 'Time Delay', 'Wait for 2 days');
  s += nodeCard(386, 254, 'Send Message', 'Send email');
  s += t(SBX + 16, 54, 'Split Path', { size: 9, weight: 700, fill: G.ink });
  s += t(SBX + 16, 80, 'How would you like to split?', { size: 7.4, weight: 600, fill: G.ink });
  s += radioRow(SBX + 16, 90, SBW - 32, 'Conditional Split', '', true);
  s += radioRow(SBX + 16, 130, SBW - 32, 'Percentage Split', '', false);
  s += t(SBX + 16, 190, 'Paths', { size: 7.4, weight: 600, fill: G.ink });
  s += box(SBX + 16, 200, SBW - 32, 30, { r: 5, fill: G.white });
  s += t(SBX + 26, 219, 'Path 1', { size: 7.4, weight: 600, fill: G.ink });
  s += box(SBX + 16, 238, SBW - 32, 30, { r: 5, fill: G.white });
  s += t(SBX + 26, 257, 'Path 2', { size: 7.4, weight: 600, fill: G.ink });
  s += zoom();
  return svg(s, 'Wireframe: Split Path Builder v2 — basic conditional split with two paths');
})();

const splitV3 = (() => {
  // Replica of bm-hifi-conditional-split.png
  let s = topBar(3) + canvasBg() + sidebarBg() + chevron(120);
  s += nodeCard(256, 62, 'Trigger Name', 'Message is received in Gmail');
  s += ln(340, 102, 340, 128, { stroke: G.line });
  s += nodeCard(256, 128, 'Send Message', 'Send email via Gmail');
  s += ln(340, 168, 340, 194, { stroke: G.line });
  s += nodeCard(256, 194, 'Split Path', 'Condition based split');
  s += ln(340, 234, 340, 252, { stroke: G.line });
  s += `<path d="M196 286 v-24 q0 -10 10 -10 h268 q10 0 10 10 v24" fill="none" stroke="${G.line}"/>`;
  s += box(174, 280, 44, 13, { r: 6, fill: G.fill, stroke: 'none' });
  s += t(196, 289, 'Path 1', { size: 6.6, anchor: 'middle', fill: G.body });
  s += box(462, 280, 44, 13, { r: 6, fill: G.fill, stroke: 'none' });
  s += t(484, 289, 'Path 2', { size: 6.6, anchor: 'middle', fill: G.body });
  s += ln(196, 293, 196, 322, { stroke: G.line });
  s += nodeCard(112, 322, 'Time Delay', 'Wait for 2 days');
  s += ln(196, 362, 196, 396, { stroke: G.line });
  s += nodeCard(112, 396, 'Video Recording', 'Start a new video recording');
  // Path 2 has no steps yet, so it ends in the add-node affordance rather than a
  // line that stops in empty space.
  s += ln(484, 293, 484, 326, { stroke: G.line });
  s += cir(484, 342, 14, { fill: G.white, stroke: G.line });
  s += `<path d="M484 335 v14 M477 342 h14" stroke="${G.body}" stroke-width="1.2" stroke-linecap="round"/>`;
  // sidebar
  s += iconSq(SBX + 16, 46, 24);
  s += t(SBX + 48, 56, 'Split Path', { size: 9, weight: 700, fill: G.ink });
  s += t(SBX + 48, 66, 'Condition Based Split', { size: 6.6, fill: G.mute });
  s += tabs(78, 0);
  s += t(SBX + 16, 114, 'How would you like to split the path?', { size: 7.4, weight: 600, fill: G.ink });
  s += radioRow(SBX + 16, 124, SBW - 32, 'Conditional Split', 'Split the path based on conditional logic.', true);
  s += radioRow(SBX + 16, 166, SBW - 32, 'Percentage Based Split', 'Split the path based on percentages.', false);
  s += t(SBX + 16, 222, 'Paths', { size: 8, weight: 700, fill: G.ink });
  s += t(SBX + 16, 240, 'First Check', { size: 7.2, weight: 600, fill: G.body });
  s += box(SBX + 16, 248, SBW - 32, 34, { r: 5, fill: G.white });
  s += t(SBX + 26, 262, 'Path 1', { size: 7.4, weight: 600, fill: G.ink });
  s += t(SBX + 26, 273, 'If sender contains 123, +4', { size: 6.2, fill: G.mute });
  s += `<path d="M${W - 26} 262 l3 3 -3 3" stroke="${G.mute}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(SBX + 16, 300, 'Then check', { size: 7.2, weight: 600, fill: G.body });
  s += box(SBX + 16, 308, SBW - 32, 34, { r: 5, fill: G.white });
  s += t(SBX + 26, 322, 'Path 2', { size: 7.4, weight: 600, fill: G.ink });
  s += t(SBX + 26, 333, 'Add Condition', { size: 6.2, weight: 600, fill: G.body });
  s += `<path d="M${W - 26} 322 l3 3 -3 3" stroke="${G.mute}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(SBX + 18, 366, '+', { size: 9, weight: 700, fill: G.ink });
  s += t(SBX + 30, 366, 'Add Path', { size: 7.6, weight: 700, fill: G.ink });
  s += box(SBX + 16, 392, 116, 16, { r: 3, fill: G.solid, stroke: G.solid });
  s += t(SBX + 24, 403, 'Merge paths to a single', { size: 5.8, fill: G.white });
  s += t(SBX + 16, 424, 'Single Endpoint', { size: 7.4, weight: 600, fill: G.ink });
  s += cir(SBX + 88, 421, 4.5, { stroke: G.mute });
  s += box(W - 46, 415, 30, 14, { r: 7, fill: G.solid, stroke: G.solid });
  s += cir(W - 24, 422, 5, { fill: G.white, stroke: G.white });
  s += zoom();
  return svg(s, 'Wireframe: Split Path Builder v3 — conditional and percentage splits with merge control');
})();

// =====================================================================
// GROUP 4 — TEST & PUBLISH
// =====================================================================
const testV1 = (() => {
  // "V1 had no testing at all, just a publish button."
  let s = topBar(1) + canvasBg(W);
  let y = 110;
  for (let i = 0; i < 3; i++) {
    s += nodeCard(381, y, '', '', { fid: 1 });
    if (i < 2) s += ln(465, y + 40, 465, y + 76, { stroke: G.line });
    y += 76;
  }
  return svg(s, 'Wireframe: Test and Publish v1 — no testing, publish button only');
})();

const testV2 = (() => {
  // "V2 added a basic run test that showed pass/fail as text."
  let s = topBar(2) + canvasBg(W);
  s += nodeCard(381, 110, 'Trigger Name', 'Message is received');
  s += ln(465, 150, 465, 176, { stroke: G.line });
  s += nodeCard(381, 176, 'Send Message', 'Send email');
  s += box(30, 60, 240, 96, { r: 6, fill: G.white, stroke: G.line });
  s += t(44, 80, 'Workflow Test', { size: 8.5, weight: 700, fill: G.ink });
  s += t(44, 100, 'Passed: 2 connections', { size: 7.2, fill: G.body });
  s += t(44, 114, 'Failed: 2 connections', { size: 7.2, fill: G.body });
  s += box(44, 126, 54, 18, { r: 4, fill: G.solid, stroke: G.solid });
  s += t(71, 138, 'Run Test', { size: 7, weight: 600, fill: G.white, anchor: 'middle' });
  s += zoom();
  return svg(s, 'Wireframe: Test and Publish v2 — basic run test with pass/fail as text');
})();

const testV3 = (() => {
  // Replica of bm-hifi-test-results.png
  let c = canvasBg();
  // test panel
  c += box(20, 56, 340, 220, { r: 6, fill: G.white, stroke: G.line });
  c += t(38, 78, 'Workflow Test', { size: 9.5, weight: 700, fill: G.ink });
  c += t(190, 100, 'Logic Test Results', { size: 8, weight: 600, fill: G.ink, anchor: 'middle' });
  c += t(190, 114, 'Logic Tests allow you to review any errors in your automation.', { size: 6.4, fill: G.mute, anchor: 'middle' });
  c += box(38, 128, 304, 44, { r: 5, fill: G.white });
  c += check(58, 150, 8);
  c += t(76, 147, '2 Passed Connections', { size: 7.6, weight: 700, fill: G.ink });
  c += t(76, 159, "Successful connections mean your workflow is on it's way.", { size: 6, fill: G.mute });
  c += `<path d="M326 148 l4 4 4 -4" stroke="${G.mute}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  c += box(38, 180, 304, 44, { r: 5, fill: G.white });
  c += warn(58, 202, 8);
  c += t(76, 199, '2 Failed Connections', { size: 7.6, weight: 700, fill: G.ink });
  c += t(76, 211, 'These failed connections need to be fixed.', { size: 6, fill: G.mute });
  c += `<path d="M326 200 l4 4 4 -4" stroke="${G.mute}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  c += box(130, 236, 62, 20, { r: 4, fill: G.solid, stroke: G.solid });
  c += t(161, 249, 'Test Again', { size: 7, weight: 600, fill: G.white, anchor: 'middle' });
  c += box(200, 236, 48, 20, { r: 4, fill: G.white });
  c += t(224, 249, 'Close', { size: 7, weight: 600, fill: G.body, anchor: 'middle' });
  // branch, pulled left so the right-hand node stays clear of the sidebar
  c += t(492, 74, '20%', { size: 6.6, fill: G.mute });
  c += nodeCard(400, 92, 'Save Data', 'Add a new category', { w: 170 });
  c += ln(485, 132, 485, 156, { stroke: G.line });
  c += nodeCard(400, 156, 'Condition', '2 or more settings applied', { w: 170 });
  c += ln(485, 196, 485, 248, { stroke: G.line });
  c += `<path d="M420 300 v-42 q0 -10 10 -10 h110 q10 0 10 10 v42" fill="none" stroke="${G.line}"/>`;
  c += t(420, 240, 'Yes', { size: 6.6, anchor: 'middle', fill: G.mute });
  c += t(560, 240, 'No', { size: 6.6, anchor: 'middle', fill: G.mute });
  // failed nodes — heavier black stroke stands in for the red error state
  c += warn(336, 320, 7);
  c += nodeCard(350, 300, 'Send Message', 'Send email via Gmail', { w: 140, stroke: G.ink, sw: 1.8 });
  c += warn(486, 320, 7);
  c += nodeCard(500, 300, 'Send Message', 'Send email via Gmail', { w: 140, stroke: G.ink, sw: 1.8 });
  c += cir(420, 372, 11, { fill: G.white, stroke: G.line });
  c += `<path d="M420 367 v10 M415 372 h10" stroke="${G.body}" stroke-width="1.1" stroke-linecap="round"/>`;
  c += cir(570, 372, 11, { fill: G.white, stroke: G.line });
  c += `<path d="M570 367 v10 M565 372 h10" stroke="${G.body}" stroke-width="1.1" stroke-linecap="round"/>`;
  c += zoom();

  let sb = sidebarBg() + chevron(120);
  sb += iconSq(SBX + 16, 46, 24);
  sb += t(SBX + 48, 56, 'Send Message', { size: 9, weight: 700, fill: G.ink });
  sb += t(SBX + 48, 66, 'Send email via Gmail', { size: 6.6, fill: G.mute });
  sb += tabs(78, 0, ['Setup', 'Conditions', 'Test'], { warnOn: 0 });
  sb += t(SBX + 16, 114, 'Which event will start the workflow?', { size: 7.4, weight: 600, fill: G.ink });
  [['New Attachment', 'Triggers when you receive a new attachment'], ['New Email', 'Triggers when a new e-mail appears in mailbox.'], ['New Label', 'Triggers when you add a new label.']]
    .forEach((e, i) => { sb += radioRow(SBX + 16, 124 + i * 40, SBW - 32, e[0], e[1], i === 1); });
  sb += box(SBX + 16, 252, SBW - 32, 26, { r: 4, fill: G.white, stroke: G.ink, sw: 1.5 });
  sb += t(SBX + 26, 268, 'Select Forms', { size: 7.4, fill: G.body });
  sb += warn(W - 40, 265, 5);
  sb += t(SBX + 16, 290, 'This is an error message.', { size: 6.8, weight: 600, fill: G.ink });
  return svg(topBar(3) + clipCanvas(c) + sb, 'Wireframe: Test and Publish v3 — expandable results per connection with error nodes highlighted');
})();


// =====================================================================
// GROUP 5 — MULTIPLE TRIGGERS  (src: "First action node with multiple triggers")
// =====================================================================
const trigV1 = (() => {
  let s = topBar(1) + canvasBg(W);
  s += nodeCard(381, 90, '', '', { fid: 1 });
  s += ln(465, 130, 465, 170, { stroke: G.line });
  s += nodeCard(381, 170, '', '', { fid: 1 });
  return svg(s, 'Wireframe: Multiple Triggers v1 — one trigger per workflow');
})();

const trigV2 = (() => {
  let s = topBar(2) + canvasBg(W);
  s += nodeCard(200, 80, 'Form Trigger', 'New form is submitted', { w: 160 });
  s += nodeCard(570, 80, 'Form Trigger', 'New form is submitted', { w: 160 });
  s += ln(280, 120, 280, 190, { stroke: G.line });
  s += ln(650, 120, 650, 190, { stroke: G.line });
  s += ln(280, 190, 650, 190, { stroke: G.line });
  s += ln(465, 190, 465, 224, { stroke: G.line });
  s += nodeCard(385, 224, 'Send Message', 'Send email via Gmail', { w: 160 });
  s += cir(465, 296, 13, { fill: G.white, stroke: G.line });
  s += `<path d="M465 290 v12 M459 296 h12" stroke="${G.body}" stroke-width="1.2" stroke-linecap="round"/>`;
  s += zoom();
  return svg(s, 'Wireframe: Multiple Triggers v2 — two triggers joined by straight connectors');
})();

const trigV3 = (() => {
  // five Form Triggers fanning into a single first action
  let s = topBar(3) + canvasBg(W);
  const cx = [98, 276, 454, 632, 810];
  cx.forEach((c) => { s += nodeCard(c - 80, 66, 'Form Trigger', 'New form is submitted', { w: 160 }); });
  cx.forEach((c) => {
    s += `<path d="M${c} 106 C ${c} 168, 454 176, 454 236" fill="none" stroke="${G.line}" stroke-width="1"/>`;
  });
  s += nodeCard(374, 236, 'Send Message', 'Send email via Gmail', { w: 160 });
  s += cir(454, 306, 13, { fill: G.white, stroke: G.line });
  s += `<path d="M454 300 v12 M448 306 h12" stroke="${G.body}" stroke-width="1.2" stroke-linecap="round"/>`;
  s += zoom();
  return svg(s, 'Wireframe: Multiple Triggers v3 — five triggers fanning into one action node');
})();

// =====================================================================
// GROUP 6 — ACCOUNT CONNECTION  (src: "Wireframe Option 4 Prototype 14")
// =====================================================================
const authV1 = (() => {
  let s = topBar(1) + canvasBg() + sidebarBg();
  s += nodeCard(256, 150, '', '', { fid: 1 });
  s += bar(SBX + 16, 50, 84, 6);
  s += bar(SBX + 16, 76, 60, 4, { fill: G.soft });
  s += box(SBX + 16, 86, SBW - 32, 24, { r: 4, fill: G.white });
  s += bar(SBX + 16, 126, 70, 4, { fill: G.soft });
  s += box(SBX + 16, 136, SBW - 32, 24, { r: 4, fill: G.white });
  s += box(SBX + 16, 180, 74, 20, { r: 4, fill: G.solid, stroke: G.solid });
  return svg(s, 'Wireframe: Account Connection v1 — authorize off-platform, no inline context');
})();

const authV2 = (() => {
  let s = topBar(2) + canvasBg() + sidebarBg();
  s += nodeCard(256, 150, 'Save Data', 'Add a new category');
  s += t(SBX + 16, 54, 'Save Data', { size: 9, weight: 700, fill: G.ink });
  s += tabs(64, 0);
  s += t(SBX + 16, 102, 'Connect your account', { size: 7.4, weight: 600, fill: G.ink });
  s += box(SBX + 16, 112, SBW - 32, 40, { r: 5, fill: G.white });
  s += iconSq(SBX + 26, 124, 18);
  s += t(SBX + 50, 136, 'Connect your Gmail', { size: 7, fill: G.body });
  s += box(SBX + 16, 164, 60, 20, { r: 4, fill: G.solid, stroke: G.solid });
  s += t(SBX + 46, 177, 'Connect', { size: 7, weight: 600, fill: G.white, anchor: 'middle' });
  return svg(s, 'Wireframe: Account Connection v2 — inline account row with a connect button');
})();

const authV3 = (() => {
  let c = canvasBg();
  c += nodeCard(256, 62, 'Form Trigger', 'New form is submitted');
  c += ln(340, 102, 340, 128, { stroke: G.line });
  c += nodeCard(256, 128, 'Save Data', 'Add a new category', { stroke: G.ink, sw: 1.8 });
  c += t(408, 152, '…', { size: 9, fill: G.body });
  c += ln(340, 168, 340, 194, { stroke: G.line });
  c += nodeCard(256, 194, 'App Event', 'Choose this to start your workflow');
  c += ln(340, 234, 340, 260, { stroke: G.line });
  c += nodeCard(256, 260, 'Save Data', 'Add a new category');
  c += ln(340, 300, 340, 326, { stroke: G.line });
  c += nodeCard(256, 326, 'Send Message', 'Send email via Gmail');
  c += cir(340, 392, 13, { fill: G.white, stroke: G.line });
  c += `<path d="M340 386 v12 M334 392 h12" stroke="${G.body}" stroke-width="1.2" stroke-linecap="round"/>`;
  c += zoom();

  // Sidebar laid out on a consistent rhythm: 40px row pitch (34 tall + 6 gap),
  // 26px between a section heading and its first row, 30px between sections.
  const L = SBX + 16, CW = SBW - 32;
  let sb = sidebarBg() + chevron(120);
  sb += iconSq(L, 46, 24);
  sb += t(L + 32, 56, 'Save Data', { size: 9, weight: 700, fill: G.ink });
  sb += t(L + 32, 66, 'Trigger short description here', { size: 6.4, fill: G.mute });
  sb += t(W - 16, 54, 'Back', { size: 7, weight: 600, fill: G.body, anchor: 'end' });
  sb += tabs(84, 0);
  sb += check(SBX + 62, 91, 4.5);

  sb += t(L, 124, 'Which event will start the workflow?', { size: 7.4, weight: 600, fill: G.ink });
  for (let i = 0; i < 5; i++) {
    sb += radioRow(L, 136 + i * 40, CW, 'Option 1', 'Short description here', i === 0);
  }

  sb += t(L, 362, 'Connect your account', { size: 7.4, weight: 600, fill: G.ink });
  sb += box(L, 374, CW, 44, { r: 5, fill: G.white });
  sb += iconSq(L + 12, 388, 18);
  sb += t(L + 38, 392, 'Connect your Gmail', { size: 6.8, weight: 600, fill: G.ink });
  sb += t(L + 38, 403, 'account', { size: 6.8, weight: 600, fill: G.ink });
  sb += box(W - 90, 386, 66, 20, { r: 4, fill: G.white, stroke: G.line });
  sb += t(W - 57, 399, '+  Connect', { size: 6.4, weight: 600, fill: G.ink, anchor: 'middle' });

  sb += t(L, 440, 'Gmail is a secure partner with Blend Metrics.', { size: 6, fill: G.mute });
  sb += t(L, 452, 'Your credentials are encrypted & can be', { size: 6, fill: G.mute });
  sb += t(L, 464, 'removed at any time.', { size: 6, fill: G.mute });
  return svg(topBar(3) + clipCanvas(c) + sb, 'Wireframe: Account Connection v3 — inline authorization with trust copy');
})();

// =====================================================================
// GROUP 7 — PATH NAMING & MERGE  (src: "Naming Paths - 9")
// =====================================================================
const nameV1 = (() => {
  let s = topBar(1) + canvasBg() + sidebarBg();
  s += nodeCard(256, 70, '', '', { fid: 1 });
  s += ln(340, 110, 340, 140, { stroke: G.line });
  s += `<path d="M220 176 v-20 q0 -10 10 -10 h220 q10 0 10 10 v20" fill="none" stroke="${G.line}"/>`;
  s += nodeCard(136, 176, '', '', { fid: 1 });
  s += nodeCard(376, 176, '', '', { fid: 1 });
  s += bar(SBX + 16, 50, 70, 6);
  for (let i = 0; i < 4; i++) s += box(SBX + 16, 70 + i * 40, SBW - 32, 30, { r: 4, fill: G.white });
  return svg(s, 'Wireframe: Path Naming and Merge v1 — unlabeled branches');
})();

const nameV2 = (() => {
  let s = topBar(2) + canvasBg() + sidebarBg();
  s += nodeCard(256, 62, 'Trigger Name', 'Message is received');
  s += ln(340, 102, 340, 128, { stroke: G.line });
  s += nodeCard(256, 128, 'Split Path', 'Condition based split');
  s += ln(340, 168, 340, 186, { stroke: G.line });
  s += `<path d="M220 220 v-24 q0 -10 10 -10 h220 q10 0 10 10 v24" fill="none" stroke="${G.line}"/>`;
  s += box(198, 214, 44, 13, { r: 6, fill: G.fill, stroke: 'none' });
  s += t(220, 223, 'Path 1', { size: 6.6, anchor: 'middle', fill: G.body });
  s += box(438, 214, 44, 13, { r: 6, fill: G.fill, stroke: 'none' });
  s += t(460, 223, 'Path 2', { size: 6.6, anchor: 'middle', fill: G.body });
  s += ln(220, 227, 220, 256, { stroke: G.line });
  s += nodeCard(136, 256, 'Time Delay', 'Wait for 2 days');
  s += ln(460, 227, 460, 256, { stroke: G.line });
  s += nodeCard(376, 256, 'Send Message', 'Send email');
  s += t(SBX + 16, 54, 'Split Path', { size: 9, weight: 700, fill: G.ink });
  s += t(SBX + 16, 80, 'Paths', { size: 7.4, weight: 600, fill: G.ink });
  s += box(SBX + 16, 90, SBW - 32, 30, { r: 5, fill: G.white });
  s += t(SBX + 26, 109, 'Path 1', { size: 7.4, weight: 600, fill: G.ink });
  s += box(SBX + 16, 128, SBW - 32, 30, { r: 5, fill: G.white });
  s += t(SBX + 26, 147, 'Path 2', { size: 7.4, weight: 600, fill: G.ink });
  s += zoom();
  return svg(s, 'Wireframe: Path Naming and Merge v2 — named Path 1 and Path 2 chips');
})();

const nameV3 = (() => {
  // Replica of "Naming Paths - 9": Path 1 / Path 2 / Other + dashed merge to a single endpoint
  let s = topBar(3) + canvasBg() + sidebarBg() + chevron(120);
  s += nodeCard(256, 62, 'Trigger Name', 'Message is received in Gmail');
  s += ln(340, 102, 340, 128, { stroke: G.line });
  s += nodeCard(256, 128, 'Split Path', 'Condition based split');
  s += ln(340, 168, 340, 184, { stroke: G.line });
  s += `<path d="M182 216 v-22 q0 -10 10 -10 h296 q10 0 10 10 v22" fill="none" stroke="${G.line}"/>`;
  s += `<path d="M390 216 v-32" fill="none" stroke="${G.line}" stroke-dasharray="3 3"/>`;
  s += `<path d="M498 216 v-22" fill="none" stroke="${G.line}" stroke-dasharray="3 3"/>`;
  [[182, 'Path 1'], [390, 'Path 2'], [498, 'Other']].forEach(([x, lab], i) => {
    s += box(x - 22, 210, 44, 13, { r: 6, fill: i === 2 ? G.soft : G.fill, stroke: 'none' });
    s += t(x, 219, lab, { size: 6.4, anchor: 'middle', fill: G.body });
  });
  s += ln(182, 223, 182, 250, { stroke: G.line });
  s += nodeCard(98, 250, 'Time Delay', 'Wait for 2 days');
  s += ln(182, 290, 182, 320, { stroke: G.line });
  s += nodeCard(98, 320, 'Video Recording', 'Start a new video recording');
  // dashed merge outline converging to a single endpoint
  s += `<path d="M182 360 v54 q0 10 10 10 h188 q10 0 10 -10 v-191" fill="none" stroke="${G.line}" stroke-dasharray="3 3"/>`;
  s += `<path d="M498 223 v182 q0 10 -10 10 h-98" fill="none" stroke="${G.line}" stroke-dasharray="3 3"/>`;
  s += ln(390, 424, 390, 448, { stroke: G.line });
  s += cir(390, 462, 13, { fill: G.white, stroke: G.line });
  s += `<path d="M390 456 v12 M384 462 h12" stroke="${G.body}" stroke-width="1.2" stroke-linecap="round"/>`;
  // sidebar
  s += iconSq(SBX + 16, 46, 24);
  s += t(SBX + 48, 56, 'Split Path', { size: 9, weight: 700, fill: G.ink });
  s += t(SBX + 48, 66, 'Condition Based Split', { size: 6.6, fill: G.mute });
  s += tabs(78, 0);
  s += t(SBX + 16, 114, 'How would you like to split the path?', { size: 7.4, weight: 600, fill: G.ink });
  s += radioRow(SBX + 16, 124, SBW - 32, 'Conditional Split', 'Split the path based on conditional logic.', true);
  s += radioRow(SBX + 16, 166, SBW - 32, 'Percentage Based Split', 'Split the path based on percentages.', false);
  s += t(SBX + 16, 222, 'Paths', { size: 8, weight: 700, fill: G.ink });
  s += t(SBX + 16, 240, 'First Check', { size: 7.2, weight: 600, fill: G.body });
  s += box(SBX + 16, 248, SBW - 32, 34, { r: 5, fill: G.white });
  s += t(SBX + 26, 262, 'Path 1', { size: 7.4, weight: 600, fill: G.ink });
  s += t(SBX + 26, 273, 'If sender contains 123, +4', { size: 6.2, fill: G.mute });
  s += t(SBX + 16, 300, 'Then check', { size: 7.2, weight: 600, fill: G.body });
  s += box(SBX + 16, 308, SBW - 32, 34, { r: 5, fill: G.white });
  s += t(SBX + 26, 322, 'Path 2', { size: 7.4, weight: 600, fill: G.ink });
  s += t(SBX + 26, 333, 'If sender contains 123, +4', { size: 6.2, fill: G.mute });
  s += t(SBX + 18, 366, '+', { size: 9, weight: 700, fill: G.ink });
  s += t(SBX + 30, 366, 'Add Path', { size: 7.6, weight: 700, fill: G.ink });
  s += box(SBX + 16, 392, 116, 16, { r: 3, fill: G.solid, stroke: G.solid });
  s += t(SBX + 24, 403, 'Merge paths to a single', { size: 5.8, fill: G.white });
  s += t(SBX + 16, 424, 'Single Endpoint', { size: 7.4, weight: 600, fill: G.ink });
  s += box(W - 46, 415, 30, 14, { r: 7, fill: G.solid, stroke: G.solid });
  s += cir(W - 24, 422, 5, { fill: G.white, stroke: G.white });
  s += zoom();
  return svg(s, 'Wireframe: Path Naming and Merge v3 — named paths, catch-all Other, merged endpoint');
})();

const files = {
  'bm-wf-canvas-v1.svg': canvasV1, 'bm-wf-canvas-v2.svg': canvasV2, 'bm-wf-canvas-v3.svg': canvasV3,
  'bm-wf-sidebar-v1.svg': sideV1, 'bm-wf-sidebar-v2.svg': sideV2, 'bm-wf-sidebar-v3.svg': sideV3,
  'bm-wf-split-v1.svg': splitV1, 'bm-wf-split-v2.svg': splitV2, 'bm-wf-split-v3.svg': splitV3,
  'bm-wf-test-v1.svg': testV1, 'bm-wf-test-v2.svg': testV2, 'bm-wf-test-v3.svg': testV3,
  'bm-wf-triggers-v1.svg': trigV1, 'bm-wf-triggers-v2.svg': trigV2, 'bm-wf-triggers-v3.svg': trigV3,
  'bm-wf-auth-v1.svg': authV1, 'bm-wf-auth-v2.svg': authV2, 'bm-wf-auth-v3.svg': authV3,
  'bm-wf-naming-v1.svg': nameV1, 'bm-wf-naming-v2.svg': nameV2, 'bm-wf-naming-v3.svg': nameV3,
};
mkdirSync(OUT, { recursive: true });
for (const [name, s] of Object.entries(files)) {
  writeFileSync(join(OUT, name), s);
  console.log(name.padEnd(24), (s.length / 1024).toFixed(1) + ' KB');
}
