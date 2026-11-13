// node check.mjs — каждый ключ data-i18n из index.html должен быть в словарях en и pl (и наоборот)
import { readFileSync } from 'node:fs';
import assert from 'node:assert';

const read = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const window = {};
new Function('window', read('i18n.js'))(window);

const keys = [...new Set([...read('index.html').matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]))].sort();
assert.ok(keys.length > 0, 'no data-i18n keys found in index.html');
for (const lang of ['en', 'pl']) {
  assert.deepStrictEqual(Object.keys(window.I18N[lang]).sort(), keys, `${lang}: keys differ from index.html`);
  for (const k of keys) assert.ok(window.I18N[lang][k].trim(), `${lang}: empty translation for ${k}`);
}
console.log(`ok: ${keys.length} keys × en, pl`);
