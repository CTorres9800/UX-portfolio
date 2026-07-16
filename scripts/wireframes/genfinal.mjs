// High-fidelity grayscale wireframes for the Blend Metrics "Final Features" section.
// Style matches the existing final-feature treatment: real layout + real copy,
// black / white / gray only, gray blocks standing in for imagery, one dark accent
// reserved for the primary action.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2];
if (!OUT) throw new Error('usage: node genfinal.mjs <outDir>');

const G = {
  ink: '#111111', body: '#3F3F3F', mute: '#8C8C8C', faint: '#B4B4B4',
  line: '#DCDCDC', soft: '#EBEBEB', fill: '#F3F3F3', block: '#DEDEDE',
  canvas: '#FBFBFB', dot: '#DCDCDC', white: '#FFFFFF', solid: '#1C1C1C',
};
const F = 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let UID = 0;

const t = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${F}" font-size="${o.size || 12}" font-weight="${o.weight || 500}" fill="${o.fill || G.body}" text-anchor="${o.anchor || 'start'}">${esc(s)}</text>`;
const box = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 8}" fill="${o.fill || 'none'}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const ln = (x1, y1, x2, y2, o = {}) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1.2}" fill="none"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const cir = (cx, cy, r, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill || 'none'}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1.2}"/>`;
const appIcon = (x, y, s = 30) =>
  box(x, y, s, s, { r: 6, fill: G.white, stroke: G.line }) +
  box(x + s * 0.26, y + s * 0.26, s * 0.48, s * 0.48, { r: 2, fill: G.block, stroke: 'none' });
const chevD = (x, y, o = {}) => `<path d="M${x} ${y} l4 4.6 4 -4.6" stroke="${o.stroke || G.body}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const chevR = (x, y) => `<path d="M${x} ${y} l4.6 4.4 -4.6 4.4" stroke="${G.faint}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const warn = (cx, cy, r = 9) => cir(cx, cy, r, { stroke: G.ink, sw: 1.6, fill: G.white }) +
  `<path d="M${cx} ${cy - 4.4} v4.8 M${cx} ${cy + 3.4} v0.8" stroke="${G.ink}" stroke-width="1.6" stroke-linecap="round"/>`;
const check = (cx, cy, r = 9, o = {}) => cir(cx, cy, r, { stroke: o.stroke || G.body, sw: 1.6, fill: o.fill || G.white }) +
  `<path d="M${cx - 3.8} ${cy} l2.6 2.7 4.9 -5.2" stroke="${o.tick || G.ink}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const btn = (x, y, w, h, label, o = {}) =>
  box(x, y, w, h, { r: 7, fill: o.primary ? G.solid : G.white, stroke: o.primary ? G.solid : G.line }) +
  t(x + w / 2, y + h / 2 + 4.2, label, { size: o.size || 12, weight: 700, fill: o.primary ? G.white : G.ink, anchor: 'middle' });

function dots(x, y, w, h, step = 18) {
  let d = '';
  for (let gx = x + step; gx < x + w; gx += step)
    for (let gy = y + step; gy < y + h; gy += step) d += `M${gx} ${gy}h1`;
  return `<path d="${d}" stroke="${G.dot}" stroke-width="1.2" stroke-linecap="round"/>`;
}
function svg(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><title>${esc(title)}</title>` +
    `<rect width="${w}" height="${h}" fill="${G.white}"/>${body}` +
    `<rect x="0.6" y="0.6" width="${w - 1.2}" height="${h - 1.2}" rx="6" fill="none" stroke="${G.soft}"/></svg>\n`;
}

// ---------------- app chrome (1300-wide screens) ----------------
const W = 1300, TOP = 52, SBX = 960, SBW = W - SBX;
function topBar(o = {}) {
  let s = box(0, 0, W, TOP, { r: 0, fill: G.white, stroke: 'none' }) + ln(0, TOP, W, TOP);
  s += box(16, 12, 28, 28, { r: 6, fill: G.fill });
  s += `<path d="M34 26 l-8 0 M29 21 l-5 5 5 5" stroke="${G.body}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(56, 31, o.title || 'Test Workflow', { size: 14, weight: 700, fill: G.ink });
  s += cir(W - 268, 26, 6, { stroke: G.mute }) + ln(W - 268, 26, W - 268, 22, { stroke: G.mute });
  s += t(W - 256, 30, 'Saved at 10:38AM', { size: 11, fill: G.mute });
  s += box(W - 148, 12, 30, 28, { r: 6, fill: G.white });
  s += t(W - 133, 31, '…', { size: 13, anchor: 'middle', fill: G.body });
  s += btn(W - 108, 12, 62, 28, 'Publish', { primary: true, size: 11 });
  s += t(W - 26, 31, '✕', { size: 12, anchor: 'middle', fill: G.body });
  return s;
}
function canvasBg(h, w = SBX) {
  return box(0, TOP, w, h - TOP, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, TOP, w, h - TOP);
}
function clipCanvas(content, h) {
  const id = 'fc' + (++UID);
  return `<defs><clipPath id="${id}"><rect x="0" y="${TOP}" width="${SBX}" height="${h - TOP}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${content}</g>`;
}
function sidebarBg(h) {
  return box(SBX, TOP, SBW, h - TOP, { r: 0, fill: G.white, stroke: 'none' }) + ln(SBX, TOP, SBX, h);
}
function node(x, y, title, sub, o = {}) {
  const w = o.w || 240, h = 56;
  let s = box(x, y, w, h, { r: 8, fill: G.white, stroke: o.stroke || G.line, sw: o.sw || 1.2 });
  s += appIcon(x + 12, y + 13, 30);
  s += t(x + 54, y + 25, title, { size: 12.5, weight: 700, fill: G.ink });
  s += t(x + 54, y + 41, sub, { size: 10.5, fill: G.mute });
  if (o.menu) s += t(x + w - 18, y + 30, '…', { size: 12, anchor: 'middle', fill: G.faint });
  return s;
}
function zoomBar(y) {
  let s = box(20, y, 28, 28, { r: 6, fill: G.white });
  s += cir(34, y + 14, 5, { stroke: G.body }) + ln(37.5, y + 17.5, y ? 41 : 41, y + 21, { stroke: G.body, sw: 1.5 });
  s += box(56, y, 96, 28, { r: 6, fill: G.white });
  s += t(70, y + 19, '−', { size: 14, fill: G.body });
  s += t(104, y + 19, '100%', { size: 11, anchor: 'middle', fill: G.body });
  s += t(136, y + 19, '+', { size: 14, fill: G.body });
  return s;
}
function tabs(x, y, w, labels, active, warnIdx = []) {
  let s = ln(x, y + 18, x + w, y + 18, { stroke: G.soft });
  const cw = w / labels.length;
  labels.forEach((lab, i) => {
    const cx = x + cw * i + cw / 2;
    const on = i === active;
    s += t(cx, y + 12, lab, { size: 11.5, weight: on ? 700 : 500, fill: on ? G.ink : G.mute, anchor: 'middle' });
    if (warnIdx.includes(i)) s += warn(cx + lab.length * 3.6 + 12, y + 8, 5.5);
    if (on) s += `<rect x="${x + cw * i + 12}" y="${y + 16}" width="${cw - 24}" height="2.5" rx="1.2" fill="${G.ink}"/>`;
  });
  return s;
}
function radio(x, y, w, title, sub, on) {
  let s = box(x, y, w, 44, { r: 7, fill: G.white, stroke: on ? G.ink : G.line, sw: on ? 1.8 : 1.2 });
  s += cir(x + 18, y + 22, 7, { stroke: on ? G.ink : G.mute });
  if (on) s += cir(x + 18, y + 22, 3.4, { fill: G.ink, stroke: G.ink });
  s += t(x + 36, y + (sub ? 19 : 26), title, { size: 11.5, weight: 600, fill: G.ink });
  if (sub) s += t(x + 36, y + 33, sub, { size: 9.6, fill: G.mute });
  return s;
}

// =====================================================================
// 1. WORKFLOW CANVAS — 1300x860, dots both sides
// =====================================================================
const H1 = 960;   // tall enough that the four annotation cards fit within the image
const canvasScreen = (() => {
  let c = canvasBg(H1);
  c += node(360, 110, 'Form Trigger', 'New form is submitted');
  c += ln(480, 166, 480, 206, { stroke: G.line, sw: 1.4 });
  c += node(360, 206, 'Send Message', 'Send email via Gmail', { menu: true });
  c += ln(480, 262, 480, 302, { stroke: G.line, sw: 1.4 });
  c += node(360, 302, 'Split Path', 'Condition based split');
  c += ln(480, 358, 480, 382, { stroke: G.line, sw: 1.4 });
  c += `<path d="M300 448 v-46 q0 -12 12 -12 h336 q12 0 12 12 v46" fill="none" stroke="${G.line}" stroke-width="1.4"/>`;
  c += box(272, 440, 56, 18, { r: 9, fill: G.fill, stroke: 'none' });
  c += t(300, 453, 'Path 1', { size: 10, anchor: 'middle', fill: G.body });
  c += box(632, 440, 56, 18, { r: 9, fill: G.fill, stroke: 'none' });
  c += t(660, 453, 'Path 2', { size: 10, anchor: 'middle', fill: G.body });
  c += ln(300, 458, 300, 494, { stroke: G.line, sw: 1.4 });
  c += node(180, 494, 'Time Delay', 'Wait for 2 days');
  c += ln(660, 458, 660, 494, { stroke: G.line, sw: 1.4 });
  c += node(540, 494, 'Video Recording', 'Start a new recording');
  c += ln(300, 550, 300, 586, { stroke: G.line, sw: 1.4 });
  c += cir(300, 604, 18, { fill: G.white, stroke: G.line });
  c += `<path d="M300 595 v18 M291 604 h18" stroke="${G.body}" stroke-width="1.5" stroke-linecap="round"/>`;
  c += zoomBar(H1 - 48);

  let sb = sidebarBg(H1);
  sb += cir(SBX, 150, 12, { fill: G.white, stroke: G.line });
  sb += `<path d="M${SBX - 3} 145 l4.5 5 -4.5 5" stroke="${G.body}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  sb += appIcon(SBX + 24, 72, 38);
  sb += t(SBX + 74, 88, 'Send Message', { size: 13.5, weight: 700, fill: G.ink });
  sb += t(SBX + 74, 104, 'Send email via Gmail', { size: 10, fill: G.mute });
  sb += tabs(SBX + 16, 128, SBW - 32, ['Setup', 'Conditions', 'Test'], 0);
  sb += t(SBX + 24, 180, 'Which event will start the workflow?', { size: 11.5, weight: 700, fill: G.ink });
  [['New Attachment', 'Triggers when you receive a new attachment', false],
   ['New Email', 'Triggers when a new e-mail appears in mailbox', true],
   ['New Label', 'Triggers when you add a new label', false]].forEach((r, i) => {
    sb += radio(SBX + 24, 194 + i * 54, SBW - 48, r[0], r[1], r[2]);
  });
  sb += t(SBX + 24, 380, 'Fetch trigger events from…', { size: 11.5, weight: 700, fill: G.ink });
  sb += cir(SBX + 30, 398, 6, { stroke: G.mute }); sb += t(SBX + 42, 402, 'All Forms', { size: 10.5 });
  sb += cir(SBX + 122, 398, 6, { stroke: G.ink }); sb += cir(SBX + 122, 398, 3, { fill: G.ink, stroke: G.ink });
  sb += t(SBX + 134, 402, 'Specific Forms', { size: 10.5 });
  sb += box(SBX + 24, 414, SBW - 48, 34, { r: 6, fill: G.white });
  sb += t(SBX + 36, 435, 'Select Forms', { size: 11, fill: G.body }); sb += chevD(SBX + SBW - 46, 427);
  sb += t(SBX + 24, 476, 'Settings', { size: 11.5, weight: 700, fill: G.ink });
  for (let i = 0; i < 3; i++) {
    sb += box(SBX + 24, 488 + i * 52, SBW - 48, 34, { r: 6, fill: G.white });
    sb += box(SBX + 36, 500 + i * 52, 70, 8, { r: 4, fill: G.block, stroke: 'none' });
  }
  return svg(W, H1, topBar() + clipCanvas(c, H1) + sb, 'Final feature: Workflow Canvas — drag-and-drop builder with contextual sidebar');
})();

// =====================================================================
// 2. TRIGGER & ACTION SETUP — 900x1240 sidebar panel, 3 dots left
// =====================================================================
const trigSetup = (() => {
  // 900x1240 was 0.73 w/h. Real sidebars sit near 0.5-0.6: the condition builder
  // panel is 0.60, the trigger setup 0.51, our component wireframes 0.49. 740
  // gives 0.60 — narrow enough to read as a sidebar, design otherwise untouched.
  const PW = 740, PH = 1240;
  let s = box(24, 24, PW - 48, PH - 48, { r: 12, fill: G.white, stroke: G.line });
  const X = 60, R = PW - 60;
  s += `<path d="M${X + 10} 76 l-10 0 M${X + 4} 70 l-6 6 6 6" stroke="${G.body}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(X + 24, 81, 'Back to Trigger Types', { size: 12.5, weight: 700, fill: G.body });
  s += t(X, 128, 'When this happens…', { size: 19, weight: 700, fill: G.ink });
  s += box(X, 148, R - X, 56, { r: 8, fill: G.white });
  s += appIcon(X + 14, 161, 30);
  s += t(X + 58, 182, 'Forms Trigger', { size: 13.5, weight: 700, fill: G.ink });
  s += t(R - 20, 182, '✕', { size: 12, anchor: 'middle', fill: G.body });
  // Final design has three tabs. The four-tab version (with Filters) was the v1
  // wireframe — Filters was dropped before ship, and every hi-fi screen shows three.
  s += tabs(X, 232, R - X, ['Setup', 'Conditions', 'Test'], 0);
  s += t(X, 292, 'Choose a Trigger Event', { size: 14, weight: 700, fill: G.ink });
  const events = [
    ['New Form Submission', 'Triggers when a user submits a new form', true],
    ['Partial Form Submission', 'Triggers when a user saves a partially completed form', false],
    ['Form Deadline Reached', 'Triggers when a form submission deadline is reached', false],
    ['Abandoned Form', 'Triggers when a user starts a form but abandons it', false],
    ['Updated Form', 'Triggers when a user modifies an existing form', false],
    ['Form Approval', 'Triggers when a user approves or rejects a submission', false],
  ];
  events.forEach(([a, b, on], i) => { s += radio(X, 310 + i * 62, R - X, a, b, on); });
  // required field + account connection
  s += t(X, 718, 'Choose Form', { size: 11.5, weight: 700, fill: G.ink });
  s += t(X + 82, 718, '*required', { size: 10, fill: G.mute });
  s += box(X, 730, R - X, 44, { r: 7, fill: G.white });
  s += t(X + 14, 757, 'Select a form', { size: 12, fill: G.mute }); s += chevD(R - 30, 748);
  s += t(X, 812, 'Connect your account', { size: 14, weight: 700, fill: G.ink });
  s += box(X, 830, R - X, 64, { r: 8, fill: G.white });
  s += appIcon(X + 16, 847, 30);
  s += t(X + 60, 858, 'Connect your Gmail account', { size: 12.5, weight: 700, fill: G.ink });
  s += t(X + 60, 876, 'Not connected', { size: 10.5, fill: G.mute });
  s += btn(R - 116, 847, 96, 30, '+  Connect');
  s += t(X, 926, 'Gmail is a secure partner with Blend Metrics. Your credentials are', { size: 10.5, fill: G.mute });
  s += t(X, 944, 'encrypted and can be removed at any time.', { size: 10.5, fill: G.mute });
  s += ln(X, 986, R, 986, { stroke: G.soft });
  s += t(X, 1020, 'Setup', { size: 11.5, weight: 700, fill: G.ink });
  s += check(X + 52, 1016, 6, { tick: G.body });
  for (let i = 0; i < 2; i++) {
    s += box(X, 1036 + i * 60, R - X, 44, { r: 7, fill: G.white });
    s += box(X + 14, 1052 + i * 60, 90, 10, { r: 5, fill: G.block, stroke: 'none' });
  }
  s += btn(R - 116, 1160, 96, 34, 'Continue', { primary: true });
  return svg(PW, PH, s, 'Final feature: Trigger and Action Setup — event selection, required fields and account connection');
})();

// =====================================================================
// 3. SPLIT PATH CONFIGURATION — 1300x820, 2 dots right
// =====================================================================
const H3 = 820;
const splitScreen = (() => {
  let c = canvasBg(H3);
  c += node(360, 106, 'Trigger Name', 'Message is received in Gmail');
  c += ln(480, 162, 480, 198, { stroke: G.line, sw: 1.4 });
  c += node(360, 198, 'Split Path', 'Condition based split', { stroke: G.ink, sw: 1.8 });
  c += ln(480, 254, 480, 282, { stroke: G.line, sw: 1.4 });
  c += `<path d="M280 348 v-50 q0 -12 12 -12 h376 q12 0 12 12 v50" fill="none" stroke="${G.line}" stroke-width="1.4"/>`;
  [[280, 'Path 1'], [480, 'Path 2'], [680, 'Other']].forEach(([x, lab], i) => {
    c += box(x - 30, 340, 60, 18, { r: 9, fill: i === 2 ? G.soft : G.fill, stroke: 'none' });
    c += t(x, 353, lab, { size: 10, anchor: 'middle', fill: G.body });
  });
  c += ln(480, 286, 480, 340, { stroke: G.line, dash: '4 4' });
  c += ln(280, 358, 280, 400, { stroke: G.line, sw: 1.4 });
  c += node(160, 400, 'Time Delay', 'Wait for 2 days');
  c += t(300, 392, 'If sender contains 123, +4', { size: 9.6, fill: G.mute });
  c += ln(480, 358, 480, 400, { stroke: G.line, dash: '4 4' });
  c += ln(680, 358, 680, 400, { stroke: G.line, dash: '4 4' });
  c += zoomBar(H3 - 48);

  let sb = sidebarBg(H3);
  sb += appIcon(SBX + 24, 72, 38);
  sb += t(SBX + 74, 88, 'Split Path', { size: 13.5, weight: 700, fill: G.ink });
  sb += t(SBX + 74, 104, 'Condition Based Split', { size: 10, fill: G.mute });
  sb += tabs(SBX + 16, 128, SBW - 32, ['Setup', 'Conditions', 'Test'], 0);
  sb += t(SBX + 24, 180, 'How would you like to split the path?', { size: 11.5, weight: 700, fill: G.ink });
  sb += radio(SBX + 24, 194, SBW - 48, 'Conditional Split', 'Split the path based on conditional logic', true);
  sb += radio(SBX + 24, 248, SBW - 48, 'Percentage Based Split', 'Split the path based on percentages', false);
  sb += t(SBX + 24, 328, 'Paths', { size: 12.5, weight: 700, fill: G.ink });
  sb += t(SBX + 24, 350, 'First Check', { size: 11, weight: 600, fill: G.body });
  sb += box(SBX + 24, 360, SBW - 48, 48, { r: 7, fill: G.white });
  sb += t(SBX + 36, 380, 'Path 1', { size: 11.5, weight: 700, fill: G.ink });
  sb += t(SBX + 36, 396, 'If sender contains 123, +4', { size: 9.6, fill: G.mute });
  sb += chevR(SBX + SBW - 42, 380);
  sb += t(SBX + 24, 430, 'Then check', { size: 11, weight: 600, fill: G.body });
  sb += box(SBX + 24, 440, SBW - 48, 48, { r: 7, fill: G.white });
  sb += t(SBX + 36, 460, 'Path 2', { size: 11.5, weight: 700, fill: G.ink });
  sb += t(SBX + 36, 476, 'Add Condition', { size: 9.6, weight: 600, fill: G.body });
  sb += chevR(SBX + SBW - 42, 460);
  // AND/OR builder detail
  sb += box(SBX + 24, 502, SBW - 48, 72, { r: 8, fill: G.fill, stroke: G.soft });
  sb += box(SBX + 36, 512, 120, 26, { r: 6, fill: G.white });
  sb += t(SBX + 46, 529, 'Id contains', { size: 10, weight: 700, fill: G.ink });
  sb += box(SBX + 36, 544, 46, 24, { r: 6, fill: G.white });
  sb += t(SBX + 46, 560, 'OR', { size: 9.6, weight: 700, fill: G.ink }); sb += chevD(SBX + 68, 552);
  sb += box(SBX + 90, 544, 120, 24, { r: 6, fill: G.white });
  sb += t(SBX + 100, 560, 'Id contains', { size: 10, weight: 700, fill: G.ink });
  sb += t(SBX + 24, 600, '+', { size: 14, weight: 700, fill: G.ink });
  sb += t(SBX + 38, 600, 'Add Condition', { size: 11.5, weight: 700, fill: G.ink });
  sb += t(SBX + 24, 640, 'Single Endpoint', { size: 11.5, weight: 700, fill: G.ink });
  sb += box(SBX + SBW - 66, 630, 40, 20, { r: 10, fill: G.solid, stroke: G.solid });
  sb += cir(SBX + SBW - 36, 640, 7, { fill: G.white, stroke: G.white });
  return svg(W, H3, topBar() + clipCanvas(c, H3) + sb, 'Final feature: Split Path Configuration — conditional and percentage routing with an AND/OR builder');
})();

// =====================================================================
// 4. TESTING & VALIDATION — 1300x860, 2 dots left
// =====================================================================
const H4 = 860;
const testScreen = (() => {
  let c = canvasBg(H4);
  c += box(28, 80, 420, 292, { r: 10, fill: G.white, stroke: G.line });
  c += t(52, 110, 'Workflow Test', { size: 14, weight: 700, fill: G.ink });
  c += t(238, 140, 'Logic Test Results', { size: 12, weight: 700, fill: G.ink, anchor: 'middle' });
  c += t(238, 158, 'Logic Tests allow you to review any errors in your automation.', { size: 10, fill: G.mute, anchor: 'middle' });
  c += box(52, 176, 372, 58, { r: 8, fill: G.white });
  c += check(78, 205, 11);
  c += t(102, 200, '2 Passed Connections', { size: 12, weight: 700, fill: G.ink });
  c += t(102, 217, "Successful connections mean your workflow is on it's way.", { size: 9.6, fill: G.mute });
  c += chevD(398, 200);
  c += box(52, 244, 372, 58, { r: 8, fill: G.white });
  c += warn(78, 273, 11);
  c += t(102, 268, '2 Failed Connections', { size: 12, weight: 700, fill: G.ink });
  c += t(102, 285, 'These failed connections need to be fixed.', { size: 9.6, fill: G.mute });
  c += chevD(398, 268);
  c += btn(180, 320, 92, 32, 'Test Again', { primary: true, size: 11 });
  c += btn(284, 320, 72, 32, 'Close', { size: 11 });
  // canvas with error nodes
  c += node(560, 100, 'Save Data', 'Add a new category');
  c += ln(680, 156, 680, 192, { stroke: G.line, sw: 1.4 });
  c += node(560, 192, 'Condition', '2 or more settings applied');
  c += ln(680, 248, 680, 286, { stroke: G.line, sw: 1.4 });
  c += `<path d="M580 352 v-46 q0 -12 12 -12 h176 q12 0 12 12 v46" fill="none" stroke="${G.line}" stroke-width="1.4"/>`;
  c += t(580, 344, 'Yes', { size: 10, anchor: 'middle', fill: G.mute });
  c += t(780, 344, 'No', { size: 10, anchor: 'middle', fill: G.mute });
  c += warn(546, 380, 10);
  c += node(560, 352, 'Send Message', 'Send email via Gmail', { w: 200, stroke: G.ink, sw: 2.2, menu: true });
  c += ln(660, 408, 660, 440, { stroke: G.line, sw: 1.4 });
  c += cir(660, 458, 16, { fill: G.white, stroke: G.line });
  c += `<path d="M660 450 v16 M652 458 h16" stroke="${G.body}" stroke-width="1.4" stroke-linecap="round"/>`;
  c += zoomBar(H4 - 48);

  let sb = sidebarBg(H4);
  sb += appIcon(SBX + 24, 72, 38);
  sb += t(SBX + 74, 88, 'Send Message', { size: 13.5, weight: 700, fill: G.ink });
  sb += t(SBX + 74, 104, 'Send email via Gmail', { size: 10, fill: G.mute });
  sb += tabs(SBX + 16, 128, SBW - 32, ['Setup', 'Conditions', 'Test'], 0, [0]);
  sb += t(SBX + 24, 180, 'Which event will start the workflow?', { size: 11.5, weight: 700, fill: G.ink });
  [['New Attachment', 'Triggers when you receive a new attachment', false],
   ['New Email', 'Triggers when a new e-mail appears in mailbox', true]].forEach((r, i) => {
    sb += radio(SBX + 24, 194 + i * 54, SBW - 48, r[0], r[1], r[2]);
  });
  sb += box(SBX + 24, 312, SBW - 48, 40, { r: 7, fill: G.white, stroke: G.ink, sw: 2 });
  sb += t(SBX + 36, 337, 'Select Forms', { size: 11.5, fill: G.body });
  sb += warn(SBX + SBW - 58, 332, 7); sb += chevD(SBX + SBW - 40, 328);
  sb += t(SBX + 24, 372, 'This is an error message.', { size: 10.5, weight: 700, fill: G.ink });
  sb += t(SBX + 24, 412, 'Settings', { size: 11.5, weight: 700, fill: G.ink });
  for (let i = 0; i < 2; i++) {
    sb += box(SBX + 24, 424 + i * 52, SBW - 48, 34, { r: 6, fill: G.white });
    sb += box(SBX + 36, 436 + i * 52, 76, 8, { r: 4, fill: G.block, stroke: 'none' });
  }
  return svg(W, H4, topBar() + clipCanvas(c, H4) + sb, 'Final feature: Testing and Validation — test results panel with error nodes highlighted on the canvas');
})();

// =====================================================================
// 5. PUBLISH & CONFIRMATION — 1300x700, 2 dots right
// =====================================================================
const publishScreen = (() => {
  const H = 700;
  let s = box(0, 0, W, H, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, 0, W, H);
  // confirmation modal
  s += box(80, 150, 520, 300, { r: 12, fill: G.white, stroke: G.line });
  s += t(120, 208, 'Publish this workflow?', { size: 19, weight: 700, fill: G.ink });
  s += t(560, 200, '✕', { size: 13, anchor: 'middle', fill: G.body });
  s += t(120, 246, 'This workflow will go live and become available to', { size: 12.5, fill: G.body });
  s += t(120, 268, 'your users. You can pause or unpublish it at any time', { size: 12.5, fill: G.body });
  s += t(120, 290, 'from the dashboard.', { size: 12.5, fill: G.body });
  s += box(120, 318, 440, 56, { r: 8, fill: G.fill, stroke: G.soft });
  s += appIcon(136, 331, 30);
  s += t(178, 344, 'Test Workflow', { size: 12, weight: 700, fill: G.ink });
  s += t(178, 361, '4 steps · all connections passing', { size: 10, fill: G.mute });
  s += btn(120, 394, 96, 36, 'Cancel');
  s += btn(228, 394, 128, 36, 'Yes, publish', { primary: true });
  // success state
  s += box(700, 150, 520, 300, { r: 12, fill: G.white, stroke: G.line });
  s += check(960, 216, 24, { fill: G.fill, stroke: G.body });
  s += t(960, 268, 'Congratulations!', { size: 19, weight: 700, fill: G.ink, anchor: 'middle' });
  s += t(960, 294, 'Your workflow is now live.', { size: 12.5, fill: G.body, anchor: 'middle' });
  s += t(960, 316, 'It will start running the next time the trigger fires.', { size: 11.5, fill: G.mute, anchor: 'middle' });
  s += btn(760, 358, 190, 40, 'Go To Dashboard');
  s += btn(970, 358, 190, 40, 'Keep Working', { primary: true });
  s += t(960, 426, 'Published at 10:41AM', { size: 10, fill: G.faint, anchor: 'middle' });
  s += t(340, 500, 'Step 1 — confirm intent', { size: 11, weight: 700, fill: G.mute, anchor: 'middle' });
  s += t(960, 500, 'Step 2 — success + next step', { size: 11, weight: 700, fill: G.mute, anchor: 'middle' });
  return svg(W, H, s, 'Final feature: Publish and Confirmation — two-step publish with a success state');
})();

// =====================================================================
// 6. AUTHORIZATION & ACCOUNT CONNECTION — 1300x560, 1 dot left
// =====================================================================
const authScreen = (() => {
  const H = 560;
  let s = box(0, 0, W, H, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, 0, W, H);
  const cards = [
    ['Username & Password', ['Username', 'Password']],
    ['Email & API Key', ['Email address', 'API key']],
  ];
  cards.forEach(([title, fields], i) => {
    const x = 40 + i * 420;
    s += box(x, 60, 380, 440, { r: 12, fill: G.white, stroke: G.line });
    s += appIcon(x + 28, 92, 34);
    s += t(x + 28, 156, title, { size: 15, weight: 700, fill: G.ink });
    s += t(x + 28, 178, 'Authorize Blend Metrics to access your account.', { size: 10.5, fill: G.mute });
    fields.forEach((f, j) => {
      s += t(x + 28, 218 + j * 74, f, { size: 11, weight: 600, fill: G.body });
      s += box(x + 28, 228 + j * 74, 324, 42, { r: 7, fill: G.white });
      s += t(x + 42, 255 + j * 74, `Enter ${f.toLowerCase()}`, { size: 11, fill: G.faint });
    });
    s += btn(x + 28, 372, 324, 42, 'Connect', { primary: true });
    s += t(x + 28, 442, 'Credentials are encrypted and can be', { size: 9.6, fill: G.mute });
    s += t(x + 28, 458, 'removed at any time.', { size: 9.6, fill: G.mute });
  });
  // google account picker
  const x = 880;
  s += box(x, 60, 380, 440, { r: 12, fill: G.white, stroke: G.line });
  s += appIcon(x + 28, 92, 34);
  s += t(x + 28, 156, 'Google Account Picker', { size: 15, weight: 700, fill: G.ink });
  s += t(x + 28, 178, 'Choose an account to continue to Blend Metrics.', { size: 10.5, fill: G.mute });
  ['chris@marketeqdigital.com', 'christopher@gmail.com'].forEach((acct, j) => {
    s += box(x + 28, 202 + j * 66, 324, 54, { r: 8, fill: G.white });
    s += cir(x + 52, 229 + j * 66, 13, { fill: G.block, stroke: 'none' });
    s += t(x + 76, 234 + j * 66, acct, { size: 11, weight: 600, fill: G.ink });
  });
  s += box(x + 28, 334, 324, 54, { r: 8, fill: G.white, stroke: G.line, dash: '5 4' });
  s += t(x + 52, 366, '+   Use another account', { size: 11, weight: 600, fill: G.body });
  s += t(x + 28, 424, 'Blend Metrics will receive your name, email', { size: 9.6, fill: G.mute });
  s += t(x + 28, 440, 'address and profile picture.', { size: 9.6, fill: G.mute });
  s += t(x + 28, 466, 'Manage connected accounts', { size: 10, weight: 700, fill: G.ink });
  return svg(W, H, s, 'Final feature: Authorization — username/password, API key and Google OAuth account picker');
})();

// =====================================================================
// 7. WORKFLOW MANAGEMENT — 1300x820, 2 dots right
// =====================================================================
const manageScreen = (() => {
  const H = 820;
  let s = box(0, 0, W, H, { r: 0, fill: G.white, stroke: 'none' });
  s += box(0, 0, W, 60, { r: 0, fill: G.white, stroke: 'none' }) + ln(0, 60, W, 60);
  s += t(32, 37, 'Workflows', { size: 17, weight: 700, fill: G.ink });
  s += box(300, 16, 280, 30, { r: 6, fill: G.white });
  s += cir(320, 31, 5, { stroke: G.mute }) + ln(324, 35, 327, 38, { stroke: G.mute, sw: 1.4 });
  s += t(336, 35, 'Search workflows', { size: 11, fill: G.faint });
  s += box(596, 16, 100, 30, { r: 6, fill: G.white }); s += t(612, 35, 'All status', { size: 11, fill: G.body }); s += chevD(672, 26);
  s += box(708, 16, 96, 30, { r: 6, fill: G.white }); s += t(724, 35, 'Sort: Date', { size: 11, fill: G.body }); s += chevD(784, 26);
  s += btn(W - 152, 15, 120, 32, '+  New Workflow', { primary: true, size: 11 });
  // table header
  s += t(32, 92, 'Name', { size: 10.5, weight: 700, fill: G.mute });
  s += t(560, 92, 'Status', { size: 10.5, weight: 700, fill: G.mute });
  s += t(700, 92, 'Steps', { size: 10.5, weight: 700, fill: G.mute });
  s += t(820, 92, 'Last edited', { size: 10.5, weight: 700, fill: G.mute });
  s += ln(32, 104, W - 32, 104, { stroke: G.soft });
  const rows = [
    ['Test Workflow', 'Live', '4', '2 minutes ago'],
    ['Lead routing — inbound', 'Live', '7', 'Yesterday'],
    ['Weekly digest', 'Paused', '3', '3 days ago'],
    ['Onboarding sequence', 'Draft', '5', 'Last week'],
    ['Churn alert', 'Live', '6', 'Last week'],
  ];
  rows.forEach(([name, status, steps, edited], i) => {
    const y = 118 + i * 62;
    s += box(32, y, W - 64, 54, { r: 8, fill: i === 2 ? G.fill : G.white });
    s += appIcon(48, y + 12, 30);
    s += t(92, y + 26, name, { size: 12.5, weight: 700, fill: G.ink });
    s += t(92, y + 42, 'Form Trigger · Send Message · Split Path', { size: 9.6, fill: G.mute });
    const sw = status === 'Live' ? G.solid : G.white;
    s += box(560, y + 17, 60, 22, { r: 11, fill: status === 'Live' ? G.solid : G.fill, stroke: status === 'Live' ? G.solid : G.line });
    s += t(590, y + 32, status, { size: 9.6, weight: 700, fill: status === 'Live' ? G.white : G.body, anchor: 'middle' });
    s += t(700, y + 32, steps, { size: 11.5, fill: G.body });
    s += t(820, y + 32, edited, { size: 11, fill: G.mute });
    s += t(W - 56, y + 32, '…', { size: 14, anchor: 'middle', fill: G.body });
  });
  // context menu on row 3
  const mx = W - 250, my = 246;
  s += box(mx, my, 210, 218, { r: 10, fill: G.white, stroke: G.line });
  ['Rename', 'Duplicate', 'Pause workflow', 'Version history', 'Unpublish'].forEach((m, i) => {
    s += t(mx + 20, my + 32 + i * 34, m, { size: 11.5, weight: 500, fill: G.body });
  });
  s += ln(mx + 10, my + 182, mx + 200, my + 182, { stroke: G.soft });
  s += t(mx + 20, my + 204, 'Delete workflow', { size: 11.5, weight: 700, fill: G.ink });
  // rename modal
  s += box(360, 470, 460, 230, { r: 12, fill: G.white, stroke: G.line });
  s += t(392, 512, 'Rename workflow', { size: 16, weight: 700, fill: G.ink });
  s += t(788, 506, '✕', { size: 12, anchor: 'middle', fill: G.body });
  s += t(392, 548, 'Workflow name', { size: 11, weight: 600, fill: G.body });
  s += box(392, 558, 396, 44, { r: 7, fill: G.white, stroke: G.ink, sw: 1.8 });
  s += t(406, 586, 'Test Workflow', { size: 12.5, weight: 600, fill: G.ink });
  s += ln(492, 570, 492, 592, { stroke: G.ink, sw: 1.4 });
  s += t(392, 622, 'Version history keeps the last 30 days of changes.', { size: 10, fill: G.mute });
  s += btn(568, 640, 100, 38, 'Cancel');
  s += btn(680, 640, 108, 38, 'Save', { primary: true });
  return svg(W, H, s, 'Final feature: Workflow Management — dashboard with search, filters, status, context menu and rename modal');
})();


// =====================================================================
// 8. WORKFLOW SEARCH — 1300x820   (src: Hi Fi Screens/Search-13.png)
// =====================================================================
const searchScreen = (() => {
  const H = 880, PW = 380;
  let c = canvasBg(H);
  c += node(550, 96, 'Save Data', 'Add a new category');
  c += ln(670, 152, 670, 190, { stroke: G.line, sw: 1.4 });
  c += node(550, 190, 'Condition', '2 or more settings applied');
  c += ln(670, 246, 670, 292, { stroke: G.line, sw: 1.4 });
  c += `<path d="M520 350 v-46 q0 -12 12 -12 h276 q12 0 12 12 v46" fill="none" stroke="${G.line}" stroke-width="1.4"/>`;
  c += t(520, 342, 'Yes', { size: 10, anchor: 'middle', fill: G.mute });
  c += t(820, 342, 'No', { size: 10, anchor: 'middle', fill: G.mute });
  c += node(400, 350, 'Add Label To Email', 'Add a label to an email');
  // the search hit, highlighted on canvas
  c += node(700, 350, 'Send Message', 'Send email via Gmail', { stroke: G.ink, sw: 2.4, menu: true });
  c += ln(820, 406, 820, 438, { stroke: G.line, sw: 1.4 });
  c += cir(820, 456, 16, { fill: G.white, stroke: G.line });
  c += `<path d="M820 448 v16 M812 456 h16" stroke="${G.body}" stroke-width="1.4" stroke-linecap="round"/>`;
  // search panel docked left
  c += box(0, TOP, PW, H - TOP, { r: 0, fill: G.white, stroke: 'none' });
  c += ln(PW, TOP, PW, H);
  c += box(24, 76, PW - 48, 42, { r: 7, fill: G.white, stroke: G.ink, sw: 2 });
  c += cir(46, 97, 6, { stroke: G.body }) + ln(50, 101, 54, 105, { stroke: G.body, sw: 1.5 });
  c += t(66, 102, 'Send', { size: 12.5, weight: 600, fill: G.ink });
  c += ln(102, 88, 102, 106, { stroke: G.ink, sw: 1.3 });
  c += t(PW - 40, 102, 'Clear', { size: 11.5, weight: 700, fill: G.body, anchor: 'end' });
  c += t(24, 148, '12 Results', { size: 13, weight: 700, fill: G.ink });
  c += chevD(PW - 68, 142); c += `<path d="M${PW - 44} 148 l4 -4.6 4 4.6" stroke="${G.body}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const groups = [
    ['Triggers', '4', [['Send Message', 'Create and send an email', true], ['Send Label From Email', 'Remove a label from an email message', false], ['Send Form', 'Triggers when new email appears in mailbox', false]]],
    ['Actions', '8', [['Send Data', 'Triggers when new email appears in mailbox', false], ['Send Form', 'Triggers when new email appears in mailbox', false], ['Send Condition', 'Triggers when new email appears in mailbox', false]]],
  ];
  let gy = 184;
  groups.forEach(([name, count, rows]) => {
    c += chevD(26, gy);
    c += t(44, gy + 6, name, { size: 12, weight: 700, fill: G.ink });
    c += t(PW - 24, gy + 6, count, { size: 11.5, weight: 700, fill: G.mute, anchor: 'end' });
    gy += 22;
    rows.forEach(([a, b, on]) => {
      if (on) c += box(0, gy, PW, 54, { r: 0, fill: G.fill, stroke: 'none' });
      c += appIcon(24, gy + 12, 30);
      c += t(66, gy + 25, a, { size: 12, weight: 700, fill: G.ink });
      c += t(66, gy + 41, b, { size: 9.6, fill: G.mute });
      gy += 54;
    });
    gy += 16;
  });
  c += zoomBar(H - 48);

  let sb = sidebarBg(H);
  sb += appIcon(SBX + 24, 72, 38);
  sb += t(SBX + 74, 88, 'Send Message', { size: 13.5, weight: 700, fill: G.ink });
  sb += t(SBX + 74, 104, 'Send message via Gmail', { size: 10, fill: G.mute });
  sb += tabs(SBX + 16, 128, SBW - 32, ['Setup', 'Conditions', 'Test'], 0, [0]);
  sb += t(SBX + 24, 180, 'Which event will start the workflow?', { size: 11.5, weight: 700, fill: G.ink });
  for (let i = 0; i < 4; i++) sb += radio(SBX + 24, 194 + i * 54, SBW - 48, 'Option 1', 'Short description here', i === 0);
  return svg(W, H, topBar() + clipCanvas(c, H) + sb, 'Final feature: Workflow Search — grouped, counted results that highlight the matching node');
})();

// =====================================================================
// 9. SIDEBAR TABS — Setup / Conditions / Test, 1300x880
// =====================================================================
const tabsScreen = (() => {
  // Panels end at 820 and their captions at 848 — H was 1280, leaving 432px blank.
  const H = 880, CW = 400, GAP = 24, X0 = 26;
  let s = box(0, 0, W, H, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, 0, W, H);
  const panels = ['Setup', 'Conditions', 'Test'];
  panels.forEach((active, i) => {
    const x = X0 + i * (CW + GAP);
    s += box(x, 40, CW, 780, { r: 12, fill: G.white, stroke: G.line });
    s += appIcon(x + 22, 68, 34);
    s += t(x + 66, 84, 'Send Message', { size: 13, weight: 700, fill: G.ink });
    s += t(x + 66, 100, 'Send email via Gmail', { size: 9.6, fill: G.mute });
    s += tabs(x + 14, 118, CW - 28, panels, i, i === 0 ? [0] : []);
    const bx = x + 22, bw = CW - 44;
    if (i === 0) {
      s += t(bx, 176, 'Which event will start the workflow?', { size: 11.5, weight: 700, fill: G.ink });
      [['New Attachment', false], ['New Email', true], ['New Label', false]].forEach(([n, on], j) =>
        { s += radio(bx, 190 + j * 54, bw, n, 'Short description here', on); });
      s += t(bx, 380, 'Fetch trigger events from…', { size: 11.5, weight: 700, fill: G.ink });
      s += box(bx, 392, bw, 40, { r: 7, fill: G.white, stroke: G.ink, sw: 1.8 });
      s += t(bx + 14, 417, 'Select Forms', { size: 11.5, fill: G.body });
      s += warn(x + CW - 60, 412, 7); s += chevD(x + CW - 42, 408);
      s += t(bx, 452, 'This is an error message.', { size: 10.5, weight: 700, fill: G.ink });
      s += t(bx, 492, 'Required fields are flagged inline before', { size: 10, fill: G.mute });
      s += t(bx, 508, 'the step can be tested or published.', { size: 10, fill: G.mute });
    } else if (i === 1) {
      s += t(bx, 176, 'Only continue if', { size: 11.5, fill: G.body });
      s += box(bx + 96, 160, 72, 28, { r: 6, fill: G.white });
      s += t(bx + 108, 179, 'ALL', { size: 11, weight: 700, fill: G.ink }); s += chevD(bx + 146, 170);
      s += t(bx + 182, 176, 'of the following', { size: 11.5, fill: G.body });
      s += t(bx, 198, 'conditions are met:', { size: 11.5, fill: G.body });
      s += box(bx, 214, bw, 120, { r: 8, fill: G.fill, stroke: G.soft });
      s += box(bx + 12, 226, 150, 28, { r: 6, fill: G.white });
      s += t(bx + 24, 245, 'Id contains', { size: 10.5, weight: 700, fill: G.ink });
      s += box(bx + 12, 262, 56, 26, { r: 6, fill: G.white });
      s += t(bx + 22, 279, 'OR', { size: 10, weight: 700, fill: G.ink }); s += chevD(bx + 52, 271);
      s += box(bx + 76, 262, 150, 26, { r: 6, fill: G.white });
      s += t(bx + 88, 279, 'Sender contains', { size: 10.5, weight: 700, fill: G.ink });
      s += box(bx + 12, 296, 28, 26, { r: 6, fill: G.white });
      s += t(bx + 26, 314, '+', { size: 13, anchor: 'middle', fill: G.body });
      s += box(bx + bw / 2 - 36, 346, 72, 28, { r: 6, fill: G.white });
      s += t(bx + bw / 2 - 22, 365, 'AND', { size: 10.5, weight: 700, fill: G.ink }); s += chevD(bx + bw / 2 + 14, 356);
      s += box(bx, 386, bw, 72, { r: 8, fill: G.fill, stroke: G.soft });
      s += box(bx + 12, 398, 150, 28, { r: 6, fill: G.white });
      s += t(bx + 24, 417, 'Id contains', { size: 10.5, weight: 700, fill: G.ink });
      s += t(bx, 488, '+', { size: 13, weight: 700, fill: G.ink });
      s += t(bx + 14, 488, 'Add Condition', { size: 11.5, weight: 700, fill: G.ink });
      s += t(bx + bw, 488, 'Clear All Conditions', { size: 11.5, weight: 600, fill: G.mute, anchor: 'end' });
      s += btn(bx + bw - 130, 700, 130, 36, 'Save Conditions');
    } else {
      s += t(bx, 176, 'Test this step', { size: 11.5, weight: 700, fill: G.ink });
      s += t(bx, 196, 'Run the step on its own before testing the', { size: 10, fill: G.mute });
      s += t(bx, 212, 'whole workflow.', { size: 10, fill: G.mute });
      s += btn(bx, 228, 140, 34, 'Run Step Test', { primary: true, size: 11 });
      s += box(bx, 282, bw, 56, { r: 8, fill: G.white });
      s += check(bx + 26, 310, 11);
      s += t(bx + 50, 305, 'Trigger connected', { size: 11.5, weight: 700, fill: G.ink });
      s += t(bx + 50, 322, 'Received a sample payload', { size: 9.6, fill: G.mute });
      s += box(bx, 348, bw, 56, { r: 8, fill: G.white });
      s += warn(bx + 26, 376, 11);
      s += t(bx + 50, 371, 'Field mapping incomplete', { size: 11.5, weight: 700, fill: G.ink });
      s += t(bx + 50, 388, 'Select a form to continue', { size: 9.6, fill: G.mute });
      s += t(bx, 434, 'Sample output', { size: 11.5, weight: 700, fill: G.ink });
      s += box(bx, 446, bw, 132, { r: 8, fill: G.fill, stroke: G.soft });
      ['id: 129390293', 'sender: John Doe', 'channel: #general', 'flagged: true'].forEach((k, j) =>
        { s += t(bx + 16, 472 + j * 26, k, { size: 10, fill: G.body }); });
    }
    s += t(x + CW / 2, 848, `${active} tab`, { size: 11, weight: 700, fill: G.mute, anchor: 'middle' });
  });
  return svg(W, H, s, 'Final feature: sidebar tabs — Setup, Conditions and Test each carry their own panel');
})();

// =====================================================================
// 10. VERSION HISTORY — 1300x760
// =====================================================================
const versionScreen = (() => {
  // Panel runs near full-bleed so the left rail and the Restore buttons sit close
  // to the image edges — the annotation dots have something to reach.
  const H = 700, PX = 40, PR = W - 40, RX = 72, RR = W - 72;
  let s = box(0, 0, W, H, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, 0, W, H);
  s += box(PX, 40, PR - PX, 620, { r: 12, fill: G.white, stroke: G.line });
  s += t(RX, 84, 'Version history', { size: 18, weight: 700, fill: G.ink });
  s += t(RX, 106, 'Every publish is snapshotted. Restore any version without losing your current draft.', { size: 11, fill: G.mute });
  s += t(PR - 32, 80, '\u2715', { size: 13, anchor: 'middle', fill: G.body });
  s += ln(PX, 130, PR, 130, { stroke: G.soft });
  const versions = [
    ['Current draft', 'You \u00b7 edited 2 minutes ago', '4 steps', true, false],
    ['v5 \u2014 Published', 'You \u00b7 Today, 10:41AM', '4 steps', false, true],
    ['v4 \u2014 Published', 'You \u00b7 Yesterday, 4:12PM', '3 steps', false, false],
    ['v3 \u2014 Published', 'Inna T. \u00b7 3 days ago', '3 steps', false, false],
    ['v2 \u2014 Published', 'You \u00b7 Last week', '2 steps', false, false],
  ];
  versions.forEach(([name, meta, steps, isDraft, isLive], i) => {
    const y = 150 + i * 92;
    s += box(RX, y, RR - RX, 76, { r: 8, fill: isDraft ? G.fill : G.white });
    s += cir(RX + 28, y + 38, 6, { fill: isDraft ? G.solid : G.white, stroke: isDraft ? G.solid : G.faint });
    if (i < versions.length - 1) s += ln(RX + 28, y + 46, RX + 28, y + 92, { stroke: G.line, dash: '3 4' });
    s += t(RX + 54, y + 32, name, { size: 12.5, weight: 700, fill: G.ink });
    s += t(RX + 54, y + 50, meta, { size: 10, fill: G.mute });
    s += t(700, y + 44, steps, { size: 11, fill: G.body });
    if (isLive) { s += box(820, y + 27, 54, 22, { r: 11, fill: G.solid, stroke: G.solid }); s += t(847, y + 42, 'Live', { size: 9.6, weight: 700, fill: G.white, anchor: 'middle' }); }
    if (isDraft) { s += box(820, y + 27, 68, 22, { r: 11, fill: G.white, stroke: G.line }); s += t(854, y + 42, 'Editing', { size: 9.6, weight: 700, fill: G.body, anchor: 'middle' }); }
    if (!isDraft) {
      s += btn(RR - 204, y + 22, 88, 32, 'Preview', { size: 10.5 });
      s += btn(RR - 104, y + 22, 88, 32, 'Restore', { size: 10.5, primary: i === 1 });
    }
  });
  s += t(RX, 628, '30 days of history is kept on every workflow.', { size: 10, fill: G.mute });
  return svg(W, H, s, 'Final feature: Version History — snapshot per publish with preview and restore');
})();

// =====================================================================
// 11. STEP LIBRARY — 1300x760
// =====================================================================
const libraryScreen = (() => {
  const H = 820, NAV = 290, X0 = 40, Y0 = 40, PW2 = W - 80, PH2 = H - 80;
  let s = box(0, 0, W, H, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, 0, W, H);
  s += box(X0, Y0, PW2, PH2, { r: 12, fill: G.white, stroke: G.line });
  s += box(X0, Y0, NAV, PH2, { r: 0, fill: G.canvas, stroke: 'none' });
  s += ln(X0 + NAV, Y0, X0 + NAV, Y0 + PH2);
  s += box(X0 + 22, Y0 + 24, NAV - 44, 38, { r: 8, fill: G.white });
  s += cir(X0 + 44, Y0 + 43, 6, { stroke: G.mute }) + ln(X0 + 48, Y0 + 47, X0 + 52, Y0 + 51, { stroke: G.mute });
  s += t(X0 + 64, Y0 + 47, 'Search', { size: 11.5, fill: G.faint });
  [['Recently Used', 88], ['Popular', 128], ['View All', 168]].forEach(([lab, dy], i) => {
    if (i === 2) s += box(X0 + 22, Y0 + dy - 16, NAV - 44, 34, { r: 8, fill: G.soft, stroke: 'none' });
    s += box(X0 + 36, Y0 + dy - 8, 16, 16, { r: 4, stroke: G.mute });
    s += t(X0 + 66, Y0 + dy + 5, lab, { size: 11.5, weight: i === 2 ? 700 : 600, fill: i === 2 ? G.ink : G.body });
  });
  s += ln(X0 + 22, Y0 + 202, X0 + NAV - 22, Y0 + 202, { stroke: G.soft });
  [['Triggers', '126', 232], ['Conditions', '52', 272], ['Actions', '294', 312], ['Filters', '46', 352]].forEach(([lab, n, dy]) => {
    s += box(X0 + 36, Y0 + dy - 8, 16, 16, { r: 4, stroke: G.mute });
    s += t(X0 + 66, Y0 + dy + 5, lab, { size: 11.5, weight: 600, fill: G.body });
    s += box(X0 + NAV - 78, Y0 + dy - 10, 44, 20, { r: 10, fill: G.soft, stroke: 'none' });
    s += t(X0 + NAV - 56, Y0 + dy + 4, n, { size: 10, weight: 700, fill: G.body, anchor: 'middle' });
  });
  s += t(X0 + NAV / 2, Y0 + PH2 - 74, "Can't find what you're looking for?", { size: 10.5, fill: G.mute, anchor: 'middle' });
  s += t(X0 + NAV / 2, Y0 + PH2 - 56, 'Browse the marketplace', { size: 10.5, weight: 700, fill: G.body, anchor: 'middle' });
  s += btn(X0 + 22, Y0 + PH2 - 44, 118, 32, 'My Collection', { size: 10.5 });
  s += btn(X0 + 150, Y0 + PH2 - 44, 112, 32, 'Marketplace', { size: 10.5 });
  // right pane
  const RX = X0 + NAV;
  s += t(RX + 32, Y0 + 44, 'Add a workflow step', { size: 17, weight: 700, fill: G.ink });
  s += t(X0 + PW2 - 30, Y0 + 44, '✕', { size: 13, anchor: 'middle', fill: G.body });
  s += ln(RX, Y0 + 70, X0 + PW2, Y0 + 70, { stroke: G.soft });
  const cats = [['Triggers', '126'], ['Conditions', '52'], ['Actions', '294'], ['Filters', '46']];
  const cw = (PW2 - NAV) / cats.length;
  cats.forEach(([lab, n], i) => {
    const cx = RX + cw * i + cw / 2;
    s += t(cx - 16, Y0 + 100, lab, { size: 12, weight: i === 0 ? 700 : 500, fill: i === 0 ? G.ink : G.mute, anchor: 'middle' });
    s += box(cx + 14, Y0 + 88, 38, 18, { r: 9, fill: G.soft, stroke: 'none' });
    s += t(cx + 33, Y0 + 101, n, { size: 9.6, weight: 700, fill: G.body, anchor: 'middle' });
    if (i === 0) s += `<rect x="${RX + cw * i + 6}" y="${Y0 + 112}" width="${cw - 12}" height="2.5" rx="1.2" fill="${G.ink}"/>`;
  });
  s += ln(RX, Y0 + 114, X0 + PW2, Y0 + 114, { stroke: G.soft });
  s += t(RX + 32, Y0 + 148, 'Trigger From App', { size: 13, weight: 700, fill: G.ink });
  s += t(RX + 32, Y0 + 166, 'Use an app to trigger your workflow', { size: 10, fill: G.mute });
  const gw = (PW2 - NAV - 96) / 2;
  [0, 1].forEach(r => [0, 1].forEach(cc => {
    const x = RX + 32 + cc * (gw + 32), y = Y0 + 184 + r * 132;
    s += box(x, y, gw, 112, { r: 8, fill: G.canvas, stroke: G.soft });
    s += box(x + 16, y + 16, 26, 26, { r: 5, fill: G.white, stroke: G.line });
    s += t(x + 16, y + 66, 'Trigger Name', { size: 11.5, weight: 700, fill: G.ink });
    s += t(x + 16, y + 86, 'Suscipit tortor in sagittis purus fringilla adipiscing urna.', { size: 9.6, fill: G.mute });
  }));
  s += t(RX + 32, Y0 + 470, 'Trigger From Webhook', { size: 13, weight: 700, fill: G.ink });
  s += t(RX + 32, Y0 + 488, 'Update your photo and personal details here.', { size: 10, fill: G.mute });
  [0, 1].forEach(cc => {
    const x = RX + 32 + cc * (gw + 32), y = Y0 + 506;
    s += box(x, y, gw, 112, { r: 8, fill: G.canvas, stroke: G.soft });
    s += box(x + 16, y + 16, 26, 26, { r: 5, fill: G.white, stroke: G.line });
    s += t(x + 16, y + 66, 'Trigger Name', { size: 11.5, weight: 700, fill: G.ink });
  });
  return svg(W, H, s, 'Final feature: Step Library — 126 triggers, 52 conditions, 294 actions and 46 filters, browsable by category');
})();

// =====================================================================
// 12. OPTIONS MENU & CONFIRMATIONS — 1300x640
// =====================================================================
const confirmScreen = (() => {
  const H = 620;
  let s = box(0, 0, W, H, { r: 0, fill: G.canvas, stroke: 'none' }) + dots(0, 0, W, H);
  // options menu
  s += box(60, 60, 300, 236, { r: 12, fill: G.white, stroke: G.line });
  s += t(88, 96, 'Workflow options', { size: 11, weight: 700, fill: G.mute });
  ['Clone Workflow', 'Run Workflow Test', 'Pause Workflow', 'Search'].forEach((m, i) => {
    s += box(76, 108 + i * 34, 24, 24, { r: 5, stroke: G.line });
    s += t(112, 125 + i * 34, m, { size: 12, weight: 500, fill: G.body });
  });
  s += ln(76, 246, 344, 246, { stroke: G.soft });
  s += box(76, 254, 24, 24, { r: 5, stroke: G.ink });
  s += t(112, 271, 'Delete Workflow', { size: 12, weight: 700, fill: G.ink });
  s += t(210, 326, 'Options menu', { size: 10.5, weight: 700, fill: G.mute, anchor: 'middle' });
  // delete confirmation
  s += box(420, 60, 400, 212, { r: 12, fill: G.white, stroke: G.line });
  s += warn(460, 106, 16);
  s += t(492, 112, 'Delete this workflow?', { size: 16, weight: 700, fill: G.ink });
  s += t(452, 152, 'This workflow and its 5 steps will be moved to trash.', { size: 11.5, fill: G.body });
  s += t(452, 174, 'You can restore it for 30 days.', { size: 11.5, fill: G.body });
  s += btn(452, 210, 100, 38, 'Cancel');
  s += btn(564, 210, 100, 38, 'Delete', { primary: true });
  s += t(620, 326, 'Destructive confirmation', { size: 10.5, weight: 700, fill: G.mute, anchor: 'middle' });
  // exit confirmation
  s += box(880, 60, 360, 212, { r: 12, fill: G.white, stroke: G.line });
  s += t(912, 112, 'Exit without publishing?', { size: 16, weight: 700, fill: G.ink });
  s += t(912, 152, 'Your changes are saved as a draft. The live', { size: 11.5, fill: G.body });
  s += t(912, 174, 'workflow keeps running the last published version.', { size: 11.5, fill: G.body });
  s += btn(912, 210, 100, 38, 'Cancel');
  s += btn(1024, 210, 120, 38, 'Yes, exit', { primary: true });
  s += t(1060, 326, 'Exit protection', { size: 10.5, weight: 700, fill: G.mute, anchor: 'middle' });
  // node-level confirmations
  [['Delete this trigger?', 'The trigger and its setup will be removed.', 60],
   ['Delete this step?', 'Steps downstream keep their configuration.', 500],
   ['Publish this workflow?', 'It will go live immediately.', 940]].forEach(([title, body, x]) => {
    s += box(x, 366, 300, 168, { r: 12, fill: G.white, stroke: G.line });
    s += t(x + 28, 412, title, { size: 14, weight: 700, fill: G.ink });
    s += t(x + 28, 444, body, { size: 10.5, fill: G.mute });
    s += btn(x + 28, 476, 88, 34, 'Cancel', { size: 11 });
    s += btn(x + 128, 476, 100, 34, 'Confirm', { primary: true, size: 11 });
  });
  s += t(650, 566, 'Every destructive or irreversible action is confirmed in the same shape', { size: 10.5, weight: 700, fill: G.mute, anchor: 'middle' });
  return svg(W, H, s, 'Final feature: options menu and confirmation modals for destructive and irreversible actions');
})();

const files = {
  'bm-final-canvas.svg': canvasScreen,
  'bm-final-trigger-setup.svg': trigSetup,
  'bm-final-split-path.svg': splitScreen,
  'bm-final-testing.svg': testScreen,
  'bm-final-publish.svg': publishScreen,
  'bm-final-auth.svg': authScreen,
  'bm-final-manage.svg': manageScreen,
  'bm-final-search.svg': searchScreen,
  'bm-final-tabs.svg': tabsScreen,
  'bm-final-version.svg': versionScreen,
  'bm-final-library.svg': libraryScreen,
  'bm-final-confirm.svg': confirmScreen,
};
mkdirSync(OUT, { recursive: true });
for (const [n, s] of Object.entries(files)) {
  writeFileSync(join(OUT, n), s);
  console.log(n.padEnd(30), (s.length / 1024).toFixed(1) + ' KB');
}
