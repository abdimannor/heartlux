// Page switching, the navbar account links and the unread-matches badge.
import { KEYS, getUser, getUnread, clearUserData, resetMatchState } from '../state.js';
import { t } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';
import { switchAuthTab } from './register.js';
import { showMatchesTab, initMatches } from './matches.js';
import { loadProfilePage } from './profile.js';
import { cancelScope, PAGE } from '../timers.js';
import { motionReduced } from '../motion.js';

const PROTECTED_PAGES = ['discover', 'matches', 'profile'];

function swapPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  byId(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

function activatePage(pageId) {
  cancelScope(PAGE);
  const current = document.querySelector('.page.active');
  const reduced = motionReduced();
  // View Transitions where supported; a plain swap everywhere else.
  if (document.startViewTransition && !reduced && current && current.id !== pageId) {
    document.startViewTransition(() => swapPage(pageId));
  } else {
    swapPage(pageId);
  }
}

export function showPage(pageId) {
  if (PROTECTED_PAGES.includes(pageId) && !getUser()) {
    activatePage('register');
    switchAuthTab('register');
    const gate = byId('authGate');
    if (gate) { gate.textContent = t('auth.gate'); setVisible(gate, true); }
    return;
  }

  activatePage(pageId);
  if (pageId === 'matches') { showMatchesTab('browse'); initMatches(); }
  if (pageId === 'profile') loadProfilePage();
}

function navLink(id, className, action, arg) {
  return h('a', { id, href: '#', className, dataset: { action, ...(arg ? { arg } : {}) } });
}

export function updateNavbar() {
  const user     = getUser();
  const joinLink = document.querySelector('.navbar-link[data-page="register"]');
  if (!joinLink) return;

  if (user) {
    joinLink.textContent = `${t('nav.hello')}, ${user.username}`;
    joinLink.dataset.arg = 'profile';

    let profileLink = byId('profileNavLink');
    if (!profileLink) {
      profileLink = navLink('profileNavLink', 'navbar-link', 'showPage', 'profile');
      joinLink.parentElement.insertBefore(profileLink, joinLink);
    }
    profileLink.textContent = t('nav.profile');

    let logoutLink = byId('logoutLink');
    if (!logoutLink) {
      logoutLink = navLink('logoutLink', 'navbar-link navbar-logout', 'logout');
      joinLink.parentElement.appendChild(logoutLink);
    }
    logoutLink.textContent = t('nav.logout');
  } else {
    joinLink.textContent = t('nav.join');
    joinLink.dataset.arg = 'register';
    byId('logoutLink')?.remove();
    byId('profileNavLink')?.remove();
  }
}

export function logout() {
  clearUserData();
  resetMatchState();
  updateNavbar();
  showPage('home');
}

export function updateMatchBadge() {
  const badge = byId('matchesBadge');
  if (!badge) return;
  const unread = getUnread();
  badge.textContent = unread > 9 ? '9+' : unread;
  setVisible(badge, unread > 0);
}
