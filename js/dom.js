// Small DOM helpers. Text is always set with textContent, never parsed as HTML.

export const byId = id => document.getElementById(id);

/** Create an element: h('div', { className: 'x', dataset: { idx: 1 } }, 'text', childEl). */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'className') el.className = value;
    else if (key in el) el[key] = value;
    else el.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/** Show or hide an element with the .is-hidden utility class. */
export function setVisible(el, visible) {
  if (el) el.classList.toggle('is-hidden', !visible);
}

/** Escape a string for the rare case where HTML must be built as text. */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
