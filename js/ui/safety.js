// Safety controls: unmatch, block and report a match, the blocked list with
// unblock, and the "Before you meet" tips. Dialogs are native <dialog> elements
// opened with showModal(), so focus moves in and the page behind is inert;
// focus goes back to the control that opened them when they close.
import { KEYS, session, readJSON, writeJSON } from '../state.js';
import { t } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';

let onChange = () => {};

/** Called after a match is removed or a profile is (un)blocked. */
export function onSafetyChange(fn) { onChange = fn; }

const pidOf = profile => String(profile.id);

function announce(text) {
  const live = byId('safetyStatus');
  if (live) live.textContent = text;
}

/** Open a native dialog and return focus to the opener when it closes. */
function openDialog(dialog, opener = document.activeElement) {
  dialog.addEventListener('close', () => {
    if (opener && opener.isConnected) opener.focus();
  }, { once: true });
  dialog.showModal();
}

function removeMatch(profile) {
  const pid = pidOf(profile);
  writeJSON(KEYS.matches, readJSON(KEYS.matches, []).filter(p => String(p.id) !== pid));
  const chats = readJSON(KEYS.chats, {});
  delete chats[pid];
  writeJSON(KEYS.chats, chats);
  if (session.match.matchedProfiles) {
    session.match.matchedProfiles = session.match.matchedProfiles.filter(p => String(p.id) !== pid);
  }
}

export function unmatch(profile) {
  removeMatch(profile);
  announce(t('safety.done.unmatch', { name: profile.name }));
  onChange({ type: 'unmatch', profile });
}

export function block(profile) {
  removeMatch(profile);
  const list = readJSON(KEYS.blocked, []).filter(b => String(b.id) !== pidOf(profile));
  list.push({ id: profile.id, name: profile.name, age: profile.age, city: profile.city, ts: Date.now() });
  writeJSON(KEYS.blocked, list);
  announce(t('safety.done.block', { name: profile.name }));
  onChange({ type: 'block', profile });
}

export function unblock(id) {
  const list = readJSON(KEYS.blocked, []);
  const entry = list.find(b => String(b.id) === String(id));
  writeJSON(KEYS.blocked, list.filter(b => String(b.id) !== String(id)));
  if (entry) announce(t('safety.done.unblock', { name: entry.name }));
  renderBlockedList();
  onChange({ type: 'unblock', id });
}

/** Ask before a destructive action. */
export function confirmAction(kind, profile, opener) {
  const dialog = byId('confirmDialog');
  byId('confirmTitle').textContent = t(`safety.${kind}.title`, { name: profile.name });
  byId('confirmText').textContent = t(`safety.${kind}.text`);
  const ok = byId('confirmOk');
  ok.textContent = t(`safety.${kind}.confirm`);
  dialog.returnValue = '';
  dialog.addEventListener('close', () => {
    if (dialog.returnValue !== 'ok') return;
    (kind === 'block' ? block : unmatch)(profile);
  }, { once: true });
  openDialog(dialog, opener);
}

export function openReport(profile, opener) {
  const dialog = byId('reportDialog');
  const form = byId('reportForm');
  form.reset();
  byId('reportTitle').textContent = t('safety.report.title', { name: profile.name });
  dialog.returnValue = '';
  dialog.addEventListener('close', () => {
    if (dialog.returnValue !== 'send') return;
    const data = new FormData(form);
    const reports = readJSON(KEYS.reports, []);
    reports.push({ id: profile.id, reason: data.get('reason'), details: String(data.get('details') || '').slice(0, 1000), ts: Date.now() });
    writeJSON(KEYS.reports, reports);
    if (data.get('alsoBlock')) block(profile);
    announce(t('safety.done.report', { name: profile.name }));
  }, { once: true });
  openDialog(dialog, opener);
}

export function openTips(opener) {
  openDialog(byId('tipsDialog'), opener);
}

/** A "Safety" disclosure with unmatch, block, report and tips for one match. */
export function safetyMenu(profile, { tips = false } = {}) {
  const item = (key, run) => {
    const btn = h('button', { type: 'button', className: `safety-item safety-item--${key}` }, t(`safety.${key}`));
    btn.addEventListener('click', event => {
      event.stopPropagation();
      menu.open = false;
      run(summary);
    });
    return btn;
  };
  const summary = h('summary', { className: 'btn btn-ghost btn-sm safety-summary',
    'aria-label': t('safety.menu.label', { name: profile.name }) }, t('safety.menu'));
  const menu = h('details', { className: 'safety-menu' },
    summary,
    h('div', { className: 'safety-list' },
      tips && item('tips', opener => openTips(opener)),
      item('unmatch', opener => confirmAction('unmatch', profile, opener)),
      item('block', opener => confirmAction('block', profile, opener)),
      item('report', opener => openReport(profile, opener))));
  menu.addEventListener('click', event => event.stopPropagation());
  return menu;
}

export function renderBlockedList() {
  const list = byId('blockedList');
  if (!list) return;
  const blocked = readJSON(KEYS.blocked, []);
  setVisible(byId('blockedEmpty'), blocked.length === 0);
  list.replaceChildren(...blocked.map(b => {
    const btn = h('button', { type: 'button', className: 'btn btn-secondary btn-sm',
      'aria-label': t('safety.unblock.label', { name: b.name }) }, t('safety.unblock'));
    btn.addEventListener('click', () => {
      const next = btn.closest('li')?.nextElementSibling?.querySelector('button')
        || btn.closest('li')?.previousElementSibling?.querySelector('button');
      unblock(b.id);
      (next && next.isConnected ? next : byId('blockedHeading'))?.focus();
    });
    return h('li', { className: 'blocked-row' },
      h('span', {}, `${b.name}, ${b.age}`, h('small', {}, ` · ${b.city}`)), btn);
  }));
}

export function initSafety() {
  // Clicking the backdrop of a safety dialog closes it like Escape does.
  ['confirmDialog', 'reportDialog', 'tipsDialog'].forEach(id => {
    byId(id)?.addEventListener('click', event => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    });
  });
}
