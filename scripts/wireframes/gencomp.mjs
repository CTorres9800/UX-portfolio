// Component-level grayscale wireframes, redrawn from the original Blend Metrics wireframes.
// Sources: Triggers/, Workflow wireframes/, Conditional Logic/, Template popup/
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2];
if (!OUT) throw new Error('usage: node gencomp.mjs <outDir>');

const G = {
  ink: '#111111', body: '#3D3D3D', mute: '#8A8A8A',
  line: '#D8D8D8', soft: '#E8E8E8', fill: '#F4F4F4',
  panel: '#FCFCFC', white: '#FFFFFF', solid: '#2E2E2E', ghost: '#EDEDED',
};
const F = 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const t = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${F}" font-size="${o.size || 11}" font-weight="${o.weight || 500}" fill="${o.fill || G.body}" text-anchor="${o.anchor || 'start'}">${esc(s)}</text>`;
const box = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 8}" fill="${o.fill || 'none'}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const ln = (x1, y1, x2, y2, o = {}) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1.2}" fill="none"/>`;
const cir = (cx, cy, r, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill || 'none'}" stroke="${o.stroke || G.line}" stroke-width="${o.sw || 1.2}"/>`;
const icon = (x, y, s = 34) =>
  box(x, y, s, s, { r: 7, fill: G.white, stroke: G.line }) +
  box(x + s * 0.28, y + s * 0.28, s * 0.44, s * 0.44, { r: 2, stroke: G.mute });
const chevD = (x, y, o = {}) =>
  `<path d="M${x} ${y} l3.6 4 3.6 -4" stroke="${o.stroke || G.body}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const bang = (cx, cy, r = 7) =>
  cir(cx, cy, r, { stroke: G.ink, sw: 1.3, fill: G.white }) +
  `<path d="M${cx} ${cy - 3.4} v3.8 M${cx} ${cy + 2.8} v0.7" stroke="${G.ink}" stroke-width="1.4" stroke-linecap="round"/>`;

let UID = 0;
// The popup is inset inside a slightly larger canvas so its gray border is fully
// visible (a border drawn at x=0 gets half-clipped by the viewBox edge).
function popupWrap(inner) {
  const id = 'pp' + (++UID);
  const framed =
    `<defs><clipPath id="${id}"><rect x="0" y="0" width="${QW}" height="${QH}" rx="12"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${inner}</g>` +
    box(0.9, 0.9, QW - 1.8, QH - 1.8, { r: 12, fill: 'none', stroke: G.line, sw: 1.8 });
  return `<g transform="translate(10,10)">${framed}</g>`;
}

function svg(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><title>${esc(title)}</title><rect width="${w}" height="${h}" fill="${G.white}"/>${body}</svg>\n`;
}
const PANEL_PAD = 10;            // panel border sits on this x
function panel(w, h, pad = PANEL_PAD) {
  return box(pad, pad, w - pad * 2, h - pad * 2, { r: 12, fill: G.white, stroke: G.line });
}
// Collapse handle straddles the panel's left border, centred on it.
function collapseHandle(y) {
  return cir(PANEL_PAD, y, 13, { fill: G.white, stroke: G.line }) +
    `<path d="M${PANEL_PAD - 2.5} ${y - 6} l5 6 -5 6" stroke="${G.body}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// horizontal tab strip
function tabStrip(x, y, w, labels, active, warnIdx = []) {
  let s = '';
  const colW = w / labels.length;
  labels.forEach((lab, i) => {
    const cx = x + colW * i + colW / 2;
    const on = i === active;
    s += t(cx, y, lab, { size: 11.5, weight: on ? 700 : 500, fill: on ? G.ink : G.mute, anchor: 'middle' });
    if (warnIdx.includes(i)) s += bang(cx + lab.length * 3.4 + 10, y - 4, 5.5);
  });
  s += ln(x, y + 12, x + w, y + 12, { stroke: G.soft });
  labels.forEach((lab, i) => {
    if (i === active) {
      const cx = x + colW * i + colW / 2;
      s += `<rect x="${cx - 34}" y="${y + 10}" width="68" height="2.5" rx="1.2" fill="${G.ink}"/>`;
    }
  });
  return s;
}
function optionRow(x, y, w, h, title, sub, o = {}) {
  let s = box(x, y, w, h, { r: 8, fill: G.white, stroke: o.on ? G.ink : G.line, sw: o.on ? 1.8 : 1.2 });
  if (o.radio) {
    s += cir(x + 20, y + h / 2, 7, { stroke: o.on ? G.ink : G.mute });
    if (o.on) s += cir(x + 20, y + h / 2, 3.4, { fill: G.ink, stroke: G.ink });
    s += t(x + 38, y + h / 2 - 2, title, { size: 11.5, weight: 600, fill: G.ink });
    if (sub) s += t(x + 38, y + h / 2 + 12, sub, { size: 9.4, fill: G.mute });
  } else {
    s += icon(x + 14, y + (h - 34) / 2, 34);
    s += t(x + 60, y + h / 2 - 2, title, { size: 12, weight: 600, fill: G.ink });
    if (sub) s += t(x + 60, y + h / 2 + 12, sub, { size: 9.6, fill: G.mute });
  }
  return s;
}

// =====================================================================
// 1. TRIGGER TYPE PICKER   (src: Triggers/Custom Triggers 1 (v1).png)
// =====================================================================
const PW = 440, PH = 900;
const triggerPicker = (() => {
  let s = panel(PW, PH);
  s += t(30, 58, 'How should this workflow start?', { size: 16, weight: 700, fill: G.ink });
  s += box(30, 76, PW - 60, 34, { r: 7, fill: G.white });
  s += t(44, 98, 'New Trigger', { size: 11.5, weight: 600, fill: G.ink });
  s += t(PW - 46, 99, '✕', { size: 11, fill: G.body });
  s += t(30, 146, 'Choose Trigger Type', { size: 13, weight: 700, fill: G.ink });
  s += box(PW - 116, 130, 86, 26, { r: 6, fill: G.white });
  s += t(PW - 73, 147, 'View More', { size: 10.5, weight: 600, fill: G.body, anchor: 'middle' });
  const types = [
    ['By App', 'Choose this to start your workflow'],
    ['Webhook', 'Choose this to start your workflow'],
    ['Forms', 'Choose this to start your workflow'],
    ['Schedule', 'Choose this to start your workflow'],
    ['Link Or Button', 'Choose an app to integrate into your thought'],
    ['Workflow', 'Choose this to start your workflow'],
    ['Message', 'Choose this to start your workflow'],
    ['Alert', 'Choose an app to integrate into your thought'],
  ];
  types.forEach(([a, b], i) => { s += optionRow(30, 176 + i * 74, PW - 60, 62, a, b); });
  s += box(PW - 130, 810, 100, 30, { r: 7, fill: G.solid, stroke: G.solid });
  s += t(PW - 80, 830, 'Continue', { size: 11.5, weight: 600, fill: G.white, anchor: 'middle' });
  return svg(PW, PH, s, 'Component wireframe: Trigger Type Picker — choose how a workflow starts');
})();

// =====================================================================
// 2. TRIGGER EVENT SETUP  (src: Workflow wireframes/Custom Triggers Prototype (v1) - Sidebar.png)
// =====================================================================
const triggerSetup = (() => {
  let s = panel(PW, PH);
  s += `<path d="M36 62 l-7 0 M32 58 l-4 4 4 4" stroke="${G.body}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(46, 66, 'Back to Trigger Types', { size: 11, weight: 700, fill: G.body });
  s += t(30, 106, 'When this happens…', { size: 15, weight: 700, fill: G.ink });
  s += box(30, 124, PW - 60, 40, { r: 8, fill: G.white });
  s += icon(42, 132, 24);
  s += t(78, 149, 'Forms Trigger', { size: 12, weight: 700, fill: G.ink });
  s += t(PW - 46, 150, '✕', { size: 11, fill: G.body });
  s += tabStrip(30, 200, PW - 60, ['Setup', 'Filters', 'Conditions', 'Test'], 0);
  s += t(30, 254, 'Choose a Trigger Event', { size: 13, weight: 700, fill: G.ink });
  const events = [
    ['New Form Submission', 'Triggers when a user submits a new form'],
    ['Partial Form Submission', 'Triggers when a user saves a partially completed form'],
    ['Form Deadline Reached', 'Triggers when a form submission deadline is reached'],
    ['Abandoned Form', 'Triggers when user starts filling out a form but abandons it'],
    ['Updated Form', 'Triggers when a user updates or modifies an existing form'],
    ['Form Approval', 'Triggers when a user approves or rejects a form submission'],
    ['New Form Creation', 'Triggers when a user creates a new form'],
    ['Form Input Completion', 'Triggers when a user completes a specific field or input'],
    ['Specific Form Field', 'Triggers when a user enters specific data into a form field'],
  ];
  events.forEach(([a, b], i) => { s += optionRow(30, 276 + i * 62, PW - 60, 52, a, b, { radio: true }); });
  return svg(PW, PH, s, 'Component wireframe: Trigger Event Setup — choose a trigger event');
})();

// =====================================================================
// 3. CONDITION BUILDER  (src: Conditional Logic/Sidebar Master.png)
// =====================================================================
const conditionBuilder = (() => {
  let s = panel(PW, PH);
  s += icon(30, 44, 44);
  s += t(86, 68, 'Trigger Name', { size: 16, weight: 700, fill: G.ink });
  s += t(86, 86, 'Trigger short description here', { size: 10.5, fill: G.mute });
  s += `<path d="M${PW - 92} 62 l-7 0 M${PW - 96} 58 l-4 4 4 4" stroke="${G.body}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(PW - 82, 66, 'Back', { size: 12, weight: 700, fill: G.body });
  s += ln(20, 108, PW - 20, 108, { stroke: G.soft });
  s += collapseHandle(140);
  s += tabStrip(30, 146, PW - 60, ['Setup', 'Conditions', 'Test'], 1, [0, 1]);
  s += t(30, 198, 'Only continue if', { size: 12.5, fill: G.body });
  s += box(126, 182, 74, 26, { r: 6, fill: G.white });
  s += t(140, 199, 'ALL', { size: 11.5, weight: 700, fill: G.ink });
  s += chevD(180, 192);
  s += t(208, 198, 'of the following', { size: 12.5, fill: G.body });
  s += t(30, 220, 'conditions are met:', { size: 12.5, fill: G.body });
  s += box(30, 240, PW - 60, 56, { r: 8, fill: G.fill, stroke: G.soft });
  s += box(44, 254, 172, 28, { r: 6, fill: G.white });
  s += icon(52, 259, 18);
  s += t(78, 273, 'Id greater than', { size: 11, weight: 700, fill: G.ink });
  s += box(224, 254, 28, 28, { r: 6, fill: G.white });
  s += t(238, 273, '+', { size: 13, anchor: 'middle', fill: G.body });
  s += t(30, 322, '+', { size: 14, weight: 700, fill: G.ink });
  s += t(44, 322, 'Add Condition', { size: 12.5, weight: 700, fill: G.ink });
  s += t(PW - 30, 322, 'Clear All Conditions', { size: 12.5, weight: 600, fill: G.mute, anchor: 'end' });
  // save action pinned to the bottom of the panel
  s += box(PW - 160, 828, 130, 32, { r: 7, fill: G.white });
  s += box(PW - 148, 838, 12, 12, { r: 2, stroke: G.body });
  s += t(PW - 130, 849, 'Save Conditions', { size: 11.5, weight: 700, fill: G.ink });
  return svg(PW, PH, s, 'Component wireframe: Condition Builder — AND/OR rules with save and clear actions');
})();

// =====================================================================
// 4-6. STEP LIBRARY POPUP  (src: Template popup/*.png)
// =====================================================================
const QW = 1300, QH = 700, NAV = 300;
function popupShell(title, query) {
  let s = box(0, 0, QW, QH, { r: 12, fill: G.white, stroke: 'none' });
  // left nav
  s += box(0, 0, NAV, QH, { r: 0, fill: G.panel, stroke: 'none' });
  s += ln(NAV, 0, NAV, QH, { stroke: G.line });
  s += box(24, 28, NAV - 48, 38, { r: 8, fill: G.white });
  s += cir(46, 47, 6, { stroke: G.mute }) + ln(50, 51, 54, 55, { stroke: G.mute, sw: 1.4 });
  s += t(66, 51, query || 'Search', { size: 12, weight: query ? 600 : 500, fill: query ? G.ink : G.mute });
  [['Recently Used', 94], ['Popular', 138], ['View All', 182]].forEach(([lab, y], i) => {
    if (i === 2) s += box(24, y - 18, NAV - 48, 38, { r: 8, fill: G.ghost, stroke: 'none' });
    s += box(38, y - 9, 18, 18, { r: 4, stroke: G.mute });
    s += t(72, y + 5, lab, { size: 12.5, weight: i === 2 ? 700 : 600, fill: i === 2 ? G.ink : G.body });
  });
  s += ln(24, 226, NAV - 24, 226, { stroke: G.soft });
  [['Triggers', '126', 262], ['Conditions', '52', 306], ['Actions', '294', 350], ['Filters', '46', 394]].forEach(([lab, n, y]) => {
    s += box(38, y - 9, 18, 18, { r: 4, stroke: G.mute });
    s += t(72, y + 5, lab, { size: 12.5, weight: 600, fill: G.body });
    s += box(NAV - 76, y - 10, 44, 20, { r: 10, fill: G.ghost, stroke: 'none' });
    s += t(NAV - 54, y + 5, n, { size: 10.5, weight: 700, fill: G.body, anchor: 'middle' });
  });
  s += ln(24, 436, NAV - 24, 436, { stroke: G.soft });
  s += t(NAV / 2, 486, "Can't find what you're looking for?", { size: 11, fill: G.mute, anchor: 'middle' });
  s += t(NAV / 2, 506, 'Browse the marketplace', { size: 11, fill: G.mute, anchor: 'middle' });
  s += box(14, QH - 58, 132, 34, { r: 8, fill: G.white });
  s += cir(34, QH - 41, 4, { fill: G.body, stroke: G.body });
  s += t(50, QH - 36, 'My Collection', { size: 11.5, weight: 600, fill: G.ink });
  s += box(156, QH - 58, 130, 34, { r: 8, fill: G.white });
  s += box(172, QH - 48, 14, 14, { r: 3, stroke: G.body });
  s += t(196, QH - 36, 'Marketplace', { size: 11.5, weight: 600, fill: G.ink });
  // header
  s += t(NAV + 36, 44, title, { size: 18, weight: 700, fill: G.ink });
  s += t(QW - 36, 44, '✕', { size: 14, anchor: 'middle', fill: G.body });
  s += ln(NAV, 72, QW, 72, { stroke: G.soft });
  return s;
}
function popupTabs(active) {
  let s = '';
  const items = [['Triggers', '126'], ['Conditions', '52'], ['Actions', '294'], ['Filters', '46']];
  const colW = (QW - NAV) / items.length;
  items.forEach(([lab, n], i) => {
    const cx = NAV + colW * i + colW / 2;
    const on = i === active;
    s += t(cx - 18, 99, lab, { size: 12.5, weight: on ? 700 : 500, fill: on ? G.ink : G.mute, anchor: 'middle' });
    s += box(cx + 12, 86, 38, 18, { r: 9, fill: G.ghost, stroke: 'none' });
    s += t(cx + 31, 99, n, { size: 10, weight: 700, fill: G.body, anchor: 'middle' });
    if (on) s += `<rect x="${NAV + colW * i + 4}" y="${112}" width="${colW - 8}" height="2.5" rx="1.2" fill="${G.ink}"/>`;
  });
  s += ln(NAV, 114, QW, 114, { stroke: G.soft });
  return s;
}
function trigCard(x, y, w, h, label) {
  let s = box(x, y, w, h, { r: 8, fill: G.panel, stroke: G.soft });
  s += box(x + 16, y + 16, 26, 26, { r: 5, fill: G.white, stroke: G.line });
  s += t(x + 16, y + 66, label || 'Trigger Name', { size: 12, weight: 700, fill: G.ink });
  s += t(x + 16, y + 86, 'Suscipit tortor in sagittis purus fringilla adipiscing', { size: 10, fill: G.mute });
  s += t(x + 16, y + 102, 'urna. Viverra vel in in non neque.', { size: 10, fill: G.mute });
  return s;
}
const popupGrid = (() => {
  let s = popupShell('Add trigger to the workflow') + popupTabs(0);
  s += t(NAV + 36, 152, 'Trigger From App', { size: 14, weight: 700, fill: G.ink });
  s += t(NAV + 36, 172, 'Use an app to trigger your workflow', { size: 10.5, fill: G.mute });
  const cw = (QW - NAV - 108) / 2;
  [0, 1].forEach((r) => [0, 1].forEach((c) => { s += trigCard(NAV + 36 + c * (cw + 36), 194 + r * 148, cw, 128); }));
  s += t(NAV + 36, 512, 'Trigger From Webhook', { size: 14, weight: 700, fill: G.ink });
  s += t(NAV + 36, 532, 'Update your photo and personal details here.', { size: 10.5, fill: G.mute });
  [0, 1].forEach((c) => { s += trigCard(NAV + 36 + c * (cw + 36), 554, cw, 128); });
  return svg(QW + 20, QH + 20, popupWrap(s), 'Component wireframe: Step Library popup — grid view of triggers by category');
})();
const popupList = (() => {
  let s = popupShell('Add a workflow step') + popupTabs(2);
  s += t(NAV + 36, 152, 'Actions', { size: 14, weight: 700, fill: G.ink });
  s += t(NAV + 36, 172, 'Pick a step to run when the trigger fires', { size: 10.5, fill: G.mute });
  const rows = ['Send Message', 'Save Data', 'Time Delay', 'Video Recording', 'Condition', 'Split Path'];
  rows.forEach((r, i) => {
    const y = 194 + i * 74;
    s += box(NAV + 36, y, QW - NAV - 72, 60, { r: 8, fill: G.panel, stroke: G.soft });
    s += box(NAV + 52, y + 17, 26, 26, { r: 5, fill: G.white, stroke: G.line });
    s += t(NAV + 92, y + 28, r, { size: 12, weight: 700, fill: G.ink });
    s += t(NAV + 92, y + 44, 'Suscipit tortor in sagittis purus fringilla adipiscing urna.', { size: 10, fill: G.mute });
    s += t(QW - 56, y + 36, '›', { size: 14, fill: G.mute, anchor: 'middle' });
  });
  return svg(QW + 20, QH + 20, popupWrap(s), 'Component wireframe: Step Library popup — list view of actions');
})();
const popupEmpty = (() => {
  let s = popupShell('Add a workflow step', 'xxxx') + popupTabs(0);
  s += t(NAV + 36, 152, '0 Search Results', { size: 14, weight: 700, fill: G.ink });
  // magnifier-with-x empty state mark, built around one centre so the parts stay registered
  const cx = NAV + (QW - NAV) / 2, cy = 350;
  const R = 62, SW = 18;
  const lensX = cx + 26, lensY = cy - 26;              // lens sits up-right of centre
  const ang = Math.PI / 4;                              // handle leaves the lens at 45deg
  const hx = lensX - Math.cos(ang) * R, hy = lensY + Math.sin(ang) * R;
  s += cir(lensX, lensY, R, { stroke: G.ghost, sw: SW });
  s += ln(hx, hy, hx - 46, hy + 46, { stroke: G.ghost, sw: SW });
  // the X sits centred on the lens, not floating beside it
  const a = 22;
  s += `<path d="M${lensX - a} ${lensY - a} L${lensX + a} ${lensY + a} M${lensX + a} ${lensY - a} L${lensX - a} ${lensY + a}" stroke="${G.ghost}" stroke-width="${SW}" stroke-linecap="round"/>`;
  s += t(cx, cy + 190, "There are no search results for 'xxxx'", { size: 14, weight: 600, fill: G.ink, anchor: 'middle' });
  return svg(QW + 20, QH + 20, popupWrap(s), 'Component wireframe: Step Library popup — empty search results state');
})();

const popupSearch = (() => {
  // src: Template popup/SEARCH Popup menu prototype.png — no tab strip, results header instead
  let s = popupShell('Add a workflow step', 'Sub');
  s += t(NAV + 36, 124, '5 Search Results', { size: 14, weight: 700, fill: G.ink });
  s += t(QW - 250, 124, 'All Categories', { size: 11.5, weight: 600, fill: G.body });
  s += chevD(QW - 168, 118);
  s += t(QW - 138, 124, 'Show All', { size: 11.5, weight: 600, fill: G.body });
  s += chevD(QW - 80, 118);
  const cw = (QW - NAV - 108) / 2;
  const labels = ['Condition Name', 'Action Name', 'Filter Name', 'Trigger Name', 'Filter Name'];
  labels.forEach((lab, i) => {
    const r = Math.floor(i / 2), c = i % 2;
    s += trigCard(NAV + 36 + c * (cw + 36), 152 + r * 160, cw, 140, lab);
  });
  return svg(QW + 20, QH + 20, popupWrap(s), 'Component wireframe: Step Library popup — search results across every category');
})();


// =====================================================================
// 8-13. CONDITIONAL LOGIC — STATES & SELECTORS   (src: Conditional Logic/*)
// Uniform 440x460 canvas with the card centred, so the grid rows stay even.
// =====================================================================
const CW2 = 440, CH2 = 460;
function card(w, h) {
  const x = (CW2 - w) / 2, y = (CH2 - h) / 2;
  return { x, y, s: box(x, y, w, h, { r: 10, fill: G.white, stroke: G.line }) };
}
function chip(x, y, w, label) {
  return box(x, y, w, 30, { r: 6, fill: G.white }) + icon(x + 8, y + 6, 18) +
    t(x + 34, y + 19, label, { size: 11, weight: 700, fill: G.ink });
}
function selectBox(x, y, w, label) {
  return box(x, y, w, 30, { r: 6, fill: G.white }) +
    t(x + 12, y + 19, label, { size: 11, weight: 700, fill: G.ink }) + chevD(x + w - 22, y + 12);
}

// 8. Nested AND/OR condition groups, with the ANY/ALL selector open
const condGroups = (() => {
  const c = card(400, 420); let s = c.s;
  const X = c.x + 16, Y = c.y + 18, W2 = 400 - 32;
  // 'Only continue if' measures ~82px at 11px DM Sans; leave a 20px gutter either
  // side of the ALL select so the sentence never crowds the control.
  const SEL_X = X + 102, SEL_W = 66;
  s += t(X, Y + 14, 'Only continue if', { size: 11, fill: G.body });
  s += selectBox(SEL_X, Y, SEL_W, 'ALL');
  s += t(SEL_X + SEL_W + 20, Y + 14, 'of the following', { size: 11, fill: G.body });
  s += t(X, Y + 36, 'conditions are met:', { size: 11, fill: G.body });
  // group 1 — OR chain
  s += box(X, Y + 50, W2, 118, { r: 8, fill: G.fill, stroke: G.soft });
  s += chip(X + 12, Y + 60, 150, 'Id contains');
  s += selectBox(X + 12, Y + 96, 56, 'OR');
  s += chip(X + 80, Y + 96, 150, 'Id contains');
  s += selectBox(X + 12, Y + 132, 56, 'OR');
  s += chip(X + 80, Y + 132, 150, 'Id contains');
  s += box(X + 242, Y + 132, 28, 30, { r: 6, fill: G.white });
  s += t(X + 256, Y + 151, '+', { size: 13, anchor: 'middle', fill: G.body });
  // AND between groups
  s += selectBox(X + W2 / 2 - 33, Y + 180, 66, 'AND');
  // group 2
  s += box(X, Y + 224, W2, 82, { r: 8, fill: G.fill, stroke: G.soft });
  s += chip(X + 12, Y + 234, 150, 'Id contains');
  s += selectBox(X + 12, Y + 270, 56, 'OR');
  s += chip(X + 80, Y + 270, 150, 'Id contains');
  s += box(X + 242, Y + 270, 28, 30, { r: 6, fill: G.white });
  s += t(X + 256, Y + 289, '+', { size: 13, anchor: 'middle', fill: G.body });
  s += t(X, Y + 336, '+', { size: 13, weight: 700, fill: G.ink });
  s += t(X + 14, Y + 336, 'Add Condition', { size: 11.5, weight: 700, fill: G.ink });
  s += t(X + W2, Y + 336, 'Clear All Conditions', { size: 11.5, weight: 600, fill: G.mute, anchor: 'end' });
  // the open ANY/ALL popover sits above the groups
  s += box(SEL_X, Y + 34, 108, 62, { r: 8, fill: G.white, stroke: G.line });
  s += t(SEL_X + 14, Y + 55, 'ANY', { size: 11.5, weight: 600, fill: G.body });
  s += t(SEL_X + 14, Y + 83, 'ALL', { size: 11.5, weight: 700, fill: G.ink });
  s += `<path d="M${SEL_X + 76} ${Y + 78} l4 4.5 8 -9" stroke="${G.ink}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return svg(CW2, CH2, s, 'Component wireframe: nested AND/OR condition groups with the ANY/ALL selector open');
})();

// 9. Operator dropdown
const opDropdown = (() => {
  const c = card(400, 330); let s = c.s;
  const X = c.x + 20, Y = c.y + 18;
  s += cir(X + 10, Y + 12, 8, { stroke: G.ink });
  s += cir(X + 10, Y + 12, 3.8, { fill: G.ink, stroke: G.ink });
  s += t(X + 30, Y + 17, 'greater than', { size: 13, weight: 600, fill: G.ink });
  // focused amount field
  s += box(X, Y + 32, 360, 40, { r: 7, fill: G.white, stroke: G.ink, sw: 2 });
  s += ln(X + 14, Y + 44, X + 14, Y + 60, { stroke: G.ink, sw: 1.4 });
  s += t(X + 22, Y + 58, 'Enter Amount', { size: 13, fill: G.mute });
  ['less than', 'equals', 'does not equal', 'in range of'].forEach((o, i) => {
    const y = Y + 96 + i * 46;
    s += cir(X + 10, y, 8, { stroke: G.mute });
    s += t(X + 30, y + 5, o, { size: 13, weight: 500, fill: G.ink });
  });
  return svg(CW2, CH2, s, 'Component wireframe: condition operator dropdown with a focused amount field');
})();

// 10. Field picker flyout
const fieldFlyout = (() => {
  const c = card(400, 340); let s = c.s;
  const X = c.x + 20, Y = c.y + 22;
  const rows = [['Id', 'ex. 129390293'], ['Sender', 'ex. John Doe'], ['Channel', 'ex. #general'],
                ['Timestamp', 'ex. 023-06-08T10:30:00'], ['Content', 'ex. Hey everyone, just a quick reminder ab…'], ['Flagged', 'ex. true']];
  rows.forEach(([k, v], i) => {
    const y = Y + i * 46;
    s += t(X, y, k, { size: 12, weight: 700, fill: G.ink });
    s += t(X, y + 16, v, { size: 11, weight: 500, fill: G.mute });
  });
  s += t(X, Y + 288, 'Show Advanced…', { size: 12, weight: 700, fill: G.ink });
  return svg(CW2, CH2, s, 'Component wireframe: data field picker flyout with example values');
})();

// 11. Date picker menu
const datePicker = (() => {
  // 420 tall: the calendar needs 6 rows + a footer, and 400 pushed the buttons past the card edge
  const c = card(400, 420); let s = c.s;
  const X = c.x + 18, Y = c.y + 16;
  s += t(X + 182, Y + 14, 'January 2022', { size: 12.5, weight: 700, fill: G.ink, anchor: 'middle' });
  s += `<path d="M${X + 12} ${Y + 6} l-5 4.5 5 4.5" stroke="${G.body}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M${X + 352} ${Y + 6} l5 4.5 -5 4.5" stroke="${G.body}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += box(X, Y + 28, 272, 34, { r: 6, fill: G.white });
  s += t(X + 14, Y + 50, 'Jan 6, 2022', { size: 12, weight: 600, fill: G.ink });
  s += box(X + 284, Y + 28, 80, 34, { r: 6, fill: G.white });
  s += t(X + 324, Y + 50, 'Today', { size: 11.5, weight: 600, fill: G.ink, anchor: 'middle' });
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su'];
  days.forEach((d, i) => { s += t(X + 26 + i * 53, Y + 84, d, { size: 10.5, weight: 600, fill: G.body, anchor: 'middle' }); });
  const grid = [[26, 27, 28, 29, 30, 32, 1], [2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15],
                [16, 17, 18, 19, 20, 21, 22], [23, 24, 25, 26, 27, 28, 29], [30, 31, 1, 2, 3, 4, 5]];
  grid.forEach((row, r) => row.forEach((d, i) => {
    const cx = X + 26 + i * 53, cy = Y + 112 + r * 42;
    const outside = (r === 0 && i < 6) || (r === 5 && i > 1);
    if (r === 1 && i === 4) { s += cir(cx, cy - 4, 15, { fill: G.solid, stroke: G.solid }); }      // selected
    if (r === 4 && i === 1) { s += cir(cx, cy - 4, 15, { fill: G.fill, stroke: 'none' }); }        // hover
    s += t(cx, cy, String(d), { size: 11, weight: 500, fill: (r === 1 && i === 4) ? G.white : outside ? G.mute : G.ink, anchor: 'middle' });
    if ((r === 0 && i === 0) || (r === 2 && i === 2) || (r === 4 && i === 1)) s += cir(cx, cy + 8, 1.8, { fill: G.body, stroke: G.body });
  }));
  s += ln(c.x, Y + 340, c.x + 400, Y + 340, { stroke: G.soft });
  s += box(X, Y + 356, 172, 34, { r: 6, fill: G.white });
  s += t(X + 86, Y + 378, 'Cancel', { size: 12, weight: 700, fill: G.ink, anchor: 'middle' });
  s += box(X + 192, Y + 356, 172, 34, { r: 6, fill: G.solid, stroke: G.solid });
  s += t(X + 278, Y + 378, 'Apply', { size: 12, weight: 700, fill: G.white, anchor: 'middle' });
  return svg(CW2, CH2, s, 'Component wireframe: date picker menu with selected, hover and event-dot states');
})();

// 12. Step search with autocomplete results
const stepSearch = (() => {
  const c = card(400, 250); let s = c.s;
  const X = c.x + 18, Y = c.y + 18;
  s += box(X, Y, 364, 46, { r: 8, fill: G.white });
  s += cir(X + 24, Y + 22, 7, { stroke: G.mute }) + ln(X + 29, Y + 27, X + 33, Y + 31, { stroke: G.mute, sw: 1.5 });
  s += t(X + 46, Y + 27, 'Search for an event name or app name', { size: 12.5, fill: G.mute });
  s += t(X, Y + 84, 'Workflow Steps', { size: 12.5, weight: 700, fill: G.ink });
  [['New Message received', 'Slack'], ['Create a new meeting', 'Slack']].forEach(([a, b], i) => {
    const y = Y + 100 + i * 58;
    s += icon(X, y, 42);
    s += t(X + 56, y + 18, a, { size: 12.5, weight: 600, fill: G.ink });
    s += t(X + 56, y + 34, b, { size: 11.5, fill: G.mute });
  });
  return svg(CW2, CH2, s, 'Component wireframe: step search with autocomplete results');
})();

// 13. Save condition modal
const saveModal = (() => {
  const c = card(400, 240); let s = c.s;
  const X = c.x + 22, Y = c.y + 24;
  s += t(X, Y + 12, 'Save This Condition?', { size: 15, weight: 700, fill: G.ink });
  s += t(c.x + 400 - 22, Y + 12, '✕', { size: 12, anchor: 'middle', fill: G.body });
  s += t(X, Y + 48, 'File Name', { size: 12, weight: 500, fill: G.body });
  s += box(X, Y + 58, 356, 44, { r: 7, fill: G.white });
  s += t(X + 14, Y + 86, 'Condition Name', { size: 13, weight: 500, fill: G.ink });
  s += ln(X + 104, Y + 72, X + 104, Y + 90, { stroke: G.ink, sw: 1.2 });
  s += chevD(X + 330, Y + 76);
  s += box(X, Y + 122, 170, 44, { r: 7, fill: G.white });
  s += t(X + 85, Y + 150, 'Cancel', { size: 12.5, weight: 700, fill: G.ink, anchor: 'middle' });
  s += box(X + 186, Y + 122, 170, 44, { r: 7, fill: G.solid, stroke: G.solid });
  s += t(X + 271, Y + 150, 'Save', { size: 12.5, weight: 700, fill: G.white, anchor: 'middle' });
  return svg(CW2, CH2, s, 'Component wireframe: save condition modal with a named-condition field');
})();

const files = {
  'bm-cw-trigger-picker.svg': triggerPicker,
  'bm-cw-trigger-setup.svg': triggerSetup,
  'bm-cw-condition-builder.svg': conditionBuilder,
  'bm-cw-popup-grid.svg': popupGrid,
  'bm-cw-popup-list.svg': popupList,
  'bm-cw-popup-search.svg': popupSearch,
  'bm-cw-popup-empty.svg': popupEmpty,
  'bm-cw-cond-groups.svg': condGroups,
  'bm-cw-cond-operator.svg': opDropdown,
  'bm-cw-cond-fields.svg': fieldFlyout,
  'bm-cw-cond-datepicker.svg': datePicker,
  'bm-cw-cond-search.svg': stepSearch,
  'bm-cw-cond-savemodal.svg': saveModal,
};
mkdirSync(OUT, { recursive: true });
for (const [n, s] of Object.entries(files)) {
  writeFileSync(join(OUT, n), s);
  console.log(n.padEnd(30), (s.length / 1024).toFixed(1) + ' KB');
}
