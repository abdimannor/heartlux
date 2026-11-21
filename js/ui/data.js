// "Your data": an inventory of everything this app keeps in this browser,
// read live from localStorage and the photo store, plus export to one JSON
// file, import of that file on another device, and delete everything.
// There is no server: nothing here is ever sent anywhere.
import { KEYS, readJSON } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h } from '../dom.js';
import { loadPhoto, savePhoto, deletePhoto } from '../photo-store.js';

export const SCHEMA = 1;
export const PREFIX = 'heartlux_';
export const MAX_FILE_BYTES = 8 * 1024 * 1024;   // whole export file
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;  // the photo data URL
const NOTICE = 'heartlux_notice';                // one-shot message in sessionStorage
const DB_NAME = 'heartlux';
const CACHE_PREFIX = 'heartlux-';

/** Which keys make up each category on the screen. */
const CATEGORIES = [
  { id: 'profile',  keys: [KEYS.user, KEYS.bio, KEYS.avatar, KEYS.prompt, KEYS.prefs, KEYS.filters],
    count: () => (readJSON(KEYS.user) ? 1 : 0) },
  { id: 'likes',    keys: [KEYS.likes, KEYS.passes, KEYS.interest],
    count: () => readJSON(KEYS.likes, []).length + readJSON(KEYS.passes, []).length },
  { id: 'matches',  keys: [KEYS.matches, KEYS.seen, KEYS.unread],
    count: () => readJSON(KEYS.matches, []).length },
  { id: 'chats',    keys: [KEYS.chats, KEYS.chatRead],
    count: () => Object.values(readJSON(KEYS.chats, {})).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0) },
  { id: 'safety',   keys: [KEYS.blocked, KEYS.reports],
    count: () => readJSON(KEYS.blocked, []).length + readJSON(KEYS.reports, []).length },
  { id: 'settings', keys: [KEYS.lang, KEYS.dark, KEYS.motion],
    count: () => [KEYS.lang, KEYS.dark, KEYS.motion].filter(k => localStorage.getItem(k) !== null).length },
];

const bytes = text => new Blob([text]).size;
const kb = n => (n === 0 ? '0' : Math.max(0.1, n / 1024)
  .toLocaleString(getLang() === 'en' ? 'en-GB' : 'sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

/** Every key this app owns in localStorage (the origin may be shared with other sites). */
export const ownKeys = () => Object.keys(localStorage).filter(k => k.startsWith(PREFIX));

/** Live inventory: [{ id, count, bytes }] including the photo and any unknown keys. */
export async function inventory() {
  const known = new Set(CATEGORIES.flatMap(c => c.keys));
  const size = keys => keys.reduce((n, k) => {
    const v = localStorage.getItem(k);
    return v === null ? n : n + bytes(k) + bytes(v);
  }, 0);
  const rows = CATEGORIES.map(c => ({ id: c.id, count: c.count(), bytes: size(c.keys) }));
  const photo = await loadPhoto();
  rows.push({ id: 'photo', count: photo ? 1 : 0, bytes: photo?.size || 0 });
  const other = ownKeys().filter(k => !known.has(k));
  if (other.length) rows.push({ id: 'other', count: other.length, bytes: size(other) });
  return rows;
}

export async function renderDataPage() {
  const list = byId('dataInventory');
  if (!list) return;
  const rows = await inventory();
  list.replaceChildren(...rows.map(r => h('li', { className: 'data-row', dataset: { category: r.id } },
    h('span', { className: 'data-row-name' }, t(`data.cat.${r.id}`)),
    h('span', { className: 'data-row-count' }, t(`data.count.${r.id}`).replace('{n}', r.count)),
    h('span', { className: 'data-row-size' }, t('data.size').replace('{kb}', kb(r.bytes))))));
  const total = rows.reduce((n, r) => n + r.bytes, 0);
  byId('dataTotal').textContent = t('data.total').replace('{kb}', kb(total));
  status('');
  const notice = sessionStorage.getItem(NOTICE);
  if (notice) {
    sessionStorage.removeItem(NOTICE);
    status(t(notice));
  }
}

function status(text, isError = false) {
  const el = byId('dataStatus');
  el.textContent = text;
  el.classList.toggle('data-status--error', isError);
}

const blobToDataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

/** The complete export object (versioned). */
export async function buildExport() {
  const storage = {};
  ownKeys().sort().forEach(k => { storage[k] = localStorage.getItem(k); });
  const photo = await loadPhoto();
  return {
    app: 'heartlux',
    schema: SCHEMA,
    exportedAt: new Date().toISOString(),
    storage,
    photo: photo ? await blobToDataUrl(photo) : null,
  };
}

export async function exportData() {
  const data = await buildExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: `heartlux-${data.exportedAt.slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  status(t('data.export.done'));
}

/** Check an export file. Returns { ok, data } or { ok: false, error: i18n key }. */
export function validateExport(text, fileSize = bytes(text)) {
  if (fileSize > MAX_FILE_BYTES) return { ok: false, error: 'data.import.error.size' };
  let data;
  try { data = JSON.parse(text); } catch { return { ok: false, error: 'data.import.error.json' }; }
  if (!data || typeof data !== 'object' || data.app !== 'heartlux') return { ok: false, error: 'data.import.error.app' };
  if (data.schema !== SCHEMA) return { ok: false, error: 'data.import.error.schema' };
  const s = data.storage;
  if (!s || typeof s !== 'object' || Array.isArray(s)) return { ok: false, error: 'data.import.error.app' };
  for (const [k, v] of Object.entries(s)) {
    if (!k.startsWith(PREFIX) || typeof v !== 'string') return { ok: false, error: 'data.import.error.app' };
  }
  if (!s[KEYS.user]) return { ok: false, error: 'data.import.error.noprofile' };
  try { if (!JSON.parse(s[KEYS.user])?.username) throw 0; } catch { return { ok: false, error: 'data.import.error.noprofile' }; }
  if (data.photo !== null && data.photo !== undefined) {
    if (typeof data.photo !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(data.photo)) return { ok: false, error: 'data.import.error.photo' };
    if (data.photo.length > MAX_PHOTO_BYTES) return { ok: false, error: 'data.import.error.size' };
  }
  return { ok: true, data };
}

/** Short summary of what a file holds, for the confirm dialog. */
function summarise(data) {
  const s = data.storage;
  const parse = (k, fb) => { try { return JSON.parse(s[k]) ?? fb; } catch { return fb; } };
  const chats = Object.values(parse(KEYS.chats, {})).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0);
  return t('data.import.summary')
    .replace('{name}', parse(KEYS.user, {}).username || '?')
    .replace('{matches}', parse(KEYS.matches, []).length)
    .replace('{messages}', chats)
    .replace('{photo}', data.photo ? t('data.import.photo.yes') : t('data.import.photo.no'));
}

let pending = null;

async function onImportFile(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  const result = validateExport(await file.text(), file.size);
  if (!result.ok) { status(t(result.error), true); return; }
  pending = result.data;
  byId('importSummary').textContent = summarise(pending);
  const current = (await inventory()).filter(r => r.count > 0).map(r => t(`data.cat.${r.id}`).toLowerCase());
  byId('importReplaces').textContent = current.length
    ? t('data.import.replaces').replace('{list}', current.join(', '))
    : t('data.import.replaces.none');
  byId('importDialog').showModal();
}

function reloadTo(hash, notice) {
  sessionStorage.setItem(NOTICE, notice);
  history.replaceState(null, '', `#${hash}`);
  location.reload();
}

export async function applyImport(data) {
  ownKeys().forEach(k => localStorage.removeItem(k));
  Object.entries(data.storage).forEach(([k, v]) => localStorage.setItem(k, v));
  if (data.photo) await savePhoto(await (await fetch(data.photo)).blob());
  else await deletePhoto();
}

/** Remove every key, the photo database and the offline caches of this app. */
export async function wipeEverything() {
  ownKeys().forEach(k => localStorage.removeItem(k));
  Object.keys(sessionStorage).filter(k => k.startsWith(PREFIX)).forEach(k => sessionStorage.removeItem(k));
  await new Promise(resolve => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  if (window.caches) {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX)).map(k => caches.delete(k)));
  }
}

export function initDataPage() {
  byId('dataImportInput')?.addEventListener('change', onImportFile);
  byId('importDialog')?.addEventListener('close', async event => {
    const dialog = event.currentTarget;
    const data = pending;
    pending = null;
    if (dialog.returnValue !== 'ok' || !data) { byId('dataImportInput')?.focus(); return; }
    await applyImport(data);
    reloadTo('data', 'data.import.done');
  });
  byId('wipeDialog')?.addEventListener('close', async event => {
    if (event.currentTarget.returnValue !== 'ok') { byId('dataWipeButton')?.focus(); return; }
    await wipeEverything();
    history.replaceState(null, '', location.pathname);
    location.reload();
  });
}

export function openWipeDialog() {
  byId('wipeDialog').showModal();
}
