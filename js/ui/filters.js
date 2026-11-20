// Discover filter sheet: age range, interests, city and "has a prompt".
// Changes apply to the deck live and are remembered in localStorage.
import { KEYS, readJSON, writeJSON } from '../state.js';
import { byId } from '../dom.js';
import { t } from '../i18n.js';
import { normaliseFilters, activeFilterCount, NO_FILTERS } from '../profiles.js';

export const getFilters = () => normaliseFilters(readJSON(KEYS.filters, NO_FILTERS));

let onChange = () => {};

function readForm() {
  return normaliseFilters({
    minAge:    byId('filterMinAge').value,
    maxAge:    byId('filterMaxAge').value,
    interests: [...document.querySelectorAll('input[name="filterInterest"]:checked')].map(cb => cb.value),
    city:      byId('filterCity').value,
    hasPrompt: byId('filterHasPrompt').checked,
  });
}

function fillForm(f) {
  byId('filterMinAge').value = f.minAge;
  byId('filterMaxAge').value = f.maxAge;
  document.querySelectorAll('input[name="filterInterest"]').forEach(cb => {
    cb.checked = f.interests.includes(cb.value);
  });
  byId('filterCity').value        = f.city;
  byId('filterHasPrompt').checked = f.hasPrompt;
}

export function syncFilterButton() {
  const badge = byId('filterCount');
  if (!badge) return;
  const n = activeFilterCount(getFilters());
  badge.textContent = n ? String(n) : '';
  badge.classList.toggle('is-hidden', n === 0);
  byId('openFilters')?.setAttribute('aria-label', n ? t('filters.button.active', { n }) : t('filters.button'));
}

function save(f) {
  writeJSON(KEYS.filters, f);
  syncFilterButton();
  onChange(f);
}

export function openFilters() {
  const sheet = byId('filterSheet');
  if (!sheet || sheet.open) return;
  fillForm(getFilters());
  sheet.showModal();
}

export function closeFilters() {
  byId('filterSheet')?.close();
}

export function resetFilters() {
  const f = normaliseFilters(NO_FILTERS);
  if (byId('filterForm')) fillForm(f);
  save(f);
}

/** Wire the sheet once. changed(filters) re-deals the deck. */
export function initFilters(changed) {
  onChange = changed;
  const form = byId('filterForm');
  if (!form) return;
  form.addEventListener('input', () => save(readForm()));
  form.addEventListener('submit', event => { event.preventDefault(); closeFilters(); });
  // A click on the backdrop (the dialog element itself) closes the sheet.
  byId('filterSheet').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeFilters();
  });
  syncFilterButton();
}
