import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const auth = readFileSync('js/auth.js', 'utf8');
const html = [
  readFileSync('index.html', 'utf8'),
  readFileSync('landing.html', 'utf8'),
].join('\n');

assert.match(auth, /no password\/account authentication/i);
assert.match(auth, /localStorage\.removeItem\(['"]users['"]\)/);
assert.match(auth, /localStorage\.removeItem\(['"]currentUser['"]\)/);

assert.doesNotMatch(auth, /localStorage\.setItem\(['"]users['"]/);
assert.doesNotMatch(auth, /localStorage\.setItem\(['"]currentUser['"]/);
assert.doesNotMatch(html, /type\s*=\s*["']password["']/i);
assert.doesNotMatch(html, /localStorage\.setItem\(['"]pythonAdventuresUsers['"]/);
assert.doesNotMatch(html, /password\s*:/i);

console.log('Local learner-profile privacy contract passed.');
