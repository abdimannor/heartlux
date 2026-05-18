const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');

const failures = [];

function unique(values) {
  return [...new Set(values)].sort();
}

function fail(message) {
  failures.push(message);
}

const handlerAttributes = [...html.matchAll(/\son(?:click|submit|keydown)="([^"]+)"/g)].map(match => match[1]);
const handlerCalls = unique(
  handlerAttributes
    .flatMap(value => [...value.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]))
    .filter(name => !['if', 'stopPropagation'].includes(name))
);

for (const name of handlerCalls) {
  const declaration = new RegExp(`\\bfunction\\s+${name}\\s*\\(`);
  const assignment = new RegExp(`\\b(?:const|let|var)\\s+${name}\\s*=`);
  if (!declaration.test(js) && !assignment.test(js)) {
    fail(`Missing JavaScript handler referenced by HTML: ${name}()`);
  }
}

const htmlI18nKeys = unique([
  ...[...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]),
  ...[...html.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(match => match[1]),
]);

function extractLanguageBlock(language) {
  const start = js.indexOf(`  ${language}: {`);
  if (start === -1) return '';

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = start; i < js.length; i++) {
    const char = js[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return js.slice(start, i + 1);
    }
  }

  return '';
}

function extractTranslationKeys(language) {
  const block = extractLanguageBlock(language);
  return new Set([...block.matchAll(/'([^']+)'\s*:/g)].map(match => match[1]));
}

for (const language of ['sv', 'en']) {
  const keys = extractTranslationKeys(language);
  if (!keys.size) {
    fail(`Could not find translations for language: ${language}`);
    continue;
  }

  for (const key of htmlI18nKeys) {
    if (!keys.has(key)) {
      fail(`Missing ${language} translation for HTML key: ${key}`);
    }
  }
}

const referencedIds = unique([...js.matchAll(/getElementById\('([^']+)'\)/g)].map(match => match[1]));
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
const dynamicIds = new Set(['logoutLink', 'profileNavLink']);

for (const id of referencedIds) {
  if (!htmlIds.has(id) && !dynamicIds.has(id)) {
    fail(`JavaScript references missing HTML id: ${id}`);
  }
}

if (failures.length) {
  console.error('Smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Smoke test passed: ${handlerCalls.length} handlers, ${htmlI18nKeys.length} i18n keys, ${referencedIds.length} DOM ids checked.`);
