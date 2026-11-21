// Dark mode.
import { KEYS, getItem, setItem } from '../state.js';
import { byId } from '../dom.js';
import { t } from '../i18n.js';

// Browser chrome / installed-app title bar follows the in-app theme.
const THEME_COLOR = { light: '#cc328c', dark: '#140c1b' };

export function syncDarkModeButton(isDark = document.body.classList.contains('dark-mode')) {
  const btn = byId('darkModeBtn');
  if (btn) {
    const label = t(isDark ? 'nav.theme.light' : 'nav.theme.dark');
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? THEME_COLOR.dark : THEME_COLOR.light);
}

export function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  setItem(KEYS.dark, isDark ? '1' : '0');
  syncDarkModeButton(isDark);
}

export function applyDarkMode() {
  const isDark = getItem(KEYS.dark) === '1';
  if (isDark) document.body.classList.add('dark-mode');
  syncDarkModeButton(isDark);
}
