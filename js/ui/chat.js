// Chat modal. Messages are user text, so they are rendered with textContent only.
import { KEYS, session, readJSON, writeJSON } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';
import { randomReply } from '../profiles.js';
import { renderMatchesList } from './matches-list.js';
import { later, cancelScope } from '../timers.js';
import { paintAvatar } from '../avatars.js';

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
  container.replaceChildren(...messages.map(msg =>
    h('div', { className: `chat-bubble ${msg.from === 'user' ? 'bubble-user' : 'bubble-match'}` },
      h('span', {}, msg.text))));
  container.dataset.chatId = pid;
  container.scrollTop = container.scrollHeight;
}

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
  later(`chat:${pid}`, () => {
    const updated = getChats();
    if (!updated[pid]) return;
    updated[pid].push({ from: 'match', text: reply, ts: Date.now() });
    writeJSON(KEYS.chats, updated);
    if (session.chatProfile && String(session.chatProfile.id) === pid) renderChatMessages(pid);
  }, 800 + Math.random() * 1000);
}

export function initChat() {
  byId('chatInput')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') sendChatMessage();
  });
}
