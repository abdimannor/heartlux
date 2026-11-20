// Language toggle: re-translates the static page and the dynamic bits.
import { getLang, setLang, t, translateDocument } from '../i18n.js';
import { byId } from '../dom.js';
import { updateNavbar } from './navigation.js';
import { updateAgeRangeDisplay } from './register.js';

export function applyTranslations() {
  translateDocument();
  const lang   = getLang();
  const toggle = byId('langToggle');
  if (toggle) {
    toggle.textContent = lang === 'sv' ? 'EN' : 'SV';
    toggle.setAttribute('aria-label', t('nav.langLabel'));
  }
  document.documentElement.lang = lang;
  updateNavbar();
  updateAgeRangeDisplay();
}

export function toggleLanguage() {
  setLang(getLang() === 'sv' ? 'en' : 'sv');
  applyTranslations();
}
