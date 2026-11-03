/* Native Chrome 200% acceptance with a disposable profile and a real isolated API. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const { checkReadability } = require('./presentation-text-checks.cjs');
const { fillField } = require('./presentation-form-actions.cjs');

const repository = path.resolve(__dirname, '../..');
const buildRoot = path.join(repository, 'frontend/build');
const runtime = path.join(repository, '.qa');
const screenshots = path.join(repository, 'docs/screenshots');
const port = Number(process.env.QA_PORT || 4174);
const apiUrl = process.env.QA_API_URL || 'http://127.0.0.1:5187';
const baseUrl = `http://127.0.0.1:${port}`;
const checks = [];
const observations = [];
const captures = [];
const errors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let context;
let backend;
let page;
let token;
let deckId;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.jpg': 'image/jpeg' };
const server = http.createServer((request, response) => {
  const requested = path.resolve(buildRoot, `.${decodeURIComponent(new URL(request.url, baseUrl).pathname)}`);
  const file = requested.startsWith(buildRoot + path.sep) && fs.existsSync(requested) && fs.statSync(requested).isFile() ? requested : path.join(buildRoot, 'index.html');
  response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});

async function api (method, endpoint, body) {
  const response = await fetch(apiUrl + endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() };
}
async function storedDecks () {
  const response = await api('GET', '/store');
  assert.equal(response.status, 200);
  return response.body.store.store;
}
async function persisted (label, predicate) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (predicate(await storedDecks())) { checks.push(label); return; }
    await delay(80);
  }
  assert.fail(`${label}: expected state was not persisted to the real API.`);
}
const activeDeck = data => data.find(deck => deck.id === deckId);
const dialog = () => page.getByRole('dialog');
async function commitDialog (name) {
  const active = await dialog().elementHandle();
  await dialog().getByRole('button', { name, exact: true }).last().click();
  await active.waitForElementState('hidden');
  await active.dispose();
}
async function addText (text) {
  await page.getByRole('button', { name: 'TEXT', exact: true }).click();
  await dialog().getByLabel('Text', { exact: true }).fill(text);
  await fillField(dialog().getByLabel('Width (%)', { exact: true }), 45);
  await fillField(dialog().getByLabel('Height (%)', { exact: true }), 30);
  await fillField(dialog().getByLabel('Left (%)', { exact: true }), 10);
  await fillField(dialog().getByLabel('Top (%)', { exact: true }), 12);
  await zoomLayout('text element modal');
  await capture('element-modal');
  await commitDialog('Add element');
}

async function zoomLayout (label, target = page) {
  await checkReadability(target, label);
  const result = await target.evaluate(() => {
    const clipped = [...document.querySelectorAll('button, a.btn, label, .modal-title, h1, h2, h3')].filter(element => {
      const style = getComputedStyle(element);
      if (!element.getClientRects().length || style.visibility === 'hidden' || element.closest('.slide')) return false;
      return (style.overflowX === 'hidden' && element.scrollWidth > element.clientWidth + 2) || (style.overflowY === 'hidden' && element.scrollHeight > element.clientHeight + 2);
    }).map(element => element.textContent.trim().slice(0, 80));
    const modal = document.querySelector('[role="dialog"]');
    const canvas = document.querySelector('.editor-stage .slide');
    const navigation = document.querySelector('.editor-stage .slide-control');
    return {
      innerWidth, outerWidth, devicePixelRatio,
      cssZoom: getComputedStyle(document.body).zoom,
      scrollWidth: document.documentElement.scrollWidth,
      clipped,
      modalOverflow: modal ? modal.scrollWidth > modal.clientWidth + 2 : false,
      navigationOverlap: canvas && navigation ? navigation.getBoundingClientRect().top < canvas.getBoundingClientRect().bottom - 1 : false,
    };
  });
  assert.equal(result.outerWidth, 1440, `${label}: physical browser width`);
  assert.equal(result.devicePixelRatio, 2, `${label}: Chrome native zoom must produce DPR 2`);
  assert(result.innerWidth >= 700 && result.innerWidth <= 720, `${label}: native zoom must halve the CSS viewport: ${JSON.stringify(result)}`);
  assert.equal(result.cssZoom, '1', `${label}: no CSS zoom may emulate native zoom`);
  assert(result.scrollWidth <= result.innerWidth + 1, `${label}: page overflows horizontally`);
  assert.deepEqual(result.clipped, [], `${label}: clipped controls`);
  assert.equal(result.modalOverflow, false, `${label}: modal overflow`);
  assert.equal(result.navigationOverlap, false, `${label}: navigation overlaps authored content`);
  observations.push({ label, ...result });
  checks.push(`${label} at native Chrome 200%`);
}

async function capture (name, target = page) {
  await target.evaluate(() => Promise.all(document.getAnimations()
    .filter(animation => animation.effect.getComputedTiming().iterations !== Infinity)
    .map(animation => animation.finished.catch(() => {}))));
  const session = await context.newCDPSession(target);
  try {
    // Legacy contentSize uses the physical capture dimensions at native browser zoom.
    const layout = await session.send('Page.getLayoutMetrics');
    const { width, height } = layout.contentSize;
    const screenshot = await session.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
    const bytes = Buffer.from(screenshot.data, 'base64');
    const file = path.join(screenshots, `presto-native-200-${name}.png`);
    fs.writeFileSync(file, bytes);
    const dimensions = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
    assert.equal(dimensions.width, Math.round(width));
    assert.equal(dimensions.height, Math.round(height));
    captures.push({ file, ...dimensions });
  } finally { await session.detach(); }
}

async function main () {
  assert(fs.existsSync(path.join(buildRoot, 'index.html')), 'Build first with REACT_APP_API_BASE_URL matching QA_API_URL.');
  fs.mkdirSync(runtime, { recursive: true });
  fs.mkdirSync(screenshots, { recursive: true });
  const databaseFile = path.join(runtime, `native-zoom-${process.pid}.json`);
  backend = spawn(process.execPath, ['src/server.js'], { cwd: path.join(repository, 'backend'), env: { ...process.env, NODE_ENV: 'development', HOST: new URL(apiUrl).hostname, PORT: new URL(apiUrl).port, PRESTO_DATABASE_FILE: databaseFile }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let backendOutput = '';
  backend.stdout.on('data', chunk => { backendOutput += chunk; });
  backend.stderr.on('data', chunk => { backendOutput += chunk; });
  for (let attempt = 0; attempt < 60; attempt++) {
    if (backend.exitCode !== null) assert.fail(`Isolated API exited: ${backendOutput}`);
    if (backendOutput.includes('Backend is now listening')) break;
    await delay(100);
  }
  assert(backendOutput.includes('Backend is now listening'), 'Isolated API did not start.');
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  // Empty userDataDir asks Playwright to create and remove its own temporary profile.
  context = await chromium.launchPersistentContext('', { channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true, viewport: null, reducedMotion: 'reduce', args: ['--window-size=1440,1000'] });
  const settings = context.pages()[0];
  await settings.goto('chrome://settings/appearance');
  await settings.evaluate(() => new Promise(resolve => chrome.settingsPrivate.setDefaultZoom(2, resolve)));
  page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => errors.push(error.message));
  await settings.close();

  const email = `presto-native-${Date.now()}@example.test`;
  const password = 'Presto-native-zoom-2026';
  const title = 'Ideas at twice the scale';
  const renamed = 'A clear view at native 200%';
  await page.goto(`${baseUrl}/register`);
  await page.getByRole('heading', { name: 'Make it yours.', exact: true }).waitFor();
  await zoomLayout('register');
  await capture('register');
  await page.getByLabel(/Email:/).fill(email);
  await page.getByLabel(/Name:/).fill('Native Zoom QA');
  await page.getByLabel(/Password:/).nth(0).fill(password);
  await page.getByLabel(/Confirm Password:/).fill(password);
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.getByText('Register successfully.', { exact: true }).waitFor();
  await commitDialog('OK');
  checks.push('registration submits successfully at native 200%');
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByRole('heading', { name: 'Welcome back.', exact: true }).waitFor();
  await zoomLayout('login');
  await capture('login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForURL('**/dashboard');
  await page.getByText('A new beginning.', { exact: true }).waitFor();
  const skipLink = page.getByRole('link', { name: 'Skip to workspace', exact: true });
  await skipLink.focus();
  assert.equal(await skipLink.evaluate(element => getComputedStyle(element).clipPath), 'none');
  await skipLink.press('Tab');
  assert.notEqual(await skipLink.evaluate(element => getComputedStyle(element).clipPath), 'none');
  checks.push('skip navigation is visible only while keyboard focused');
  token = await page.evaluate(() => localStorage.getItem('token'));
  checks.push('login opens the real account workspace at native 200%');
  await zoomLayout('dashboard');
  await page.getByRole('button', { name: '+ New presentation', exact: true }).first().click();
  await page.getByLabel('Presentation name', { exact: true }).fill(title);
  await zoomLayout('create deck modal');
  await commitDialog('Create presentation');
  await page.getByRole('button', { name: `Open ${title}`, exact: true }).waitFor();
  deckId = (await storedDecks())[0].id;
  await persisted('deck creation persists at native 200%', data => data.length === 1);
  await capture('dashboard');
  await page.getByRole('button', { name: `Open ${title}`, exact: true }).click();
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit presentation title', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill(renamed);
  await zoomLayout('rename modal');
  await commitDialog('Save');
  await persisted('deck title update persists at native 200%', data => activeDeck(data).name === renamed);
  await addText('A presentation that stays usable at 200%.');
  await persisted('element creation persists at native 200%', data => activeDeck(data).slides[0].items.length === 1);
  const element = page.getByRole('button', { name: 'Edit text element', exact: true });
  await element.focus();
  await element.press('Enter');
  await dialog().getByLabel('Text', { exact: true }).fill('Edited at native Chrome 200%.');
  await commitDialog('Save element');
  await persisted('element edit persists at native 200%', data => activeDeck(data).slides[0].items[0].src === 'Edited at native Chrome 200%.');
  await element.click();
  const movement = page.getByRole('button', { name: 'Move selected element', exact: true });
  await movement.scrollIntoViewIfNeeded();
  const moveBox = await movement.boundingBox();
  await page.mouse.move(moveBox.x + 25, moveBox.y + 25);
  await page.mouse.down();
  await page.mouse.move(moveBox.x + 45, moveBox.y + 40, { steps: 8 });
  await page.mouse.up();
  await persisted('element pointer movement persists at native 200%', data => activeDeck(data).slides[0].items[0].left > 10 && activeDeck(data).slides[0].items[0].top > 12);
  const resizeControl = page.getByRole('button', { name: 'Resize selected element', exact: true });
  await resizeControl.scrollIntoViewIfNeeded();
  const resizeBox = await resizeControl.boundingBox();
  await page.mouse.move(resizeBox.x + resizeBox.width / 2, resizeBox.y + resizeBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(resizeBox.x + 18, resizeBox.y + 15, { steps: 8 });
  await page.mouse.up();
  await persisted('element pointer resize persists at native 200%', data => activeDeck(data).slides[0].items[0].width > 45);
  await zoomLayout('editor with selected element');
  await capture('editor-selected');
  await page.getByRole('button', { name: 'Deselect element', exact: true }).click();
  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  await page.getByLabel('Current Slide Background Colour').fill('#dce4d9');
  await zoomLayout('theme modal');
  await commitDialog('Save');
  await persisted('theme update persists at native 200%', data => activeDeck(data).slides[0].bg === '#dce4d9');
  await page.getByRole('button', { name: 'Add slide', exact: true }).click();
  await persisted('slide creation persists at native 200%', data => activeDeck(data).slides.length === 2);
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await page.waitForURL('**/1');
  await addText('A second chapter at native zoom.');
  await persisted('second slide content persists at native 200%', data => activeDeck(data).slides[1].items.length === 1);
  await page.getByRole('button', { name: 'Previous slide', exact: true }).click();
  await page.waitForURL('**/0');
  await page.getByRole('button', { name: 'Next slide', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/1');
  checks.push('pointer and keyboard slide navigation work at native 200%');
  await page.getByRole('button', { name: 'Arrange slides', exact: true }).click();
  await page.getByRole('button', { name: 'Move slide 2 earlier', exact: true }).click();
  await zoomLayout('slide order modal');
  await commitDialog('Save order');
  await persisted('slide reordering persists at native 200%', data => activeDeck(data).slides[0].items[0].src === 'A second chapter at native zoom.');
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await zoomLayout('history modal');
  assert(await dialog().locator('.history-item').count() > 4);
  await page.keyboard.press('Escape');
  await dialog().waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Go to slide 1', exact: true }).click();
  await zoomLayout('editor');
  await capture('editor');
  await page.getByText('All changes saved', { exact: true }).waitFor();
  const opened = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = await opened;
  preview.on('pageerror', error => errors.push(error.message));
  await preview.getByText('A second chapter at native zoom.', { exact: true }).waitFor();
  await zoomLayout('preview', preview);
  await capture('preview', preview);
  await preview.getByRole('button', { name: 'Next slide', exact: true }).click();
  await preview.getByText('Edited at native Chrome 200%.', { exact: true }).waitFor();
  await preview.keyboard.press('ArrowLeft');
  await preview.waitForURL('**/0');
  await preview.close();
  checks.push('preview reads saved content and navigates at native 200%');
  await page.getByRole('button', { name: 'Edit text element', exact: true }).focus();
  await page.keyboard.press('Delete');
  await persisted('element deletion persists at native 200%', data => activeDeck(data).slides[0].items.length === 0);
  await page.getByRole('button', { name: 'Delete slide', exact: true }).click();
  await persisted('slide deletion persists at native 200%', data => activeDeck(data).slides.length === 1);
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await zoomLayout('delete confirmation modal');
  await commitDialog('Yes');
  await page.waitForURL('**/dashboard');
  await persisted('deck deletion persists at native 200%', data => data.length === 0);
  await page.getByRole('button', { name: 'Log out', exact: false }).click();
  await page.waitForURL('**/login');
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
  assert.equal((await api('GET', '/store')).status, 403);
  checks.push('logout invalidates the real API session at native 200%');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log(JSON.stringify({ result: 'passed', nativeZoom: '200%', browser: process.env.BROWSER_CHANNEL || 'chrome', viewportEmulation: null, checks: checks.length, verified: checks, observations, runtimeErrors: errors.length, screenshots: captures, isolatedDatabase: databaseFile }, null, 2));
}

main().catch(async error => {
  if (page && context) await capture('failure').catch(() => {});
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (context) await context.close();
  if (backend && backend.exitCode === null) {
    const stopped = new Promise(resolve => backend.once('exit', resolve));
    backend.kill();
    await stopped;
  }
  if (server.listening) await new Promise(resolve => server.close(resolve));
});
