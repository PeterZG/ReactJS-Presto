import { BACKEND_PORT } from './apiConfiguration.js';

const SERVER_URL = (
  process.env.REACT_APP_API_BASE_URL || `http://localhost:${BACKEND_PORT}`
).replace(/\/$/, '');

let network = true;

class ApiError extends Error {
  constructor (message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = options.kind || 'api';
    this.status = options.status;
    this.cause = options.cause;
  }
}

function requestHeaders () {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse (response) {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204) {
    return null;
  }
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : null;
}

const fetchCall = async (method, path, body) => {
  const params = {
    method,
    headers: requestHeaders(),
  };
  if (body !== undefined) {
    params.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(SERVER_URL + path, params);
  } catch (cause) {
    network = false;
    throw new ApiError('Unable to reach the Presto API.', {
      kind: 'network',
      cause,
    });
  }

  network = true;
  let data;
  try {
    data = await parseResponse(response);
  } catch (cause) {
    throw new ApiError('The Presto API returned an unreadable response.', {
      kind: 'response',
      status: response.status,
      cause,
    });
  }

  if (!response.ok) {
    const message =
      data && (data.error || data.message)
        ? data.error || data.message
        : `Request failed with HTTP ${response.status}.`;
    throw new ApiError(message, { kind: 'http', status: response.status });
  }
  if (data && data.error) {
    throw new ApiError(data.error, { kind: 'api', status: response.status });
  }
  return data;
};

function fetchPost (path, body) {
  return fetchCall('POST', path, body);
}

function fetchGet (path, params = '') {
  const query = params ? `?${params}` : '';
  return fetchCall('GET', path + query);
}

function fetchPut (path, body) {
  return fetchCall('PUT', path, body);
}

function online () {
  return network;
}

export {
  ApiError,
  fetchPost,
  fetchGet,
  fetchPut,
  online,
};
