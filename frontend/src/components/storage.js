import { fetchGet, fetchPut } from './fetch_util';

function loadPresentations () {
  return fetchGet('/store').then(data => {
    if (data.store && data.store.store) {
      console.log('get data:', data.store.store);
      return Promise.resolve(data.store.store);
    } else {
      console.log('get data null:', data);
      return Promise.resolve([]);
    }
  }).catch(err => {
    console.log('get error:', err);
  });
}

function savePresentations (data) {
  if (data === null) {
    return;
  }
  fetchPut('/store', { store: data }).catch(err => {
    console.log('save error:', err);
  });
}

function loadPresentation (id) {
  return loadPresentations().then(presentations => {
    const presentation = presentations.find(p => p.id === id);
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
  loadPresentations().then(presentations => {
    const index = presentations.findIndex(p => p.id === presentation.id);
    if (index === -1) {
      presentations.push(presentation);
    } else {
      presentations[index] = presentation;
    }
    savePresentations(presentations);
  });
}

function loadUser () {
  const user = localStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  return null;
}

function saveUser (user) {
  localStorage.setItem('user', JSON.stringify(user));
  // clear history
  localStorage.setItem('history', '{}');
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
  localStorage.getItem('token');
}

function loadHistory () {
  const str = localStorage.getItem('history');
  if (str === null) {
    return {};
  }
  return JSON.parse(str);
}
function saveHistory (history) {
  localStorage.setItem('history', JSON.stringify(history));
}

function loadHistoryRecord (id, time) {
  const history = loadHistory();
  if (!(id in history)) {
    return;
  }
  const records = history[id];
  for (const record of records) {
    if (record.time === time) {
      return record;
    }
  }
  return null;
}
function saveHistoryRecord (record) {
  const old = loadHistory();
  record.time = new Date().getTime();
  let arr;
  if (record.id in old) {
    arr = old[record.id];
  } else {
    arr = [];
  }
  arr.push(record);

  const now = new Date().getTime();
  while (arr.length > 0 && arr[0].time < now - 1000 * 60 * 1) {
    arr.shift();
  }
  old[record.id] = arr;
  saveHistory(old);
}

function loadHistoryRecords (id) {
  const history = loadHistory();
  if (!(id in history)) {
    return [];
  }
  return history[id];
}

export {
  loadPresentations,
  savePresentations,
  loadPresentation,
  savePresentation,
  loadUser,
  saveUser,
  clearUser,
  saveToken,
  loadToken,
  loadHistory,
  saveHistory,
  loadHistoryRecord,
  saveHistoryRecord,
  loadHistoryRecords
}
