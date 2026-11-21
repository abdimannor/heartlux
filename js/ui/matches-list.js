// "My matches" tab: the list of matched profiles.
import { paintAvatar } from '../avatars.js';
import { KEYS, readJSON, setItem, isChatUnread } from '../state.js';
import { t } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';
import { updateMatchBadge } from './navigation.js';
import { openChat } from './chat.js';
import { safetyMenu } from './safety.js';

export function showMatchesTab(tab) {
  const browseEl    = byId('browseContent');
  const myMatchesEl = byId('matchesListContent');
  if (!browseEl) return;

  const isBrowse = tab === 'browse';
  setVisible(browseEl, isBrowse);
  setVisible(myMatchesEl, !isBrowse);
  byId('tabBrowse').classList.toggle('active', isBrowse);
  byId('tabMyMatches').classList.toggle('active', !isBrowse);

  if (!isBrowse) {
    setItem(KEYS.unread, '0');
    updateMatchBadge();
    renderMatchesList();
  }
}

function matchCard(profile, isNew, lastMessage) {
  const unread = isChatUnread(String(profile.id));
  const card = h('div', { className: `match-list-card${unread ? ' is-unread' : ''}`, dataset: { matchId: String(profile.id) } },
    h('div', { className: 'match-list-avatar' }),
    h('div', { className: 'match-list-info' },
      h('strong', {}, `${profile.name}, ${profile.age} `,
        isNew && h('span', { className: 'match-new-badge' }, t('matches.new.badge')),
        unread && h('span', { className: 'unread-dot', role: 'img', 'aria-label': t('matches.unread') })),
      lastMessage && h('span', { className: 'match-list-preview' }, lastMessage),
      h('span', {}, `📍 ${profile.city}`),
      h('div', { className: 'match-list-tags' },
        profile.interests.slice(0, 2).map(i => t(`interest.${i}`)).join(' · '))),
    h('div', { className: 'match-list-actions' },
      h('button', { type: 'button', className: 'btn btn-primary btn-sm' }, t('matches.list.chat')),
      safetyMenu(profile)));
  paintAvatar(card.querySelector('.match-list-avatar'), profile);
  card.addEventListener('click', () => openChat(profile));
  return card;
}

export function renderMatchesList() {
  const grid = byId('matchesListGrid');
  if (!grid) return;
  const matched = readJSON(KEYS.matches, []);

  if (matched.length === 0) {
    grid.replaceChildren(
      h('div', { className: 'empty-state matches-list-empty' },
        h('div', { className: 'empty-emoji' }, '💕'),
        h('h2', {}, t('matches.list.empty.title')),
        h('p', {}, t('matches.list.empty.text')),
        h('button', {
          className: 'btn btn-primary u-mt-1',
          dataset: { action: 'showMatchesTab', arg: 'browse' },
        }, t('matches.tab.browse'))));
    return;
  }

  const seen  = readJSON(KEYS.seen, []);
  const chats = readJSON(KEYS.chats, {});
  const query = (byId('matchSearch')?.value || '').trim().toLocaleLowerCase();
  const hits  = matched.filter(p => !query
    || p.name.toLocaleLowerCase().includes(query)
    || (chats[String(p.id)] || []).some(m => String(m.text).toLocaleLowerCase().includes(query)));

  if (hits.length === 0) {
    grid.replaceChildren(h('p', { className: 'match-search-empty', role: 'status' },
      t('matches.search.empty', { q: byId('matchSearch').value.trim() })));
    return;
  }
  grid.replaceChildren(...hits.map(p =>
    matchCard(p, !seen.includes(String(p.id)), (chats[String(p.id)] || []).at(-1)?.text)));
}

export function initMatchSearch() {
  byId('matchSearch')?.addEventListener('input', renderMatchesList);
}
