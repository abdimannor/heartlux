// Language toggle: re-translates the static page and the dynamic bits.
import { getLang, setLang, t, translateDocument } from '../i18n.js';
import { byId } from '../dom.js';
import { updateNavbar } from './navigation.js';
import { updateAgeRangeDisplay } from './register.js';
import { renderHint } from './swipe.js';
import { renderBlockedList } from './safety.js';
import { syncDarkModeButton } from './theme.js';

export function applyTranslations() {
  translateDocument();
  const lang   = getLang();
  const toggle = byId('langToggle');
  if (toggle) {
    const code = toggle.querySelector('.ctl-code');
    code.textContent = lang === 'sv' ? 'EN' : 'SV';
    code.lang = lang === 'sv' ? 'en' : 'sv';
    // The name ends with the visible code, so speech users can say it (WCAG 2.5.3).
    toggle.setAttribute('aria-label', `${t('nav.langLabel')}, ${code.textContent}`);
    toggle.title = t('nav.langLabel');
  }
  document.documentElement.lang = lang;
  updateNavbar();
  updateAgeRangeDisplay();
  renderHint();
  renderBlockedList();
  syncDarkModeButton();
}

export function toggleLanguage() {
  setLang(getLang() === 'sv' ? 'en' : 'sv');
  applyTranslations();
}
