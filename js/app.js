// Entry point: wires every [data-action] element to its handler through one
// delegated listener, then initialises the views.
import { applyTranslations, toggleLanguage } from './ui/language.js';
import { showPage, logout, updateMatchBadge } from './ui/navigation.js';
import { switchAuthTab, selectOption, handleRegister, handleLogin, initAgeRange, restoreInterestSelection } from './ui/register.js';
import { finishSetup } from './ui/discover.js';
import { initMatches, likeProfile, passProfile, undoProfile, closeMatchPopup } from './ui/matches.js';
import { showMatchesTab, initMatchSearch } from './ui/matches-list.js';
import { closeChat, sendChatMessage, initChat } from './ui/chat.js';
import { saveProfileBio, selectAvatar, removeProfilePhoto, initProfileEditor } from './ui/profile.js';
import { toggleDarkMode, applyDarkMode } from './ui/theme.js';
import { applyMotion, toggleMotion, syncMotionButton } from './motion.js';
import { startDemo } from './ui/demo.js';
import { initFilters, openFilters, closeFilters, resetFilters } from './ui/filters.js';
import { refilterDeck } from './ui/matches.js';
import { registerServiceWorker } from './pwa.js';

/** data-action name -> handler(element, event). data-arg carries a string argument. */
const actions = {
  showPage:        el => showPage(el.dataset.arg),
  switchAuthTab:   el => switchAuthTab(el.dataset.arg),
  showMatchesTab:  el => showMatchesTab(el.dataset.arg),
  selectOption:    el => selectOption(el),
  selectAvatar:    el => selectAvatar(el),
  toggleLanguage:  () => { toggleLanguage(); syncMotionButton(); },
  toggleMotion:    () => toggleMotion(),
  toggleDarkMode:  () => toggleDarkMode(),
  startDemo:       () => startDemo(),
  finishSetup:     () => finishSetup(),
  logout:          () => logout(),
  likeProfile:     () => likeProfile(),
  passProfile:     () => passProfile(),
  undoProfile:     () => undoProfile(),
  closeMatchPopup: () => closeMatchPopup(),
  // The popup backdrop closes the popup; clicks inside the content do not.
  closeMatchPopupBackdrop: (el, event) => { if (event.target === el) closeMatchPopup(); },
  closeChat:       () => closeChat(),
  sendChatMessage: () => sendChatMessage(),
  saveProfileBio:  () => saveProfileBio(),
  removeProfilePhoto: () => removeProfilePhoto(),
  openFilters:     () => openFilters(),
  closeFilters:    () => closeFilters(),
  resetFilters:    () => resetFilters(),
};

const submitActions = {
  register: handleRegister,
  login:    handleLogin,
};

document.addEventListener('click', event => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const handler = actions[el.dataset.action];
  if (handler) handler(el, event);
});

document.addEventListener('submit', event => {
  const handler = submitActions[event.target.dataset.submit];
  if (handler) handler(event);
});

initAgeRange();
initChat();
initMatchSearch();
initProfileEditor();
restoreInterestSelection();
applyMotion();
applyDarkMode();
applyTranslations();
updateMatchBadge();
initFilters(() => refilterDeck());
initMatches();
// Manifest shortcuts open ./#discover and ./#matches.
const startPage = location.hash.slice(1);
if (['discover', 'matches'].includes(startPage)) showPage(startPage);
registerServiceWorker();
