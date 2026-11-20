// Scoped timers. Every delayed callback belongs to a scope (a view or a chat),
// so navigation can cancel what no longer applies instead of letting it fire late.
const scopes = new Map();

/** Run fn after ms inside a scope. Returns the timer id. */
export function later(scope, fn, ms) {
  const ids = scopes.get(scope) || new Set();
  scopes.set(scope, ids);
  const id = setTimeout(() => {
    ids.delete(id);
    fn();
  }, ms);
  ids.add(id);
  return id;
}

/** Cancel every pending timer in a scope. */
export function cancelScope(scope) {
  const ids = scopes.get(scope);
  if (!ids) return 0;
  ids.forEach(id => clearTimeout(id));
  const count = ids.size;
  scopes.delete(scope);
  return count;
}

/** Cancel every scope whose name starts with prefix (e.g. 'chat:'). */
export function cancelPrefix(prefix) {
  let count = 0;
  [...scopes.keys()].filter(k => k.startsWith(prefix)).forEach(k => { count += cancelScope(k); });
  return count;
}

export function pending(scope) {
  return scopes.get(scope)?.size || 0;
}

// Page-level timers (redirects, focus moves) live in this scope and die on navigation.
export const PAGE = 'page';
