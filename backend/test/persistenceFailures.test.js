const fs = require("fs");
const request = require("supertest");
const server = require("../src/server");
const { reset, register, login, getStore, setStore, getEmailFromAuthorization } =
  require("../src/presentationService");

beforeEach(async () => { await reset(); });
afterEach(() => { jest.restoreAllMocks(); });
afterAll(done => { server.close(() => done()); });

function failNextDiskWrite() {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(fs, "renameSync").mockImplementationOnce(() => {
    throw new Error("Simulated unavailable disk");
  });
}

test("a failed store write returns 500 and preserves the previously saved collection", async () => {
  const token = await register("owner@example.test", "strong-password", "Owner");
  await setStore("owner@example.test", [{ id: 1, name: "Saved" }]);
  failNextDiskWrite();

  await request(server).put("/store").set("Authorization", "Bearer " + token)
    .send({ store: [{ id: 1, name: "Not saved" }] }).expect(500);
  expect(await getStore("owner@example.test")).toEqual({ store: [{ id: 1, name: "Saved" }] });
  await setStore("owner@example.test", []);
  expect(await getStore("owner@example.test")).toEqual({ store: [] });
});

test("a failed registration does not reserve the email address", async () => {
  failNextDiskWrite();
  await expect(register("owner@example.test", "strong-password", "Owner")).rejects.toThrow();
  await expect(register("owner@example.test", "strong-password", "Owner")).resolves.toEqual(expect.any(String));
});

test("a failed login does not invalidate the existing session", async () => {
  const token = await register("owner@example.test", "strong-password", "Owner");
  failNextDiskWrite();
  await expect(login("owner@example.test", "strong-password")).rejects.toThrow();
  expect(getEmailFromAuthorization("Bearer " + token)).toBe("owner@example.test");
});

test("reading a collection does not attempt a disk write", async () => {
  const token = await register("owner@example.test", "strong-password", "Owner");
  const write = jest.spyOn(fs, "writeFileSync");
  await request(server).get("/store").set("Authorization", "Bearer " + token).expect(200);
  expect(write).not.toHaveBeenCalled();
});

test("service callers cannot mutate stored objects without a successful write", async () => {
  await register("owner@example.test", "strong-password", "Owner");
  const collection = [{ id: 1, name: "Saved" }];
  await setStore("owner@example.test", collection);
  collection[0].name = "Caller mutation";
  const loaded = await getStore("owner@example.test");
  loaded.store[0].name = "Reader mutation";
  expect(await getStore("owner@example.test")).toEqual({ store: [{ id: 1, name: "Saved" }] });
});

test("malformed JSON receives a readable JSON 400 response", async () => {
  const response = await request(server).post("/admin/auth/login")
    .set("Content-Type", "application/json").send('{"email":').expect(400);
  expect(response.body.error).toMatch(/valid JSON/);
});
