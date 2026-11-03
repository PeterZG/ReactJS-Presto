/* Production UI + real local API acceptance. Each run owns an isolated, ignored database. */
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
const screenshots = path.join(repository, 'docs/screenshots');
const runtime = path.join(repository, '.qa');
const port = Number(process.env.QA_PORT || 4173);
const apiUrl = process.env.QA_API_URL || 'http://127.0.0.1:5187';
const baseUrl = `http://127.0.0.1:${port}`;
const widths = [320, 390, 768, 1024, 1440, 1920];
const errors = [];
const checks = [];
let browser;
let backend;
let token;
let context;
let page;
let deckId;
const imageSource = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#dce4d9"/><circle cx="570" cy="240" r="140" fill="#b83e28"/><text x="50" y="200" font-family="sans-serif" font-size="60" fill="#202a34">Ideas, presented.</text></svg>').toString('base64');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.jpg': 'image/jpeg' };
const server = http.createServer((request, response) => {
  const requested = path.resolve(buildRoot, `.${decodeURIComponent(new URL(request.url, baseUrl).pathname)}`);
  const file = requested.startsWith(buildRoot + path.sep) && fs.existsSync(requested) && fs.statSync(requested).isFile() ? requested : path.join(buildRoot, 'index.html');
  response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function api (method, endpoint, body, accessToken = token) {
  const response = await fetch(apiUrl + endpoint, { method, headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, body: await response.json() };
}
async function decks () {
  const response = await api('GET', '/store');
  assert.equal(response.status, 200);
  return response.body.store.store;
}
async function verifyStore (label, predicate) {
  let data;
  for (let attempt = 0; attempt < 60; attempt++) {
    data = await decks();
    if (predicate(data)) { checks.push(label); return data; }
    await delay(80);
  }
  assert.fail(`${label}: persisted store did not match expected state: ${JSON.stringify(data).slice(0, 800)}`);
}
const currentDeck = data => data.find(deck => deck.id === deckId);
const dialog = () => page.getByRole('dialog');
async function commitDialog (name) {
  const activeDialog = await dialog().elementHandle();
  await dialog().getByRole('button', { name, exact: true }).last().click();
  // A failed save can immediately open a different error dialog.
  await activeDialog.waitForElementState('hidden');
  await activeDialog.dispose();
}
async function editElement (type, values) {
  const element = page.getByRole('button', { name: `Edit ${type.toLowerCase()} element`, exact: true });
  await element.focus();
  await element.press('Enter');
  for (const [label, value] of Object.entries(values)) await fillField(dialog().getByLabel(label, { exact: true }), value);
  await commitDialog('Save element');
}
async function addElement (type, values) {
  await page.getByRole('button', { name: type, exact: true }).click();
  for (const [label, value] of Object.entries(values)) await fillField(dialog().getByLabel(label, { exact: true }), value);
  await commitDialog('Add element');
}
async function screen (name) { await page.screenshot({ path: path.join(screenshots, `${name}.png`), fullPage: true }); }

async function layoutCheck (label) {
  await checkReadability(page, label);
  const result = await page.evaluate(() => {
    const root = document.documentElement;
    const clippedControls = [...document.querySelectorAll('button, a.btn, label, .modal-title, .field-error, h1, h2, h3')].filter(element => {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || !element.getClientRects().length || element.closest('.slide')) return false;
      return (style.overflowX === 'hidden' && element.scrollWidth > element.clientWidth + 2) || (style.overflowY === 'hidden' && element.scrollHeight > element.clientHeight + 2);
    }).map(element => element.textContent.trim().slice(0, 100));
    const dialog = document.querySelector('[role="dialog"]');
    const canvas = document.querySelector('.editor-stage .slide');
    const controls = document.querySelector('.editor-stage .slide-control');
    const artworkTitle = document.querySelector('.art-slide-front strong');
    const artworkFooter = document.querySelector('.art-slide-front small');
    return {
      width: window.innerWidth,
      scrollWidth: root.scrollWidth,
      clippedControls,
      dialogOverflow: dialog ? dialog.scrollWidth > dialog.clientWidth + 2 : false,
      canvasControlsOverlap: canvas && controls ? controls.getBoundingClientRect().top < canvas.getBoundingClientRect().bottom - 1 : false,
      artworkTextOverlap: artworkTitle?.getClientRects().length ? artworkTitle.offsetTop + artworkTitle.offsetHeight > artworkFooter.offsetTop : false,
    };
  });
  assert(result.scrollWidth <= result.width + 1, `${label}: page overflow ${JSON.stringify(result)}`);
  assert.deepEqual(result.clippedControls, [], `${label}: clipped controls`);
  assert.equal(result.dialogOverflow, false, `${label}: dialog overflow`);
  assert.equal(result.canvasControlsOverlap, false, `${label}: navigation covers authored content`);
  assert.equal(result.artworkTextOverlap, false, `${label}: artwork text overlaps`);
  checks.push(label);
}

async function responsivePage (route, ready, name) {
  await page.goto(baseUrl + route);
  await ready();
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await layoutCheck(`${name} at ${width}px`);
    if (width === 390 || width === 1440) await screen(`presto-${name}-${width}`);
  }
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  await layoutCheck(`${name} at 200% page enlargement`);
  await page.evaluate(() => { document.body.style.zoom = ''; });
}

async function main () {
  assert(fs.existsSync(path.join(buildRoot, 'index.html')), 'Run npm run build first, with REACT_APP_API_BASE_URL matching QA_API_URL.');
  fs.mkdirSync(runtime, { recursive: true });
  fs.mkdirSync(screenshots, { recursive: true });
  const databaseFile = path.join(runtime, `browser-${process.pid}.json`);
  backend = spawn(process.execPath, ['src/server.js'], { cwd: path.join(repository, 'backend'), env: { ...process.env, NODE_ENV: 'development', PORT: new URL(apiUrl).port, HOST: new URL(apiUrl).hostname, PRESTO_DATABASE_FILE: databaseFile }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let backendOutput = '';
  backend.stdout.on('data', chunk => { backendOutput += chunk; });
  backend.stderr.on('data', chunk => { backendOutput += chunk; });
  for (let attempt = 0; attempt < 60; attempt++) {
    if (backend.exitCode !== null) assert.fail(`QA backend exited: ${backendOutput}`);
    if (backendOutput.includes('Backend is now listening')) break;
    await delay(100);
  }
  assert(backendOutput.includes('Backend is now listening'), 'QA backend did not start.');
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}), ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  context.on('page', opened => opened.on('pageerror', error => errors.push(error.message)));
  page = await context.newPage();
  page.setDefaultTimeout(12000);
  const email = `presto-qa-${Date.now()}@example.test`;
  const password = 'Presto-local-qa-2026';
  const deckName = 'A better way to share ideas';
  const longName = 'A thoughtful presentation for a very long project name — ' + 'UnbrokenPresentationTitle'.repeat(7);

  await page.goto(`${baseUrl}/register`);
  await page.getByLabel(/Email:/).fill(email);
  await page.getByLabel(/Name:/).fill('Presto QA');
  await page.getByLabel(/Password:/).nth(0).fill(password);
  await page.getByLabel(/Confirm Password:/).fill('mismatch');
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.getByText('Error confirm password.').waitFor();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.getByLabel(/Confirm Password:/).fill(password);
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.getByText('Register successfully.').waitFor();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.getByText('Invalid username or password', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForURL('**/dashboard');
  token = await page.evaluate(() => localStorage.getItem('token'));
  await page.getByText('A new beginning.').waitFor();
  checks.push('registration mismatch recovery, registration, invalid-login recovery, login, fresh account');
  async function createDeck (name) {
    await page.getByRole('button', { name: '+ New presentation', exact: true }).first().click();
    await page.getByLabel('Presentation name').fill(name);
    await commitDialog('Create presentation');
    await page.getByRole('button', { name: `Open ${name}`, exact: true }).waitFor();
  }
  await createDeck(deckName);
  deckId = (await decks())[0].id;
  await createDeck('A second independent deck');
  await page.getByRole('button', { name: `Open ${deckName}`, exact: true }).click();
  await page.getByRole('heading', { name: deckName, exact: true }).waitFor();
  await verifyStore('deck creation preserves independent decks', data => data.length === 2);

  await page.getByRole('button', { name: 'Edit presentation title' }).click();
  await page.getByLabel('Title', { exact: true }).fill(longName);
  await commitDialog('Save');
  await verifyStore('title update persists', data => currentDeck(data).name === longName);
  await page.route(`${apiUrl}/store`, route => route.request().method() === 'PUT' ? route.abort() : route.continue());
  await page.getByRole('button', { name: 'Edit presentation title' }).click();
  await page.getByLabel('Title', { exact: true }).fill(longName + ' recovered');
  await commitDialog('Save');
  await page.getByText('Unable to reach the Presto API.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  assert.equal(currentDeck(await decks()).name, longName, 'A failed save must not overwrite server data.');
  await page.unroute(`${apiUrl}/store`);
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await verifyStore('failed editor save remains recoverable through retry', data => currentDeck(data).name === longName + ' recovered');
  await page.getByRole('button', { name: 'Edit presentation title' }).click();
  await page.getByLabel('Title', { exact: true }).fill(longName);
  await commitDialog('Save');
  await verifyStore('editing continues after save recovery', data => currentDeck(data).name === longName);
  await page.getByRole('button', { name: 'Thumbnail', exact: true }).click();
  await page.getByLabel('Thumbnail URL', { exact: true }).fill(imageSource);
  await commitDialog('Save');
  await verifyStore('thumbnail update persists', data => currentDeck(data).thumbnail === imageSource);
  await page.getByRole('button', { name: 'TEXT', exact: true }).click();
  await dialog().getByLabel('Text', { exact: true }).fill('Invalid geometry should stay in the dialog');
  await dialog().getByLabel('Left (%)', { exact: true }).fill('80');
  await dialog().getByRole('button', { name: 'Add element', exact: true }).click();
  await dialog().getByRole('alert').filter({ hasText: 'Keep the element inside the slide' }).waitFor();
  assert.equal(currentDeck(await decks()).slides[0].items.length, 0);
  await commitDialog('Cancel');
  checks.push('invalid geometry prevents invisible or off-canvas elements');
  await addElement('TEXT', { Text: 'Every great story starts with an idea.', 'Font size (em)': 2, 'Width (%)': 80, 'Height (%)': 40 });
  await verifyStore('text element creation persists', data => currentDeck(data).slides[0].items.length === 1);
  await editElement('TEXT', { Text: 'Edited text — ideas deserve a great stage.', 'Left (%)': 5, 'Top (%)': 8, 'Width (%)': 70, 'Height (%)': 35 });
  await verifyStore('text edit and numeric position/size persist', data => { const item = currentDeck(data).slides[0].items[0]; return item.left === 5 && item.top === 8 && item.width === 70 && item.src.startsWith('Edited text'); });

  await page.getByRole('button', { name: 'Edit text element', exact: true }).click();
  const move = page.getByRole('button', { name: 'Move selected element' });
  const moveBox = await move.boundingBox();
  await page.mouse.move(moveBox.x + 20, moveBox.y + 20);
  await page.mouse.down();
  await page.mouse.move(moveBox.x + 45, moveBox.y + 45, { steps: 8 });
  await page.mouse.up();
  await verifyStore('pointer reposition persists', data => currentDeck(data).slides[0].items[0].left > 5 && currentDeck(data).slides[0].items[0].top > 8);
  const resize = await page.getByRole('button', { name: 'Resize selected element' }).boundingBox();
  await page.mouse.move(resize.x + resize.width / 2, resize.y + resize.height / 2);
  await page.mouse.down();
  await page.mouse.move(resize.x + 25, resize.y + 20, { steps: 8 });
  await page.mouse.up();
  await verifyStore('pointer resize persists', data => currentDeck(data).slides[0].items[0].width > 70);
  await page.getByRole('button', { name: 'Deselect element' }).click();

  await addElement('IMAGE', { 'Image URL': imageSource, 'Image description': 'Original cover artwork', 'Width (%)': 20, 'Height (%)': 20, 'Left (%)': 75, 'Top (%)': 75 });
  await editElement('IMAGE', { 'Image description': 'Updated accessible image description' });
  await addElement('CODE', { Code: 'const idea = "make it happen";', 'Width (%)': 60, 'Height (%)': 20, 'Top (%)': 65 });
  await editElement('CODE', { Code: 'function present() { return "ready"; }' });
  await addElement('VIDEO', { 'YouTube URL': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Width (%)': 20, 'Height (%)': 20, 'Left (%)': 75, 'Top (%)': 45 });
  await editElement('VIDEO', { 'YouTube URL': 'https://youtu.be/aqz-KE-bpKQ' });
  await verifyStore('image/code/video creation and edits persist', data => { const items = currentDeck(data).slides[0].items; return items.length === 4 && items.find(item => item.type === 'IMAGE').alt.startsWith('Updated') && items.find(item => item.type === 'CODE').code.includes('function present') && items.find(item => item.type === 'VIDEO').src.includes('aqz-KE-bpKQ'); });
  assert(await page.getByAltText('Updated accessible image description', { exact: true }).evaluate(element => element.complete && element.naturalWidth > 0), 'The authored image must decode in the canvas.');
  assert.match(await page.getByTitle('YouTube video player', { exact: true }).getAttribute('src'), /youtube-nocookie\.com\/embed\/aqz-KE-bpKQ/);
  checks.push('image renders and video uses the saved privacy-enhanced embed frame');

  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  await page.getByLabel('Current Slide Background Colour').fill('#f3e6d8');
  await page.getByLabel('Default Slide Background Colour').fill('#dce4d9');
  await commitDialog('Save');
  await verifyStore('current/default theme persist atomically', data => currentDeck(data).bg === '#dce4d9' && currentDeck(data).slides[0].bg === '#f3e6d8');
  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  await page.getByLabel('Use colour gradient for current slide').check();
  await page.getByLabel('Current Colour Start').fill('#f3e6d8');
  await page.getByLabel('Current Colour End').fill('#dce4d9');
  await commitDialog('Save');
  await verifyStore('gradient theme persists', data => currentDeck(data).slides[0].bg.includes('linear-gradient'));
  await page.getByRole('button', { name: 'Add slide', exact: true }).click();
  await verifyStore('slide creation persists', data => currentDeck(data).slides.length === 2);
  await page.getByRole('button', { name: 'Go to slide 2', exact: true }).click();
  await addElement('TEXT', { Text: 'A second chapter.', 'Width (%)': 80, 'Font size (em)': 3 });
  await verifyStore('second slide has independent content', data => currentDeck(data).slides[1].items[0]?.src === 'A second chapter.');
  await page.getByRole('button', { name: 'Arrange slides', exact: true }).click();
  await page.getByRole('button', { name: 'Move slide 2 earlier', exact: true }).click();
  await commitDialog('Save order');
  await verifyStore('accessible slide reordering persists', data => currentDeck(data).slides[0].items[0]?.src === 'A second chapter.');
  await page.getByRole('button', { name: 'Go to slide 1', exact: true }).click();
  await page.getByRole('button', { name: 'Arrange slides', exact: true }).click();
  await page.getByRole('button', { name: 'Move slide 2 earlier', exact: true }).click();
  await commitDialog('Cancel');
  assert.equal(currentDeck(await decks()).slides[0].items[0].src, 'A second chapter.');
  checks.push('cancelled ordering leaves persisted order unchanged');
  await page.getByRole('button', { name: 'Arrange slides', exact: true }).click();
  await dialog().locator('.slide-order-list li').nth(0).dragTo(dialog().locator('.slide-order-list li').nth(1));
  await commitDialog('Save order');
  await verifyStore('pointer slide reordering persists', data => currentDeck(data).slides[0].items.length === 4);
  await page.getByRole('button', { name: 'Arrange slides', exact: true }).click();
  await page.getByRole('button', { name: 'Move slide 2 earlier', exact: true }).click();
  await commitDialog('Save order');
  await verifyStore('reordering can restore the intended slide sequence', data => currentDeck(data).slides[0].items[0]?.src === 'A second chapter.');
  await page.getByRole('button', { name: 'Edit presentation title' }).click();
  await page.getByLabel('Title', { exact: true }).press('ArrowRight');
  assert(page.url().endsWith('/0'), 'Typing must not navigate slides.');
  await commitDialog('Close');
  await page.getByRole('button', { name: 'Next slide', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/1');
  await page.keyboard.press('ArrowLeft');
  await page.waitForURL('**/0');
  checks.push('editor keyboard navigation and text-field isolation');

  await page.getByRole('button', { name: 'History', exact: true }).click();
  const historyButtons = dialog().locator('.history-item');
  await page.waitForFunction(() => document.querySelectorAll('.history-item').length > 4);
  assert(await historyButtons.count() > 4);
  await historyButtons.first().click();
  await verifyStore('history restoration writes an earlier snapshot to API', data => currentDeck(data).name === deckName && currentDeck(data).slides.length === 1 && currentDeck(data).slides[0].items.length === 0);
  await page.reload();
  await page.getByRole('heading', { name: deckName, exact: true }).waitFor();
  checks.push('history restoration survives reload');
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await dialog().locator('.history-item').filter({ hasText: longName }).last().click();
  await verifyStore('history can restore the complete edited deck', data => currentDeck(data).slides.length === 2);

  const popupPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = await popupPromise;
  await preview.getByText('A second chapter.', { exact: true }).waitFor();
  await preview.keyboard.press('ArrowRight');
  await preview.waitForURL('**/1');
  await preview.getByText('Edited text — ideas deserve a great stage.', { exact: true }).waitFor();
  await preview.close();
  checks.push('preview reads saved content and navigates slides');

  // Long authored text remains scrollable inside its canvas rather than spilling into the editor.
  await page.getByRole('button', { name: 'Go to slide 2', exact: true }).click();
  await editElement('TEXT', { Text: 'An intentionally long paragraph with no lost content. '.repeat(18) + 'UnbrokenText'.repeat(20) });
  await verifyStore('long text content persists without truncating stored data', data => currentDeck(data).slides[1].items.find(item => item.type === 'TEXT').src.length > 1000);
  const textOverflow = await page.locator('.slide-text-content').evaluate(element => ({ accessible: getComputedStyle(element).overflowY, wraps: getComputedStyle(element).overflowWrap }));
  assert.equal(textOverflow.accessible, 'auto');
  assert.equal(textOverflow.wraps, 'anywhere');

  await responsivePage('/dashboard', () => page.getByRole('button', { name: `Open ${longName}`, exact: true }).waitFor(), 'dashboard');
  await page.getByLabel('Search presentations').fill('no such presentation');
  await page.getByText('No presentations found.').waitFor();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await page.route(`${apiUrl}/store`, route => route.abort());
  await page.reload();
  await page.getByText('We couldn’t load your presentations.').waitFor();
  await page.unroute(`${apiUrl}/store`);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByRole('button', { name: `Open ${longName}`, exact: true }).waitFor();
  checks.push('search empty state and real network failure recovery');
  await page.route(`${apiUrl}/store`, route => route.abort());
  await page.goto(`${baseUrl}/dashboard/presentation/${deckId}/1`);
  await page.getByRole('heading', { name: 'We couldn’t load this presentation.', exact: true }).waitFor();
  await page.unroute(`${apiUrl}/store`);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByRole('heading', { name: longName, exact: true }).waitFor();
  checks.push('editor load failure retries against the real API');
  await page.route(`${apiUrl}/store`, route => route.abort());
  await page.goto(`${baseUrl}/preview/${deckId}/1`);
  await page.getByRole('alert').filter({ hasText: 'We couldn’t load this presentation.' }).waitFor();
  await page.unroute(`${apiUrl}/store`);
  await page.getByRole('link', { name: 'Return to workspace', exact: true }).click();
  await page.getByRole('button', { name: `Open ${longName}`, exact: true }).waitFor();
  checks.push('preview load failure provides a working workspace recovery link');
  await page.goto(`${baseUrl}/preview/${deckId}/999`);
  await page.getByText('This slide could not be found.', { exact: false }).waitFor();
  await page.getByRole('link', { name: 'Open the first slide', exact: true }).click();
  await page.getByText('A second chapter.', { exact: true }).waitFor();
  checks.push('missing preview slide recovers to the first slide');

  await responsivePage(`/dashboard/presentation/${deckId}/1`, () => page.getByRole('heading', { name: longName, exact: true }).waitFor(), 'editor');
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.getByLabel('Canvas zoom', { exact: true }).fill('200');
  assert(await page.locator('.editor-stage').evaluate(element => element.scrollWidth > element.clientWidth), 'Zoomed canvas should pan within the stage.');
  await layoutCheck('mobile 200% canvas zoom keeps page in bounds');
  await screen('presto-editor-mobile-canvas-zoom');
  await page.getByRole('button', { name: 'Fit to screen', exact: true }).click();
  await page.getByRole('button', { name: 'Edit image element', exact: true }).click();
  const mobileMove = await page.getByRole('button', { name: 'Move selected element' }).boundingBox();
  const initialMobileImage = currentDeck(await decks()).slides[1].items.find(item => item.type === 'IMAGE');
  await page.mouse.move(mobileMove.x + mobileMove.width / 2, mobileMove.y + mobileMove.height / 2);
  await page.mouse.down();
  await page.mouse.move(mobileMove.x + mobileMove.width / 2 - 12, mobileMove.y + mobileMove.height / 2 - 12, { steps: 6 });
  await page.mouse.up();
  await verifyStore('element pointer movement persists at mobile width', data => currentDeck(data).slides[1].items.find(item => item.type === 'IMAGE').left < initialMobileImage.left);
  await page.getByRole('button', { name: 'Deselect element' }).click();
  await responsivePage(`/preview/${deckId}/1`, () => page.getByText('An intentionally long paragraph', { exact: false }).waitFor(), 'preview');
  await page.goto(`${baseUrl}/dashboard/presentation/${deckId}/1`);
  await page.getByRole('heading', { name: longName, exact: true }).waitFor();
  const dialogNames = ['Thumbnail', 'TEXT', 'Theme', 'Arrange slides', 'History'];
  for (const name of dialogNames) {
    await page.getByRole('button', { name, exact: true }).click();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await layoutCheck(`${name} dialog at ${width}px`);
    }
    await page.keyboard.press('Escape');
    await dialog().waitFor({ state: 'hidden' });
  }
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  await layoutCheck('editor at 200% page zoom');
  await page.getByRole('button', { name: 'TEXT', exact: true }).click();
  await layoutCheck('element dialog at 200% page zoom');
  await page.keyboard.press('Escape');
  await dialog().waitFor({ state: 'hidden' });
  await page.evaluate(() => { document.body.style.zoom = ''; document.querySelectorAll('button, a, label, h1, h2, h3, p, input, textarea, .save-status').forEach(element => { if (!element.closest('.slide')) element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * 2}px`; }); });
  await layoutCheck('editor with 200% UI text enlargement');
  await screen('presto-editor-text-200-percent');

  await page.goto(`${baseUrl}/dashboard/presentation/${deckId}/1`);
  await page.getByRole('heading', { name: longName, exact: true }).waitFor();
  for (const type of ['IMAGE', 'CODE', 'VIDEO', 'TEXT']) {
    const element = page.getByRole('button', { name: `Edit ${type.toLowerCase()} element`, exact: true });
    await element.focus();
    await element.press('Delete');
    await verifyStore(`${type.toLowerCase()} deletion persists`, data => !currentDeck(data).slides[1].items.some(item => item.type === type));
  }
  await page.getByRole('button', { name: 'Delete slide', exact: true }).click();
  await verifyStore('slide deletion persists and route adjusts', data => currentDeck(data).slides.length === 1);
  await page.waitForURL('**/0');
  await page.getByRole('button', { name: 'Delete slide', exact: true }).click();
  await page.getByText('Can not delete the last slide.').waitFor();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  checks.push('last-slide guard');
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await commitDialog('No');
  assert.equal((await decks()).length, 2);
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await commitDialog('Yes');
  await page.waitForURL('**/dashboard');
  await verifyStore('deck deletion preserves the other deck', data => data.length === 1 && data[0].name === 'A second independent deck');
  await page.getByRole('button', { name: 'Clear workspace', exact: true }).click();
  await commitDialog('Yes');
  await verifyStore('clear workspace persists', data => data.length === 0);
  const oldToken = token;
  await page.getByRole('button', { name: 'Log out', exact: false }).click();
  await page.waitForURL('**/login');
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
  assert.equal((await api('GET', '/store', undefined, oldToken)).status, 403);
  checks.push('logout removes browser session and invalidates API token');
  await page.goto(`${baseUrl}/dashboard`);
  await page.waitForURL('**/login');
  checks.push('protected workspace redirects to login after logout');
  await responsivePage('/login', () => page.getByRole('heading', { name: 'Welcome back.' }).waitFor(), 'login');
  await responsivePage('/register', () => page.getByRole('heading', { name: 'Make it yours.' }).waitFor(), 'register');
  const persisted = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));
  assert(persisted.admins[email].password.startsWith('scrypt$'));
  assert(!JSON.stringify(persisted).includes(password));
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log(JSON.stringify({ result: 'passed', checks: checks.length, verified: checks, viewportWidths: widths, runtimeErrors: errors.length, screenshots, isolatedDatabase: databaseFile }, null, 2));
}

main().catch(async error => {
  if (page) await page.screenshot({ path: path.join(screenshots, 'presto-failure.png'), fullPage: true }).catch(() => {});
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  if (backend) backend.kill();
  await new Promise(resolve => server.close(resolve));
});
