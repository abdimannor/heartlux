// Conversation starters: three openers built from shared interests, the
// match's prompt answer and their city. Pure, so it can be tested in Node.
import { translate } from '../i18n.js';

/** Return up to three opener strings for a match, in the given language. */
export function buildStarters(lang, profile, userInterests = []) {
  const tr = (key, vars) => translate(lang, key, vars);
  const topic = i => tr(`starter.topic.${i}`);
  const shared = (profile.interests || []).filter(i => userInterests.includes(i));
  const out = [];
  if (profile.prompt?.answer) {
    out.push(tr('starter.prompt', { question: tr(`prompt.${profile.prompt.key}`).replace(/\.{3}$|…$/, '').trim(), answer: profile.prompt.answer }));
  }
  if (shared[0]) out.push(tr('starter.shared', { topic: topic(shared[0]) }));
  if (shared[1]) out.push(tr('starter.pick', { a: topic(shared[0]), b: topic(shared[1]) }));
  if (profile.city) out.push(tr('starter.city', { city: profile.city }));
  out.push(tr('starter.generic'));
  return [...new Set(out)].slice(0, 3);
}
