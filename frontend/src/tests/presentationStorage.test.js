import { fetchGet, fetchPut } from '../services/presentationApi';
import {
  loadPresentations,
  savePresentation,
  saveHistoryRecord,
  loadHistoryRecords,
  loadUser,
  loadHistory,
  removePresentation,
} from '../services/presentationStorage';

jest.mock('../services/presentationApi', () => ({
  ...jest.requireActual('../services/presentationApi'),
  fetchGet: jest.fn(),
  fetchPut: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

test('a fresh backend account is an empty dashboard', async () => {
  fetchGet.mockResolvedValue({ store: { store: {} } });
  await expect(loadPresentations()).resolves.toEqual([]);
});

test('saving a presentation waits for and propagates the backend write', async () => {
  fetchGet.mockResolvedValue({ store: { store: [] } });
  fetchPut.mockRejectedValue(new Error('Unable to save'));
  const presentation = { id: 1, name: 'Demo', slides: [] };

  await expect(savePresentation(presentation)).rejects.toThrow(
    'Unable to save',
  );
  expect(fetchPut).toHaveBeenCalledWith('/store', { store: [presentation] });
});

test('history stores an independent snapshot without mutating the presentation', () => {
  const presentation = { id: 1, slides: [{ items: [{ src: 'Original' }] }] };
  saveHistoryRecord(presentation);
  presentation.slides[0].items[0].src = 'Changed';
  expect(presentation.time).toBeUndefined();
  expect(loadHistoryRecords(1)[0].slides[0].items[0].src).toBe('Original');
});

test('rapid saves remain ordered and do not observe later mutations', async () => {
  let stored = [];
  fetchGet.mockImplementation(async () => ({ store: { store: JSON.parse(JSON.stringify(stored)) } }));
  fetchPut.mockImplementation(async (path, body) => { stored = body.store; });
  const presentation = { id: 1, name: 'First edit', slides: [] };
  const firstWrite = savePresentation(presentation);
  presentation.name = 'Second edit';
  const secondWrite = savePresentation(presentation);
  await Promise.all([firstWrite, secondWrite]);
  expect(fetchPut.mock.calls[0][1].store[0].name).toBe('First edit');
  expect(stored[0].name).toBe('Second edit');
});

test('a library read waits for the preceding queued edit', async () => {
  let stored = [];
  let finishWrite;
  let signalWriteStarted;
  const writeStarted = new Promise(resolve => { signalWriteStarted = resolve; });
  fetchGet.mockImplementation(async () => ({ store: { store: stored } }));
  fetchPut.mockImplementation((path, body) => new Promise(resolve => {
    finishWrite = () => { stored = body.store; resolve(); };
    signalWriteStarted();
  }));
  const saving = savePresentation({ id: 1, name: 'Latest edit', slides: [] });
  await writeStarted;
  const reading = loadPresentations();
  expect(fetchGet).toHaveBeenCalledTimes(1);
  finishWrite();
  await saving;
  await expect(reading).resolves.toEqual([{ id: 1, name: 'Latest edit', slides: [] }]);
});

test('queued edits cannot run under a replacement account', async () => {
  localStorage.setItem('token', 'first-account');
  const saving = savePresentation({ id: 1, name: 'Private edit', slides: [] });
  localStorage.setItem('token', 'second-account');
  await expect(saving).rejects.toMatchObject({ kind: 'session', status: 403 });
  expect(fetchGet).not.toHaveBeenCalled();
  expect(fetchPut).not.toHaveBeenCalled();
});

test('a session change during the read also cancels the following write', async () => {
  let completeRead;
  let signalReadStarted;
  const readStarted = new Promise(resolve => { signalReadStarted = resolve; });
  fetchGet.mockImplementation(() => new Promise(resolve => {
    completeRead = resolve;
    signalReadStarted();
  }));
  localStorage.setItem('token', 'first-account');
  const saving = savePresentation({ id: 1, name: 'Private edit', slides: [] });
  await readStarted;
  localStorage.setItem('token', 'second-account');
  completeRead({ store: { store: [] } });
  await expect(saving).rejects.toMatchObject({ kind: 'session' });
  expect(fetchPut).not.toHaveBeenCalled();
});

test('saving uses the snapshotted identity rather than a later mutation', async () => {
  fetchGet.mockResolvedValue({
    store: {
      store: [{ id: 1, name: 'First', slides: [] }, { id: 2, name: 'Second', slides: [] }],
    },
  });
  fetchPut.mockResolvedValue({});
  const presentation = { id: 1, name: 'Edited first', slides: [] };
  const saving = savePresentation(presentation);
  presentation.id = 2;
  await saving;
  expect(fetchPut.mock.calls[0][1].store.map(entry => entry.name)).toEqual(['Edited first', 'Second']);
});

test('deletion is ordered after pending edits and preserves the other deck', async () => {
  let stored = [{ id: 1, name: 'First', slides: [] }, { id: 2, name: 'Second', slides: [] }];
  fetchGet.mockImplementation(async () => ({ store: { store: stored } }));
  fetchPut.mockImplementation(async (path, body) => { stored = body.store; });
  await Promise.all([
    savePresentation({ id: 1, name: 'Latest first', slides: [] }),
    removePresentation(2),
  ]);
  expect(stored).toEqual([{ id: 1, name: 'Latest first', slides: [] }]);
});

test('malformed optional browser state does not crash the workspace', () => {
  localStorage.setItem('user', '{broken');
  localStorage.setItem('history', 'null');
  expect(loadUser()).toBeNull();
  expect(loadHistory()).toEqual({});
  localStorage.setItem('history', '{"1":[null,{"time":10}]}');
  expect(loadHistoryRecords(1)).toEqual([]);
});

test('history quota exhaustion is reported without throwing or blocking API saves', async () => {
  const setItem = Storage.prototype.setItem;
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
    if (key === 'history') throw new DOMException('History is full', 'QuotaExceededError');
    return setItem.call(this, key, value);
  });
  expect(saveHistoryRecord({ id: 1, slides: [] })).toBe(false);
  fetchGet.mockResolvedValue({ store: { store: [] } });
  fetchPut.mockResolvedValue({});
  await expect(savePresentation({ id: 1, name: 'Still saved', slides: [] })).resolves.toEqual({});
  jest.restoreAllMocks();
});
