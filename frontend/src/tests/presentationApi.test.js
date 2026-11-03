import {
  ApiError,
  fetchGet,
  fetchPost,
  online,
} from '../services/presentationApi';

function jsonResponse (status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('serializes request bodies and includes a stored token', async () => {
  localStorage.setItem('token', 'test-token');
  global.fetch.mockResolvedValue(
    jsonResponse(200, { token: 'response-token' }),
  );

  await expect(
    fetchPost('/admin/auth/login', {
      email: 'person@example.test',
      password: 'not-logged',
    }),
  ).resolves.toEqual({ token: 'response-token' });

  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5005/admin/auth/login',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      body: JSON.stringify({
        email: 'person@example.test',
        password: 'not-logged',
      }),
    }),
  );
});

test('distinguishes an HTTP rejection from a network failure', async () => {
  global.fetch.mockResolvedValueOnce(
    jsonResponse(401, { error: 'Invalid credentials' }),
  );

  await expect(fetchGet('/store')).rejects.toMatchObject({
    name: 'ApiError',
    kind: 'http',
    status: 401,
    message: 'Invalid credentials',
  });
  expect(online()).toBe(true);

  global.fetch.mockRejectedValueOnce(new TypeError('connection refused'));
  const failedRequest = fetchGet('/store');
  await expect(failedRequest).rejects.toEqual(expect.any(ApiError));
  expect(online()).toBe(false);
});
