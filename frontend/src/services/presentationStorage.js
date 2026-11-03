import { ApiError, fetchGet, fetchPut } from './presentationApi';

let pendingWrite = Promise.resolve();

function queueWrite (operation) {
  const expectedToken = loadToken();
  const checkSession = () => {
    if (loadToken() !== expectedToken) {
      throw new ApiError('Your session changed. Reopen the presentation before saving.', {
        kind: 'session', status: 403,
      });
    }
  };
  const next = pendingWrite.catch(() => {}).then(() => {
    checkSession();
    return operation(checkSession);
  });
  pendingWrite = next;
  return next;
}

function readPresentations () {
  return fetchGet('/store').then((data) => {
    const stored = data && data.store && data.store.store;
    // The provided backend initializes a new account's store to an empty object.
    return Array.isArray(stored) ? stored : [];
  });
}

function loadPresentations () {
  // Reads must observe the last queued edit, including navigation back to the library.
  return pendingWrite.catch(() => {}).then(readPresentations);
}

function savePresentations (data) {
  if (data === null) {
    return;
  }
  const snapshot = JSON.parse(JSON.stringify(data));
  return queueWrite(() => fetchPut('/store', { store: snapshot }));
}

function loadPresentation (id) {
  return loadPresentations().then((presentations) => {
    const presentation = presentations.find((p) => p.id === id);
    if (presentation === undefined) {
      return Promise.resolve(null);
    }
    return Promise.resolve(presentation);
  });
}

function savePresentation (presentation) {
  if (presentation === null) {
    return;
  }
  const snapshot = JSON.parse(JSON.stringify(presentation));
  return queueWrite((checkSession) => readPresentations().then((presentations) => {
    checkSession();
    const index = presentations.findIndex((entry) => entry.id === snapshot.id);
    if (index === -1) {
      presentations.push(snapshot);
    } else {
      presentations[index] = snapshot;
    }
    return fetchPut('/store', { store: presentations });
  }));
}

function removePresentation (id) {
  return queueWrite((checkSession) => readPresentations().then((presentations) => {
    checkSession();
    return fetchPut('/store', { store: presentations.filter((entry) => entry.id !== id) });
  }));
}

function readLocalObject (key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    // Browser history and cached identity are optional, never the saved presentation data.
    return null;
  }
}

function loadUser () {
  const user = readLocalObject('user');
  return typeof user?.email === 'string' ? user : null;
}

function saveUser (user) {
  localStorage.setItem('user', JSON.stringify(user));
  saveHistory({});
}

function clearUser () {
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  localStorage.removeItem('history');
}

function saveToken (token) {
  localStorage.setItem('token', token);
}

function loadToken () {
  return localStorage.getItem('token');
}

function loadHistory () {
  return readLocalObject('history') || {};
}
function saveHistory (history) {
  try {
    localStorage.setItem('history', JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

function saveHistoryRecord (record) {
  const old = loadHistory();
  const snapshot = { ...JSON.parse(JSON.stringify(record)), time: Date.now() };
  const records = loadHistoryRecords(record.id);
  records.push(snapshot);

  const now = new Date().getTime();
  while (records.length > 100 || (records.length > 0 && records[0].time < now - 1000 * 60 * 60 * 24)) {
    records.shift();
  }
  old[record.id] = records;
  return saveHistory(old);
}

function loadHistoryRecords (id) {
  const history = loadHistory();
  const records = history[id];
  return Array.isArray(records)
    ? records.filter((record) => record && Array.isArray(record.slides) && Number.isFinite(record.time))
    : [];
}

export {
  loadPresentations,
  savePresentations,
  loadPresentation,
  savePresentation,
  removePresentation,
  loadUser,
  saveUser,
  clearUser,
  saveToken,
  loadToken,
  loadHistory,
  saveHistory,
  saveHistoryRecord,
  loadHistoryRecords,
};
