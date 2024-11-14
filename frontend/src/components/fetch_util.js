import { BACKEND_PORT } from './config.js';
const SERVER_URL = `http://localhost:${BACKEND_PORT}`;

let network = true;

function testNetwork (userId) {
  const token = localStorage.getItem('token');
  const params = {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  };
  return fetch(SERVER_URL + '/user?userId=' + userId, params)
    .then(() => {
      network = true;
    }).catch(err => {
      console.log('Test network error:', err);
      network = false;
    });
}

const fetchCall = (method, path, inData) => {
  const token = localStorage.getItem('token');
  const params = {
    method,
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
  if (method !== 'GET') {
    params.body = inData;
  }
  return fetch(SERVER_URL + path, params)
    .then((response) => response.json())
    .then((data) => {
      network = true;
      console.log(method, path, 'indata:', inData, 'fetch data:', data);
      if (data.error) {
        return Promise.reject(data.error);
      } else {
        return Promise.resolve(data);
      }
    }).catch((err) => {
      network = false;
      console.log('fetch error:', err);
      return Promise.reject(err);
    });
};

function fetchPost (path, body) {
  return fetchCall('POST', path, JSON.stringify(body));
}

function fetchGet (path, params) {
  return fetchCall('GET', path + '?' + params, '');
}

function fetchPut (path, body) {
  return fetchCall('PUT', path, JSON.stringify(body));
}

function fetchDelete (path, body) {
  return fetchCall('DELETE', path, JSON.stringify(body));
}

function online () {
  return network;
}

export {
  testNetwork,
  fetchPost,
  fetchGet,
  fetchPut,
  fetchDelete,
  online
}
