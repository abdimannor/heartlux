// Preference setup on the Discover page.
import { KEYS, getItem, writeJSON, resetMatchState } from '../state.js';
import { t } from '../i18n.js';
import { byId, h } from '../dom.js';
import { showPage } from './navigation.js';
import { later, PAGE } from '../timers.js';

export function finishSetup() {
  const interest  = getItem(KEYS.interest);
  const minAge    = parseInt(byId('ageMin')?.value || 18, 10);
  const maxAge    = parseInt(byId('ageMax')?.value || 80, 10);
  const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
    .map(cb => cb.value);

  if (!interest)         { alert(t('discover.alert.interest'));  return; }
  if (!interests.length) { alert(t('discover.alert.interests')); return; }

  writeJSON(KEYS.prefs, { interest, minAge, maxAge, interests, completedAt: new Date().toISOString() });
  resetMatchState();

  document.querySelector('.selector-section').replaceChildren(
    h('div', { className: 'setup-done' },
      h('div', { className: 'setup-done-emoji' }, '💗'),
      h('h2', { className: 'setup-done-title' }, t('setup.done.title')),
      h('p', { className: 'setup-done-text' }, t('setup.done.text'))));

  // Page-scoped: leaving Discover before it fires cancels the redirect.
  later(PAGE, () => showPage('matches'), 1500);
}
