// Chat modal. Messages are user text, so they are rendered with textContent only.
import { KEYS, session, readJSON, writeJSON } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';
import { randomReply } from '../profiles.js';
import { renderMatchesList } from './matches-list.js';
import { later, cancelScope } from '../timers.js';
import { paintAvatar } from '../avatars.js';
import { photoUrl } from '../photo-store.js';

const getChats = () => readJSON(KEYS.chats, {});

export function openChat(profile) {
  session.chatProfile = profile;
  paintAvatar(byId('chatPartnerAvatar'), profile);
  byId('chatPartnerName').textContent   = `${profile.name}, ${profile.age}`;
  setVisible(byId('chatModal'), true);

  const seen = readJSON(KEYS.seen, []);
  if (!seen.includes(String(profile.id))) {
    seen.push(String(profile.id));
    writeJSON(KEYS.seen, seen);
    renderMatchesList();
  }

  renderChatMessages();
  later('chat:ui', () => byId('chatInput').focus(), 50);
}

export function closeChat() {
  cancelScope('chat:ui');
  setVisible(byId('chatModal'), false);
  session.chatProfile = null;
}

function renderChatMessages(pid = String(session.chatProfile.id)) {
  const chats = getChats();
  let messages = chats[pid];
  if (!messages) {
    messages = [{ from: 'match', text: t('chat.greeting'), ts: Date.now() - 60000 }];
    chats[pid] = messages;
    writeJSON(KEYS.chats, chats);
  }
  const container = byId('chatMessages');
  const bubbles = messages.map(msg =>
    h('div', { className: `chat-bubble ${msg.from === 'user' ? 'bubble-user' : 'bubble-match'}` },
      h('span', {}, msg.text)));
  // Typing state belongs to a conversation, so it only shows in the chat it is for.
  if (session.typing.has(pid)) {
    bubbles.push(h('div', { className: 'chat-bubble bubble-match typing-indicator', role: 'status',
      'aria-label': t('chat.typing', { name: session.chatProfile?.name || '' }) },
      h('span', { className: 'typing-dot' }), h('span', { className: 'typing-dot' }), h('span', { className: 'typing-dot' })));
  }
  container.replaceChildren(...bubbles);
  container.dataset.chatId = pid;
  container.scrollTop = container.scrollHeight;
  paintSelfPhoto();
}

/** Your own photo beside your messages, when you have uploaded one. */
async function paintSelfPhoto() {
  const url = await photoUrl();
  const own = byId('chatSelfPhoto');
  if (!own) return;
  own.replaceChildren(...(url ? [h('img', { src: url, alt: t('profile.photo.alt') })] : []));
  setVisible(own, Boolean(url));
}

const isOpenChat = pid => session.chatProfile && String(session.chatProfile.id) === pid;

export function sendChatMessage() {
  const input = byId('chatInput');
  const text  = input.value.trim();
  if (!text || !session.chatProfile) return;

  const chats = getChats();
  const pid   = String(session.chatProfile.id);
  if (!chats[pid]) chats[pid] = [];
  chats[pid].push({ from: 'user', text, ts: Date.now() });
  writeJSON(KEYS.chats, chats);
  input.value = '';
  renderChatMessages();

  const reply = randomReply(getLang());
  // The reply is bound to the conversation it answers (pid), never to whichever
  // chat happens to be open when the timer fires.
  const delay = 800 + Math.random() * 1000;
  later(`chat:${pid}`, () => {
    session.typing.add(pid);
    if (isOpenChat(pid)) renderChatMessages(pid);
  }, 300);
  later(`chat:${pid}`, () => {
    session.typing.delete(pid);
    const updated = getChats();
    if (!updated[pid]) return;
    updated[pid].push({ from: 'match', text: reply, ts: Date.now() });
    writeJSON(KEYS.chats, updated);
    if (isOpenChat(pid)) renderChatMessages(pid);
  }, Math.max(delay, 400));
}

export function initChat() {
  byId('chatInput')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') sendChatMessage();
  });
}
