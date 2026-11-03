const assert = require('node:assert/strict');

async function fillField(input, value) {
  const text = String(value);
  if (await input.getAttribute('type') === 'number') {
    // Older Chromium number fields can ignore DOM select(); use the same
    // keyboard replacement a person uses, then verify the actual field value.
    await input.focus();
    await input.press('ControlOrMeta+A');
    await input.press('Backspace');
  }
  await input.fill(text);
  assert.equal(await input.inputValue(), text, 'The form must contain the requested value');
}

module.exports = { fillField };
