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

const manifestPath = path.join(root, 'manifest.webmanifest');
const serviceWorkerPath = path.join(root, 'sw.js');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!html.includes('rel="manifest"') || !html.includes('manifest.webmanifest')) {
  fail('index.html must link manifest.webmanifest');
}

if (!js.includes('navigator.serviceWorker.register')) {
  fail('main.js must register the service worker');
}

for (const required of ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons']) {
  if (!manifest[required]) fail(`manifest.webmanifest missing required field: ${required}`);
}

if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  fail('manifest.webmanifest must define regular and maskable icons');
}

for (const icon of manifest.icons || []) {
  if (!fs.existsSync(path.join(root, icon.src))) {
    fail(`Manifest icon does not exist: ${icon.src}`);
  }
}

const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
for (const asset of ['index.html', 'css/style.css', 'js/main.js', 'manifest.webmanifest']) {
  if (!serviceWorker.includes(asset)) fail(`Service worker cache list missing: ${asset}`);
}

const robotsPath = path.join(root, 'robots.txt');
const sitemapPath = path.join(root, 'sitemap.xml');
const robots = fs.readFileSync(robotsPath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');

for (const requiredMeta of ['rel="canonical"', 'og:title', 'og:description', 'twitter:card', 'application/ld+json']) {
  if (!html.includes(requiredMeta)) fail(`index.html missing SEO metadata: ${requiredMeta}`);
}

if (!robots.includes('Sitemap: https://abdimannor.github.io/heartlux/sitemap.xml')) {
  fail('robots.txt must reference the production sitemap URL');
}

if (!sitemap.includes('<loc>https://abdimannor.github.io/heartlux/</loc>')) {
  fail('sitemap.xml must include the production GitHub Pages URL');
}
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
