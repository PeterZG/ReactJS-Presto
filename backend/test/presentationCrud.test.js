const request = require('supertest');
const server = require('../src/server');
const { reset } = require('../src/presentationService');

beforeAll(done => {
  if (server.listening) done();
  else server.once('listening', done);
});
afterAll(done => { server.close(() => done()); });
beforeEach(async () => { await reset(); });

async function account (email) {
  const response = await request(server).post('/admin/auth/register').send({ email, name: 'CRUD QA', password: 'strong-password' }).expect(200);
  return response.body.token;
}
const read = token => request(server).get('/store').set('Authorization', `Bearer ${token}`);
const write = (token, store) => request(server).put('/store').set('Authorization', `Bearer ${token}`).send({ store });

test('a user can persist and read deck, slide and element CRUD without exposing another account', async () => {
  const token = await account('owner@example.test');
  const otherToken = await account('other@example.test');
  const decks = [{ id: 1, name: 'First idea', thumbnail: '', slides: [{ layer: 11, items: [{ layer: 10, type: 'TEXT', src: 'Original', width: 50, height: 40, top: 0, left: 0 }] }] }];
  await write(token, decks).expect(200);
  expect((await read(token).expect(200)).body.store.store).toEqual(decks);
  expect((await read(otherToken).expect(200)).body.store.store).toEqual({});
  decks[0].name = 'Updated idea';
  decks[0].thumbnail = 'https://example.test/cover.png';
  decks[0].slides[0].items[0] = { ...decks[0].slides[0].items[0], src: 'Edited', left: 12, top: 10, width: 60, height: 30 };
  decks[0].slides.push({ layer: 10, items: [] });
  await write(token, decks).expect(200);
  expect((await read(token).expect(200)).body.store.store).toEqual(decks);
  decks[0].slides[0].items = [];
  decks[0].slides.pop();
  await write(token, decks).expect(200);
  expect((await read(token).expect(200)).body.store.store[0].slides).toHaveLength(1);
  await write(token, []).expect(200);
  expect((await read(token).expect(200)).body.store.store).toEqual([]);
});

test('store rejects malformed writes and previously logged out sessions', async () => {
  const token = await account('owner@example.test');
  await write(token, null).expect(400);
  await write(token, 'not a store').expect(400);
  await request(server).post('/admin/auth/logout').set('Authorization', `Bearer ${token}`).send({}).expect(200);
  await read(token).expect(403);
  await write(token, []).expect(403);
});
